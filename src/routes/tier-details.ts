import { Hono } from 'hono';
import { getPublicClient, TOKENOMIST_ABI, encodeBytes32String, decodeBytes32String } from '../lib/contract';
import type { GetCategoryTierDetailsResponse, TierDetail } from '../types';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get('/v1/vaults/:vaultId/categories/:category/tiers', async (c) => {
  const vaultId = c.req.param('vaultId');
  const category = c.req.param('category');

  const client = getPublicClient(c.env);
  const categoryBytes32 = encodeBytes32String(category);

  const details = await client.readContract({
    address: c.env.TOKENOMIST_CONTRACT_ADDRESS as `0x${string}`,
    abi: TOKENOMIST_ABI,
    functionName: 'getCategoryTierDetails',
    args: [BigInt(vaultId), categoryBytes32],
  });

  const mapped: TierDetail[] = (details as any[]).map((t) => ({
    tier: decodeBytes32String(t.tier),
    allocationPerPass: t.allocationPerPass.toString(),
    maxSupply: t.maxSupply.toString(),
    mintedCount: t.mintedCount.toString(),
    remainingSupply: t.remainingSupply.toString(),
    totalAllocated: t.totalAllocated.toString(),
    passHolderCount: t.passHolderCount.toString(),
  }));

  const response: GetCategoryTierDetailsResponse = {
    vaultId,
    category,
    tiers: mapped,
  };

  return c.json(response);
});

export default app;