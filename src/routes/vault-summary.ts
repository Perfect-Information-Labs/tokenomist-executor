import { Hono } from 'hono';
import { getPublicClient, TOKENOMIST_ABI } from '../lib/contract';
import { VaultNotFoundError } from '../lib/errors';
import type { VaultSummaryResponse } from '../types';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get('/v1/vaults/:vaultId/summary', async (c) => {
  const vaultId = c.req.param('vaultId');
  const client = getPublicClient(c.env);

  let summary: any;
  try {
    summary = await client.readContract({
      address: c.env.TOKENOMIST_CONTRACT_ADDRESS as `0x${string}`,
      abi: TOKENOMIST_ABI,
      functionName: 'getVaultSummary',
      args: [BigInt(vaultId)],
    });
  } catch (err: any) {
    // Plain string revert "Vault not found" — not a custom ABI error, so it
    // surfaces in viem's error message rather than being ABI-decoded.
    if (err?.message?.includes('Vault not found')) {
      throw new VaultNotFoundError(`Vault ${vaultId} not found`);
    }
    throw err;
  }

  const response: VaultSummaryResponse = {
    vaultId: summary.vaultId.toString(),
    tokenAddress: summary.tokenAddress,
    creator: summary.creator,
    admin1: summary.admin1,
    admin2: summary.admin2,
    executor: summary.executor,
    totalDeposited: summary.totalDeposited.toString(),
    totalAllocated: summary.totalAllocated.toString(),
    totalClaimed: summary.totalClaimed.toString(),
    createdAt: summary.createdAt.toString(),
    startTime: summary.startTime.toString(),
    finalized: summary.finalized,
    categoryCount: summary.categoryCount.toString(),
    totalPassesMinted: summary.totalPassesMinted.toString(),
    totalCompletedClaims: summary.totalCompletedClaims.toString(),
    totalActivePasses: summary.totalActivePasses.toString(),
  };

  return c.json(response);
});

export default app;