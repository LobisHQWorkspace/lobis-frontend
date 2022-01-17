import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Grid, Zoom, useMediaQuery } from "@material-ui/core";
import { trim } from "../../helpers";
import "./dashboard.scss";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { IAppSlice } from "../../store/slices/app-slice";
import { loadAppDetails } from "../../store/slices/app-slice";
import { TOKEN_NAME } from "src/constants";
import { useAddress, useWeb3Context } from "../../hooks";
import useBonds from "../../hooks/bonds";
import TreasuryTable from "./TreasuryTable";

function Dashboard() {
    const { connect, provider, hasCachedProvider, chainID, connected } = useWeb3Context();
    const dispatch = useDispatch();
    const address = useAddress();
    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const app = useSelector<IReduxState, IAppSlice>(state => state.app);
    const { bonds } = useBonds();
    const isSmallScreen = useMediaQuery("(max-width: 733px)"); // change to breakpoint query
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(loadAppDetails({ networkID: chainID, provider: provider }));
            console.log("dispatching app details");
        }, 60000);
        return () => clearInterval(interval);
    }, []);
    const trimmedStakingAPY = trim(app.stakingAPY * 100, 1);

    const crvPerLobi = app.crvTreasuryBalance / (app.totalSupply - app.multisigLobiBalance);
    const fxsPerLobi = app.fraxTreasuryBalance / (app.totalSupply - app.multisigLobiBalance);
    const tokePerLobi = app.tokeTreasuryBalance / (app.totalSupply - app.multisigLobiBalance);

    return (
        <div className="dashboard-view">
            <div className="dashboard-infos-wrap">
                <Zoom in={true}>
                    <Grid container spacing={4}>
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <div className="dashboard-card">
                                <p className="card-title">{TOKEN_NAME} Price</p>
                                <p className="card-value">{isAppLoading ? <Skeleton width="100px" /> : `$${trim(app.marketPrice, 2)}`}</p>
                            </div>
                        </Grid>

                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <div className="dashboard-card">
                                <p className="card-title">Market Cap</p>
                                <p className="card-value">
                                    {isAppLoading ? (
                                        <Skeleton width="160px" />
                                    ) : (
                                        new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            maximumFractionDigits: 0,
                                            minimumFractionDigits: 0,
                                        }).format(app.marketCap)
                                    )}
                                </p>
                            </div>
                        </Grid>

                        {/* <Grid item lg={6} md={6} sm={6} xs={12}>
                            <div className="dashboard-card">
                                <p className="card-title">Supply (Staked/Total)</p>
                                <p className="card-value">
                                    {isAppLoading ? (
                                        <Skeleton width="250px" />
                                    ) : (
                                        `${new Intl.NumberFormat("en-US", {
                                            maximumFractionDigits: 0,
                                            minimumFractionDigits: 0,
                                        }).format(app.circSupply)}
                                        /
                                        ${new Intl.NumberFormat("en-US", {
                                            maximumFractionDigits: 0,
                                            minimumFractionDigits: 0,
                                        }).format(app.totalSupply)}`
                                    )}
                                </p>
                            </div>
                        </Grid> */}

                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <div className="dashboard-card">
                                <p className="card-title">TVL</p>
                                <p className="card-value">
                                    {isAppLoading ? (
                                        <Skeleton width="250px" />
                                    ) : (
                                        new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            maximumFractionDigits: 0,
                                            minimumFractionDigits: 0,
                                        }).format(app.stakingTVL)
                                    )}
                                </p>
                            </div>
                        </Grid>

                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <div className="dashboard-card">
                                <p className="card-title">APY</p>
                                <p className="card-value">
                                    {isAppLoading ? (
                                        <Skeleton width="250px" />
                                    ) : parseFloat(trimmedStakingAPY) > 100000000 ? (
                                        "100,000,000% +"
                                    ) : (
                                        `${new Intl.NumberFormat("en-US").format(Number(trimmedStakingAPY))}%`
                                    )}
                                </p>
                            </div>
                        </Grid>

                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <div className="dashboard-card">
                                <p className="card-title">Current Index</p>
                                <p className="card-value">{isAppLoading ? <Skeleton width="250px" /> : `${trim(Number(app.currentIndex), 4)} ${TOKEN_NAME}`}</p>
                            </div>
                        </Grid>

                        {isSmallScreen && (
                            <Grid item lg={6} md={6} sm={6} xs={12}>
                                <div className="dashboard-card">
                                    <p className="card-title">Treasury Balance</p>
                                    <p className="card-value">
                                        {isAppLoading ? (
                                            <Skeleton width="250px" />
                                        ) : (
                                            new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: "USD",
                                                maximumFractionDigits: 0,
                                                minimumFractionDigits: 0,
                                            }).format(app.treasuryBalance)
                                        )}
                                    </p>
                                </div>
                            </Grid>
                        )}
                        {/* 
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <div className="dashboard-card">
                                <p className="card-title">Backing per ${TOKEN_NAME}</p>
                                <p className="card-value">
                                    {isAppLoading ? (
                                        <Skeleton width="250px" />
                                    ) : (
                                        new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            maximumFractionDigits: 0,
                                            minimumFractionDigits: 0,
                                        }).format(app.rfv)
                                    )}
                                </p>
                            </div>
                        </Grid> */}

                        {isSmallScreen && (
                            <Grid item lg={6} md={6} sm={6} xs={12}>
                                <div className="dashboard-card">
                                    <p className="card-title">CRV Balance of Treasury</p>
                                    <p className="card-value">
                                        {isAppLoading ? (
                                            <Skeleton width="250px" />
                                        ) : (
                                            `${new Intl.NumberFormat("en-US", {
                                                maximumFractionDigits: 0,
                                                minimumFractionDigits: 0,
                                            }).format(app.crvTreasuryBalance)} CRV`
                                        )}
                                    </p>
                                </div>
                            </Grid>
                        )}
                        {isSmallScreen && (
                            <Grid item lg={6} md={6} sm={6} xs={12}>
                                <div className="dashboard-card">
                                    <p className="card-title">TOKE Balance of Treasury</p>
                                    <p className="card-value">
                                        {isAppLoading ? (
                                            <Skeleton width="250px" />
                                        ) : (
                                            `${new Intl.NumberFormat("en-US", {
                                                maximumFractionDigits: 0,
                                                minimumFractionDigits: 0,
                                            }).format(app.tokeTreasuryBalance)} TOKE`
                                        )}
                                    </p>
                                </div>
                            </Grid>
                        )}

                        {isSmallScreen && (
                            <Grid item lg={6} md={6} sm={6} xs={12}>
                                <div className="dashboard-card">
                                    <p className="card-title">FXS Balance of Treasury</p>
                                    <p className="card-value">
                                        {isAppLoading ? (
                                            <Skeleton width="250px" />
                                        ) : (
                                            `${new Intl.NumberFormat("en-US", {
                                                maximumFractionDigits: 0,
                                                minimumFractionDigits: 0,
                                            }).format(app.fraxTreasuryBalance)} FXS`
                                        )}
                                    </p>
                                </div>
                            </Grid>
                        )}
                        {isSmallScreen && (
                            <Grid item lg={6} md={6} sm={6} xs={12}>
                                <div className="dashboard-card">
                                    <p className="card-title">SDT Balance of Treasury</p>
                                    <p className="card-value">
                                        {isAppLoading ? (
                                            <Skeleton width="250px" />
                                        ) : (
                                            `${new Intl.NumberFormat("en-US", {
                                                maximumFractionDigits: 0,
                                                minimumFractionDigits: 0,
                                            }).format(app.treasurySdtBalance)} SDT`
                                        )}
                                    </p>
                                </div>
                            </Grid>
                        )}
                        {isSmallScreen && (
                            <Grid item lg={6} md={6} sm={6} xs={12}>
                                <div className="dashboard-card">
                                    <p className="card-title">ANGLE Balance of Treasury</p>
                                    <p className="card-value">
                                        {isAppLoading ? (
                                            <Skeleton width="250px" />
                                        ) : (
                                            `${new Intl.NumberFormat("en-US", {
                                                maximumFractionDigits: 0,
                                                minimumFractionDigits: 0,
                                            }).format(app.angleTreasuryBalance)} ANGLE`
                                        )}
                                    </p>
                                </div>
                            </Grid>
                        )}
                        {isSmallScreen && (
                            <Grid item lg={6} md={6} sm={6} xs={12}>
                                <div className="dashboard-card">
                                    <p className="card-title">gOHM Balance of Treasury</p>
                                    <p className="card-value">
                                        {isAppLoading ? (
                                            <Skeleton width="250px" />
                                        ) : (
                                            `${new Intl.NumberFormat("en-US", {
                                                maximumFractionDigits: 0,
                                                minimumFractionDigits: 0,
                                            }).format(app.gOhmTreasuryBalance)} gOHM`
                                        )}
                                    </p>
                                </div>
                            </Grid>
                        )}
                        {isSmallScreen && (
                            <Grid item lg={6} md={6} sm={6} xs={12}>
                                <div className="dashboard-card">
                                    <p className="card-title">Vote per ${TOKEN_NAME}</p>
                                    <p className="card-value card-value-small">
                                        {isAppLoading ? (
                                            <Skeleton width="250px" />
                                        ) : (
                                            `${new Intl.NumberFormat("en-US", {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 0,
                                            }).format(fxsPerLobi)} FXS + ${new Intl.NumberFormat("en-US", {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 0,
                                            }).format(crvPerLobi)} CRV + ${new Intl.NumberFormat("en-US", {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 0,
                                            }).format(tokePerLobi)} TOKE`
                                        )}
                                    </p>
                                </div>
                            </Grid>
                        )}

                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <div className="dashboard-card">
                                <p className="card-title">Runway</p>
                                <p className="card-value">{isAppLoading ? <Skeleton width="250px" /> : `${trim(Number(app.runway), 1)} Days`}</p>
                            </div>
                        </Grid>
                    </Grid>
                </Zoom>
            </div>
            {!isSmallScreen && <div className="treasury-table">{isAppLoading ? <Skeleton width="250px" /> : <TreasuryTable />}</div>}
        </div>
    );
}

export default Dashboard;
