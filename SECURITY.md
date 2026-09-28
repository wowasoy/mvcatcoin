# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| main    | Yes       |
| < main  | No        |

## Reporting a Vulnerability

If you discover a security issue, report it privately via Telegram: [t.me/MVrocketRuns](https://t.me/MVrocketRuns).

Do not open a public GitHub issue. Response within 72 hours. If the report is valid, a fix will be prepared and disclosed after remediation.

## Scope

In scope:

- `contracts/MVCatCoin.sol`
- `contracts/MVStaking.sol`
- `script/DeployMVCatCoin.s.sol`
- `script/DeployMVStaking.s.sol`

Out of scope:

- Third-party dependencies (`openzeppelin-contracts`, `forge-std`)
- Frontend dashboard
- Deployment infrastructure not part of this repository

## Areas of Interest

- Access control bypass on `MINTER_ROLE` and `DEFAULT_ADMIN_ROLE`
- Reward accounting errors in `MVStaking`
- Reentrancy vectors
- Integer overflow and underflow
- Incorrect `_update` override resolution in `MVCatCoin`
- Permit signature replay or nonce issues
- Vote delegation edge cases

## Best Practices Applied

- OpenZeppelin Contracts v5.3.0
- Solidity 0.8.30 with built-in overflow checks
- `ReentrancyGuard` on all state-changing external functions
- `Ownable2Step` for ownership transfer
- Custom errors instead of require strings
- Role-based access control
- Fuzz testing via Foundry
- Continuous integration via GitHub Actions

## Disclosure Policy

Coordinated disclosure. Reporters are credited in release notes unless they prefer to remain anonymous.

## Contact

Telegram: [t.me/MVrocketRuns](https://t.me/MVrocketRuns)