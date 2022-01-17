import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, OutlinedInput, InputAdornment, Slide, FormControl } from "@material-ui/core";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { IReduxState } from "../../store/slices/state.interface";
import { claim } from "../../store/slices/airdrop-thunk";
import { useWeb3Context } from "../../hooks";
import { BigNumber } from "@ethersproject/bignumber";
import addresses0 from "../../constants/airdrop.json";
import addresses1 from "../../constants/airdrop1.json";
import { ethers } from "ethers";
interface airdropDataType {
    index: number;
    amount: string;
    proof: string[];
}
interface IObjectKeys {
    [key: string]: string | number;
}

const ADDRESSES: any = {
    0: addresses0,
    1: addresses1,
};

function AirdropClaim({ merkleIndex }: any) {
    const dispatch = useDispatch();
    const addresses = ADDRESSES[merkleIndex];
    const { provider, address, chainID, checkWrongNetwork } = useWeb3Context();
    const [airdropData, setAirdropData] = useState<airdropDataType>();
    const addressIndex = address as string;
    const claims: { [key: string]: any } = { ...addresses.claims };
    useEffect(() => {
        const index = Object.keys(addresses.claims).indexOf(address);
        if (index !== -1) {
            setAirdropData(claims[address]);
        }
    }, []);
    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    async function onClaim() {
        if (await checkWrongNetwork()) return;
        if (!airdropData) return;
        await dispatch(
            claim({
                proof: airdropData.proof,
                amount: airdropData.amount,
                index: airdropData.index,
                merkleIndex: merkleIndex,
                networkID: chainID,
                provider,
                address: address,
            }),
        );
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" className="">
            <Box display="flex" justifyContent="center" flexWrap="wrap">
                <p className="claimable-amount ">Claimable Airdrop Amount : {airdropData && ethers.utils.formatUnits(BigNumber.from(airdropData.amount).toString(), 9)} LOBI</p>
            </Box>
            <Box display="flex" justifyContent="center" flexWrap="wrap">
                <div
                    className="transaction-button airdrop-claim-btn"
                    onClick={async () => {
                        await onClaim();
                    }}
                >
                    <p>{txnButtonText(pendingTransactions, "claim_", "CLAIM")}</p>
                </div>
            </Box>
        </Box>
    );
}

export default AirdropClaim;
