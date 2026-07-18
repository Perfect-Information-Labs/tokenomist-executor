export const MAX_BATCH_SIZE = 60;

/**
 * Splits an array into chunks of at most MAX_BATCH_SIZE.
 * Order is preserved; last chunk may be smaller than MAX_BATCH_SIZE.
 */
export function chunkArray<T>(items: T[], size: number = MAX_BATCH_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Splits recipients (and their parallel proofs array) into aligned chunks.
 * Used by mintPasses, where each recipient has a corresponding proof entry.
 */
export function chunkRecipientsWithProofs(
  recipients: string[],
  proofs: `0x${string}`[][],
  size: number = MAX_BATCH_SIZE
): { recipients: string[]; proofs: `0x${string}`[][] }[] {
  const recipientChunks = chunkArray(recipients, size);
  const proofChunks = chunkArray(proofs, size);

  return recipientChunks.map((recipientChunk, i) => ({
    recipients: recipientChunk,
    proofs: proofChunks[i],
  }));
}