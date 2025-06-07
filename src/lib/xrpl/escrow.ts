import { Wallet } from 'xrpl';
import { ReputationScore, MOCK_REPUTATION_SCORES } from '@/types';

export interface EscrowDetails {
  account: string;
  destination: string;
  amount: string;
  escrowId?: string;
  txHash?: string;
  status: 'created' | 'fulfilled' | 'cancelled' | 'expired';
  createdAt: number;
  loanPurpose?: string;
  borrowerDID?: string;
  pseudonymousId?: string;
}

export interface LoanMetadata {
  purpose: string;
  borrowerDID: string;
  pseudonymousId: string;
  tags: string[];
  requestedAmount: number;
  currency: string;
  repaymentPeriod: number;
  interestRate: number;
  riskScore: number;
  createdAt: number;
}

// In-memory storage for demo
const loanMetadataStore = new Map<string, LoanMetadata>();
const escrowStore = new Map<string, EscrowDetails>();

// Initialize with mock reputation data
const reputationStore = new Map<string, ReputationScore>(
  MOCK_REPUTATION_SCORES.map(rep => [rep.did, rep])
);

/**
 * Create a loan request (store metadata)
 */
export function createLoanRequest(metadata: LoanMetadata): string {
  const requestId = `loan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  loanMetadataStore.set(requestId, metadata);
  return requestId;
}

/**
 * Mock escrow creation for demo purposes
 */
export async function createLoanEscrow(
  lenderWallet: Wallet,
  borrowerAddress: string,
  amount: number,
  loanMetadata: LoanMetadata,
  durationDays: number = 30
): Promise<{ success: boolean; escrowId?: string; txHash?: string; error?: string }> {
  try {
    const escrowId = `escrow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const txHash = `tx-${Date.now().toString(16).toUpperCase()}`;

    const escrowDetails: EscrowDetails = {
      account: lenderWallet.address,
      destination: borrowerAddress,
      amount: amount.toString(),
      escrowId: escrowId,
      txHash: txHash,
      status: 'created',
      createdAt: Date.now(),
      loanPurpose: loanMetadata.purpose,
      borrowerDID: loanMetadata.borrowerDID,
      pseudonymousId: loanMetadata.pseudonymousId
    };

    escrowStore.set(escrowId, escrowDetails);
    console.log('Mock escrow created:', { escrowId, txHash });
    return { success: true, escrowId, txHash };
  } catch (error) {
    console.error('Error creating escrow:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Mock loan repayment
 */
export async function repayLoan(
  borrowerWallet: Wallet,
  escrowId: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const escrowDetails = escrowStore.get(escrowId);
    if (!escrowDetails) {
      return { success: false, error: 'Escrow not found' };
    }

    escrowDetails.status = 'fulfilled';
    escrowStore.set(escrowId, escrowDetails);

    if (escrowDetails.borrowerDID) {
      updateReputationScore(escrowDetails.borrowerDID, true);
    }

    const txHash = `repay-tx-${Date.now().toString(16).toUpperCase()}`;
    return { success: true, txHash };
  } catch (error) {
    console.error('Error repaying loan:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get reputation score for a borrower
 */
export function getReputationScore(borrowerDID: string): ReputationScore | null {
  return reputationStore.get(borrowerDID) || null;
}

/**
 * Update reputation score for a borrower
 */
export function updateReputationScore(borrowerDID: string, successful: boolean): void {
  let reputation = reputationStore.get(borrowerDID);
  
  if (!reputation) {
    // Create new reputation for borrower
    reputation = {
      did: borrowerDID,
      pseudonymousId: `USER-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      totalLoans: 0,
      successfulRepayments: 0,
      defaultedLoans: 0,
      averageRepaymentTime: 15,
      trustScore: 50,
      lastUpdated: Date.now(),
      verificationLevel: 'unverified',
      categories: {
        education: 0,
        healthcare: 0,
        business: 0,
        agriculture: 0,
        emergency: 0
      }
    };
  }

  reputation.totalLoans += 1;
  if (successful) {
    reputation.successfulRepayments += 1;
  } else {
    reputation.defaultedLoans += 1;
  }

  // Simple trust score calculation
  const successRate = (reputation.successfulRepayments / reputation.totalLoans) * 100;
  reputation.trustScore = Math.round(Math.min(100, Math.max(0, successRate)));
  reputation.lastUpdated = Date.now();
  
  reputationStore.set(borrowerDID, reputation);
}

/**
 * Get escrow details by ID
 */
export function getEscrowDetails(escrowId: string): EscrowDetails | null {
  return escrowStore.get(escrowId) || null;
}

/**
 * Get all escrows for a user
 */
export function getUserEscrows(userAddress: string): EscrowDetails[] {
  return Array.from(escrowStore.values()).filter(
    escrow => escrow.account === userAddress || escrow.destination === userAddress
  );
}

/**
 * Get available loan opportunities (for lenders)
 */
export function getAvailableLoanRequests(): LoanMetadata[] {
  return Array.from(loanMetadataStore.values());
}

/**
 * Get loan request by ID
 */
export function getLoanRequest(requestId: string): LoanMetadata | null {
  return loanMetadataStore.get(requestId) || null;
}

/**
 * Generate testnet explorer link
 */
export function getTestnetExplorerLink(txHash: string): string {
  return `https://testnet.xrpl.org/transactions/${txHash}`;
} 