// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/// @title MVCatCoin
/// @notice ERC20 governance and utility token with capped supply, permit, and on-chain voting.
/// @dev OpenZeppelin Contracts v5.3.0. Roles: DEFAULT_ADMIN_ROLE, MINTER_ROLE.
contract MVCatCoin is
    ERC20,
    ERC20Burnable,
    ERC20Capped,
    ERC20Permit,
    ERC20Votes,
    AccessControl
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000e18;

    error ZeroAddress();

    constructor(address admin, address treasury, uint256 initialSupply)
        ERC20("MVCatCoin", "MVCAT")
        ERC20Capped(MAX_SUPPLY)
        ERC20Permit("MVCatCoin")
    {
        if (admin == address(0) || treasury == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        if (initialSupply > 0) {
            _mint(treasury, initialSupply);
        }
    }

    /// @notice Mint new tokens. Caller must hold MINTER_ROLE.
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        _mint(to, amount);
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Capped, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}