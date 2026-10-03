# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| main    | Yes       |
| < main  | No        |

## Reporting a Vulnerability

Report security issues **privately** via Telegram:
[t.me/MVrocketRuns](https://t.me/MVrocketRuns)

Do **not** open a public GitHub issue for security problems.

**Response time:** within 72 hours.

If the report is valid, a fix will be prepared and disclosed after remediation.

## Scope

In scope:

- `contracts/MVCatCoin.sol`
- `contracts/MVStaking.sol`
- `contracts/MockToken.sol`
- `script/DeployMVCatCoin.s.sol`
- `script/DeployMVStaking.s.sol`
- `script/DeployMockStack.s.sol`
- `frontend/functions/api/check-token.ts`

Out of scope:

- Third-party dependencies (`openzeppelin-contracts`, `forge-std`, `viem`, `wagmi`)
- Frontend UI components
- Cloudflare infrastructure
- User wallets

## Areas of Interest

- Access control bypass on `MINTER_ROLE` and `DEFAULT_ADMIN_ROLE`
- Reward accounting errors in `MVStaking`
- Reentrancy vectors
- Integer overflow and underflow
- Incorrect `_update` override resolution in `MVCatCoin`
- Permit signature replay or nonce issues
- Vote delegation edge cases
- Cloudflare Function SSRF or header injection

## Best Practices Applied

- OpenZeppelin Contracts v5.3.0 (audited)
- Solidity 0.8.30 with built-in overflow checks
- `ReentrancyGuard` on all state-changing external functions
- `Ownable2Step` for ownership transfer
- Custom errors instead of `require` strings
- Role-based access control
- Fuzz testing via Foundry
- Content Security Policy via `_headers`
- No secrets committed (`.env` ignored)

## Disclosure Policy

Coordinated disclosure. Reporters are credited in release notes unless they
prefer to remain anonymous.

## Contact

Telegram: [t.me/MVrocketRuns](https://t.me/MVrocketRuns)