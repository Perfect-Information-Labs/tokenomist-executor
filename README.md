# Tokenomist Executor

Onchain Tokenomist has a native **executor** role—a vault-scoped identity specifically designed to be fulfilled by an AI agent, distinct from the vault's creator and administrators. This API is the interface for that role, enabling AI agents to inspect protocol state and construct correctly encoded, protocol-specific transactions, including proposals, token pass mints, and Merkle-proof operations, for the vaults they are authorized to serve. Access is gated by x402 nanopayments through Circle Gateway on Arc.

This API does **not** hold custody of any private key and never signs or broadcasts transactions on your behalf. Every write route returns unsigned calldata (`to` + `data`); the caller signs and submits it with their own wallet. `msg.sender` on-chain is always the caller's own address — never this API's.

## How it works

1. Call any endpoint below.
2. If unpaid, you get `402 Payment Required` with an `accepts` array describing the payment terms (amount in USDC atomic units, network, `payTo` address).
3. Pay via [Circle Gateway](https://developers.circle.com/gateway/nanopayments) (batched, gas-free USDC nanopayments) and retry with a `PAYMENT-SIGNATURE` header containing your signed authorization.
4. On success, you get the actual response — for write routes, unsigned transaction calldata to sign and broadcast yourself; for read routes, live on-chain data.

The easiest way to call this API is via Circle's [`@circle-fin/x402-batching`](https://www.npmjs.com/package/@circle-fin/x402-batching) `GatewayClient`, which handles the full 402 → sign → settle → retry cycle automatically:

```ts
import { GatewayClient } from '@circle-fin/x402-batching/client';

const gateway = new GatewayClient({
  chain: 'arcTestnet',
  privateKey: YOUR_PRIVATE_KEY,
});

const result = await gateway.pay('https://<your-deployment>.workers.dev/v1/vaults/3/summary', {
  method: 'GET',
});

console.log(result.data);
```

## Base URL

```
https://executor.perfectinformationlabs.com
```

## OpenAPI Specification

Machine-readable OpenAPI specification available at:
```
GET /openapi.yaml
```

## Health check

GET /health

Free, unauthenticated, no payment required. Returns `{ "status": "ok", "service": "tokenomist-executor" }` if the Worker is running. Use this for uptime monitoring — it never touches the chain or payment system.

**Example:**

GET https://executor.perfectinformationlabs.com/health

```json
{ "status": "ok", "service": "tokenomist-executor" }
```

## Prerequisites

Before calling any paid endpoint, an agent needs:

1. **An EVM wallet with USDC on Arc Testnet.** Get testnet USDC from [faucet.circle.com](https://faucet.circle.com/).
2. **A funded Gateway balance.** Payment settles from your Gateway balance, not your wallet balance directly — you must deposit once before your first paid call:
```ts
   const gateway = new GatewayClient({ chain: 'arcTestnet', privateKey: YOUR_KEY });
   await gateway.deposit('5'); // deposits 5 USDC into your Gateway balance, one-time
```
   If your Gateway balance is `0`, every `pay()` call will fail with `PaymentFailed`, even if your wallet holds plenty of USDC. Check anytime with `await gateway.getBalances()`.
3. **Your wallet must already be configured as `creator` or `executor` for the specific vault you want to act on.** This is set once by the vault deployer at `createVault` time — it's not something this API or your agent can set. Every write route (`propose`, `mint`, `mint-direct`) checks `msg.sender` against the vault's stored `creator`/`executor` addresses on-chain; if your signing wallet isn't one of those two, the transaction will revert with `NotAuthorized` after you've already paid and signed. Confirm your address matches via `GET /v1/vaults/:vaultId/summary` (Route 5) before attempting any write.

## Endpoints

### 1. Propose a mint category

POST /v1/vaults/:vaultId/proposals

Price: **$0.01**

Builds calldata for `proposeMintCategory`. Computes a merkle root per tier from a plain address list — you don't need to build the tree yourself. `tiers` is an array — send one tier or several; a proposal isn't bound to a single-tier or multi-tier shape, it's just whatever tiers you include, all created together under one `category` in a single transaction.

**Request body (single tier):**
```json
{
  "category": "MockTokenomics",
  "tiers": [
    { "tier": "Staff", "addresses": ["0x...", "0x..."], "supplyCount": 10 }
  ]
}
```

**Response (single tier):**
```json
{
  "vaultId": "3",
  "category": "MockTokenomics",
  "to": "0x...",
  "data": "0x...",
  "tiers": [
    { "tier": "Staff", "merkleRoot": "0x...", "supplyCount": 10, "addressCount": 10 }
  ]
}
```

**Request body (multiple tiers, same call):**
```json
{
  "category": "Ecosystem",
  "tiers": [
    { "tier": "Builder", "addresses": ["0x...", "0x...", "0x...", "0x...", "0x..."], "supplyCount": 5 },
    { "tier": "Partner", "addresses": ["0x...", "0x...", "0x...", "0x...", "0x..."], "supplyCount": 5 },
    { "tier": "Contributor", "addresses": ["0x...", "0x...", "0x...", "0x...", "0x..."], "supplyCount": 5 }
  ]
}
```

**Response (multiple tiers)** — shape matches whatever was sent, one entry per tier included:
```json
{
  "vaultId": "3",
  "category": "Ecosystem",
  "to": "0x...",
  "data": "0x...",
  "tiers": [
    { "tier": "Builder", "merkleRoot": "0x...", "supplyCount": 5, "addressCount": 5 },
    { "tier": "Partner", "merkleRoot": "0x...", "supplyCount": 5, "addressCount": 5 },
    { "tier": "Contributor", "merkleRoot": "0x...", "supplyCount": 5, "addressCount": 5 }
  ]
}
```

**Important:** `category`/`tier` strings are case-sensitive on-chain. Use the exact casing configured for the vault (e.g. `"MockTokenomics"`, not `"MOCKTOKENOMICS"`) — check with Route 6/7 if unsure.

---

### 2. Mint passes for an approved proposal

POST /v1/proposals/:proposalId/mint

Price: **$0.01**

Builds calldata for `mintPasses`. Requires the proposal to already be approved on-chain by the vault's admins.

**Request body:**
```json
{
  "tier": "Staff",
  "addresses": ["0x...", "0x..."],
  "recipients": ["0x...", "0x..."]
}
```
- `addresses`: the **full original allowlist** used when the proposal was created (needed to rebuild the identical merkle tree).
- `recipients`: which addresses to mint **in this call** — can be a subset. Minting is resumable: you can mint part of the list now and the rest later under the same proposal, as long as the total across all calls doesn't exceed the tier's supply.

**Response:**
```json
{
  "proposalId": "5",
  "tier": "Staff",
  "transactions": [
    { "to": "0x...", "data": "0x...", "chunkIndex": 0, "recipientCount": 60 },
    { "to": "0x...", "data": "0x...", "chunkIndex": 1, "recipientCount": 20 }
  ],
  "totalChunks": 2,
  "totalRecipients": 80
}
```
Batches of more than 60 recipients are automatically split into multiple transactions (Arc's per-tx gas ceiling). Sign and broadcast each in order — they're sequential and rely on correct nonce ordering.

---

### 3. Mint directly (no-admin / creator-only vaults)

POST /v1/vaults/:vaultId/mint-direct

Price: **$0.01**

Builds calldata for `mintDirect`. Only valid for vaults with no admins configured — use Route 1/2 instead if the vault has admins.

**Request body:**
```json
{
  "category": "Community",
  "tier": "Standard",
  "recipients": ["0x...", "0x..."]
}
```

**Response:** same shape as Route 2 (array of `{ to, data, chunkIndex, recipientCount }`, batched at 60).

---

### 4. Get proposals for an account

GET /v1/accounts/:account/proposals

Price: **$0.0001**

Returns every proposal tied to any vault where `:account` is the **creator or executor** — not just proposals that address personally submitted.

**Response:**
```json
{
  "account": "0x...",
  "proposals": [
    {
      "proposalId": "5",
      "vaultId": "3",
      "category": "MockTokenomics",
      "proposer": "0x...",
      "admin1": "0x...",
      "admin2": "0x...",
      "admin1Approved": true,
      "admin2Approved": true,
      "rejected": false,
      "expired": false,
      "executed": true,
      "proposedAt": "1784322186",
      "deadline": "1784840586"
    }
  ]
}
```
Returns an empty array (not an error) if the account isn't a creator/executor on any vault. `expired` reflects live deadline status even if not yet finalized on-chain. Fully-approved proposals never expire, regardless of elapsed time.

---

### 5. Get vault summary

GET /v1/vaults/:vaultId/summary

Price: **$0.0005**

Returns aggregated vault-level data: roles, deposits, allocation totals, finalization status.

**Response:**
```json
{
  "vaultId": "3",
  "tokenAddress": "0x...",
  "creator": "0x...",
  "admin1": "0x...",
  "admin2": "0x...",
  "executor": "0x...",
  "totalDeposited": "10000000000000000000000000000",
  "totalAllocated": "675000000000000000000000000",
  "totalClaimed": "0",
  "createdAt": "1782653758",
  "startTime": "1783518953",
  "finalized": false,
  "categoryCount": "10",
  "totalPassesMinted": "25",
  "totalCompletedClaims": "0",
  "totalActivePasses": "25"
}
```
All numeric fields are raw on-chain values (wei-scale where applicable) as strings, since they can exceed JS's safe integer range.

---

### 6. Get tier details for a category

GET /v1/vaults/:vaultId/categories/:category/tiers

Price: **$0.0001**

Returns supply/allocation detail for every tier in a category — useful to check before calling Routes 1-3.

**Response:**
```json
{
  "vaultId": "3",
  "category": "MockTokenomics",
  "tiers": [
    {
      "tier": "Core",
      "allocationPerPass": "50000000000000000000000000",
      "maxSupply": "14",
      "mintedCount": "10",
      "remainingSupply": "4",
      "totalAllocated": "500000000000000000000000000",
      "passHolderCount": "10"
    }
  ]
}
```

### 7. Get vault categories

GET /v1/vaults/:vaultId/categories

Price: **$0.0001**

Returns every category configured for a vault, decoded to plain strings. Use this as the starting point for discovering a vault's structure before calling any other route.

**Response:**
```json
{
  "vaultId": "3",
  "categories": [
    "Liquidity",
    "Reserve",
    "MockTokenomics",
    "Advisors",
    "SeedInvestors",
    "PublicSale",
    "Ecosystem",
    "Marketing",
    "Airdrop",
    "CommunityRewards"
  ]
}
```

## Avoiding the most common failure: category/tier casing

**This was the single most likely way a write call silently failed on-chain during development — now fully avoidable.**

`category` and `tier` values are encoded exactly as you send them (UTF-8 bytes, no normalization). `"MockTokenomics"` and `"MOCKTOKENOMICS"` produce completely different on-chain keys. If the casing doesn't exactly match what the vault deployer configured, the write transaction will revert — `ExceedsMaxSupply` or `InvalidTier` are the typical symptoms, since the lookup silently resolves to an empty/zero config instead of erring on the mismatch itself.

**This API does not validate category/tier strings against the vault's actual configuration** — a mismatched string still returns valid-looking calldata; the mismatch only surfaces after you sign, broadcast, and pay gas.

**Correct discovery flow before ever calling Routes 1-3 on a vault for the first time:**

1. **`GET /v1/vaults/:vaultId/categories`** (Route 7) — get the exact category strings for this vault.
2. **`GET /v1/vaults/:vaultId/categories/:category/tiers`** (Route 6), using an exact string from step 1 — get the exact tier strings and their remaining supply.
3. **Use the exact strings returned in steps 1-2**, verbatim, in your Route 1-3 request bodies. Don't retype or reformat them.

If you already have a `proposalId` (from your own records or from Route 4), you don't need steps 1-2 to mint — `getInvolvedProposals` already returns the correct `category` for that proposal directly, since it was stored on-chain at propose time.

**Recommended pattern for any agent integrating this API for a new vault:**
1. Call Route 7 to list categories.
2. Call Route 6 per category of interest to get tiers + supply.
3. Use those exact strings for any Route 1-3 call.

## End-to-end example: propose then mint

This walks through the full lifecycle for a vault with admins (team mode).

**1. Discover the vault's structure (optional, if you don't already know it):**
```ts
const categories = await gateway.pay(`${BASE}/v1/vaults/3/categories`, { method: 'GET' });
// → ["Liquidity", "Reserve", "MockTokenomics", ...]

const tiers = await gateway.pay(`${BASE}/v1/vaults/3/categories/MockTokenomics/tiers`, { method: 'GET' });
// → tiers with exact casing + remaining supply
```

**2. Propose a mint** (requires your wallet to be creator/executor for this vault):
```ts
const proposeResult = await gateway.pay(`${BASE}/v1/vaults/3/proposals`, {
  method: 'POST',
  body: {
    category: 'MockTokenomics',
    tiers: [{ tier: 'Staff', addresses: [...], supplyCount: 10 }],
  },
});

const txHash = await gateway.walletClient.sendTransaction({
  to: proposeResult.data.to,
  data: proposeResult.data.data,
});
// Wait for this to mine, then read the ProposalCreated event (or query Route 4)
// to get the real proposalId — it is NOT returned by this API directly.
```

**3. Wait for admin approval.** This happens outside this API entirely — the vault's admins call `approveMintProposal` themselves (via their own tooling/dashboard). Poll for status:
```ts
const proposals = await gateway.pay(`${BASE}/v1/accounts/${gateway.address}/proposals`, { method: 'GET' });
// Find your proposalId in the list, check admin1Approved && admin2Approved
```

**4. Mint once approved** — send the exact same `addresses` list used in step 2, so the proof-generation rebuilds an identical merkle tree:
```ts
const mintResult = await gateway.pay(`${BASE}/v1/proposals/${proposalId}/mint`, {
  method: 'POST',
  body: {
    tier: 'Staff',
    addresses: [...],   // same list as step 2 — required to regenerate valid proofs
    recipients: [...],  // who to mint now — can be a subset; the rest can be minted later
  },
});

for (const tx of mintResult.data.transactions) {
  await gateway.walletClient.sendTransaction({ to: tx.to, data: tx.data });
}
```

**Note:** minting is resumable — you can mint part of `recipients` now and the remainder later under the same proposal, as long as total minted never exceeds the tier's supply.

## Error responses

All errors follow this shape:
```json
{ "error": "ErrorName", "message": "human-readable detail" }
```

| Error | Status | Meaning |
|---|---|---|
| `InvalidCategoryError` | 400 | Category string exceeds 31 bytes |
| `InvalidTierError` | 400 | Tier string exceeds 31 bytes |
| `InvalidAddressError` | 400 | Malformed EVM address |
| `EmptyAddressListError` | 400 | Address list is empty |
| `EmptyRecipientsError` | 400 | Recipients list is empty |
| `VaultNotFoundError` | 404 | Vault doesn't exist |
| `RateLimited` | 429 | Too many requests — see limits below |
| `InternalError` | 500 | Unexpected server error |

Input validation runs **before** payment — a malformed request is rejected for free, with no charge.

## Rate limits (per IP)

| Route type | Limit |
|---|---|
| Writes (propose, mint, mint-direct) | 20 / minute |
| Reads (involved-proposals) | 60 / minute |
| Tier details / vault summary | 60-120 / minute |

## What this API does and doesn't do

**Does:** encode correct calldata, compute merkle roots/proofs from plain address lists, batch large recipient lists into ≤60-per-tx chunks, decode on-chain reads into clean JSON.

**Doesn't:** hold any private key, sign or submit any transaction, validate business logic (supply limits, tier existence, recipient eligibility) — that's the calling agent's responsibility, optionally checked in advance via Routes 4-6.

## Network

Arc Testnet — CAIP-2 `eip155:5042002`. Payment settles via Circle Gateway's testnet facilitator (`https://gateway-api-testnet.circle.com`).