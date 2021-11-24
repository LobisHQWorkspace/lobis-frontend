import file from "./deploy.json";
const deploy = file.contracts;

export default {
    lobi: deploy.LobiERC20.address,
    treasury: deploy.LobisTreasury.address,
    staking: deploy.LobisStaking.address,
    sLobi: deploy.StakedLobiERC20.address,
    stakingWarmup: deploy.StakingWarmup.address,
    stakingHelper: deploy.StakingHelper.address,
    crv: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    crvBond: deploy.TokenBondDepositoryCRV.address,
    fxs: "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
    fxsBond: deploy.TokenBondDepositoryFXS.address,
    pair: "0x2734F4A846D1127f4B5D3BAb261FaCfe51dF1D9a",
    ohmLobiBond: deploy.TokenBondDepositoryOHMLOBI.address,
};
