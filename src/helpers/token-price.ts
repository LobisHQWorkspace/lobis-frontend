import axios from "axios";

const cache: { [key: string]: number } = {};

export const loadTokenPrices = async () => {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=olympus,chainlink,curve-dao-token,frax-share&vs_currencies=usd";
    const { data } = await axios.get(url);

    cache["OHM"] = data["olympus"].usd;
    cache["CRV"] = data["curve-dao-token"].usd;
    cache["FXS"] = data["frax-share"].usd;
};

export const getTokenPrice = (symbol: string): number => {
    return Number(cache[symbol]);
};
