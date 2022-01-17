import { ethers } from "ethers";

import { setAll } from "../../helpers";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getMarketPrice, getTokenPrice } from "../../helpers";
import { RootState } from "../store";
import allBonds, { angleBond, gOhmBond } from "../../helpers/bond";

import addresses from "../../constants/addresses-list";
import abis from "../../constants/abi-list";

interface ILoadAppDetails {
    networkID: number;
    provider: JsonRpcProvider;
}

export const loadAppDetails = createAsyncThunk(
    "app/loadAppDetails",
    //@ts-ignore
    async ({ networkID, provider }: ILoadAppDetails) => {
        const ohmPrice = getTokenPrice("OHM");
        const fxsPrice = getTokenPrice("FXS");
        const tokePrice = getTokenPrice("TOKE");
        const crvPrice = getTokenPrice("CRV");
        const sdtPrice = getTokenPrice("SDT");
        const anglePrice = getTokenPrice("ANGLE");
        const gOhmPrice = getTokenPrice("GOHM");
        const ohmAmount = 0;

        const stakingContract = new ethers.Contract(addresses.staking, abis.staking, provider);
        const currentBlock = await provider.getBlockNumber();
        const currentBlockTime = (await provider.getBlock(currentBlock)).timestamp;

        const sLobiContract = new ethers.Contract(addresses.sLobi, abis.sLobi, provider);
        const lobiContract = new ethers.Contract(addresses.lobi, abis.lobi, provider);
        const lobiBalanceOfDAO = await lobiContract.balanceOf("0xDe50fb295549EdA934D222e7a24d5A8dd132444F");
        const crvContract = new ethers.Contract(addresses.crv, abis.lobi, provider);
        const fraxContract = new ethers.Contract(addresses.fxs, abis.lobi, provider);
        const tokeContract = new ethers.Contract(addresses.toke, abis.lobi, provider);
        const xSdtContract = new ethers.Contract(addresses.xSdt, abis.lobi, provider);
        const sdtContract = new ethers.Contract(addresses.sdt, abis.lobi, provider);
        const veFXSContract = new ethers.Contract(addresses.veFXS, abis.veFXS, provider);
        const tokeStakeContract = new ethers.Contract(addresses.tokeStake, abis.TokeStake, provider);
        const angleContract = new ethers.Contract(addresses.angle, abis.lobi, provider);
        const gOhmContract = new ethers.Contract(addresses.gOhm, abis.lobi, provider);

        const marketPrice = (await getMarketPrice(networkID, provider)) * ohmPrice;

        const totalSupply = (await lobiContract.totalSupply()) / Math.pow(10, 9);
        const circSupply = (await sLobiContract.circulatingSupply()) / Math.pow(10, 9);

        const stakingTVL = circSupply * marketPrice;
        const marketCap = (totalSupply - lobiBalanceOfDAO / Math.pow(10, 9)) * marketPrice;

        const tokenBalPromises = allBonds.map(bond => bond.getTreasuryBalance(networkID, provider));
        const tokenBalances = await Promise.all(tokenBalPromises);
        let treasuryBalance = tokenBalances.reduce((tokenBalance0, tokenBalance1) => tokenBalance0 + tokenBalance1, ohmAmount);

        const tokenAmountsPromises = allBonds.map(bond => bond.getTokenAmount(networkID, provider));
        const tokenAmounts = await Promise.all(tokenAmountsPromises);
        const rfvTreasury = tokenAmounts.reduce((tokenAmount0, tokenAmount1) => tokenAmount0 + tokenAmount1, ohmAmount);

        const lobiBondsAmountsPromises = allBonds.map(bond => bond.getLobiAmount(networkID, provider));
        const lobiBondsAmounts = await Promise.all(lobiBondsAmountsPromises);
        const lobiAmount = lobiBondsAmounts.reduce((lobiAmount0, lobiAmount1) => lobiAmount0 + lobiAmount1, 0);
        const lobiSupply = totalSupply - lobiAmount;

        const rfv = rfvTreasury / lobiSupply;

        const epoch = await stakingContract.epoch();
        const blockSecondLength = 13;
        const rebaseTimeInSeconds = epoch[0] * blockSecondLength;
        const dailyRebaseAmounts = 86400 / rebaseTimeInSeconds;
        const stakingReward = epoch.distribute;
        const circ = await sLobiContract.circulatingSupply();
        const stakingRebase = stakingReward / circ;
        const fiveDayRate = Math.pow(1 + stakingRebase, 5 * dailyRebaseAmounts) - 1;
        const stakingAPY = Math.pow(1 + stakingRebase, 365 * dailyRebaseAmounts) - 1;
        const crvTreasuryBalance = (await crvContract.balanceOf(addresses.treasury)) / 1e18;

        const fraxLockedBalance = (await veFXSContract.locked(addresses.fxsAllocator)).amount / 1e18;
        const fraxTreasuryBalance = (await fraxContract.balanceOf(addresses.treasury)) / 1e18 + fraxLockedBalance;

        const tokeStakeBalance = (await tokeStakeContract.balanceOf(addresses.multisig)) / 1e18;
        const tokeTreasuryBalance = (await tokeContract.balanceOf(addresses.treasury)) / 1e18 + tokeStakeBalance;
        const angleTreasuryBalance = (await angleContract.balanceOf(addresses.treasury)) / 1e18;
        const gOhmTreasuryBalance = (await gOhmContract.balanceOf(addresses.treasury)) / 1e18;
        const currentIndex = await stakingContract.index();
        const nextRebase = epoch.endBlock;
        let multisigLobiBalance = await lobiContract.balanceOf(addresses.multisig);
        multisigLobiBalance = multisigLobiBalance / 1e9;
        const treasuryRunway = rfvTreasury / circSupply;
        const runway = Math.log(treasuryRunway) / Math.log(1 + stakingRebase) / dailyRebaseAmounts;
        const sdtStakedInSanctuary = await sdtContract.balanceOf(xSdtContract.address);
        const xSDTTotalSupply = await xSdtContract.totalSupply();
        const multisigxSDTBalance = await xSdtContract.balanceOf(addresses.multisig);
        const treasurySdtBalance = (sdtStakedInSanctuary / xSDTTotalSupply) * (multisigxSDTBalance / 1e18);
        treasuryBalance = treasuryBalance + fraxLockedBalance * fxsPrice + tokeStakeBalance * tokePrice + treasurySdtBalance * sdtPrice;

        return {
            currentIndex: Number(ethers.utils.formatUnits(currentIndex, "gwei")),
            totalSupply,
            marketCap,
            currentBlock,
            circSupply,
            fiveDayRate,
            treasuryBalance,
            stakingAPY,
            stakingTVL,
            stakingRebase,
            marketPrice,
            currentBlockTime,
            nextRebase,
            crvTreasuryBalance,
            fraxTreasuryBalance,
            tokeTreasuryBalance,
            angleTreasuryBalance,
            gOhmTreasuryBalance,
            multisigLobiBalance,
            treasurySdtBalance,
            rfv,
            runway,
            epoch,
            fxsPrice,
            tokePrice,
            crvPrice,
            sdtPrice,
            anglePrice,
            gOhmPrice,
        };
    },
);

const initialState = {
    loading: true,
};

export interface IAppSlice {
    loading: boolean;
    stakingTVL: number;
    marketPrice: number;
    marketCap: number;
    circSupply: number;
    currentIndex: string;
    currentBlock: number;
    currentBlockTime: number;
    fiveDayRate: number;
    treasuryBalance: number;
    stakingAPY: number;
    stakingRebase: number;
    networkID: number;
    nextRebase: number;
    totalSupply: number;
    crvTreasuryBalance: number;
    tokeTreasuryBalance: number;
    fraxTreasuryBalance: number;
    multisigLobiBalance: number;
    angleTreasuryBalance: number;
    gOhmTreasuryBalance: number;
    treasurySdtBalance: number;
    fxsPrice: number;
    tokePrice: number;
    crvPrice: number;
    gOhmPrice: number;
    anglePrice: number;
    sdtPrice: number;
    rfv: number;
    runway: number;
    epoch: any[];
}

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        fetchAppSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAppDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(loadAppDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAppDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
