import { Hono } from 'hono';
import { getPublicClient, TOKENOMIST_ABI, decodeBytes32String } from '../lib/contract';
import type { GetInvolvedProposalsResponse, ProposalInfo } from '../types';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get('/v1/accounts/:account/proposals', async (c) => {
  const account = c.req.param('account');


  const client = getPublicClient(c.env);

  const proposals = await client.readContract({
    address: c.env.TOKENOMIST_CONTRACT_ADDRESS as `0x${string}`,
    abi: TOKENOMIST_ABI,
    functionName: 'getInvolvedProposals',
    args: [account as `0x${string}`],
  });

  const mapped: ProposalInfo[] = (proposals as any[]).map((p) => ({
    proposalId: p.proposalId.toString(),
    vaultId: p.vaultId.toString(),
    category: decodeBytes32String(p.category),
    proposer: p.proposer,
    admin1: p.admin1,
    admin2: p.admin2,
    admin1Approved: p.admin1Approved,
    admin2Approved: p.admin2Approved,
    rejected: p.rejected,
    expired: p.expired,
    executed: p.executed,
    proposedAt: p.proposedAt.toString(),
    deadline: p.deadline.toString(),
  }));

  const response: GetInvolvedProposalsResponse = {
    account,
    proposals: mapped,
  };

  return c.json(response);
});

export default app;