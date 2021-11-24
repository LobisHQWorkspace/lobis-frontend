import { useEffect, useState } from "react";
import "./footer.scss";
import { Grid } from "@material-ui/core";
import { useSelector } from "react-redux";
import { IReduxState } from "../../../../store/slices/state.interface";
import { trim } from "../../../../helpers";
import { Skeleton } from "@material-ui/lab";
import axios from "axios";

function Footer() {
    const [data, setData] = useState<any>({});
    const [loadingData, setLoadingData] = useState(true);

    const getData = async () => {
        const { data } = await axios.get("https://lobis-api.vercel.app/api/stats");
        setData(data);
        setLoadingData(false);
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="landing-footer">
            <Grid container spacing={1}>
                <Grid item xs={12} sm={3} md={3} lg={3}>
                    <div className="landing-footer-item-wrap">
                        <p className="landing-footer-item-title">TVL</p>
                        <p className="landing-footer-item-value">
                            {loadingData ? (
                                <Skeleton width="180px" />
                            ) : (
                                new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(data.tvl)
                            )}
                        </p>
                    </div>
                </Grid>

                <Grid item xs={12} sm={3} md={3} lg={3}>
                    <div className="landing-footer-item-wrap">
                        <p className="landing-footer-item-title">Current APY</p>
                        <p className="landing-footer-item-value">
                            {loadingData ? (
                                <Skeleton width="150px" />
                            ) : (
                                <>
                                    {new Intl.NumberFormat("en-US", {
                                        style: "percent",
                                        maximumFractionDigits: 0,
                                        minimumFractionDigits: 0,
                                    }).format(parseFloat(data.apy))}
                                </>
                            )}
                        </p>
                    </div>
                </Grid>
                <Grid item xs={12} sm={3} md={3} lg={3}>
                    <div className="landing-footer-item-wrap">
                        <p className="landing-footer-item-title">CRV Balance Of Treasury</p>
                        <p className="landing-footer-item-value">
                            {loadingData ? (
                                <Skeleton width="180px" />
                            ) : (
                                new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(data.balances.crv)
                            )}
                        </p>
                    </div>
                </Grid>
                <Grid item xs={12} sm={3} md={3} lg={3}>
                    <div className="landing-footer-item-wrap">
                        <p className="landing-footer-item-title">FXS Balance Of Treasury</p>
                        <p className="landing-footer-item-value">
                            {loadingData ? (
                                <Skeleton width="180px" />
                            ) : (
                                new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(data.balances.fxs)
                            )}
                        </p>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}

export default Footer;
