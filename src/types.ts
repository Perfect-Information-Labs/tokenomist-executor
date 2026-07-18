// ── Route 1: proposeMintCategory ────────────────────────────
export interface ProposeMintRequest {
  category: string;
  tiers: {
    tier: string;
    addresses: string[];
    supplyCount: number;
  }[];
}

export interface ProposeMintResponse {
  vaultId: string;
  category: string;
  to: string;
  data: string;
  tiers: {
    tier: string;
    merkleRoot: string;
    supplyCount: number;
    addressCount: number;
  }[];
}

// ── Route 2: mintPasses ─────────────────────────────────────
export interface MintPassesRequest {
  tier: string;
  addresses: string[];
  recipients: string[];
}

export interface TxChunk {
  to: string;
  data: string;
  chunkIndex: number;
  recipientCount: number;
}

export interface MintPassesResponse {
  proposalId: string;
  tier: string;
  transactions: TxChunk[];
  totalChunks: number;
  totalRecipients: number;
}

// ── Route 3: mintDirect ──────────────────────────────────────
export interface MintDirectRequest {
  category: string;
  tier: string;
  recipients: string[];
}

export interface MintDirectResponse {
  vaultId: string;
  category: string;
  tier: string;
  transactions: TxChunk[];
  totalChunks: number;
  totalRecipients: number;
}

// ── Route 4: getInvolvedProposals ────────────────────────────
export interface ProposalInfo {
  proposalId: string;
  vaultId: string;
  category: string;
  proposer: string;
  admin1: string;
  admin2: string;
  admin1Approved: boolean;
  admin2Approved: boolean;
  rejected: boolean;
  expired: boolean;
  executed: boolean;
  proposedAt: string;
  deadline: string;
}

export interface GetInvolvedProposalsResponse {
  account: string;
  proposals: ProposalInfo[];
}

// ── Route 5: getVaultSummary ─────────────────────────────────
export interface VaultSummaryResponse {
  vaultId: string;
  tokenAddress: string;
  creator: string;
  admin1: string;
  admin2: string;
  executor: string;
  totalDeposited: string;
  totalAllocated: string;
  totalClaimed: string;
  createdAt: string;
  startTime: string;
  finalized: boolean;
  categoryCount: string;
  totalPassesMinted: string;
  totalCompletedClaims: string;
  totalActivePasses: string;
}

// ── Route 6: getCategoryTierDetails ──────────────────────────
export interface TierDetail {
  tier: string;
  allocationPerPass: string;
  maxSupply: string;
  mintedCount: string;
  remainingSupply: string;
  totalAllocated: string;
  passHolderCount: string;
}

export interface GetCategoryTierDetailsResponse {
  vaultId: string;
  category: string;
  tiers: TierDetail[];
}

export interface GetVaultCategoriesResponse {
  vaultId: string;
  categories: string[];
}

// ── Shared error response shape ──────────────────────────────
export interface ErrorResponse {
  error: string;
  message: string;
}
