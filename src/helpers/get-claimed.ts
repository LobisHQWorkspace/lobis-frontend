import { useEffect, useState, useCallback } from "react";
import { Contract } from "ethers";
import addresses from "../constants/addresses-list";
import abis from "../constants/abi-list";
export default async function getClaimed(merkleIndex: number, userMerkleIndex: number, provider: any) {
    const merkleDistributor = new Contract(addresses.merkleDistributor, abis.merkleDistributor, provider);
    const result = await merkleDistributor.isClaimed(merkleIndex, userMerkleIndex);
    return result;
}
