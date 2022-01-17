import React from "react";
import { ethers } from "ethers";
import { setAll } from "../../helpers";

import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Bond } from "../../helpers/bond/bond";
import { Networks } from "../../constants/blockchain";
import { RootState } from "../store";

import addresses from "../../constants/addresses-list";
import abis from "../../constants/abi-list";

interface IGetBalances {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IAccountBalances {
    balances: {
        sLobi: string;
        lobi: string;
    };
}

export const getBalances = createAsyncThunk("account/getBalances", async ({ address, networkID, provider }: IGetBalances): Promise<IAccountBalances> => {
    const sLobiContract = new ethers.Contract(addresses.lobi, abis.sLobi, provider);
    const sLobiBalance = await sLobiContract.balanceOf(address);
    const lobiContract = new ethers.Contract(addresses.sLobi, abis.lobi, provider);
    const lobiBalance = await lobiContract.balanceOf(address);

    return {
        balances: {
            sLobi: ethers.utils.formatUnits(sLobiBalance, "gwei"),
            lobi: ethers.utils.formatUnits(lobiBalance, "gwei"),
        },
    };
});

interface ILoadAccountDetails {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IUserAccountDetails {
    balances: {
        lobi: string;
        sLobi: string;
    };
    staking: {
        lobi: number;
        sLobi: number;
    };
}

export const loadAccountDetails = createAsyncThunk("account/loadAccountDetails", async ({ networkID, provider, address }: ILoadAccountDetails): Promise<IUserAccountDetails> => {
    let lobiBalance = 0;
    let sLobiBalance = 0;
    let stakeAllowance = 0;
    let unstakeAllowance = 0;

    const lobiContract = new ethers.Contract(addresses.lobi, abis.lobi, provider);
    lobiBalance = await lobiContract.balanceOf(address);
    stakeAllowance = await lobiContract.allowance(address, addresses.stakingHelper);

    const sLobiContract = new ethers.Contract(addresses.sLobi, abis.sLobi, provider);
    sLobiBalance = await sLobiContract.balanceOf(address);
    unstakeAllowance = await sLobiContract.allowance(address, addresses.staking);

    return {
        balances: {
            sLobi: ethers.utils.formatUnits(sLobiBalance, "gwei"),
            lobi: ethers.utils.formatUnits(lobiBalance, "gwei"),
        },
        staking: {
            lobi: Number(stakeAllowance),
            sLobi: Number(unstakeAllowance),
        },
    };
});

interface ICalcUserBondDetails {
    address: string;
    bond: Bond;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IUserBondDetails {
    allowance: number;
    balance: number;
    etherBalance: number;
    interestDue: number;
    bondMaturationBlock: number;
    pendingPayout: number; //Payout formatted in gwei.
}

export const calculateUserBondDetails = createAsyncThunk("bonding/calculateUserBondDetails", async ({ address, bond, networkID, provider }: ICalcUserBondDetails) => {
    if (!address)
        return new Promise<any>(resevle => {
            resevle({
                bond: "",
                displayName: "",
                bondIconSvg: "",
                isLP: false,
                allowance: 0,
                balance: 0,
                interestDue: 0,
                bondMaturationBlock: 0,
                pendingPayout: "",
                etherBalance: 0,
            });
        });

    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = await bondContract.bondInfo(address);

    interestDue = bondDetails.payout / Math.pow(10, 9);
    bondMaturationBlock = Number(bondDetails[1]) + Number(bondDetails[2]);
    pendingPayout = await bondContract.pendingPayoutFor(address);

    let allowance,
        balance = "0";

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    const balanceVal = ethers.utils.formatEther(balance);

    const etherBalance = await provider.getSigner().getBalance();
    const etherVal = ethers.utils.formatEther(etherBalance);

    const pendingPayoutVal = ethers.utils.formatUnits(pendingPayout, "gwei");

    return {
        bond: bond.name,
        displayName: bond.displayName,
        bondIconSvg: bond.bondIconSvg,
        isLP: bond.isLP,
        allowance: Number(allowance),
        balance: Number(balanceVal),
        etherBalance: Number(etherVal),
        interestDue,
        bondMaturationBlock,
        pendingPayout: Number(pendingPayoutVal),
    };
});

export interface IAccountSlice {
    bonds: { [key: string]: IUserBondDetails };
    balances: {
        sLobi: string;
        lobi: string;
    };
    loading: boolean;
    staking: {
        lobi: number;
        sLobi: number;
    };
}

const initialState: IAccountSlice = {
    loading: true,
    bonds: {},
    balances: { sLobi: "", lobi: "" },
    staking: { lobi: 0, sLobi: 0 },
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        fetchAccountSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAccountDetails.pending, state => {
                state.loading = true;
            })
            .addCase(loadAccountDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAccountDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(getBalances.pending, state => {
                state.loading = true;
            })
            .addCase(getBalances.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(getBalances.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calculateUserBondDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const bond = action.payload.bond;
                state.bonds[bond] = action.payload;
                state.loading = false;
            })
            .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
