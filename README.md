# PrivateSkill — Privacy-Preserving Credential Verification on Midnight Network

[![CI](https://github.com/omkarjagtap2105-design/-PrivateSkill-Midnight/actions/workflows/ci.yml/badge.svg)](https://github.com/omkarjagtap2105-design/-PrivateSkill-Midnight/actions/workflows/ci.yml)

> Prove your skills meet the bar — without revealing your score.

## Live Demo

🔗 **[https://privateskill-midnight.vercel.app](https://privateskill-midnight.vercel.app)**

> Auto-deploys on every push via Vercel + GitHub integration.

## Demo Video

![PrivateSkill Demo](assets/demo.gif)

> Full deployment walkthrough — wallet connection, ZK proof generation, and skill verification result.

**What the video shows:**
| Timestamp | Action |
|-----------|--------|
| 0:00–0:20 | Open live app → click **Connect Wallet** → Lace connection + wallet address |
| 0:20–0:45 | Public verification inputs (commitment + threshold) — no private fields in UI |
| 0:45–1:10 | Click **Verify Skill** → "Generating Proof…" → "Submitting…" progress steps |
| 1:10–1:35 | Verification result (✅ or ❌) |
| 1:35–2:00 | Privacy notice: "Your private credential data is processed locally by your wallet" |

## Contract Address

| Network | Address |
|---------|---------|
| Preview | `TBD — run: npm run deploy -- --network preview` |
| Preprod | `TBD — run: npm run deploy -- --network preprod` |

After deployment, the address is saved to `.midnight-state.json` and printed to the console.

## What This Does

PrivateSkill lets credential holders (students, professionals) **prove their skill score meets an employer's threshold without revealing the exact score**.

The flow:
1. A certification body (Issuer) issues a credential — the score is hashed into a cryptographic commitment stored on-chain. Only the commitment is public; the score, certificate ID, and holder identity stay private.
2. An employer (Verifier) creates a verification request: *"prove you have a blockchain certification with score ≥ 70."*
3. The credential holder responds with a **zero-knowledge proof** — the circuit verifies `score ≥ 70` and records only `true/false` on-chain.
4. The employer sees "passed" or "failed." They never see the exact score, the certificate ID, or who the holder is.

## Privacy Model

### Public (visible on-chain to everyone)
- Skill identifier and credential type (domain-separated hashes)
- Issuing institution's hashed public identity
- Issue and expiry timestamps
- Revocation status
- Cryptographic commitment (binding score + certificate + holder — but revealing none)
- Verification result: `true` (threshold met) or `false` (threshold not met)

### Private (never leaves the holder's device)
- Exact score
- Certificate identifier
- Holder identity
- Commitment opening (the random salt binding the commitment)
- Owner / issuer secret keys

### Proved Without Revealing
- "My score ≥ threshold" — the circuit computes `score >= threshold` inside ZK, outputs only the boolean via `disclose(score >= threshold)`
- "My credential is valid and non-revoked" — verified inside the proof, not disclosed
- "I am the legitimate holder of this commitment" — proven via the opening, not disclosed

## Privacy Claim

| Observer | Can see | Cannot see |
|----------|---------|------------|
| On-chain observer | Credential commitment, skill (hashed), issuer (hashed), pass/fail result | Exact score, certificate ID, holder identity, opening |
| Verifier | Pass/fail boolean for their specific request | Exact score or any other private attribute |
| Issuing institution | Their own issued credentials | Holder's responses to other requests |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart contract | Compact (Midnight Network) |
| ZK proofs | Midnight's built-in proof system (`circuit` declarations) |
| Contract runtime | `@midnight-ntwrk/compact-runtime` 0.16.0 |
| Backend / scripts | TypeScript + Node.js 22 |
| Wallet SDK | `@midnight-ntwrk/wallet-sdk` 1.2.0 |
| Frontend | React 18 + TypeScript + Vite 6 |
| Wallet connection | Lace wallet (`window.midnight.mnLace` dapp connector API) |
| Tests | Vitest (unit, no network required) |
| CI/CD | GitHub Actions |
| Frontend hosting | Vercel |

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 22 | Required for all scripts |
| Docker + Compose v2 | Latest | Local Midnight devnet |
| Compact compiler | Pinned | Compiles `.compact` contracts |
| Lace browser extension | Latest | Wallet for frontend |

**Install Lace:** https://www.lace.io  
**Install Compact compiler:** https://docs.midnight.network

## Setup & Run Locally

```bash
# 1. Clone and install root dependencies
git clone https://github.com/omkarjagtap2105-design/-PrivateSkill-Midnight
cd -PrivateSkill-Midnight
npm install

# 2. Start the local devnet (node + indexer + proof-server)
docker compose up -d --wait

# 3. Compile both contracts
npm run compile

# 4. Deploy to local devnet
npm run deploy

# 5. Run the frontend
npm install --prefix frontend
npm run dev --prefix frontend
```

For public testnet deployment:
```bash
npm run deploy -- --network preprod
```

## Run Tests

```bash
npm test
```

Tests run entirely in-memory with Vitest. If Compact artifacts haven't been compiled yet, the 4 contract-specific tests skip gracefully — the suite still exits 0.

```bash
# Compile artifacts first for full test run
npm run compile
npm test

# Live contract tests (requires running devnet)
npm run test:contracts

# End-to-end smoke check
npm run test:e2e
```

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`) triggers on every push and pull request:

1. **Checkout** — `actions/checkout@v4`
2. **Node.js 22** — `actions/setup-node@v4`
3. **Install** — `npm ci`
4. **Test** — `npm test` (Vitest, no network required)
5. **Frontend install** — `npm ci --prefix frontend`
6. **Frontend build** — `npm run build --prefix frontend`

> The Compact compiler step is skipped in CI — the `compact` binary requires local installation.

## Product Proposal

See [PROPOSAL.md](./PROPOSAL.md) for the full product proposal: use cases, data model, mainnet feasibility, and roadmap.

---

## Initial Idea

The problem that sparked PrivateSkill is one most professionals encounter: credential verification leaks far more information than it should.

When an employer asks a candidate to "share your test result," the candidate typically hands over a full certificate — exact score, date, institution, certificate ID, and sometimes their full name. The employer only needs to know one thing: *did this person score at or above our bar?* Everything else is overshared, and once shared it cannot be unshared.

Traditional approaches make this worse, not better:

- **Centralised credential databases** require the holder to trust a third party to store and share their data correctly.
- **PDF certificates** can be forged, altered, or screenshotted and reused by anyone who gets a copy.
- **On-chain transparent systems** replace the PDF problem with a public ledger problem — every score, every certificate, every holder identity is permanently visible to anyone who looks.

Zero-knowledge proofs offer a way out. A ZK proof lets a credential holder convince a verifier that a statement is true ("my score is ≥ 70") without revealing any of the underlying data that makes it true. The verifier learns exactly what they need and nothing more.

Midnight Network makes this practical for credential verification because it provides ZK proof generation natively inside the smart contract layer through its Compact language. Private circuit parameters are never stored on-chain. The `disclose()` primitive makes every public disclosure explicit — the compiler rejects accidental leakage at build time. This is "privacy by default," not privacy bolted on.

PrivateSkill was built to demonstrate this end-to-end: a credential is issued with its sensitive fields bound into a cryptographic commitment; a verifier sets a threshold; the holder answers with a ZK proof. The employer's ledger entry reads `true` or `false`. The score, the certificate ID, and the holder's identity never leave the holder's wallet.

## Screenshots

| # | Description |
|---|-------------|
| 1 | `npm run compile` — successful Compact contract compilation |
| 2 | `npm test` — Vitest suite passing (4 skipped, 1 passed; run compile first for full run) |
| 3 | `npm run build --prefix frontend` — Vite production build output |
| 4 | Lace wallet connected — wallet address displayed in header |
| 5 | Skill verification UI — credential commitment + threshold inputs |
| 6 | Verification result — ✅ Skill verified / ❌ Threshold not met |
| 7 | Privacy notice — 🔒 message always visible in the verification card |
| 8 | Preprod contract deployment — terminal output with contract address |

> **MANUAL ACTION REQUIRED:** Capture each screenshot listed above during your demo run and embed them here using `![description](./screenshots/filename.png)`. Create a `screenshots/` folder in the project root for the images.

---

## Quick start (local devnet)

Requirements: Node 22, Docker (with Compose v2), and the Compact compiler.

```bash
npm install
npm run setup
npm run test:e2e
```

`npm run setup` runs end-to-end with no prompts:
1. `docker compose up -d --wait` — starts local Midnight devnet
2. `npm run compile` — compiles contracts to `contracts/managed/`
3. `npm run deploy` — deploys the contract, writes `.midnight-state.json`

`npm run test:e2e` reconnects to the deployed contract and reads its ledger state.

## Local devnet services

| Service | Port | Purpose |
|---------|------|---------|
| `node` | 9944 | Midnight node, `dev` chain preset |
| `indexer` | 8088 | GraphQL indexer for chain state |
| `proof-server` | 6300 | Generates ZK proofs for contract transactions |

```bash
# Tear down devnet (removes all state)
docker compose down -v
```

## Networks

| Network | When to use | Default? |
|---------|-------------|---------|
| `undeployed` | Local devnet — hardcoded genesis seed, no funding needed | yes |
| `preview` | Public preview testnet. Faucet: https://midnight-tmnight-preview.nethermind.dev | |
| `preprod` | Public preprod testnet. Faucet: https://midnight-tmnight-preprod.nethermind.dev | |

```bash
npm run deploy -- --network preprod   # deploy to preprod
npm run network                       # show active network
npm run network preview               # switch to preview
```

## Available scripts

| Script | Description |
|--------|-------------|
| `npm run setup` | One-shot: start devnet, compile, deploy |
| `npm run compile` | Compile Compact contracts |
| `npm run deploy` | Deploy compiled contract |
| `npm run test` | Run Vitest unit tests |
| `npm run test:contracts` | Live contract tests |
| `npm run test:e2e` | End-to-end smoke check |
| `npm run cli` | Interactive CLI for deployed contract |
| `npm run check-balance` | Print wallet NIGHT/DUST balances |
| `npm run clean` | Remove `contracts/managed/`, state files |
| `npm run proof-server:start/stop` | Control local proof server |

## Compact compiler version

```bash
compact update <version>
compact use <version>
```
 `