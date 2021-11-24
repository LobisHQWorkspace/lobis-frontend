import file from "./deploy.json";
import ERC20 from "../abi/ERC20.json";
import Pair from "../abi/Pair.json";
const deploy = file.contracts;

export default {
    lobi: deploy.LobiERC20.abi,
    treasury: deploy.LobisTreasury.abi,
    staking: deploy.LobisStaking.abi,
    sLobi: deploy.StakedLobiERC20.abi,
    distributor: deploy.Distributor.abi,
    stakingWarmup: deploy.StakingWarmup.abi,
    stakingHelper: deploy.StakingHelper.abi,
    crv: deploy.LobiERC20.abi,
    crvBond: deploy.TokenBondDepositoryCRV.abi,
    fxs: deploy.LobiERC20.abi,
    fxsBond: deploy.TokenBondDepositoryFXS.abi,
    ohmLobiBond: deploy.TokenBondDepositoryOHMLOBI.abi,
    erc20: ERC20.abi,
    pair: Pair,
};
