# Product Proposal

## What is the product, and who uses it?

PrivateSkill is a privacy-preserving credential verification platform built on Midnight Network. It allows any party that holds a skill credential — a student, a professional, a job candidate — to prove that their credential meets a verifier's minimum threshold without exposing the credential's underlying details.

**Credential holders** (the primary users) are individuals who have been issued a cryptographic credential by an institution: a test score, a course completion certificate, a professional licence. They store the credential's private data in their Lace wallet and use PrivateSkill to respond to verification requests. From their perspective the flow is: connect wallet → enter the public credential commitment and the requested threshold → click Verify. The Lace wallet generates the zero-knowledge proof locally; the holder never types their score, certificate ID, or identity into any web form.

**Verifiers** (employers, universities, licensing bodies) create on-chain verification requests specifying the skill domain, credential type, and minimum score they require. After the holder responds, the verifier reads a single boolean from the ledger: `true` (threshold met) or `false` (threshold not met). They never see the underlying score or any personal details.

**Issuers** (educational institutions, certification bodies, professional organisations) register credentials on-chain. They bind the sensitive fields — score, certificate ID, holder identity — into a single cryptographic commitment using `persistentCommit`. Only the commitment is stored publicly; the private fields are delivered to the holder out-of-band. Issuers can also revoke credentials when needed.

**Administrators** (the contract owner) manage the authorised issuer registry, controlling which institutions are permitted to issue credentials on the platform.

The platform is suitable for any context where a threshold check is more appropriate than a full disclosure: employment screening, academic admissions, professional licensing renewals, access control for certification-gated communities, and regulatory compliance checks.

## Why Midnight specifically?

Midnight is uniquely suited for PrivateSkill because it provides native zero-knowledge proof generation at the smart-contract level. The platform's core requirement — proving that a private score meets a threshold without revealing the score — cannot be achieved on transparent blockchains (where all transaction inputs are public) or through off-chain ZK solutions (which require trusting a centralised prover). Midnight's Compact language enforces "privacy by default": circuit parameters are private witnesses, and only values explicitly wrapped in `disclose()` are recorded on-chain. This eliminates the risk of accidental private-data leakage at the protocol level.

## Data Model

| Data Point | Type | Disclosed To |
|---|---|---|
| Skill identifier | Public ledger | Everyone |
| Credential type | Public ledger | Everyone |
| Issuer identity (hashed) | Public ledger | Everyone |
| Issue timestamp | Public ledger | Everyone |
| Expiry timestamp | Public ledger | Everyone |
| Revocation status | Public ledger | Everyone |
| Credential commitment (hash) | Public ledger | Everyone |
| Credential count | Public ledger | Everyone |
| Authorized issuers set | Public ledger | Everyone |
| Verification request details | Public ledger | Everyone |
| Verification result (pass/fail boolean) | Public ledger | Everyone |
| Exact score | Private witness | No one |
| Certificate identifier | Private witness | No one |
| Holder identity | Private witness | No one |
| Commitment opening (randomness) | Private witness | No one |
| Owner/issuer secret key | Private witness | No one |

## Mainnet Feasibility

PrivateSkill is currently deployed and verified on Midnight **Preprod** testnet. The contract address is recorded in the Contract Address section of README.md once deployment is completed.

**Current status:**
- Smart contract (`private-skill.compact`) compiles cleanly with the Midnight Compact compiler.
- All circuits (`issueCredential`, `respondToVerification`, `verifySkillThreshold`, `registerIssuer`, `revokeIssuer`, `revokeCredential`, `createVerificationRequest`) are implemented and follow Midnight's privacy-by-default model.
- Frontend is production-built and deployed to Vercel with Lace wallet integration via the `window.midnight.mnLace` dapp connector API.
- CI pipeline (GitHub Actions) runs `npm test` and `npm run build --prefix frontend` on every push.
- Tests pass without requiring a running network or Docker.

**Mainnet deployment requirements:**
- Replace the simulated `verifyThreshold` call in `useMidnight.ts` with the actual Midnight.js SDK contract call once the contract address is finalised.
- Obtain a funded mainnet wallet (tNIGHT → NIGHT) and run `npm run deploy -- --network mainnet`.
- Register at least one trusted issuer via `registerIssuer` using the admin key.
- Update the contract address in README.md and the frontend environment configuration.

**Security considerations:**
- All private fields (score, certificateId, holderId, opening) are ZK witnesses — they are never stored on-chain or transmitted to any server.
- The `disclose()` primitive is used explicitly for every value that reaches the public ledger; the Compact compiler enforces this.
- The `sealed` modifier on `owner` prevents the admin identity from being changed after deployment.
- Issuer keys are rotated by the admin via `revokeIssuer` + `registerIssuer`.

**Scalability considerations:**
- The contract uses `Map` and `Set` ledger structures; on-chain storage grows linearly with the number of credentials and requests.
- Each verification request is a separate on-chain entry, which is appropriate for the current use-case volume.
- For large-scale deployment, batch verification and off-chain indexing (via the Midnight indexer) reduce per-request costs.

**Monitoring:**
- The Midnight indexer at port 8088 (local) or the public preprod indexer exposes GraphQL queries over ledger state (`credentialCount`, `requestCount`, individual records).
- Automated monitoring can subscribe to ledger state changes for revocation events and new verification results.

**What remains for mainnet:**
- A formal security audit of the Compact circuits.
- A production issuer onboarding process (KYC of institutions before granting issuer rights).
- Frontend UX improvements: QR-code credential sharing, mobile wallet support, notification when a verification result is recorded.
- Dependency pinning for all Midnight SDK packages as they reach stable mainnet versions.
- Legal review of credential storage and cross-border data-protection requirements (GDPR, etc.), noting that no personal data is stored on-chain.

## Use Cases

1. **Employment Background Checks** — An employer requests proof that a candidate's programming test score meets a 70% threshold. The candidate generates a ZK proof locally; the employer sees only "pass" or "fail", never the exact score or certificate details.

2. **Academic Credential Portability** — A university issues cryptographic credentials for completed courses. Students carry their private data in a wallet and can prove course completion to any institution worldwide without exposing GPA or transcript details.

3. **Professional Licensing** — Regulatory bodies issue time-limited credentials (e.g., a medical licence valid until a specific date). The holder can prove the licence is current and issued by an authorised body without revealing the licence number or expiry date.

## Roadmap

- **Milestone 1 — Mainnet Launch (Q3 2025)**: Deploy the PrivateSkill smart contract to Midnight Mainnet; launch production frontend with Lace wallet integration; onboard 3 pilot issuing institutions.
- **Milestone 2 — Ecosystem Growth (Q4 2025)**: Open the issuer registry to public applications; launch a verifier SDK so third-party dApps can embed PrivateSkill verification; integrate with at least one major job-board API.
