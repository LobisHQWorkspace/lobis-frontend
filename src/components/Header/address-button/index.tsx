import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWeb3Context } from "../../../hooks";
import { DEFAULD_NETWORK } from "../../../constants";
import { IReduxState } from "../../../store/slices/state.interface";
import { IPendingTxn } from "../../../store/slices/pending-txns-slice";
import "./connect-menu.scss";
import { useAddress } from "src/hooks/web3";
import { shorten } from "src/helpers";
import { Link, Snackbar } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { NavLink } from "react-router-dom";
import addresses0 from "../../../constants/airdrop.json";
import addresses1 from "../../../constants/airdrop1.json";
import getClaimed from "src/helpers/get-claimed";

function AddressButton() {
    const { connect, disconnect, connected, web3, providerChainID, checkWrongNetwork, provider } = useWeb3Context();
    const dispatch = useDispatch();
    const [isConnected, setConnected] = useState(connected);
    const address = useAddress();
    const [open, setOpen] = useState(false);
    const [merkleIndex, setMerkleIndex] = useState(9999);

    let buttonText = "Connect Wallet";
    let clickFunc: any = connect;
    let buttonStyle = {};

    //merkle 0
    useEffect(() => {
        (async () => {
            const index = Object.keys(addresses0.claims).indexOf(address);
            const claims: { [key: string]: any } = { ...addresses0.claims };

            if (index !== -1) {
                const result = await getClaimed(0, claims[address].index, provider);
                setMerkleIndex(0);
                !result && setOpen(true);
            }
        })();
    }, []);

    //merkle 1
    useEffect(() => {
        (async () => {
            const index = Object.keys(addresses1.claims).indexOf(address);
            const claims: { [key: string]: any } = { ...addresses1.claims };
            if (index !== -1) {
                const result = await getClaimed(1, claims[address].index, provider);
                setMerkleIndex(1);
                !result && setOpen(true);
            }
        })();
    }, []);

    if (isConnected && providerChainID !== DEFAULD_NETWORK) {
        buttonText = "Wrong network";
        buttonStyle = { backgroundColor: "rgb(255, 67, 67)" };
        clickFunc = () => {
            checkWrongNetwork();
        };
    }
    const handleClose = () => {
        setOpen(false);
    };
    useEffect(() => {
        setConnected(connected);
    }, [web3, connected]);
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
    if (address && isConnected) {
        return (
            <div className="connect-button" style={buttonStyle} onClick={clickFunc}>
                <div className="wallet-link">
                    <Link href={`https://etherscan.io/address/${address}`} target="_blank">
                        <p>{shorten(address)}</p>
                    </Link>
                    <Snackbar
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        open={open}
                        onClose={handleClose}
                        autoHideDuration={30000}
                        message={<p>You are eligible for the airdrop!</p>}
                        action={
                            <div className="connect-button" style={buttonStyle}>
                                <Link
                                    className="airdrop-link"
                                    component={NavLink}
                                    to={merkleIndex === 0 ? "/airdrop" : "/airdrop-2"}
                                    isActive={(match: any, location: any) => {
                                        return checkPage(location, "airdrop");
                                    }}
                                >
                                    <p>CLAIM</p>
                                </Link>
                            </div>
                        }
                    />
                </div>
            </div>
        );
    }

    return null;
}

export default AddressButton;
