// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import {MVStaking} from "../contracts/MVStaking.sol";

contract DeployMVStaking is Script {
    function run() external returns (MVStaking staking) {
        address stakingToken = vm.envAddress("STAKING_TOKEN");
        address rewardsToken = vm.envAddress("REWARDS_TOKEN");
        address owner = vm.envAddress("ADMIN_ADDRESS");

        vm.startBroadcast();
        staking = new MVStaking(stakingToken, rewardsToken, owner);
        vm.stopBroadcast();

        console2.log("MVStaking deployed at:", address(staking));
    }
}