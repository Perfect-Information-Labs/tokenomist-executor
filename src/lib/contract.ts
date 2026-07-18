import { createPublicClient, http, toHex, hexToString } from 'viem';
import { TOKENOMIST_ABI } from '../abi/OnchainTokenomist';

export { TOKENOMIST_ABI };

export function getPublicClient(env: CloudflareBindings) {
  return createPublicClient({
    transport: http(env.ARC_TESTNET_RPC_URL),
  });
}

export function encodeBytes32String(str: string): `0x${string}` {
  const hex = toHex(str);
  return hex.padEnd(66, '0') as `0x${string}`;
}

export function decodeBytes32String(bytes32: `0x${string}`): string {
  const trimmed = bytes32.replace(/0+$/, '');
  const evenLength = trimmed.length % 2 === 0 ? trimmed : trimmed + '0';
  return hexToString(evenLength as `0x${string}`);
}