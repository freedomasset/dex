# Freedom Asset Info

Freedom Asset Info is the on-chain analytics dashboard in the [freedomasset/dex](https://github.com/freedomasset/dex) monorepo. It surfaces protocol, liquidity pool, token, and transaction metrics with multi-chain switching and multilingual UI support.

📊 Live dashboards:

- Mainnet: [dashboard.freedomasset.global](https://dashboard.freedomasset.global)
- Testnet: [dashboard-testnet.freedomasset.global](https://dashboard-testnet.freedomasset.global)

The trading interface lives in the same repository — see [`../swap`](../swap).

---

## Features

- **Protocol overview**: volume, fees, TVL, and historical trend charts
- **Liquidity pools**: pool rankings, pool details, liquidity distribution, and transaction history
- **Token analytics**: price charts, volume, pool associations, and transaction details
- **Multi-chain**: Ethereum, Polygon, BNB, Arbitrum, Optimism, Base, Avalanche, Celo, TT Chain, and more
- **Multilingual**: built-in i18n with Simplified Chinese, Traditional Chinese, English, and more
- **CMS integration**: off-chain content and metadata managed via Sanity

---

## Tech Stack

- React 18 + TypeScript
- Create React App
- Redux Toolkit, React Router v6
- Styled Components
- Apollo Client (GraphQL / Subgraph)
- Lightweight Charts, Recharts
- i18next + react-i18next

---

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [Yarn](https://yarnpkg.com/) 4.x (Yarn Berry)

---

## Quick Start

This directory is a subproject in the monorepo. Clone the repository first, then enter `info`:

```bash
# Clone the repository
git clone https://github.com/freedomasset/dex.git
cd dex/info

# Install dependencies
yarn

# Start the dev server
yarn start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Copy `.env.example` to `.env` and fill in the values you need:

```bash
cp .env.example .env
```

---

## Environment Variables

| Variable | Description |
| --- | --- |
| `REACT_APP_ENV` | Set to `prod` / `production` for mainnet dashboard defaults |
| `REACT_APP_SANITY_PROJECT_ID` | Sanity CMS project ID (optional) |
| `REACT_APP_SANITY_DATASET` | Sanity dataset name (default: `mainnet`) |
| `REACT_APP_SANITY_AUTH_TOKEN` | Sanity API token for token descriptions (optional) |

---

## Build

| Command | Description |
| --- | --- |
| `yarn start` | Local development (`REACT_APP_ENV=prod`) |
| `yarn build` | Production build |
| `yarn build:prod:window` | Production build on Windows |
| `yarn build:test:window` | Test-environment build on Windows |
| `yarn lint` | ESLint |
| `yarn test` | Unit tests |

---

## Project Structure

```
info/
├── src/
│   ├── apollo/              # GraphQL client configuration
│   ├── components/          # Shared UI components (charts, tables, header, etc.)
│   ├── constants/           # Chain IDs, networks, subgraph endpoints
│   ├── data/                # Data fetching and aggregation
│   │   ├── pools/           # Liquidity pool data
│   │   ├── tokens/          # Token data
│   │   └── protocol/        # Protocol-level data
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   ├── sanity/          # Sanity CMS integration
│   │   └── subgraph/        # Subgraph GraphQL queries
│   ├── pages/               # Route pages and views
│   │   ├── Home/            # Protocol overview
│   │   ├── Pool/            # Pool list and details
│   │   └── Token/           # Token list and details
│   ├── state/               # Redux state management
│   └── utils/               # Utility functions
└── datadex-cms/             # Sanity Studio (optional)
```

---

## Contributing

Open pull requests against the `main` branch. CI checks run automatically on PRs — make sure they pass before requesting review.

---

## License

This project is licensed under [GPL-3.0](LICENSE).

---

## Links

- Trading interface: [dex.freedomasset.global](https://dex.freedomasset.global)
- Analytics dashboard (mainnet): [dashboard.freedomasset.global](https://dashboard.freedomasset.global)
- Analytics dashboard (testnet): [dashboard-testnet.freedomasset.global](https://dashboard-testnet.freedomasset.global)
- Repository: [github.com/freedomasset/dex](https://github.com/freedomasset/dex)

For questions, open an issue in the repository.
