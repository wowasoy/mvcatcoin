// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import {MVCatCoin} from "../contracts/MVCatCoin.sol";

contract DeployMVCatCoin is Script {
    function run() external returns (MVCatCoin coin) {
        address admin = vm.envAddress("ADMIN_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        uint256 initialSupply = vm.envUint("INITIAL_SUPPLY");

        vm.startBroadcast();
        coin = new MVCatCoin(admin, treasury, initialSupply);
        vm.stopBroadcast();

        console2.log("MVCatCoin deployed at:", address(coin));
    }
}