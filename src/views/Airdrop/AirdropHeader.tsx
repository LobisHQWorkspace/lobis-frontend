import { useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import BondLogo from "../../components/BondLogo";
import { IconButton, SvgIcon, Link } from "@material-ui/core";
import { ReactComponent as SettingsIcon } from "../../assets/icons/settings.svg";
import { ReactComponent as XIcon } from "../../assets/icons/x.svg";
import { useEscape } from "../../hooks";
import { IAllBondData } from "../../hooks/bonds";
import LobisLogo from "../../assets/icons/lobis-icon.svg";
function AirdropHeader() {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    let history = useHistory();

    useEscape(() => {
        if (open) handleClose;
        else history.push("/");
    });

    return (
        <div className="bond-header">
            <Link component={NavLink} to="/dashboard" className="cancel-bond">
                <SvgIcon color="primary" component={XIcon} />
            </Link>

            <div className="bond-header-logo">
                <img src={LobisLogo} width={50} />
            </div>
            <div className="bond-header-logo">
                <div className="bond-header-name"></div>
            </div>
        </div>
    );
}

export default AirdropHeader;
