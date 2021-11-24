import { Networks } from "../../constants/blockchain";
import { LPBond } from "./lp-bond";
import { CustomBond } from "./stable-bond";

import crvIcon from "../../assets/tokens/CRV.svg";
import fxsIcon from "../../assets/tokens/FXS.svg";
import slpOhmLobiIcon from "../../assets/tokens/SLP-OHM-LOBI.svg";
import addresses from "../../constants/addresses-list";
import abis from "../../constants/abi-list";

export const crvBond = new CustomBond({
    name: "crv",
    displayName: "CRV",
    bondToken: "CRV",
    bondIconSvg: crvIcon,
    bondContractABI: abis.crvBond,
    reserveContractAbi: abis.erc20,
    networkAddrs: {
        [Networks.MAINNET]: {
            bondAddress: addresses.crvBond,
            reserveAddress: addresses.crv,
        },
    },
});

export const fxsBond = new CustomBond({
    name: "fxs",
    displayName: "FXS",
    bondToken: "FXS",
    bondIconSvg: fxsIcon,
    bondContractABI: abis.fxsBond,
    reserveContractAbi: abis.erc20,
    networkAddrs: {
        [Networks.MAINNET]: {
            bondAddress: addresses.fxsBond,
            reserveAddress: addresses.fxs,
        },
    },
});

export const lobiOHMBond = new LPBond({
    name: "lobi",
    displayName: "LOBI-OHM",
    bondToken: "LOBI",
    lpUrl: "https://app.sushi.com/add/0x383518188C0C6d7730D91b2c03a03C837814a899/0x873ad91fa4f2aa0d557c0919ec3f6c9d240cdd05",
    bondIconSvg: slpOhmLobiIcon,
    bondContractABI: abis.ohmLobiBond,
    reserveContractAbi: abis.pair,
    networkAddrs: {
        [Networks.MAINNET]: {
            bondAddress: addresses.ohmLobiBond,
            reserveAddress: addresses.pair,
        },
    },
});

export default [crvBond, fxsBond, lobiOHMBond];
