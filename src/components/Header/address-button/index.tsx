import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWeb3Context } from "../../../hooks";
import { DEFAULD_NETWORK } from "../../../constants";
import { IReduxState } from "../../../store/slices/state.interface";
import { IPendingTxn } from "../../../store/slices/pending-txns-slice";
import "./connect-menu.scss";
import { useAddress } from "src/hooks/web3";
import { shorten } from "src/helpers";
import { Link } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

function AddressButton() {
    const { connect, disconnect, connected, web3, providerChainID, checkWrongNetwork } = useWeb3Context();
    const dispatch = useDispatch();
    const [isConnected, setConnected] = useState(connected);
    const address = useAddress();

    let buttonText = "Connect Wallet";
    let clickFunc: any = connect;
    let buttonStyle = {};

    if (isConnected && providerChainID !== DEFAULD_NETWORK) {
        buttonText = "Wrong network";
        buttonStyle = { backgroundColor: "rgb(255, 67, 67)" };
        clickFunc = () => {
            checkWrongNetwork();
        };
    }

    useEffect(() => {
        setConnected(connected);
    }, [web3, connected]);

    if (address && isConnected) {
        return (
            <div className="connect-button" style={buttonStyle} onClick={clickFunc}>
                <div className="wallet-link">
                    <Link href={`https://etherscan.io/address/${address}`} target="_blank">
                        <p>{shorten(address)}</p>
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}

export default AddressButton;
