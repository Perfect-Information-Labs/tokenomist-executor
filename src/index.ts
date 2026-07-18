import { Hono } from 'hono';
import { errorHandler } from './middleware/error-handler';
import { gatewayPayment } from './middleware/gateway-payment';
import { validateEnv } from './config';
import vaultCategoriesRoute from './routes/vault-categories';
import proposalsRoute from './routes/proposals';
import mintPassesRoute from './routes/mint-passes';
import mintDirectRoute from './routes/mint-direct';
import proposalsByAccountRoute from './routes/proposals-by-account';
import vaultSummaryRoute from './routes/vault-summary';
import tierDetailsRoute from './routes/tier-details';
import { rateLimit } from './middleware/rate-limit';
import { validateProposeMint, 
  validateMintPasses, 
  validateMintDirect, 
  validateAccountParam, 
  validateCategoryParam 
} from './middleware/validate';
import docsRoute from './routes/docs';
// @ts-ignore - text import via wrangler rule
import openapiYaml from '../openapi.yaml';

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Central error handling — catches anything thrown from any route below
app.onError(errorHandler);

// Health check always responds regardless of env state.
app.get('/health', (c) => c.json({ status: 'ok', service: 'tokenomist-executor' }));
app.route('/', docsRoute);
app.get('/openapi.yaml', (c) =>
  c.text(openapiYaml, 200, { 'Content-Type': 'application/yaml' })
);

app.use('*', async (c, next) => {
  validateEnv(c.env);
  await next();
});

// USDC has 6 decimals — convert dollar-string prices to atomic units
function toAtomicUSDC(dollarAmount: string): string {
  const atomic = Math.round(parseFloat(dollarAmount) * 1_000_000);
  return atomic.toString();
}

// Reads — $0.0001 each
app.use('/v1/vaults/:vaultId/categories', rateLimit('RATE_LIMITER_TIER_DETAILS'));
app.use('/v1/vaults/:vaultId/categories', gatewayPayment(toAtomicUSDC('0.0001')));
app.route('/', vaultCategoriesRoute);

app.use('/v1/accounts/:account/proposals', validateAccountParam);
app.use('/v1/accounts/:account/proposals', rateLimit('RATE_LIMITER_READ'));
app.use('/v1/accounts/:account/proposals', gatewayPayment(toAtomicUSDC('0.0001')));
app.route('/', proposalsByAccountRoute);

app.use('/v1/vaults/:vaultId/categories/:category/tiers', validateCategoryParam);
app.use('/v1/vaults/:vaultId/categories/:category/tiers', rateLimit('RATE_LIMITER_READ'));
app.use('/v1/vaults/:vaultId/categories/:category/tiers', gatewayPayment(toAtomicUSDC('0.0001')));
app.route('/', tierDetailsRoute);

// Vault- Summary Reads — $0.0005
app.use('/v1/vaults/:vaultId/summary', rateLimit('RATE_LIMITER_READ'));
app.use('/v1/vaults/:vaultId/summary', gatewayPayment(toAtomicUSDC('0.0005')));
app.route('/', vaultSummaryRoute);

// Writes — $0.01 each
app.use('/v1/vaults/:vaultId/proposals', validateProposeMint);
app.use('/v1/vaults/:vaultId/proposals', rateLimit('RATE_LIMITER_WRITE'));
app.use('/v1/vaults/:vaultId/proposals', gatewayPayment(toAtomicUSDC('0.01')));
app.route('/', proposalsRoute);

app.use('/v1/proposals/:proposalId/mint', validateMintPasses);
app.use('/v1/proposals/:proposalId/mint', rateLimit('RATE_LIMITER_WRITE'));
app.use('/v1/proposals/:proposalId/mint', gatewayPayment(toAtomicUSDC('0.01')));
app.route('/', mintPassesRoute);

app.use('/v1/vaults/:vaultId/mint-direct', validateMintDirect);
app.use('/v1/vaults/:vaultId/mint-direct', rateLimit('RATE_LIMITER_WRITE'));
app.use('/v1/vaults/:vaultId/mint-direct', gatewayPayment(toAtomicUSDC('0.01')));
app.route('/', mintDirectRoute);


export default app;