import { ethers } from "ethers";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./pending-txns-slice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances } from "./account-slice";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Networks } from "../../constants/blockchain";
import { warning, success, info, error } from "../../store/slices/messages-slice";
import { messages } from "../../constants/messages";
import { getGasPrice } from "../../helpers/get-gas-price";

import addresses from "../../constants/addresses-list";
import abis from "../../constants/abi-list";

interface IChangeApproval {
    token: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
}

export const changeApproval = createAsyncThunk("stake/changeApproval", async ({ token, provider, address, networkID }: IChangeApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const signer = provider.getSigner();
    const lobiContract = new ethers.Contract(addresses.lobi, abis.lobi, signer);
    const sLobiContract = new ethers.Contract(addresses.sLobi, abis.sLobi, signer);

    let approveTx;
    try {
        const gasOptions = await getGasPrice(provider);

        if (token === "lobi") {
            approveTx = await lobiContract.approve(addresses.stakingHelper, ethers.constants.MaxUint256, { ...gasOptions });
        }

        if (token === "sLobi") {
            approveTx = await sLobiContract.approve(addresses.staking, ethers.constants.MaxUint256, { ...gasOptions });
        }

        const text = "Approve " + (token === "lobi" ? "Staking" : "Unstaking");
        const pendingTxnType = token === "lobi" ? "approve_staking" : "approve_unstaking";

        dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
        dispatch(success({ text: messages.tx_successfully_send }));
        await approveTx.wait();
    } catch (err: any) {
        if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
            err.message = "You may not have enough ETH to make transaction on Lobis please add funds";
        }
        dispatch(error({ text: messages.something_wrong, error: err.message }));
        return;
    } finally {
        if (approveTx) {
            dispatch(clearPendingTxn(approveTx.hash));
        }
    }

    const stakeAllowance = await lobiContract.allowance(address, addresses.stakingHelper);
    const unstakeAllowance = await sLobiContract.allowance(address, addresses.staking);

    return dispatch(
        fetchAccountSuccess({
            staking: {
                lobi: Number(stakeAllowance),
                sLobi: Number(unstakeAllowance),
            },
        }),
    );
});

interface IChangeStake {
    action: string;
    value: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
}

export const changeStake = createAsyncThunk("stake/changeStake", async ({ action, value, provider, address, networkID }: IChangeStake, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const signer = provider.getSigner();
    const staking = new ethers.Contract(addresses.staking, abis.staking, signer);
    const stakingHelper = new ethers.Contract(addresses.stakingHelper, abis.stakingHelper, signer);

    let stakeTx;

    try {
        const gasOptions = await getGasPrice(provider);

        if (action === "stake") {
            stakeTx = await stakingHelper.stake(ethers.utils.parseUnits(value, "gwei"), address, { ...gasOptions });
        } else {
            stakeTx = await staking.unstake(ethers.utils.parseUnits(value, "gwei"), true, { ...gasOptions });
        }
        const pendingTxnType = action === "stake" ? "staking" : "unstaking";
        dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: getStakingTypeText(action), type: pendingTxnType }));
        dispatch(success({ text: messages.tx_successfully_send }));
        await stakeTx.wait();
    } catch (err: any) {
        if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
            err.message = "You may not have enough ETH to make transaction on Lobis please add funds";
        }
        if (err.code === -32603 && err.message.indexOf("ds-math-sub-underflow") >= 0) {
            dispatch(error({ text: "You may be trying to stake more than your balance! Error code: 32603. Message: ds-math-sub-underflow", error: err }));
        } else {
            dispatch(error({ text: messages.something_wrong, error: err }));
        }
        return;
    } finally {
        if (stakeTx) {
            dispatch(clearPendingTxn(stakeTx.hash));
        }
    }
    dispatch(getBalances({ address, networkID, provider }));
    dispatch(info({ text: messages.your_balance_updated }));
    return;
});
