// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockToken
/// @notice Test ERC20 with a public faucet for Sepolia demos.
/// @dev Anyone can call faucet() once every 24 hours to receive 1,000 tokens.
contract MockToken is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 1_000e18;
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    mapping(address => uint256) public lastClaim;

    event FaucetClaimed(address indexed account, uint256 amount);

    error FaucetCooldown(uint256 secondsRemaining);

    constructor(string memory name_, string memory symbol_, uint256 initialSupply)
        ERC20(name_, symbol_)
    {
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    /// @notice Claim 1,000 tokens. Cooldown: 24 hours per address.
    function faucet() external {
        uint256 next = lastClaim[msg.sender] + FAUCET_COOLDOWN;
        if (block.timestamp < next) {
            revert FaucetCooldown(next - block.timestamp);
        }
        lastClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
}