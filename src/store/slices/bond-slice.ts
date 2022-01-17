import { ethers, constants, BigNumber } from "ethers";
import { getMarketPrice, getLPWorthInOhm, getTokenPrice } from "../../helpers";
import { calculateUserBondDetails, getBalances } from "./account-slice";
import { fetchPendingTxns, clearPendingTxn } from "./pending-txns-slice";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { fetchAccountSuccess } from "./account-slice";
import { Bond } from "../../helpers/bond/bond";
import { Networks } from "../../constants/blockchain";
import { RootState } from "../store";
import { Contract } from "ethers";
import { angleBond, crvBond, fxsBond, gOhmBond, lobiOHMBond, tokeBond } from "../../helpers/bond";
import { error, warning, success, info } from "../slices/messages-slice";
import { messages } from "../../constants/messages";
import { getGasPrice } from "../../helpers/get-gas-price";

import addresses from "../../constants/addresses-list";
import abis from "../../constants/abi-list";

interface IChangeApproval {
    bond: Bond;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
    address: string;
}

export const changeApproval = createAsyncThunk("bonding/changeApproval", async ({ bond, provider, networkID, address }: IChangeApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const signer = provider.getSigner();
    const reserveContract = bond.getContractForReserve(networkID, signer);

    let approveTx;
    try {
        const gasOptions = await getGasPrice(provider);
        const bondAddr = bond.getAddressForBond(networkID);
        approveTx = await reserveContract.approve(bondAddr, constants.MaxUint256, { ...gasOptions });
        dispatch(
            fetchPendingTxns({
                txnHash: approveTx.hash,
                text: "Approving " + bond.displayName,
                type: "approve_" + bond.name,
            }),
        );
        dispatch(success({ text: messages.tx_successfully_send }));
        await approveTx.wait();
    } catch (err: any) {
        dispatch(error({ text: messages.something_wrong, error: err }));
    } finally {
        if (approveTx) {
            dispatch(clearPendingTxn(approveTx.hash));
        }
    }

    let allowance,
        balance = "0";

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    const balanceVal = ethers.utils.formatEther(balance);

    return dispatch(
        fetchAccountSuccess({
            bonds: {
                [bond.name]: {
                    allowance: Number(allowance),
                    balance: Number(balanceVal),
                },
            },
        }),
    );
});

interface ICalcBondDetails {
    bond: Bond;
    value: string | null;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IBondDetails {
    bond: string;
    bondDiscount: number;
    debtRatio: number;
    bondQuote: number;
    purchased: number;
    vestingTerm: number;
    maxBondPrice: number;
    bondPrice: number;
    marketPrice: number;
    maxBondPriceToken: number;
}

export const calcBondDetails = createAsyncThunk("bonding/calcBondDetails", async ({ bond, value, provider, networkID }: ICalcBondDetails, { dispatch }) => {
    if (!value) {
        value = "0";
    }
    const amountInWei = ethers.utils.parseEther(value);

    let bondPrice = 0,
        bondDiscount = 0,
        valuation = 0,
        bondQuote = 0;

    const bondContract = bond.getContractForBond(networkID, provider);
    const terms = await bondContract.terms();
    const maxBondPrice = (await bondContract.maxPayout()) / Math.pow(10, 9);
    const treasury = new Contract(addresses.treasury, abis.treasury, provider);

    let debtRatio = 0;

    if (bond.isLP) {
        const ohmPrice = getTokenPrice("OHM");
        let debtRatio = (await bondContract.debtRatio()) / Math.pow(10, 9);
        debtRatio = debtRatio * ohmPrice;
    } else {
        debtRatio = (await bondContract.standardizedDebtRatio()) / Math.pow(10, 9);
    }

    let marketPrice = await getMarketPrice(networkID, provider);

    try {
        if (bondContract.bondPriceInUSD) {
            bondPrice = await bondContract.bondPriceInUSD();
            if (bond.name === "toke") {
                const tokePrice = getTokenPrice("TOKE");
                bondPrice = await bondContract.bondPrice();
                bondPrice = (tokePrice * bondPrice) / 1e4;
            } else if (bond.name === "angle") {
                const anglePrice = getTokenPrice("ANGLE");
                bondPrice = await bondContract.bondPrice();
                bondPrice = (anglePrice * bondPrice) / 1e4;
            } else if (bond.name === "gohm") {
                const gOhmPrice = getTokenPrice("GOHM");
                bondPrice = await bondContract.bondPrice();
                bondPrice = (gOhmPrice * bondPrice) / 1e4;
            }
        }

        marketPrice = marketPrice * getTokenPrice("OHM");

        if (bond.name === lobiOHMBond.name) {
            bondPrice = await bondContract.bondPrice();
            const ohmPrice = getTokenPrice("OHM");
            bondPrice = ((bondPrice * ohmPrice) / 1e4) * 2;
            bondDiscount = (marketPrice - bondPrice) / bondPrice;
        } else if (bond.name !== "toke" && bond.name !== "angle" && bond.name !== "gohm") {
            bondDiscount = (marketPrice * Math.pow(10, 18) - bondPrice) / bondPrice;
        } else {
            bondDiscount = (marketPrice - bondPrice) / bondPrice;
        }
    } catch (e) {
        console.log("error getting bondPriceInUSD", e);
    }

    let maxBondPriceToken = 0;
    const maxBodValue = ethers.utils.parseEther("1");

    const valueWithWeight = await treasury.valueOfToken(bond.networkAddrs[1].reserveAddress, amountInWei);

    bondQuote = await bondContract.payoutFor(valueWithWeight);
    bondQuote = bondQuote / Math.pow(10, 9);

    const maxBondQuote = await bondContract.payoutFor(maxBodValue);
    maxBondPriceToken = maxBondPrice / (maxBondQuote * Math.pow(10, -18));

    if (!!value && bondQuote > maxBondPrice) {
        dispatch(error({ text: messages.try_mint_more(maxBondPrice.toFixed(2).toString()) }));
    }

    const token = bond.getContractForReserve(networkID, provider);
    let purchased = await token.balanceOf(addresses.treasury);

    if (bond.isLP) {
        const lpWorth = await getLPWorthInOhm(purchased, provider);
        const ohmPrice = getTokenPrice("OHM");
        purchased = lpWorth * ohmPrice;
    } else {
        let added = BigNumber.from(0);
        let tokenName = "CRV";

        if (bond.name === crvBond.name) {
            tokenName = "CRV";
        }
        if (bond.name === angleBond.name) {
            tokenName = "ANGLE";
        }
        if (bond.name === gOhmBond.name) {
            tokenName = "GOHM";
        }

        if (bond.name === fxsBond.name) {
            tokenName = "FXS";
            const veFXSContract = new ethers.Contract(addresses.veFXS, abis.veFXS, provider);
            const fraxLockedBalance = (await veFXSContract.locked(addresses.fxsAllocator)).amount;
            added = fraxLockedBalance;
        }

        if (bond.name === tokeBond.name) {
            tokenName = "TOKE";
            const tokeStakeContract = new ethers.Contract(addresses.tokeStake, abis.TokeStake, provider);
            const tokeStakeBalance = await tokeStakeContract.balanceOf(addresses.multisig);
            added = tokeStakeBalance;
        }

        purchased = purchased.add(added) / Math.pow(10, 18);
        const tokenPrice = getTokenPrice(tokenName);
        purchased = purchased * tokenPrice;
    }

    if (!bond.isLP && bond.name !== "toke" && bond.name !== "angle" && bond.name !== "gohm") {
        bondPrice = bondPrice / 1e18;
    }

    return {
        bond: bond.name,
        bondDiscount,
        debtRatio,
        bondQuote,
        purchased,
        vestingTerm: Number(terms.vestingTerm),
        maxBondPrice,
        bondPrice,
        marketPrice,
        maxBondPriceToken,
    };
});

interface IBondAsset {
    value: string;
    address: string;
    bond: Bond;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    slippage: number;
}
export const bondAsset = createAsyncThunk("bonding/bondAsset", async ({ value, address, bond, networkID, provider, slippage }: IBondAsset, { dispatch }) => {
    const depositorAddress = address;
    const acceptedSlippage = slippage / 100 || 0.005;
    const valueInWei = ethers.utils.parseUnits(value.toString(), "ether");

    const signer = provider.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);

    const calculatePremium = await bondContract.bondPrice();
    const maxPremium = Math.round(calculatePremium * (1 + acceptedSlippage));

    let bondTx;
    try {
        const gasOptions = await getGasPrice(provider);

        bondTx = await bondContract.deposit(valueInWei, maxPremium, depositorAddress, { ...gasOptions });

        dispatch(
            fetchPendingTxns({
                txnHash: bondTx.hash,
                text: "Bonding " + bond.displayName,
                type: "bond_" + bond.name,
            }),
        );
        dispatch(success({ text: messages.tx_successfully_send }));
        await bondTx.wait();
        dispatch(info({ text: messages.your_balance_updated }));
        dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
        return;
    } catch (err: any) {
        if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
            err.message = "You may not have enough ETH to make transaction on Lobis please add funds";
        }
        if (err.code === -32603 && err.message.indexOf("ds-math-sub-underflow") >= 0) {
            dispatch(error({ text: "You may be trying to bond more than your balance! Error code: 32603. Message: ds-math-sub-underflow", error: err }));
        } else if (err.code === -32603 && err.data && err.data.message) {
            const msg = err.data.message.includes(":") ? err.data.message.split(":")[1].trim() : err.data.data || err.data.message;
            dispatch(error({ text: msg, error: err }));
        } else dispatch(error({ text: messages.something_wrong, error: err }));
        return;
    } finally {
        if (bondTx) {
            dispatch(clearPendingTxn(bondTx.hash));
        }
    }
});

interface IRedeemBond {
    address: string;
    bond: Bond;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    autostake: boolean;
}

export const redeemBond = createAsyncThunk("bonding/redeemBond", async ({ address, bond, networkID, provider, autostake }: IRedeemBond, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const signer = provider.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);

    let redeemTx;
    try {
        const gasOptions = await getGasPrice(provider);

        redeemTx = await bondContract.redeem(address, autostake === true, { ...gasOptions });
        const pendingTxnType = "redeem_bond_" + bond + (autostake === true ? "_autostake" : "");
        dispatch(
            fetchPendingTxns({
                txnHash: redeemTx.hash,
                text: "Redeeming " + bond.displayName,
                type: pendingTxnType,
            }),
        );
        dispatch(success({ text: messages.tx_successfully_send }));
        await redeemTx.wait();
        await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
        dispatch(getBalances({ address, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    } catch (err: any) {
        dispatch(error({ text: messages.something_wrong, error: err.message }));
    } finally {
        if (redeemTx) {
            dispatch(clearPendingTxn(redeemTx.hash));
        }
    }
});

export interface IBondSlice {
    loading: boolean;
    [key: string]: any;
}

const initialState: IBondSlice = {
    loading: true,
};

const setBondState = (state: IBondSlice, payload: any) => {
    const bond = payload.bond;
    const newState = { ...state[bond], ...payload };
    state[bond] = newState;
    state.loading = false;
};

const bondingSlice = createSlice({
    name: "bonding",
    initialState,
    reducers: {
        fetchBondSuccess(state, action) {
            state[action.payload.bond] = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(calcBondDetails.pending, state => {
                state.loading = true;
            })
            .addCase(calcBondDetails.fulfilled, (state, action) => {
                setBondState(state, action.payload);
                state.loading = false;
            })
            .addCase(calcBondDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default bondingSlice.reducer;

export const { fetchBondSuccess } = bondingSlice.actions;

const baseInfo = (state: RootState) => state.bonding;

export const getBondingState = createSelector(baseInfo, bonding => bonding);
