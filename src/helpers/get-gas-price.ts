import { JsonRpcProvider } from "@ethersproject/providers";

export const getGasPrice = async (provider: JsonRpcProvider) => {
    const feeData = await provider.getFeeData();

    return !feeData.maxFeePerGas
        ? {
              gasPrice: feeData.gasPrice,
          }
        : {
              maxFeePerGas: feeData.maxFeePerGas?.mul(80).div(100),
              maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          };
};
