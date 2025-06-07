// Loan request status
export type LoanStatus = 'PENDING' | 'FUNDED' | 'REPAID' | 'DEFAULTED' | 'CANCELLED';

// Loan request interface
export interface LoanRequest {
  id: string;
  borrowerAddress: string;
  borrowerDID?: string;
  pseudonymousId?: string;
  amount: number;
  currency: string;
  purpose: string;
  tags?: string[];
  status: LoanStatus;
  createdAt: number;
  fundedAt?: number;
  repaidAt?: number;
  lenderAddress?: string;
  escrowId?: string;
  txHash?: string;
  repaymentTxHash?: string;
  interestRate?: number;
  repaymentPeriod?: number; // in days
  riskScore?: number;
  collateralType?: string;
}

// User type (for mock data)
export interface User {
  address: string;
  name: string;
  role: 'borrower' | 'lender';
  did?: string;
  pseudonymousId?: string;
  balance?: number;
  currency?: string;
}

// DID and Identity types
export interface MockDID {
  id: string;
  publicKey: string;
  created: number;
  controller: string;
}

// Reputation System types
export interface ReputationScore {
  did: string;
  pseudonymousId: string;
  totalLoans: number;
  successfulRepayments: number;
  defaultedLoans: number;
  averageRepaymentTime: number; // in days
  trustScore: number; // 0-100
  lastUpdated: number;
  verificationLevel: 'unverified' | 'basic' | 'enhanced';
  categories: {
    education: number;
    healthcare: number;
    business: number;
    agriculture: number;
    emergency: number;
  };
}

// Loan Metadata for IPFS/XRPL storage
export interface LoanMetadata {
  purpose: string;
  borrowerDID: string;
  pseudonymousId: string;
  tags: string[];
  requestedAmount: number;
  currency: string;
  repaymentPeriod: number; // days
  interestRate: number; // percentage
  collateralType?: string;
  riskScore: number;
  createdAt: number;
  encrypted?: boolean;
  ipfsHash?: string;
}

// XRPL Escrow types
export interface EscrowDetails {
  account: string;
  destination: string;
  amount: string | any;
  condition?: string;
  fulfillment?: string;
  destinationTag?: number;
  finishAfter?: number;
  cancelAfter?: number;
  sequence?: number;
  escrowId?: string;
  txHash?: string;
  status: 'created' | 'fulfilled' | 'cancelled' | 'expired';
  createdAt: number;
  loanPurpose?: string;
  borrowerDID?: string;
  pseudonymousId?: string;
}

// Privacy and Anonymization
export interface AnonymizedBorrowerProfile {
  pseudonymousId: string;
  reputationScore: ReputationScore;
  activeLoans: number;
  totalBorrowed: number;
  joinedDate: number;
  verificationBadges: string[];
  categoryExpertise: string[];
  averageLoanSize: number;
  preferredRepaymentPeriod: number;
}

// Lending Pool types
export interface LendingPool {
  id: string;
  name: string;
  description: string;
  totalCapital: number;
  availableCapital: number;
  interestRate: number;
  minimumCreditScore: number;
  lenders: string[];
  activeLoans: string[];
  created: number;
}

// Transaction and XRPL types
export interface XRPLTransaction {
  hash: string;
  type: 'escrow_create' | 'escrow_finish' | 'payment';
  account: string;
  destination?: string;
  amount: string | any;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  blockExplorerUrl: string;
}

// Mock data
export const MOCK_USERS: User[] = [
  {
    address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    name: 'Maya Patel',
    role: 'borrower',
    did: 'did:xrpl:Hb9CJAWy:1704157200000',
    pseudonymousId: 'USER-HB9C1234',
    balance: 250,
    currency: 'RLUSD'
  },
  {
    address: 'rUn84CJowRBX4T9w7qjpDC8BreMnqZNYhh',
    name: 'Ahmed Hassan',
    role: 'borrower',
    did: 'did:xrpl:Un84CJow:1704157200000',
    pseudonymousId: 'USER-UN84567A',
    balance: 180,
    currency: 'RLUSD'
  },
  {
    address: 'rDdECVmwpkRo8FtY3ywCYhHX8VfuSAqghj',
    name: 'Sarah Chen',
    role: 'lender',
    did: 'did:xrpl:DdECVmwp:1704157200000',
    pseudonymousId: 'LENDER-DD3C789B',
    balance: 5000,
    currency: 'RLUSD'
  },
  {
    address: 'rPp4qpHWGYBV8wC5KvCf5G8aGBkR5kZ4Ts',
    name: 'Michael Torres',
    role: 'lender',
    did: 'did:xrpl:Pp4qpHWG:1704157200000',
    pseudonymousId: 'LENDER-PP4Q901C',
    balance: 8500,
    currency: 'RLUSD'
  },
  {
    address: 'rF8h3K2mN9pQsE7Lj6vRxC4wY1zB5tG3Mp',
    name: 'Elena Rodriguez',
    role: 'borrower',
    did: 'did:xrpl:F8h3K2mN:1704157200000',
    pseudonymousId: 'USER-F8H3234D',
    balance: 320,
    currency: 'RLUSD'
  },
  {
    address: 'rB2mL9kE8vR3qT7sF1nC6pX5jA4hD9wZ8',
    name: 'David Kim',
    role: 'lender',
    did: 'did:xrpl:B2mL9kE8:1704157200000',
    pseudonymousId: 'LENDER-B2ML567E',
    balance: 12000,
    currency: 'RLUSD'
  }
];

// Mock reputation data
export const MOCK_REPUTATION_SCORES: ReputationScore[] = [
  {
    did: 'did:xrpl:Hb9CJAWy:1704157200000',
    pseudonymousId: 'USER-HB9C1234',
    totalLoans: 5,
    successfulRepayments: 4,
    defaultedLoans: 1,
    averageRepaymentTime: 18,
    trustScore: 72,
    lastUpdated: Date.now(),
    verificationLevel: 'basic',
    categories: {
      education: 2,
      healthcare: 1,
      business: 2,
      agriculture: 0,
      emergency: 0
    }
  },
  {
    did: 'did:xrpl:Un84CJow:1704157200000',
    pseudonymousId: 'USER-UN84567A',
    totalLoans: 3,
    successfulRepayments: 3,
    defaultedLoans: 0,
    averageRepaymentTime: 12,
    trustScore: 89,
    lastUpdated: Date.now(),
    verificationLevel: 'enhanced',
    categories: {
      education: 1,
      healthcare: 0,
      business: 1,
      agriculture: 1,
      emergency: 0
    }
  },
  {
    did: 'did:xrpl:F8h3K2mN:1704157200000',
    pseudonymousId: 'USER-F8H3234D',
    totalLoans: 1,
    successfulRepayments: 1,
    defaultedLoans: 0,
    averageRepaymentTime: 15,
    trustScore: 65,
    lastUpdated: Date.now(),
    verificationLevel: 'basic',
    categories: {
      education: 0,
      healthcare: 1,
      business: 0,
      agriculture: 0,
      emergency: 0
    }
  }
];

// Available loan categories with tags
export const LOAN_CATEGORIES = [
  { value: 'business-expansion', label: 'Business Expansion', tag: '#business', color: 'bg-secondary-500' },
  { value: 'education', label: 'Education', tag: '#education', color: 'bg-primary-500' },
  { value: 'medical-expenses', label: 'Medical Expenses', tag: '#healthcare', color: 'bg-error-500' },
  { value: 'agriculture', label: 'Agriculture', tag: '#agriculture', color: 'bg-success-500' },
  { value: 'home-improvement', label: 'Home Improvement', tag: '#housing', color: 'bg-warning-500' },
  { value: 'emergency', label: 'Emergency', tag: '#emergency', color: 'bg-accent-500' },
  { value: 'climate-action', label: 'Climate Action', tag: '#climateAid', color: 'bg-success-600' },
  { value: 'women-empowerment', label: 'Women Empowerment', tag: '#womenEmpowerment', color: 'bg-accent-600' },
  { value: 'other', label: 'Other', tag: '#other', color: 'bg-slate-500' }
];

// Risk assessment levels
export const RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', score: 80, color: 'text-success-400' },
  { value: 'medium', label: 'Medium Risk', score: 60, color: 'text-warning-400' },
  { value: 'high', label: 'High Risk', score: 40, color: 'text-error-400' }
];

// Currency support
export const SUPPORTED_CURRENCIES = [
  { code: 'RLUSD', name: 'Ripple USD', symbol: '$', decimals: 2 },
  { code: 'XRP', name: 'XRP', symbol: 'XRP', decimals: 6 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 }
];

// Platform statistics
export interface PlatformStats {
  totalLoansIssued: number;
  totalValueLocked: number;
  activeBorrowers: number;
  activeLenders: number;
  successRate: number;
  averageLoanSize: number;
  totalRepaid: number;
  platformFees: number;
}

export const MOCK_PLATFORM_STATS: PlatformStats = {
  totalLoansIssued: 1247,
  totalValueLocked: 2400000,
  activeBorrowers: 892,
  activeLenders: 156,
  successRate: 98.5,
  averageLoanSize: 1850,
  totalRepaid: 2200000,
  platformFees: 12000
};

// Mock loan requests
export const MOCK_LOAN_REQUESTS: LoanRequest[] = [
  {
    id: 'loan-001',
    borrowerAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    amount: 1000,
    currency: 'RLUSD',
    purpose: 'Small business expansion - inventory purchase',
    status: 'PENDING',
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
  },
  {
    id: 'loan-002',
    borrowerAddress: 'rUn84CJowRBX4T9w7qjpDC8BreMnqZNYhh',
    amount: 500,
    currency: 'RLUSD',
    purpose: 'Education - university fees',
    status: 'FUNDED',
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    fundedAt: Date.now() - 86400000 * 4, // 4 days ago
    lenderAddress: 'rDdECVmwpkRo8FtY3ywCYhHX8VfuSAqghj',
    escrowId: 'E1234567890ABCDEF',
  }
]; 