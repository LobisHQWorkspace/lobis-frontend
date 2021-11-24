import { ethers } from "ethers";
import { Networks } from "../constants/blockchain";
import addresses from "../constants/addresses-list";
import abis from "../constants/abi-list";

export async function getMarketPrice(networkID: Networks, provider: ethers.Signer | ethers.providers.Provider): Promise<number> {
    const pairContract = new ethers.Contract(addresses.pair, abis.pair, provider);
    const reserves = await pairContract.getReserves();
    const marketPrice = reserves[0] / reserves[1];
    return marketPrice;
}

export async function getLPWorthInOhm(amount: number, provider: ethers.Signer | ethers.providers.Provider): Promise<number> {
    const pairContract = new ethers.Contract(addresses.pair, abis.pair, provider);
    const reserves = await pairContract.getReserves();
    const totalSupply = await pairContract.totalSupply();
    const token0 = await pairContract.token0();
    const reserve = token0.toLowerCase() === addresses.lobi.toLowerCase() ? reserves[1] : reserves[0];
    return (reserve.mul(amount).div(totalSupply) / 1e9) * 2;
}
