import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { Networks } from "../../constants";
import contractAddresses from "../../constants/addresses-list";
import { messages } from "../../constants/messages";
import { metamaskErrorWrap, setAll, sleep } from "../../helpers";
import { getGasPrice } from "../../helpers/get-gas-price";
import { RootState } from "../store";
import { fetchAccountSuccess, getBalances } from "./account-slice";
import { info, success, warning } from "./messages-slice";
import { clearPendingTxn, fetchPendingTxns, getWrappingTypeText } from "./pending-txns-slice";

export interface IChangeApproval {
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
    address: string;
}
// todo change

const wsLobiContract = ["hello"];

export const changeApproval = createAsyncThunk("wrapping/changeApproval", async ({ provider, address, networkID }: IChangeApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const addresses = contractAddresses;
    const signer = provider.getSigner();

    const sLobiContract = new ethers.Contract(addresses.sLobi, wsLobiContract, signer);
    let approveTx;
    try {
        const gasPrice = await getGasPrice(provider);

        approveTx = await sLobiContract.approve(addresses.wsLobi, ethers.constants.MaxUint256, { gasPrice });

        const text = "Approve Wrapping";
        const pendingTxnType = "approve_wrapping";

        dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
        await approveTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (approveTx) {
            dispatch(clearPendingTxn(approveTx.hash));
        }
    }

    await sleep(2);

    const wsLobiAllowance = await sLobiContract.allowance(address, addresses.sLobi);

    return dispatch(
        fetchAccountSuccess({
            wrapping: {
                wsLobi: Number(wsLobiAllowance),
            },
        }),
    );
});

export interface IChangeWrap {
    isWrap: boolean;
    value: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
    address: string;
}

export const changeWrap = createAsyncThunk("wrapping/changeWrap", async ({ isWrap, value, provider, networkID, address }: IChangeWrap, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const addresses = contractAddresses;
    const signer = provider.getSigner();
    const amountInWei = isWrap ? ethers.utils.parseUnits(value, "gwei") : ethers.utils.parseEther(value);
    const wmemoContract = new ethers.Contract(addresses.wsLobi, wsLobiContract, signer);

    let wrapTx;

    try {
        const gasPrice = await getGasPrice(provider);

        if (isWrap) {
            wrapTx = await wmemoContract.wrap(amountInWei, { gasPrice });
        } else {
            wrapTx = await wmemoContract.unwrap(amountInWei, { gasPrice });
        }

        const pendingTxnType = isWrap ? "wrapping" : "unwrapping";
        dispatch(fetchPendingTxns({ txnHash: wrapTx.hash, text: getWrappingTypeText(isWrap), type: pendingTxnType }));
        await wrapTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (wrapTx) {
            dispatch(clearPendingTxn(wrapTx.hash));
        }
    }

    dispatch(info({ text: messages.your_balance_update_soon }));
    await sleep(10);
    await dispatch(getBalances({ address, networkID, provider }));
    dispatch(info({ text: messages.your_balance_updated }));
    return;
});

export interface IWrapDetails {
    isWrap: boolean;
    value: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

const calcWrapValue = async ({ isWrap, value, provider, networkID }: IWrapDetails): Promise<number> => {
    const addresses = contractAddresses;

    const amountInWei = isWrap ? ethers.utils.parseUnits(value, "gwei") : ethers.utils.parseEther(value);

    let wrapValue = 0;

    const wmemoContract = new ethers.Contract(addresses.wsLobi, wsLobiContract, provider);

    if (isWrap) {
        const wmemoValue = await wmemoContract.MEMOTowMEMO(amountInWei);
        wrapValue = wmemoValue / Math.pow(10, 18);
    } else {
        const memoValue = await wmemoContract.wMEMOToMEMO(amountInWei);
        wrapValue = memoValue / Math.pow(10, 9);
    }

    return wrapValue;
};

export const calcWrapDetails = createAsyncThunk("wrapping/calcWrapDetails", async ({ isWrap, value, provider, networkID }: IWrapDetails, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    if (!value) {
        return new Promise<any>(resolve =>
            resolve({
                wrapValue: "",
            }),
        );
    }

    const wrapValue = await calcWrapValue({ isWrap, value, provider, networkID });

    return {
        wrapValue,
    };
});

export interface IWrapPrice {
    isWrap: boolean;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export const calcWrapPrice = createAsyncThunk("wrapping/calcWrapPrice", async ({ isWrap, provider, networkID }: IWrapPrice, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const wrapPrice = await calcWrapValue({ isWrap, value: "1", provider, networkID });

    return {
        wrapPrice,
    };
});

export interface IWrapSlice {
    loading: boolean;
    wrapValue: "";
    wrapPrice: number;
}

const initialState: IWrapSlice = {
    loading: true,
    wrapValue: "",
    wrapPrice: 0,
};

const wrapSlice = createSlice({
    name: "wrapping",
    initialState,
    reducers: {
        fetchWrapSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(calcWrapDetails.pending, state => {
                state.loading = true;
            })
            .addCase(calcWrapDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(calcWrapDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calcWrapPrice.pending, state => {
                state.loading = true;
            })
            .addCase(calcWrapPrice.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(calcWrapPrice.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default wrapSlice.reducer;

export const { fetchWrapSuccess } = wrapSlice.actions;

const baseInfo = (state: RootState) => state.wrapping;

export const getWrappingState = createSelector(baseInfo, wrapping => wrapping);
