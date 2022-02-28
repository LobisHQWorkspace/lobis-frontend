import { IconButton, InputAdornment, Modal, OutlinedInput, Paper, SvgIcon } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as ArrowsIcon } from "../../assets/icons/arrow-up.svg";
import { ReactComponent as XIcon } from "../../assets/icons/x.svg";
import { messages } from "../../constants/messages";
import { trim } from "../../helpers";
import { useWeb3Context } from "../../hooks";
import { warning } from "../../store/slices/messages-slice";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { IReduxState } from "../../store/slices/state.interface";
import { calcWrapDetails, calcWrapPrice, changeApproval, changeWrap } from "../../store/slices/wrap-slice";
import "./wrap.scss";

interface IAdvancedSettingsProps {
    open: boolean;
    handleClose: () => void;
}

function Wrap({ open, handleClose }: IAdvancedSettingsProps) {
    const dispatch = useDispatch();
    const { provider, address, chainID, checkWrongNetwork } = useWeb3Context();

    const [value, setValue] = useState("");

    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);

    const sLobiBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.sLobi;
    });
    const wsLobiBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.wsLobi;
    });

    const wrapValue = 12;
    //     useSelector<IReduxState, string>(state => {
    //     return state.wrapping && state.wrapping.wrapValue;
    // });

    const wrapPrice = 12;
    //     useSelector<IReduxState, number>(state => {
    //     return state.wrapping && state.wrapping.wrapPrice;
    // });

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    // const sLobiAllowance = useSelector<IReduxState, number>(state => {
    //     return state.account.wrapping && state.account.wrapping.sLobi;
    // });

    const [isWrap, setIsWrap] = useState(true);
    const [isWrapPrice, setIsWrapPrice] = useState(true);

    const setMax = () => {
        if (isWrap) {
            setValue(sLobiBalance);
        } else {
            setValue(wsLobiBalance);
        }
    };

    const handleSwap = () => {
        setValue("");
        const value = !isWrap;
        setIsWrap(value);
        setIsWrapPrice(value);
    };

    const handleValueChange = (e: any) => {
        const value = e.target.value;
        setValue(value);
    };

    useEffect(() => {
        dispatch(calcWrapDetails({ isWrap, provider, value, networkID: chainID }));
    }, [value]);

    useEffect(() => {
        dispatch(calcWrapPrice({ isWrap: isWrapPrice, provider, networkID: chainID }));
    }, [isWrapPrice]);

    const onClose = () => {
        setValue("");
        setIsWrap(true);
        setIsWrapPrice(true);
        dispatch(calcWrapDetails({ isWrap, provider, value: "", networkID: chainID }));
        handleClose();
    };

    const hasAllowance = useCallback(() => 5 > 0, [5]);

    const trimmedSLobiBalance = trim(Number(sLobiBalance), 6);
    const trimmedWsLobiBalance = trim(Number(wsLobiBalance), 6);

    const getBalance = () => (isWrap ? `${trimmedSLobiBalance} sLobi` : `${trimmedWsLobiBalance} wsLobi`);

    const handleOnWrap = async () => {
        if (await checkWrongNetwork()) return;

        if (value === "" || parseFloat(value) === 0) {
            dispatch(warning({ text: isWrap ? messages.before_wrap : messages.before_unwrap }));
        } else {
            await dispatch(changeWrap({ isWrap, value, provider, networkID: chainID, address }));
            setValue("");
        }
    };

    const onSeekApproval = async () => {
        if (await checkWrongNetwork()) return;

        await dispatch(changeApproval({ address, provider, networkID: chainID }));
    };

    return (
        <Modal id="hades" open={open} onClose={onClose} hideBackdrop>
            <Paper className="ohm-card ohm-popover wrap-token-poper">
                <div className="cross-wrap wrap-cros-wrap">
                    <IconButton onClick={onClose}>
                        <SvgIcon color="primary" component={XIcon} />
                    </IconButton>
                    <div className="wrap-price" onClick={() => setIsWrapPrice(!isWrapPrice)}>
                        <p>
                            1 {isWrapPrice ? "sLobi" : "wsLobi"} = {`${trim(wrapPrice, 4)} ${isWrapPrice ? "wsLobi" : "sLobi"}`}
                        </p>
                    </div>
                </div>

                <div className="wrap-header-conteiner">
                    <p className="wrap-header-title">{isWrap ? "Wrap" : "Unwrap"}</p>
                    <p className="wrap-header-balance">Balance: {isAppLoading ? <Skeleton width="80px" /> : <>{getBalance()}</>}</p>
                </div>

                <div className="wrap-container">
                    <OutlinedInput
                        placeholder="Amount"
                        value={value}
                        onChange={handleValueChange}
                        fullWidth
                        type="number"
                        className="bond-input wrap-input"
                        startAdornment={
                            <InputAdornment position="start">
                                <div className="wrap-action-input-text">
                                    <p>{isWrap ? "sLobi" : "wsLobi"}</p>
                                </div>
                            </InputAdornment>
                        }
                        endAdornment={
                            <InputAdornment position="end">
                                <div onClick={setMax} className="wrap-action-input-btn">
                                    <p>Max</p>
                                </div>
                            </InputAdornment>
                        }
                    />
                    <div className="wrap-toggle">
                        <IconButton onClick={handleSwap}>
                            <SvgIcon color="primary" component={ArrowsIcon} />
                        </IconButton>
                    </div>
                    <OutlinedInput
                        placeholder="Amount"
                        value={wrapValue}
                        disabled
                        fullWidth
                        type="number"
                        className="bond-input wrap-input"
                        startAdornment={
                            <InputAdornment position="start">
                                <div className="wrap-action-input-text">
                                    <p>{isWrap ? "wsLobi" : "sLobi"}</p>
                                </div>
                            </InputAdornment>
                        }
                    />
                    {hasAllowance() ? (
                        <div
                            className="wrap-btn"
                            onClick={() => {
                                const inPending = isWrap ? isPendingTxn(pendingTransactions, "wrapping") : isPendingTxn(pendingTransactions, "unwrapping");
                                if (inPending) return;
                                handleOnWrap();
                            }}
                        >
                            <p>{isWrap ? txnButtonText(pendingTransactions, "wrapping", "Wrap") : txnButtonText(pendingTransactions, "unwrapping", "Unwrap")}</p>
                        </div>
                    ) : (
                        <div
                            className="wrap-btn"
                            onClick={() => {
                                if (isPendingTxn(pendingTransactions, "approve_wrapping")) return;
                                onSeekApproval();
                            }}
                        >
                            <p>{txnButtonText(pendingTransactions, "approve_wrapping", "Approve")}</p>
                        </div>
                    )}
                    {!hasAllowance() && (
                        <div className="wrap-help-text">
                            <p>Note: The "Approve" transaction is only needed when</p>
                            <p>wrapping for the first time; subsequent wrapping only</p>
                            <p>requires you to perform the "Wrap" transaction.</p>
                        </div>
                    )}
                </div>
            </Paper>
        </Modal>
    );
}

export default Wrap;
