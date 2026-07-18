import { Hono } from 'hono';
import { encodeFunctionData } from 'viem';
import { TOKENOMIST_ABI, encodeBytes32String } from '../lib/contract';
import { chunkArray } from '../lib/batching';
import type { MintDirectRequest, MintDirectResponse, TxChunk } from '../types';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post('/v1/vaults/:vaultId/mint-direct', async (c) => {
  const vaultId = c.req.param('vaultId');
  const body = await c.req.json<MintDirectRequest>();

  const categoryBytes32 = encodeBytes32String(body.category);
  const tierBytes32 = encodeBytes32String(body.tier);

  // Chunk recipients into groups of ≤60 — no merkle involved
  const chunks = chunkArray(body.recipients);

  const transactions: TxChunk[] = chunks.map((chunk, i) => {
    const data = encodeFunctionData({
      abi: TOKENOMIST_ABI,
      functionName: 'mintDirect',
      args: [BigInt(vaultId), categoryBytes32, tierBytes32, chunk as `0x${string}`[]] as const,
    });

    return {
      to: c.env.TOKENOMIST_CONTRACT_ADDRESS,
      data,
      chunkIndex: i,
      recipientCount: chunk.length,
    };
  });

  const response: MintDirectResponse = {
    vaultId,
    category: body.category,
    tier: body.tier,
    transactions,
    totalChunks: transactions.length,
    totalRecipients: body.recipients.length,
  };

  return c.json(response);
});

export default app;