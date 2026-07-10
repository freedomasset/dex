# Freedom Asset DEX Frontend

Freedom Asset is a decentralized trading interface for token swaps, liquidity pool creation, and liquidity management. It is built for TT Chain and multi-chain deployments.

This directory is part of the [freedomasset/dex](https://github.com/freedomasset/dex) monorepo. The analytics dashboard lives in [`../info`](../info).

## Features

- **Core trading**: token swaps, pool creation, add/remove liquidity, position management
- **Multi-chain**: TT Chain mainnet/testnet, plus Ethereum, Sepolia, Polygon, BNB, and more
- **Local routing**: quotes and routes are computed on the client via `@vanadex/smart-order-router`, with no external relayer dependency
- **Privacy-first**: third-party analytics and unnecessary external API calls have been removed
- **Configurable builds**: environment variables control the default mainnet or testnet chain

## Tech Stack

- React 18 + TypeScript
- Create React App with [CRACO](https://craco.js.org/)
- Redux Toolkit, React Query
- [Lingui](https://lingui.dev/) for i18n
- Ethers.js v5, Web3-React

## Requirements

- [Node.js](https://nodejs.org/) **18.20.6** (see `package.json` → `engines`)
- [Yarn](https://yarnpkg.com/) **≥ 1.22**

## Quick Start

```bash
git clone https://github.com/freedomasset/dex.git
cd dex/swap

# Install dependencies
yarn

# Local development (REACT_APP_CHAIN=prod by default, i.e. TT Chain mainnet)
yarn start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The first install runs `postinstall`, which compiles contract types, AJV validators, and i18n assets. This can take a while and is expected.

## Build

| Command           | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `yarn start`      | Dev server with `REACT_APP_CHAIN=prod`                     |
| `yarn build:prod` | Production build; default chain is TT Chain mainnet (1679) |
| `yarn build:test` | Test build; default chain is TT Chain testnet (167901)     |
| `yarn build`      | Generic build (no fixed `REACT_APP_CHAIN`)                 |
| `yarn typecheck`  | TypeScript type check                                      |
| `yarn lint`       | ESLint                                                     |
| `yarn test`       | Unit tests                                                 |

Preview a production build locally:

```bash
yarn build:prod
yarn serve
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `REACT_APP_CHAIN` | `prod`: default TT Chain mainnet (1679); `test` or unset: default TT Chain testnet (167901) |
| `REACT_APP_ENV` | Set to `prod` / `production` for production-like behavior |
| `REACT_APP_STAGING` | Marks a staging build |
| `REACT_APP_SERVICE_WORKER` | Set to `false` to disable the service worker |
| `REACT_APP_GIT_COMMIT_HASH` | Optional; shown on the settings page |
| `REACT_APP_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID (required for WalletConnect) |
| `REACT_APP_ANKR_API_KEY` | Optional Ankr API key for RPC fallback endpoints |
| `REACT_APP_INFURA_KEY` | Infura API key for Hardhat fork tests only |
| `CYPRESS_PROJECT_ID` | Optional Cypress Dashboard project ID for CI recording |

Copy `.env.example` to `.env` and fill in the values you need:

```bash
cp .env.example .env
```

To run local development against the testnet by default:

```bash
cross-env REACT_APP_CHAIN=test yarn start
```

## Project Structure

```
src/
  components/     # UI components
  pages/          # Route pages
  state/          # Redux state
  hooks/          # React hooks
  constants/      # Chain config, contract addresses, token lists
  lib/            # Routing, multicall, token list utilities
  abis/           # Contract ABIs
public/           # Static assets, token list JSON files
functions/        # Cloudflare Pages edge functions (optional)
```

## Chains & Contracts

The default app chain is determined by `REACT_APP_CHAIN` and `getAppChainId()` in `src/constants/chains.ts`:

| Network          | Chain ID | URL param `chain`  |
| ---------------- | -------- | ------------------ |
| TT Chain Mainnet | 1679     | `tt_chain`         |
| TT Chain Testnet | 167901   | `tt_chain_testnet` |

Contract addresses, RPC endpoints, and token list configuration live in `src/constants/contracts.ts`, `src/constants/chainInfo.ts`, and the per-chain token list files under `public/`.

## Token List

Token lists use a standard community JSON list format. Default lists and per-chain configuration are maintained in `src/constants/lists.ts`.

## Links

- Repository: [https://github.com/freedomasset/dex](https://github.com/freedomasset/dex)
- Website: [https://freedomasset.global](https://freedomasset.global)
- Analytics dashboard (mainnet): [https://dashboard.freedomasset.global](https://dashboard.freedomasset.global)
- Analytics dashboard (testnet): [https://dashboard-testnet.freedomasset.global](https://dashboard-testnet.freedomasset.global)

## License

This project is licensed under [GPL-3.0-or-later](LICENSE).
