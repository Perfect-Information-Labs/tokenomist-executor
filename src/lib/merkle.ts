import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

export interface MerkleResult {
  root: `0x${string}`;
  proofs: `0x${string}`[][];
}

/**
 * Builds a StandardMerkleTree over a list of addresses (single-value leaf: ['address']),
 * matching the contract's leaf format:
 *   keccak256(bytes.concat(keccak256(abi.encode(address))))
 * which is exactly OZ's default single-address-column tree.
 */
export function buildAddressMerkleTree(addresses: string[]): StandardMerkleTree<string[]> {
  const values = addresses.map((addr) => [addr]);
  return StandardMerkleTree.of(values, ['address']);
}

/**
 * Returns just the root — used at propose time (Route 1).
 */
export function computeMerkleRoot(addresses: string[]): `0x${string}` {
  const tree = buildAddressMerkleTree(addresses);
  return tree.root as `0x${string}`;
}

/**
 * Rebuilds the tree from the full original address list, then returns proofs
 * for each requested recipient, in the same order as `recipients`.
 * Throws if a recipient isn't found in the tree (agent developer's responsibility to avoid).
 */
export function getProofsForRecipients(
  addresses: string[],
  recipients: string[]
): `0x${string}`[][] {
  // Single-address tier: no real tree, root === the one leaf, no proof needed
  if (addresses.length === 1) {
    return recipients.map(() => []);
  }

  const tree = buildAddressMerkleTree(addresses);

  const addressToIndex = new Map<string, number>();
  for (const [i, v] of tree.entries()) {
    addressToIndex.set((v[0] as string).toLowerCase(), i);
  }

  return recipients.map((recipient) => {
    const index = addressToIndex.get(recipient.toLowerCase());
    if (index === undefined) {
      throw new Error(`Recipient not found in address list: ${recipient}`);
    }
    return tree.getProof(index) as `0x${string}`[];
  });
}