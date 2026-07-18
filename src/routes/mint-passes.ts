import { Hono } from 'hono';
import { encodeFunctionData } from 'viem';
import { TOKENOMIST_ABI, encodeBytes32String } from '../lib/contract';
import { getProofsForRecipients } from '../lib/merkle';
import { chunkRecipientsWithProofs } from '../lib/batching';
import type { MintPassesRequest, MintPassesResponse, TxChunk } from '../types';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post('/v1/proposals/:proposalId/mint', async (c) => {
  const proposalId = c.req.param('proposalId');
  const body = await c.req.json<MintPassesRequest>();

  const tierBytes32 = encodeBytes32String(body.tier);

  // Rebuild tree from full address list, get proofs for requested recipients
  const proofs = getProofsForRecipients(body.addresses, body.recipients);

  // Chunk recipients + proofs into groups of ≤60
  const chunks = chunkRecipientsWithProofs(body.recipients, proofs);

  const transactions: TxChunk[] = chunks.map((chunk, i) => {
    const data = encodeFunctionData({
      abi: TOKENOMIST_ABI,
      functionName: 'mintPasses',
      args: [
        BigInt(proposalId),
        tierBytes32,
        chunk.recipients as readonly `0x${string}`[],
        chunk.proofs,
      ] as const,
    });

    return {
      to: c.env.TOKENOMIST_CONTRACT_ADDRESS,
      data,
      chunkIndex: i,
      recipientCount: chunk.recipients.length,
    };
  });

  const response: MintPassesResponse = {
    proposalId,
    tier: body.tier,
    transactions,
    totalChunks: transactions.length,
    totalRecipients: body.recipients.length,
  };

  return c.json(response);
});

export default app;