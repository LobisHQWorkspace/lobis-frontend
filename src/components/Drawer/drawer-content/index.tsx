import { useCallback, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Social from "./social";
import StakeIcon from "../../../assets/icons/stake.svg";
import BondIcon from "../../../assets/icons/bond.svg";
import LobisIcon from "../../../assets/icons/lobis-icon.svg";
import DashboardIcon from "../../../assets/icons/dashboard.svg";
import GovernanceIcon from "../../../assets/icons/governance.svg";
import CalculatorIcon from "../../../assets/icons/calculator.svg";
import ForumIcon from "../../../assets/icons/forum.svg";
import EnvelopeIcon from "../../../assets/icons/envelope.svg";
import SushiIcon from "../../../assets/icons/sushi.svg";
import VoteIcon from "../../../assets/icons/vote.svg";
import { trim, shorten } from "../../../helpers";
import { useAddress } from "../../../hooks";
import useBonds from "../../../hooks/bonds";
import { Link } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import "./drawer-content.scss";
import DocsIcon from "../../../assets/icons/stake.svg";
import classnames from "classnames";
import { DEFAULD_NETWORK } from "../../../constants";
import { useSelector, useDispatch } from "react-redux";
import { IReduxState } from "../../../store/slices/state.interface";
import { BigNumber } from "@ethersproject/bignumber";
import addresses0 from "../../../constants/airdrop.json";
import addresses1 from "../../../constants/airdrop1.json";
import getClaimed from "src/helpers/get-claimed";
import { useWeb3Context } from "src/hooks/web3";
import { calcBondDetails } from "../../../store/slices/bond-slice";

function NavContent() {
    const [isActive] = useState();
    const dispatch = useDispatch();
    const { provider, chainID } = useWeb3Context();
    const { bonds } = useBonds();
    const [airdropButton, setAirdropButton] = useState(false);
    const [merkleIndex, setMerkleIndex] = useState(9999);

    const address: string = useAddress();

    // merkle 0
    useEffect(() => {
        (async () => {
            const claims: { [key: string]: any } = { ...addresses0.claims };

            if (Object.keys(addresses0.claims).indexOf(address) !== -1) {
                const result = await getClaimed(0, claims[address].index, provider);
                setMerkleIndex(0);
                !result && setAirdropButton(true);
            }
        })();
    }, []);

    // merkle 1
    useEffect(() => {
        (async () => {
            const claims: { [key: string]: any } = { ...addresses1.claims };

            if (Object.keys(addresses1.claims).indexOf(address) !== -1) {
                const result = await getClaimed(1, claims[address].index, provider);
                setMerkleIndex(1);
                !result && setAirdropButton(true);
            }
        })();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            bonds.map(bond => {
                dispatch(calcBondDetails({ bond, value: null, provider: provider, networkID: chainID }));
            });
            console.log("dispatching bond");
        }, 20000);
        return () => clearInterval(interval);
    }, []);
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
                <Link href="https://lobis.finance" target="_blank">
                    <img alt="" src={LobisIcon} width={40} />
                </Link>
                <Link href="https://lobis.finance" target="_blank">
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
                        to="/vote"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "vote");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <img alt="" src={VoteIcon} />
                            <p>Vote</p>
                        </div>
                    </Link>
                    <Link href="https://forum.lobis.finance" target="_blank" className={classnames("button-dapp-menu", { active: isActive })}>
                        <div className="dapp-menu-item">
                            <img alt="" src={ForumIcon} />
                            <p>Forum</p>
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
                    {airdropButton && (
                        <Link
                            component={NavLink}
                            to={merkleIndex === 0 ? "/airdrop" : "/airdrop-2"}
                            isActive={(match: any, location: any) => {
                                return checkPage(location, "airdrop");
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <p>Claim Your Airdrop!</p>
                            </div>
                        </Link>
                    )}
                    <Link
                        href="https://mirror.xyz/0x05Ce51f0B583D3666222f5803C51b1De8D4B35C2/Hrl-UnGbF3ep_QeU6rti-3ZKXvZDEDvFXa6-9HCSvW4"
                        target="_blank"
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <img alt="" src={EnvelopeIcon} />
                            <p>Second Envelope</p>
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
