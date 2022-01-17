import { Networks } from "../../constants/blockchain";
import { LPBond } from "./lp-bond";
import { CustomBond } from "./stable-bond";

import crvIcon from "../../assets/tokens/CRV.svg";
import fxsIcon from "../../assets/tokens/FXS.svg";
import angleIcon from "../../assets/tokens/ANGLE.svg";
import TokeIcon from "../../assets/tokens/TOKE.webp";
import gOHMIcon from "../../assets/tokens/GOHM.webp";
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
export const tokeBond = new CustomBond({
    name: "toke",
    displayName: "TOKE",
    bondToken: "TOKE",
    bondIconSvg: TokeIcon,
    bondContractABI: abis.fxsBond,
    reserveContractAbi: abis.erc20,
    networkAddrs: {
        [Networks.MAINNET]: {
            bondAddress: addresses.tokeBond,
            reserveAddress: addresses.toke,
        },
    },
});

export const angleBond = new CustomBond({
    name: "angle",
    displayName: "ANGLE",
    bondToken: "ANGLE",
    bondIconSvg: angleIcon,
    bondContractABI: abis.fxsBond,
    reserveContractAbi: abis.erc20,
    networkAddrs: {
        [Networks.MAINNET]: {
            bondAddress: addresses.anglebond,
            reserveAddress: addresses.angle,
        },
    },
});
export const gOhmBond = new CustomBond({
    name: "gohm",
    displayName: "GOHM",
    bondToken: "GOHM",
    bondIconSvg: gOHMIcon,
    bondContractABI: abis.fxsBond,
    reserveContractAbi: abis.erc20,
    networkAddrs: {
        [Networks.MAINNET]: {
            bondAddress: addresses.gOhmBond,
            reserveAddress: addresses.gOhm,
        },
    },
});
export const lobiOHMBond = new LPBond({
    name: "lobi",
    displayName: "LOBI-OHM",
    bondToken: "OHM",
    lpUrl: "https://app.sushi.com/add/0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5/0xDEc41Db0c33F3F6f3cb615449C311ba22D418A8d",
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

export default [crvBond, fxsBond, lobiOHMBond, tokeBond, angleBond, gOhmBond];
