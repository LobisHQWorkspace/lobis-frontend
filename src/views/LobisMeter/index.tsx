import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Grid, InputAdornment, OutlinedInput, Zoom, Slider, Divider } from "@material-ui/core";
import { trim } from "../../helpers";
import "./lobismeter.scss";
import { useWeb3Context } from "../../hooks";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { STAKING_TOKEN_NAME, TOKEN_NAME } from "src/constants";
import { warning } from "../../store/slices/messages-slice";

function LobisMeter() {
    const dispatch = useDispatch();
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();

    const [view, setView] = useState(0);
    const [quantity, setQuantity] = useState<string>("");
    const [rewardYield, setRewardYield] = useState<string>("");
    const [lobiPrice, setLobiPrice] = useState<string>("");
    const [days, setDays] = useState<number>(30);
    const [futureLobiPrice, setFutureLobiPrice] = useState<string>("");
    const [apy, setApy] = useState<string>("");
    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);

    const sLobiBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.sLobi;
    });

    const stakingRebase = useSelector<IReduxState, number>(state => {
        return state.app.stakingRebase;
    });
    const stakingAPY = useSelector<IReduxState, number>(state => {
        return state.app.stakingAPY;
    });

    const marketPrice = useSelector<IReduxState, number>(state => {
        return state.app.marketPrice;
    });
    const epoch = useSelector<IReduxState, any[]>(state => {
        return state.app.epoch;
    });

    const handleDays = (newValue: number | number[]) => {
        setDays(newValue as number);
    };
    const setMax = () => {
        setQuantity(sLobiBalance);
    };
    const handleAPY = (value: string) => {
        setApy(value);
        const newRewardYield = (Math.pow(Number(value) / 100, 1 / (365 * dailyRebaseAmounts)) - 1) * 100;
        setRewardYield(trim(newRewardYield, 4).toString());
        if (value === "") {
            setRewardYield("");
        }
    };
    const handleRewardYield = (value: string) => {
        setRewardYield(value);
        const newAPY = (Math.pow(1 + Number(value) / 100, 365 * dailyRebaseAmounts) - 1) * 100;
        setApy(trim(newAPY, 4).toString());
        if (value === "") {
            setApy("");
        }
    };
    const setCurrent = (type: string) => {
        switch (type) {
            case "rewardYield":
                setRewardYield(stakingRebasePercentage);
                const newAPY = (Math.pow(1 + Number(stakingRebasePercentage) / 100, 365 * dailyRebaseAmounts) - 1) * 100;
                setApy(trim(newAPY, 4).toString());
                break;
            case "setPrice":
                setLobiPrice(marketPrice.toString());
                break;
            case "futurePrice":
                setFutureLobiPrice(marketPrice.toString());
                break;
        }
    };

    const trimmedSLobiBalance = trim(Number(sLobiBalance), 6);
    const stakingRebasePercentage = trim(stakingRebase * 100, 4);
    const blockSecondLength = 13;
    const rebaseTimeInSeconds = epoch ? epoch[0] * blockSecondLength : 28800;
    const dailyRebaseAmounts = 86400 / rebaseTimeInSeconds;
    const totalReturn = (Math.pow(1 + Number(rewardYield) / 100, days * dailyRebaseAmounts) - 1) * Number(quantity);
    const initialInvestment = parseFloat(lobiPrice) * parseFloat(quantity);
    const potentialReturn = parseFloat(futureLobiPrice) * (totalReturn + Number(quantity)) - initialInvestment;
    const daysUntilTwoTimes = Math.log(2) / Math.log(1 + Number(rewardYield) / 100) / dailyRebaseAmounts;
    const daysUntilFiveTimes = Math.log(5) / Math.log(1 + Number(rewardYield) / 100) / dailyRebaseAmounts;
    const daysUntilTenTimes = Math.log(10) / Math.log(1 + Number(rewardYield) / 100) / dailyRebaseAmounts;
    return (
        <div className="stake-view">
            <Zoom in={true}>
                <div className="stake-card">
                    <Grid className="stake-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="stake-card-header">
                                <p className="stake-card-header-title">Calculator</p>
                                <p className="stake-card-header-description">Please fill the inputs to simulate your rewards</p>
                            </div>
                        </Grid>

                        <Grid item>
                            <div className="stake-card-metrics">
                                <Grid container spacing={2}>
                                    <Grid item lg={4} md={4} sm={4} xs={12}>
                                        <div className="stake-card-apy">
                                            <p className="stake-card-metrics-title">{TOKEN_NAME} Price</p>
                                            <p className="stake-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `$${trim(marketPrice, 2)}`}</p>
                                        </div>
                                    </Grid>

                                    <Grid item xs={12} sm={4} md={4} lg={4}>
                                        <div className="stake-card-tvl">
                                            <p className="stake-card-metrics-title">Current Reward Yield</p>
                                            <p className="stake-card-metrics-value">{isAppLoading ? <Skeleton width="80px" /> : <>{stakingRebasePercentage}%</>}</p>
                                        </div>
                                    </Grid>

                                    <Grid item xs={12} sm={4} md={4} lg={4}>
                                        <div className="stake-card-index">
                                            <p className="stake-card-metrics-title">Your {STAKING_TOKEN_NAME} Balance</p>
                                            <p className="stake-card-metrics-value">
                                                {isAppLoading ? (
                                                    <Skeleton width="80px" />
                                                ) : (
                                                    <>
                                                        {trimmedSLobiBalance} {STAKING_TOKEN_NAME}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                        </Grid>

                        <div className="stake-card-area">
                            {address && (
                                <div>
                                    <div className="stake-card-action-area">
                                        <div className="stake-card-action-row">
                                            <OutlinedInput
                                                type="number"
                                                placeholder={`${STAKING_TOKEN_NAME} amount`}
                                                className="stake-card-action-input"
                                                value={quantity}
                                                onChange={e => setQuantity(e.target.value)}
                                                labelWidth={0}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <div onClick={setMax} className="stake-card-action-input-btn">
                                                            <p>Max</p>
                                                        </div>
                                                    </InputAdornment>
                                                }
                                            />
                                        </div>
                                        <div className="stake-card-action-row">
                                            <OutlinedInput
                                                type="number"
                                                placeholder={`APY (%)`}
                                                className="stake-card-action-input"
                                                value={apy}
                                                onChange={e => handleAPY(e.target.value)}
                                                labelWidth={0}
                                                endAdornment={<InputAdornment position="end"></InputAdornment>}
                                            />
                                        </div>
                                        <div className="stake-card-action-row">
                                            <OutlinedInput
                                                type="number"
                                                placeholder={`Reward yield each rebase (%)`}
                                                className="stake-card-action-input"
                                                value={rewardYield}
                                                onChange={e => handleRewardYield(e.target.value)}
                                                labelWidth={0}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <div onClick={() => setCurrent("rewardYield")} className="stake-card-action-input-btn">
                                                            <p>Current</p>
                                                        </div>
                                                    </InputAdornment>
                                                }
                                            />
                                        </div>
                                        <div className="stake-card-action-row">
                                            <OutlinedInput
                                                type="number"
                                                placeholder={`${TOKEN_NAME} price at purchase ($) `}
                                                className="stake-card-action-input"
                                                value={lobiPrice}
                                                onChange={e => setLobiPrice(e.target.value)}
                                                labelWidth={0}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <div onClick={() => setCurrent("setPrice")} className="stake-card-action-input-btn">
                                                            <p>Current</p>
                                                        </div>
                                                    </InputAdornment>
                                                }
                                            />
                                        </div>
                                        <div className="stake-card-action-row">
                                            <OutlinedInput
                                                type="number"
                                                placeholder={`Future ${TOKEN_NAME} market price ($)`}
                                                className="stake-card-action-input"
                                                value={futureLobiPrice}
                                                onChange={e => setFutureLobiPrice(e.target.value)}
                                                labelWidth={0}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <div onClick={() => setCurrent("futurePrice")} className="stake-card-action-input-btn">
                                                            <p>Current</p>
                                                        </div>
                                                    </InputAdornment>
                                                }
                                            />
                                        </div>
                                        <div className="stake-card-action-row">
                                            <Slider className="slider" min={1} max={365} onChange={(e, val) => handleDays(val)} value={days} />{" "}
                                            <p className="days-text">
                                                {days} {days === 1 ? "Day" : "Days"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="stake-user-data">
                                        <div className="data-row">
                                            <p className="data-row-name">Your Initial Investment</p>
                                            <p className="data-row-value">
                                                {isAppLoading ? (
                                                    <Skeleton width="80px" />
                                                ) : (
                                                    <>
                                                        {initialInvestment > 0
                                                            ? new Intl.NumberFormat("en-US", {
                                                                  style: "currency",
                                                                  currency: "USD",
                                                                  maximumFractionDigits: 5,
                                                                  minimumFractionDigits: 0,
                                                              }).format(initialInvestment)
                                                            : new Intl.NumberFormat("en-US", {
                                                                  style: "currency",
                                                                  currency: "USD",
                                                                  maximumFractionDigits: 0,
                                                                  minimumFractionDigits: 0,
                                                              }).format(0)}
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        {/*<div className="data-row">
                                            <p className="data-row-name">Current Wealth</p>
                                            <p className="data-row-value">
                                                {
                                                    <>
                                                        {marketPrice * parseFloat(trimmedSLobiBalance) > 0
                                                            ? new Intl.NumberFormat("en-US", {
                                                                  style: "currency",
                                                                  currency: "USD",
                                                                  maximumFractionDigits: 5,
                                                                  minimumFractionDigits: 0,
                                                              }).format(marketPrice * parseFloat(trimmedSLobiBalance))
                                                            : new Intl.NumberFormat("en-US", {
                                                                  style: "currency",
                                                                  currency: "USD",
                                                                  maximumFractionDigits: 0,
                                                                  minimumFractionDigits: 0,
                                                              }).format(0)}
                                                    </>
                                                }
                                            </p>
                                            </div>*/}

                                        <div className="data-row">
                                            <p className="data-row-name">{`${TOKEN_NAME} rewards estimation`}</p>
                                            <p className="data-row-value">{totalReturn > 0 ? `${trim(totalReturn, 4)} ${TOKEN_NAME}` : `0 ${TOKEN_NAME}`}</p>
                                        </div>

                                        <div className="data-row">
                                            <p className="data-row-name">Total return</p>
                                            <p className="data-row-value">
                                                {!isNaN(potentialReturn)
                                                    ? new Intl.NumberFormat("en-US", {
                                                          style: "currency",
                                                          currency: "USD",
                                                          maximumFractionDigits: 5,
                                                          minimumFractionDigits: 0,
                                                      }).format(potentialReturn)
                                                    : "--"}
                                            </p>
                                        </div>
                                        {rewardYield !== "" && (
                                            <div style={{ width: "100%" }}>
                                                <Divider style={{ backgroundColor: " rgba(255, 255, 255, 0.2)" }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {rewardYield !== "" && (
                                <div className="stake-user-data">
                                    <div className="data-row">
                                        <p className="data-row-name">Amount of days Until...</p>
                                        <p className="data-row-value"></p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">2x {STAKING_TOKEN_NAME}</p>
                                        <p className="data-row-value">
                                            {daysUntilTwoTimes.toFixed(1)} {daysUntilTwoTimes > 1 ? "Days" : "Day"}
                                        </p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">5x {STAKING_TOKEN_NAME}</p>
                                        <p className="data-row-value">
                                            {daysUntilFiveTimes.toFixed(1)} {daysUntilTwoTimes > 1 ? "Days" : "Day"}
                                        </p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">10x {STAKING_TOKEN_NAME}</p>
                                        <p className="data-row-value">
                                            {daysUntilTenTimes.toFixed(1)} {daysUntilTwoTimes > 1 ? "Days" : "Day"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Grid>
                </div>
            </Zoom>
        </div>
    );
}

export default LobisMeter;
