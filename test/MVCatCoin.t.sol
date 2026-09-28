// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {MVCatCoin} from "../contracts/MVCatCoin.sol";

contract MVCatCoinTest is Test {
    MVCatCoin internal coin;
    address internal admin = address(0xA11CE);
    address internal treasury = address(0xB0B);
    address internal alice = address(0xA1);

    uint256 internal constant INITIAL_SUPPLY = 100_000_000e18;

    function setUp() public {
        vm.prank(admin);
        coin = new MVCatCoin(admin, treasury, INITIAL_SUPPLY);
    }

    function testInitialState() public view {
        assertEq(coin.name(), "MVCatCoin");
        assertEq(coin.symbol(), "MVCAT");
        assertEq(coin.totalSupply(), INITIAL_SUPPLY);
        assertEq(coin.balanceOf(treasury), INITIAL_SUPPLY);
        assertEq(coin.MAX_SUPPLY(), 1_000_000_000e18);
    }

    function testMintByMinter() public {
        vm.prank(admin);
        coin.mint(alice, 1_000e18);
        assertEq(coin.balanceOf(alice), 1_000e18);
    }

    function testMintRevertsForNonMinter() public {
        vm.prank(alice);
        vm.expectRevert();
        coin.mint(alice, 1_000e18);
    }

    function testMintRevertsAboveCap() public {
        vm.prank(admin);
        vm.expectRevert();
        coin.mint(alice, 1_000_000_000e18);
    }

    function testBurn() public {
        vm.prank(treasury);
        coin.burn(1_000e18);
        assertEq(coin.totalSupply(), INITIAL_SUPPLY - 1_000e18);
    }

    function testFuzzTransfer(uint256 amount) public {
        amount = bound(amount, 1, INITIAL_SUPPLY);
        vm.prank(treasury);
        coin.transfer(alice, amount);
        assertEq(coin.balanceOf(alice), amount);
    }
}