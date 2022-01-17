import { Typography, Box, Modal, Paper, SvgIcon, IconButton, FormControl, OutlinedInput, InputLabel, InputAdornment } from "@material-ui/core";
import { ReactComponent as XIcon } from "../../assets/icons/x.svg";
import "./bondSettings.scss";

interface IAdvancedSettingsProps {
    open: boolean;
    handleClose: () => void;
    slippage: number;
    recipientAddress: string;
    onRecipientAddressChange: (e: any) => void;
    onSlippageChange: (e: any) => void;
}

function AdvancedSettings({ open, handleClose, slippage, recipientAddress, onRecipientAddressChange, onSlippageChange }: IAdvancedSettingsProps) {
    return (
        <Modal id="hades" open={open} onClose={handleClose} hideBackdrop>
            <Paper className="ohm-card ohm-popover">
                <div className="cross-wrap">
                    <IconButton onClick={handleClose}>
                        <SvgIcon color="primary" component={XIcon} />
                    </IconButton>
                </div>

                <Box className="card-content">
                    <InputLabel htmlFor="slippage">
                        <p className="input-lable">Slippage</p>
                    </InputLabel>
                    <FormControl variant="outlined" color="primary" fullWidth>
                        <OutlinedInput
                            id="slippage"
                            value={slippage}
                            onChange={onSlippageChange}
                            fullWidth
                            type="number"
                            //@ts-ignore
                            max="100"
                            min="100"
                            className="bond-input"
                            endAdornment={
                                <InputAdornment position="end">
                                    <p className="percent">%</p>
                                </InputAdornment>
                            }
                        />
                        <div className="help-text">
                            <p className="text-bond-desc">Transaction may revert if price changes by more than slippage %</p>
                        </div>
                    </FormControl>
                </Box>
            </Paper>
        </Modal>
    );
}

export default AdvancedSettings;
