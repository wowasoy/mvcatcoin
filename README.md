# MVCatCoin

[![CI](https://github.com/wowasoy/mvcatcoin/actions/workflows/ci.yml/badge.svg)](https://github.com/wowasoy/mvcatcoin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-363636.svg)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Foundry-1.5.0-black.svg)](https://getfoundry.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](https://www.typescriptlang.org/)

**Live on Cloudflare:** https://mvcatcoin.pages.dev

MVCatCoin is a production-grade ERC20 token with on-chain governance and a companion staking pool, plus a TypeScript dApp dashboard with liquid glass UI.

## Tech Stack 2026

| Component | Version |
|---|---|
| Solidity | 0.8.30 |
| Foundry | 1.5.0 |
| OpenZeppelin Contracts | 5.3.0 |
| TypeScript | 5.6 |
| Vite | 5.4 |
| Viem | 2.21 |
| Hosting | Cloudflare Pages |

## Contracts

### MVCatCoin

- ERC20 with capped supply of 1,000,000,000 MVCAT
- ERC20Permit for gasless approvals
- ERC20Votes for on-chain governance
- ERC20Burnable
- Role-based minting via AccessControl

### MVStaking

- Time-based reward distribution
- Proportional rewards via rewardPerToken accumulator
- ReentrancyGuard on all state-changing entry points
- Ownable2Step for safe ownership transfer

## Architecture

    User -> MVStaking (stake/withdraw/claim)
                 |
                 +-- stakingToken (MVCatCoin)
                 +-- rewardsToken (MVCatCoin or other ERC20)

    MVCatCoin -> OpenZeppelin ERC20 stack
               + AccessControl (MINTER_ROLE)

## Quickstart

    forge install foundry-rs/forge-std
    forge install OpenZeppelin/openzeppelin-contracts
    forge build
    forge test

## Deploy Contracts

    cp .env.example .env
    source .env
    forge script script/DeployMVCatCoin.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

## Frontend

TypeScript dApp dashboard with liquid glass UI, black-green theme, and MV logo. Built with Vite and Viem.

    cd frontend
    npm install
    npm run dev

## Deploy Frontend to Cloudflare Pages

1. Push this repository to GitHub.
2. Go to pages.cloudflare.com, click Create a project, connect the GitHub repository.
3. Build settings:
   - Framework preset: `Vite`
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Build output directory: `dist`
4. Environment variable: `NODE_VERSION=22`
5. Click Save and Deploy.

Cloudflare provisions SSL automatically and serves via edge network with DDoS protection.

Live site: https://mvcatcoin.pages.dev

## Testing

    forge test -vvv
    forge coverage

## Contact

Telegram: [t.me/MVrocketRuns](https://t.me/MVrocketRuns)

## Security

See SECURITY.md.

## License

MIT. See LICENSE.