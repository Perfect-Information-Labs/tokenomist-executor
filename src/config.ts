const REQUIRED_KEYS: (keyof CloudflareBindings)[] = [
  'TOKENOMIST_CONTRACT_ADDRESS',
  'ARC_TESTNET_RPC_URL',
  'ARC_NETWORK_ID',
  'SELLER_ADDRESS',
  'GATEWAY_WALLET_ADDRESS',
  'USDC_ADDRESS',
  'GATEWAY_FACILITATOR_URL',
] as const;

export function validateEnv(env: CloudflareBindings): void {
  const missing = REQUIRED_KEYS.filter((key) => {
    const value = env[key];
    return typeof value !== 'string' || value.trim() === '';
  });
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}