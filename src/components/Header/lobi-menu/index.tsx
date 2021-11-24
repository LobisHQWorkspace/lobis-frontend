import { useState } from "react";
import { TOKEN_DECIMALS } from "../../../constants";
import { Link, Fade, Popper } from "@material-ui/core";
import "./lobi-menu.scss";
import { getTokenUrl } from "../../../helpers";
import { TOKEN_NAME, STAKING_TOKEN_NAME } from "src/constants/addresses";

import addresses from "../../../constants/addresses-list";

const addTokenToWallet = (tokenSymbol: string, tokenAddress: string) => async () => {
    const tokenImage = getTokenUrl(tokenSymbol.toLowerCase());

    if (window.ethereum) {
        try {
            await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: TOKEN_DECIMALS,
                        image: tokenImage,
                    },
                },
            });
        } catch (error) {
            console.log(error);
        }
    }
};

function LobiMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const isEthereumAPIAvailable = window.ethereum;

    const LOBI_ADDRESS = addresses.lobi;
    const SLOBI_ADDRESS = addresses.sLobi;

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const open = Boolean(anchorEl);

    return (
        <div className="lobi-menu-root" onMouseEnter={e => handleClick(e)} onMouseLeave={e => handleClick(e)}>
            <div className="lobi-menu-btn">
                <p>{TOKEN_NAME}</p>
            </div>

            <Popper className="lobi-menu-popper" open={open} anchorEl={anchorEl} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                        <div className="tooltip">
                            <Link className="tooltip-item" href={`https://app.sushi.com/swap?outputCurrency=0xDEc41Db0c33F3F6f3cb615449C311ba22D418A8d`} target="_blank">
                                <p>Buy on Sushiswap</p>
                            </Link>

                            {isEthereumAPIAvailable && (
                                <div className="add-tokens">
                                    <div className="tooltip-item" onClick={addTokenToWallet(`${TOKEN_NAME}`, LOBI_ADDRESS)}>
                                        <p>{TOKEN_NAME}</p>
                                    </div>
                                    <div className="tooltip-item" onClick={addTokenToWallet(`${STAKING_TOKEN_NAME}`, SLOBI_ADDRESS)}>
                                        <p>{STAKING_TOKEN_NAME}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Fade>
                )}
            </Popper>
        </div>
    );
}

export default LobiMenu;
