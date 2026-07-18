import { Hono } from 'hono';
import { getPublicClient, TOKENOMIST_ABI, decodeBytes32String } from '../lib/contract';
import type { GetVaultCategoriesResponse } from '../types';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get('/v1/vaults/:vaultId/categories', async (c) => {
  const vaultId = c.req.param('vaultId');
  const client = getPublicClient(c.env);

  const categories = await client.readContract({
    address: c.env.TOKENOMIST_CONTRACT_ADDRESS as `0x${string}`,
    abi: TOKENOMIST_ABI,
    functionName: 'getVaultCategories',
    args: [BigInt(vaultId)],
  });

  const decoded = (categories as `0x${string}`[]).map((c) => decodeBytes32String(c));

  const response: GetVaultCategoriesResponse = {
    vaultId,
    categories: decoded,
  };

  return c.json(response);
});

export default app;