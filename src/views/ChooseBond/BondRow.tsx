import { priceUnits, trim, prettyVestingPeriod } from "../../helpers";
import BondLogo from "../../components/BondLogo";
import { Paper, TableRow, TableCell, Slide, Link } from "@material-ui/core";
import { NavLink } from "react-router-dom";
import "./choosebond.scss";
import { Skeleton } from "@material-ui/lab";
import { IAllBondData } from "../../hooks/bonds";
import { useSelector, useDispatch } from "react-redux";
import { useWeb3Context } from "../../hooks";
import { messages } from "../../constants/messages";
import { warning } from "../../store/slices/messages-slice";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { IReduxState } from "../../store/slices/state.interface";
import { IBondDetails, redeemBond } from "../../store/slices/bond-slice";
import { IUserBondDetails } from "../../store/slices/account-slice";
import { TOKEN_NAME } from "../../constants/addresses";

interface IBondProps {
    bond: IAllBondData;
}

export function BondDataCard({ bond }: IBondProps) {
    const isBondLoading = !bond.bondPrice ?? true;
    return (
        <Slide direction="up" in={true}>
            <Paper className="bond-data-card">
                <div className="bond-pair">
                    <BondLogo bond={bond} />
                    <div className="bond-name">
                        <p className="bond-name-title">{bond.displayName}</p>
                        {bond.isLP && (
                            <div>
                                <Link href={bond.lpUrl} target="_blank">
                                    <p className="bond-name-title-link">View Contract</p>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="data-row">
                    <p className="bond-name-title">Price</p>
                    <p className="bond-price bond-name-title">
                        <>{isBondLoading ? <Skeleton width="50px" /> : `$${trim(bond.bondPrice, 2)}`}</>
                    </p>
                </div>

                <div className="data-row">
                    <p className="bond-name-title">ROI</p>
                    <p className="bond-name-title">{isBondLoading ? <Skeleton width="50px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}</p>
                </div>

                <div className="data-row">
                    <p className="bond-name-title">Purchased</p>
                    <p className="bond-name-title">
                        {isBondLoading ? (
                            <Skeleton width="80px" />
                        ) : (
                            new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                                minimumFractionDigits: 0,
                            }).format(bond.purchased)
                        )}
                    </p>
                </div>
                <Link component={NavLink} to={`/mints/${bond.name}`}>
                    <div className="bond-table-btn">
                        <p>Mint {bond.displayName}</p>
                    </div>
                </Link>
            </Paper>
        </Slide>
    );
}

export function BondTableData({ bond }: IBondProps) {
    const isBondLoading = !bond.bondPrice ?? true;
    const dispatch = useDispatch();
    const { provider, address, chainID, checkWrongNetwork } = useWeb3Context();
    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });
    async function onRedeem(autostake: boolean) {
        if (await checkWrongNetwork()) return;

        if (bond.interestDue === 0 || bond.pendingPayout === 0) {
            dispatch(warning({ text: messages.nothing_to_claim }));
            return;
        }

        await dispatch(redeemBond({ address, bond, networkID: chainID, provider, autostake }));
    }
    return (
        <TableRow>
            <TableCell align="left">
                <BondLogo bond={bond} />
                <div className="bond-name">
                    <p className="bond-name-title">{bond.displayName}</p>
                    {bond.isLP && (
                        <Link color="primary" href={bond.lpUrl} target="_blank">
                            <p className="bond-name-title-link">View Contract</p>
                        </Link>
                    )}
                </div>
            </TableCell>
            <TableCell align="center">
                <p className="bond-name-title">
                    <>{isBondLoading ? <Skeleton width="50px" /> : `$${trim(bond.bondPrice, 2)}`}</>
                </p>
            </TableCell>
            <TableCell align="right">
                <p className="bond-name-title">{isBondLoading ? <Skeleton width="50px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}</p>
            </TableCell>
            <TableCell align="right">
                <p className="bond-name-title">
                    {isBondLoading ? (
                        <Skeleton width="50px" />
                    ) : (
                        new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                            minimumFractionDigits: 0,
                        }).format(bond.purchased)
                    )}
                </p>
            </TableCell>
            <TableCell>
                <Link component={NavLink} to={`/mints/${bond.name}`}>
                    <div className="bond-table-btn">
                        <p>Mint</p>
                    </div>
                </Link>{" "}
            </TableCell>
        </TableRow>
    );
}

export function MyBondTableData({ bond }: IBondProps) {
    const isBondLoading = !bond.bondPrice ?? true;
    const dispatch = useDispatch();

    const { provider, address, chainID, checkWrongNetwork } = useWeb3Context();
    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });
    const bondDetails = useSelector<IReduxState, IUserBondDetails>(state => {
        return state.account.bonds && state.account.bonds[bond.name];
    });
    const currentBlock = useSelector<IReduxState, number>(state => {
        return state.app.currentBlock;
    });
    async function onRedeem(autostake: boolean) {
        if (await checkWrongNetwork()) return;

        if (bond.interestDue === 0 || bond.pendingPayout === 0) {
            dispatch(warning({ text: messages.nothing_to_claim }));
            return;
        }

        await dispatch(redeemBond({ address, bond, networkID: chainID, provider, autostake }));
    }
    const vestingTime = () => {
        return prettyVestingPeriod(currentBlock, bondDetails?.bondMaturationBlock);
    };

    return (
        <TableRow>
            <TableCell align="left">
                <BondLogo bond={bond} />
                <div className="bond-name">
                    <p className="bond-name-title">{bond.displayName}</p>
                    {bond.isLP && (
                        <Link color="primary" href={bond.lpUrl} target="_blank">
                            <p className="bond-name-title-link">View Contract</p>
                        </Link>
                    )}
                </div>
            </TableCell>
            <TableCell align="center">
                <p className="bond-name-title">
                    <>{isBondLoading ? <Skeleton width="50px" /> : `${trim(bond.interestDue, 4)} ${TOKEN_NAME}`}</>
                </p>
            </TableCell>
            <TableCell align="right">
                <p className="bond-name-title">{isBondLoading ? <Skeleton width="50px" /> : `${trim(bond.pendingPayout, 4)} ${TOKEN_NAME}`}</p>
            </TableCell>
            <TableCell align="right">
                <p className="bond-name-title">{isBondLoading ? <Skeleton width="50px" /> : vestingTime()}</p>
            </TableCell>
            <TableCell>
                <div className="bond-table-btns">
                    <div
                        className=" bond-table-btn"
                        onClick={() => {
                            if (isPendingTxn(pendingTransactions, "redeem_bond_" + bond.name)) return;
                            onRedeem(false);
                        }}
                    >
                        <p>{txnButtonText(pendingTransactions, "redeem_bond_" + bond.name, "Claim")}</p>
                    </div>
                    <div
                        className="bond-table-btn"
                        onClick={() => {
                            if (isPendingTxn(pendingTransactions, "redeem_bond_" + bond.name + "_autostake")) return;
                            onRedeem(true);
                        }}
                    >
                        <p>{txnButtonText(pendingTransactions, "redeem_bond_" + bond.name + "_autostake", "Claim & Stake")}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell></TableCell>
        </TableRow>
    );
}
