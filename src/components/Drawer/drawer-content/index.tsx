import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./social";
import StakeIcon from "../../../assets/icons/stake.svg";
import BondIcon from "../../../assets/icons/bond.svg";
import LobisIcon from "../../../assets/icons/lobis-icon.svg";
import DashboardIcon from "../../../assets/icons/dashboard.svg";
import GovernanceIcon from "../../../assets/icons/governance.svg";
import CalculatorIcon from "../../../assets/icons/calculator.svg";
import SushiIcon from "../../../assets/icons/sushi.svg";
import { trim, shorten } from "../../../helpers";
import { useAddress } from "../../../hooks";
import useBonds from "../../../hooks/bonds";
import { Link } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import "./drawer-content.scss";
import DocsIcon from "../../../assets/icons/stake.svg";
import classnames from "classnames";
import { DEFAULD_NETWORK } from "../../../constants";
import { useSelector } from "react-redux";
import { IReduxState } from "../../../store/slices/state.interface";
function NavContent() {
    const [isActive] = useState();

    const { bonds } = useBonds();

    const networkID = useSelector<IReduxState, number>(state => {
        return (state.app && state.app.networkID) || DEFAULD_NETWORK;
    });

    const checkPage = useCallback((location: any, page: string): boolean => {
        const currentPath = location.pathname.replace("/", "");
        if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
            return true;
        }
        if (currentPath.indexOf("stake") >= 0 && page === "stake") {
            return true;
        }
        if (currentPath.indexOf("mints") >= 0 && page === "mints") {
            return true;
        }
        return false;
    }, []);

    return (
        <div className="dapp-sidebar">
            <div className="branding-header">
                <Link href="https://app.lobis.finance" target="_blank">
                    <img alt="" src={LobisIcon} width={40} />
                </Link>
                <Link href="https://app.lobis.finance" target="_blank">
                    <h2>LOBIS</h2>
                </Link>
            </div>

            <div className="dapp-menu-links">
                <div className="dapp-nav">
                    <Link
                        component={NavLink}
                        to="/dashboard"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "dashboard");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <img alt="" src={DashboardIcon} />
                            <p>Dashboard</p>
                        </div>
                    </Link>

                    <Link
                        component={NavLink}
                        to="/governance"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "governance");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <img alt="" src={GovernanceIcon} />
                            <p>Governance</p>
                        </div>
                    </Link>

                    <Link
                        component={NavLink}
                        to="/stake"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "stake");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <img alt="" src={StakeIcon} />
                            <p>Stake</p>
                        </div>
                    </Link>

                    <Link
                        component={NavLink}
                        id="bond-nav"
                        to="/mints"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "mints");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <img alt="" src={BondIcon} />
                            <p>Mint</p>
                        </div>
                    </Link>

                    <div className="bond-discounts">
                        <p>Mint discounts</p>
                        {bonds.map((bond, i) => (
                            <Link component={NavLink} to={`/mints/${bond.name}`} key={i} className={"bond"}>
                                {!bond.bondDiscount ? (
                                    <Skeleton variant="text" width={"150px"} />
                                ) : (
                                    <p>
                                        {bond.displayName}
                                        <span className="bond-pair-roi">{bond.bondDiscount && trim(bond.bondDiscount * 100, 2)}%</span>
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                    <Link
                        component={NavLink}
                        to="/calculator"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "calculator");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <img alt="" src={CalculatorIcon} />
                            <p>Calculator</p>
                        </div>
                    </Link>
                    <Link
                        href={`https://app.sushi.com/swap?outputCurrency=0xDEc41Db0c33F3F6f3cb615449C311ba22D418A8d`}
                        className={classnames("button-dapp-menu", { active: isActive })}
                        target="_blank"
                    >
                        <div className="dapp-menu-item">
                            <img alt="" src={SushiIcon} />
                            <p>Buy LOBIS On Sushi</p>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="dapp-menu-doc-link">
                <Link href="https://lobis.gitbook.io/" target="_blank">
                    <img alt="" src={DocsIcon} />
                    <p>Docs</p>
                </Link>
            </div>
            <Social />
        </div>
    );
}

export default NavContent;
