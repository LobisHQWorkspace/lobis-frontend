import { Button, Grid } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { messages } from "src/constants/messages";
import { useWeb3Context } from "src/hooks";
import useBonds from "src/hooks/bonds";
import { warning } from "src/store/slices/messages-slice";
import { IPendingTxn, isPendingTxn, txnButtonText } from "src/store/slices/pending-txns-slice";
import { IReduxState } from "src/store/slices/state.interface";

export const ReedemAll = (): JSX.Element => {
    const { checkWrongNetwork } = useWeb3Context();

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const { bonds } = useBonds();
    const dispatch = useDispatch();

    const hasPendingBonds = bonds.find(bond => bond.pendingPayout !== 0 || bond.interestDue !== 0);

    async function onClaim(autostake: boolean): Promise<void> {
        if (await checkWrongNetwork()) return;

        if (!hasPendingBonds) {
            dispatch(warning({ text: messages.nothing_to_claim }));
            return;
        }

        // Call new contract
    }

    return (
        <Grid container justifyContent="center" alignItems="center" spacing={6}>
            <Grid item md={2} xs={12}>
                <Button
                    className="transaction-button"
                    variant="contained"
                    color="primary"
                    fullWidth={true}
                    onClick={() => {
                        if (isPendingTxn(pendingTransactions, "redeem_all")) return;
                        onClaim(false);
                    }}
                >
                    <p>{txnButtonText(pendingTransactions, "redeem_bond_all", "Claim all")}</p>
                </Button>
            </Grid>
            <Grid item md={3} xs={12}>
                <Button
                    className="transaction-button"
                    variant="contained"
                    color="primary"
                    fullWidth={true}
                    onClick={() => {
                        if (isPendingTxn(pendingTransactions, "redeem_bond_all_autostake")) return;
                        onClaim(true);
                    }}
                >
                    <p>{txnButtonText(pendingTransactions, "redeem_bond_all_autostake", "Claim and Autostake all")}</p>
                </Button>
            </Grid>
        </Grid>
    );
};
