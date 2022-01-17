import { ethers } from "ethers";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./pending-txns-slice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances } from "./account-slice";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Networks } from "../../constants/blockchain";
import { warning, success, info, error } from "../../store/slices/messages-slice";
import { messages } from "../../constants/messages";
import { getGasPrice } from "../../helpers/get-gas-price";
import { BigNumber } from "@ethersproject/bignumber";
import addresses from "../../constants/addresses-list";
import abis from "../../constants/abi-list";

interface IClaimAirdrop {
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
    index: number;
    proof: string[];
    amount: string;
    merkleIndex: number;
}

export const claim = createAsyncThunk("airdrop/claim", async ({ index, proof, amount, merkleIndex, provider, address, networkID }: IClaimAirdrop, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const signer = provider.getSigner();
    const merkleDistributorContract = new ethers.Contract(addresses.merkleDistributor, abis.merkleDistributor, signer);
    let claimTx;
    try {
        const gasOptions = await getGasPrice(provider);
        claimTx = await merkleDistributorContract.claim(merkleIndex, index, BigNumber.from(amount), proof, { ...gasOptions });
    } catch (err: any) {
        dispatch(error({ text: messages.something_wrong, error: err.message }));
        return;
    } finally {
        if (claimTx) {
            dispatch(clearPendingTxn(claimTx.hash));
        }
    }
    const text = "Claiming";
    dispatch(fetchPendingTxns({ txnHash: claimTx.hash, text, type: "Airdrop Claim" }));
    dispatch(success({ text: messages.tx_successfully_send }));
    await claimTx.wait();
});
