// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {MVCatCoin} from "../contracts/MVCatCoin.sol";
import {MVStaking} from "../contracts/MVStaking.sol";

contract MVStakingTest is Test {
    MVCatCoin internal stakingToken;
    MVCatCoin internal rewardsToken;
    MVStaking internal staking;

    address internal owner = address(0xA11CE);
    address internal alice = address(0xA1);
    address internal bob = address(0xB0B);

    function setUp() public {
        vm.startPrank(owner);
        stakingToken = new MVCatCoin(owner, owner, 1_000_000e18);
        rewardsToken = new MVCatCoin(owner, owner, 1_000_000e18);
        staking = new MVStaking(address(stakingToken), address(rewardsToken), owner);
        stakingToken.transfer(alice, 10_000e18);
        stakingToken.transfer(bob, 10_000e18);
        rewardsToken.transfer(address(staking), 100_000e18);
        staking.setRewardRate(1e18);
        vm.stopPrank();
    }

    function testStakeAndWithdraw() public {
        vm.startPrank(alice);
        stakingToken.approve(address(staking), 1_000e18);
        staking.stake(1_000e18);
        assertEq(staking.staked(alice), 1_000e18);
        assertEq(staking.totalStaked(), 1_000e18);

        staking.withdraw(500e18);
        assertEq(staking.staked(alice), 500e18);
        vm.stopPrank();
    }

    function testRewardAccrual() public {
        vm.startPrank(alice);
        stakingToken.approve(address(staking), 1_000e18);
        staking.stake(1_000e18);
        vm.stopPrank();

        vm.warp(block.timestamp + 100);
        uint256 earned = staking.earned(alice);
        assertApproxEqAbs(earned, 100e18, 1e15);
    }

    function testWithdrawRevertsAboveStake() public {
        vm.prank(alice);
        vm.expectRevert();
        staking.withdraw(1e18);
    }

    function testSetRewardRateOnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        staking.setRewardRate(2e18);
    }

    function testRecoverRevertsForStakingToken() public {
        vm.prank(owner);
        vm.expectRevert();
        staking.recoverERC20(address(stakingToken), 1e18);
    }
}