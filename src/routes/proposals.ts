import { Hono } from 'hono';
import { encodeFunctionData } from 'viem';
import { TOKENOMIST_ABI, encodeBytes32String } from '../lib/contract';
import { computeMerkleRoot } from '../lib/merkle';
import type { ProposeMintRequest, ProposeMintResponse } from '../types';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post('/v1/vaults/:vaultId/proposals', async (c) => {
  const vaultId = c.req.param('vaultId');
  const body = await c.req.json<ProposeMintRequest>();

  // Encode category
  const categoryBytes32 = encodeBytes32String(body.category);

  // Build tierBatches + compute roots
  const tierBatches = body.tiers.map((t) => {
    const merkleRoot = computeMerkleRoot(t.addresses);
    return {
      tier: encodeBytes32String(t.tier),
      merkleRoot,
      supplyCount: BigInt(t.supplyCount),
    };
  });

  const data = encodeFunctionData({
    abi: TOKENOMIST_ABI,
    functionName: 'proposeMintCategory',
    args: [BigInt(vaultId), categoryBytes32, tierBatches],
  });

  const response: ProposeMintResponse = {
    vaultId,
    category: body.category,
    to: c.env.TOKENOMIST_CONTRACT_ADDRESS,
    data,
    tiers: body.tiers.map((t, i) => ({
      tier: t.tier,
      merkleRoot: tierBatches[i].merkleRoot,
      supplyCount: t.supplyCount,
      addressCount: t.addresses.length,
    })),
  };

  return c.json(response);
});

export default app;