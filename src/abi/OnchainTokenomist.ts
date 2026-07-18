export const TOKENOMIST_ABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "vaultId",
                "type": "uint256"
            }
        ],
        "name": "getVaultCategories",
        "outputs": [
            {
                "internalType": "bytes32[]",
                "name": "",
                "type": "bytes32[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "vaultId",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "category",
                "type": "bytes32"
            },
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "tier",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "merkleRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "supplyCount",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct StorageLib.TierBatchInput[]",
                "name": "tierBatches",
                "type": "tuple[]"
            }
        ],
        "name": "proposeMintCategory",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "proposalId",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "proposalId",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "tier",
                "type": "bytes32"
            },
            {
                "internalType": "address[]",
                "name": "recipients",
                "type": "address[]"
            },
            {
                "internalType": "bytes32[][]",
                "name": "proofs",
                "type": "bytes32[][]"
            }
        ],
        "name": "mintPasses",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "vaultId",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "category",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "tier",
                "type": "bytes32"
            },
            {
                "internalType": "address[]",
                "name": "recipients",
                "type": "address[]"
            }
        ],
        "name": "mintDirect",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "getInvolvedProposals",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "proposalId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "vaultId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "category",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "proposer",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "admin1",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "admin2",
                        "type": "address"
                    },
                    {
                        "internalType": "bool",
                        "name": "admin1Approved",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "admin2Approved",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "rejected",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "expired",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "executed",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "proposedAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deadline",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ViewModule.ProposalInfo[]",
                "name": "proposals",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "vaultId",
                "type": "uint256"
            }
        ],
        "name": "getVaultSummary",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "vaultId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "creator",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "admin1",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "admin2",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "executor",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalDeposited",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalAllocated",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalClaimed",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "startTime",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "finalized",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "categoryCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalPassesMinted",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalCompletedClaims",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalActivePasses",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ViewModule.VaultSummary",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "vaultId",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "category",
                "type": "bytes32"
            }
        ],
        "name": "getCategoryTierDetails",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "tier",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "allocationPerPass",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxSupply",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "mintedCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "remainingSupply",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalAllocated",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "passHolderCount",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ViewModule.TierDetails[]",
                "name": "details",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;