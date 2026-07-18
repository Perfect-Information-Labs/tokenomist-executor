import {
  InvalidAddressError,
  InvalidCategoryError,
  InvalidTierError,
  EmptyAddressListError,
  EmptyRecipientsError,
} from '../lib/errors';
import type { Context, Next } from 'hono';
import type { ProposeMintRequest, MintPassesRequest, MintDirectRequest } from '../types';


// Standard EVM address check: 0x + 40 hex chars
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function isValidAddress(address: string): boolean {
  return ADDRESS_REGEX.test(address);
}

export function assertValidAddress(address: string, fieldName = 'address'): void {
  if (!isValidAddress(address)) {
    throw new InvalidAddressError(`${fieldName} is not a valid EVM address: ${address}`);
  }
}

export function assertValidAddressList(addresses: string[], fieldName = 'addresses'): void {
  if (addresses.length === 0) {
    throw new EmptyAddressListError(`${fieldName} must not be empty`);
  }
  for (const addr of addresses) {
    assertValidAddress(addr, fieldName);
  }
}

export function assertValidRecipients(recipients: string[]): void {
  if (recipients.length === 0) {
    throw new EmptyRecipientsError('recipients must not be empty');
  }
  for (const addr of recipients) {
    assertValidAddress(addr, 'recipients');
  }
}

// encodeBytes32String (ethers) requires the UTF-8 byte length to be <= 31
function utf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

export function assertValidCategory(category: string): void {
  if (utf8ByteLength(category) > 31) {
    throw new InvalidCategoryError(`category exceeds 31 bytes: "${category}"`);
  }
}

export function assertValidTier(tier: string): void {
  if (utf8ByteLength(tier) > 31) {
    throw new InvalidTierError(`tier exceeds 31 bytes: "${tier}"`);
  }
}

// ── Route 1: proposeMintCategory ─────────────────────────────
export async function validateProposeMint(c: Context, next: Next) {
  const body = await c.req.json<ProposeMintRequest>();
  assertValidCategory(body.category);
  for (const t of body.tiers) {
    assertValidTier(t.tier);
    assertValidAddressList(t.addresses);
  }
  await next();
}

// ── Route 2: mintPasses ──────────────────────────────────────
export async function validateMintPasses(c: Context, next: Next) {
  const body = await c.req.json<MintPassesRequest>();
  assertValidTier(body.tier);
  assertValidAddressList(body.addresses);
  assertValidRecipients(body.recipients);
  await next();
}

// ── Route 3: mintDirect ──────────────────────────────────────
export async function validateMintDirect(c: Context, next: Next) {
  const body = await c.req.json<MintDirectRequest>();
  assertValidCategory(body.category);
  assertValidTier(body.tier);
  assertValidRecipients(body.recipients);
  await next();
}

// ── Route 4: getInvolvedProposals ────────────────────────────
export async function validateAccountParam(c: Context, next: Next) {
  const account = c.req.param('account');
  assertValidAddress(account ?? '', 'account');
  await next();
}

// ── Route 5: getVaultSummary ─────────────────────────────────
// No body/param validation beyond vaultId being present — vaultId format
// (numeric) isn't currently checked by assertX helpers; skip for now.

// ── Route 6: getCategoryTierDetails ──────────────────────────
export async function validateCategoryParam(c: Context, next: Next) {
  const category = c.req.param('category');
  assertValidCategory(category?? '');
  await next();
}