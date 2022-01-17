import axios from "axios";

const cache: { [key: string]: number } = {};

export const loadTokenPrices = async () => {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=olympus,chainlink,curve-dao-token,frax-share,tokemak,stake-dao,angle-protocol,governance-ohm&vs_currencies=usd";
    const { data } = await axios.get(url);

    cache["OHM"] = data["olympus"].usd;
    cache["CRV"] = data["curve-dao-token"].usd;
    cache["FXS"] = data["frax-share"].usd;
    cache["TOKE"] = data["tokemak"].usd;
    cache["SDT"] = data["stake-dao"].usd;
    cache["ANGLE"] = data["angle-protocol"].usd;
    cache["GOHM"] = data["governance-ohm"].usd;
};

export const getTokenPrice = (symbol: string): number => {
    return Number(cache[symbol]);
};
