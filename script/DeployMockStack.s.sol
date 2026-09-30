// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import {MockToken} from "../contracts/MockToken.sol";
import {MVStaking} from "../contracts/MVStaking.sol";

/// @notice Deploy MockToken and MVStaking in one transaction batch.
/// @dev Reads ADMIN_ADDRESS from .env. Uses MRWD for both stake and reward.
contract DeployMockStack is Script {
    function run() external returns (MockToken token, MVStaking staking) {
        address owner = vm.envAddress("ADMIN_ADDRESS");

        vm.startBroadcast();

        // 1. Deploy mock token with 1M initial supply to deployer
        token = new MockToken("MVCat Mock", "MRWD", 1_000_000e18);
        console2.log("MockToken:", address(token));

        // 2. Deploy staking using MRWD for both stake and reward
        staking = new MVStaking(address(token), address(token), owner);
        console2.log("MVStaking:", address(staking));

        // 3. Fund reward pool with 100,000 MRWD
        token.transfer(address(staking), 100_000e18);

        // 4. Set reward rate: 0.1 MRWD/sec pool-wide
        staking.setRewardRate(1e17);

        vm.stopBroadcast();
    }
}