# Freedom Asset DEX

Decentralized trading and on-chain analytics frontends for [Freedom Asset](https://freedomasset.global). This repository contains two independent subprojects:

| Directory | Description | Docs |
| --- | --- | --- |
| [`swap/`](swap/) | Trading interface: token swaps, pool creation, add/remove liquidity | [swap/README.md](swap/README.md) |
| [`info/`](info/) | Analytics dashboard: protocol, pool, token, and transaction metrics | [info/README.md](info/README.md) |

---

## Quick Start

```bash
git clone https://github.com/freedomasset/dex.git
cd dex
```

Each subproject manages its own dependencies and dev server. From the repo root, enter the target directory and run:

```bash
cd swap   # or cd info
yarn
yarn start
```

Both default to [http://localhost:3000](http://localhost:3000) for local development.

---

## Live URLs

| Service | Mainnet | Testnet |
| --- | --- | --- |
| Trading interface | [dex.freedomasset.global](https://dex.freedomasset.global) | [dex-testnet.freedomasset.global](https://dex-testnet.freedomasset.global) |
| Analytics dashboard | [dashboard.freedomasset.global](https://dashboard.freedomasset.global) | [dashboard-testnet.freedomasset.global](https://dashboard-testnet.freedomasset.global) |

---

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [Yarn](https://yarnpkg.com/)

See each subproject's README for version-specific requirements and build commands.

---

## License

This project is licensed under [GPL-3.0-or-later](LICENSE).
