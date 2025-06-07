import { database, DatabaseUser, DatabaseLoan, Transaction, EscrowData } from './db';
import { LoanStatus, ReputationScore } from '@/types';
import { generateDIDFromAddress, generatePseudonymousId } from '@/lib/xrpl/client';

// Test accounts with realistic profiles
export const TEST_ACCOUNTS: DatabaseUser[] = [
  // Borrowers
  {
    address: 'rPsaLGFwviwB3wJrjTUb5tkdnqpGv82qf4',
    name: 'Maria Santos',
    role: 'borrower',
    balance: 5000,
    did: 'did:xrpl:N1A2B3C4:1704157200000',
    pseudonymousId: 'USER-MARIA789',
    createdAt: Date.now() - 86400000 * 30,
    lastActive: Date.now() - 3600000,
    preferences: {
      notifications: true,
      autoFunding: false,
      riskTolerance: 'medium' as const,
    },
  },
  {
    address: 'rP2B3C4D5E6F7G8H9I0J1K2L3M4N5O6Q1',
    name: 'Ahmed Hassan',
    role: 'borrower',
    balance: 3200,
    did: 'did:xrpl:P2B3C4D5:1704157200000',
    pseudonymousId: 'USER-AHMED456',
    createdAt: Date.now() - 86400000 * 45,
    lastActive: Date.now() - 7200000,
    preferences: {
      notifications: true,
      autoFunding: false,
      riskTolerance: 'low' as const,
    },
  },
  {
    address: 'rQ3C4D5E6F7G8H9I0J1K2L3M4N5O6P7R2',
    name: 'Priya Sharma',
    role: 'borrower',
    balance: 2800,
    did: 'did:xrpl:Q3C4D5E6:1704157200000',
    pseudonymousId: 'USER-PRIYA123',
    createdAt: Date.now() - 86400000 * 60,
    lastActive: Date.now() - 1800000,
    preferences: {
      notifications: true,
      autoFunding: false,
      riskTolerance: 'high' as const,
    },
  },
  {
    address: 'rR4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8S3',
    name: 'Carlos Rodriguez',
    role: 'borrower',
    balance: 1500,
    did: 'did:xrpl:R4D5E6F7:1704157200000',
    pseudonymousId: 'USER-CARLOS890',
    createdAt: Date.now() - 86400000 * 15,
    lastActive: Date.now() - 900000,
    preferences: {
      notifications: false,
      autoFunding: false,
      riskTolerance: 'medium' as const,
    },
  },

  // Lenders
  {
    address: 'rS5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9T4',
    name: 'Jennifer Chen',
    role: 'lender',
    balance: 50000,
    did: 'did:xrpl:S5E6F7G8:1704157200000',
    pseudonymousId: 'LENDER-JENNY456',
    createdAt: Date.now() - 86400000 * 90,
    lastActive: Date.now() - 1800000,
    preferences: {
      notifications: true,
      autoFunding: true,
      riskTolerance: 'low' as const,
    },
  },
  {
    address: 'rPJnG9CLsyf4rqJe1pmpfRt43jFiK7jTyf',
    name: 'Jennifer Chen (Temp)',
    role: 'lender',
    balance: 50000,
    did: 'did:xrpl:TEMP1234:1704157200000',
    pseudonymousId: 'LENDER-JENNY-TEMP',
    createdAt: Date.now() - 86400000 * 1,
    lastActive: Date.now() - 300000,
    preferences: {
      notifications: true,
      autoFunding: true,
      riskTolerance: 'medium' as const,
    },
  },
  {
    address: 'rT6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0U5',
    name: 'Michael Thompson',
    role: 'lender',
    balance: 75000,
    did: 'did:xrpl:T6F7G8H9:1704157200000',
    pseudonymousId: 'LENDER-MIKE789',
    createdAt: Date.now() - 86400000 * 120,
    lastActive: Date.now() - 600000,
    preferences: {
      notifications: true,
      autoFunding: false,
      riskTolerance: 'medium' as const,
    },
  },
  {
    address: 'rU7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1V6',
    name: 'Sarah Williams',
    role: 'lender',
    balance: 100000,
    did: 'did:xrpl:U7G8H9I0:1704157200000',
    pseudonymousId: 'LENDER-SARAH123',
    createdAt: Date.now() - 86400000 * 150,
    lastActive: Date.now() - 300000,
    preferences: {
      notifications: true,
      autoFunding: true,
      riskTolerance: 'high' as const,
    },
  },
  {
    address: 'rV8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2W7',
    name: 'David Kim',
    role: 'lender',
    balance: 25000,
    did: 'did:xrpl:V8H9I0J1:1704157200000',
    pseudonymousId: 'LENDER-DAVID890',
    createdAt: Date.now() - 86400000 * 75,
    lastActive: Date.now() - 3600000,
    preferences: {
      notifications: false,
      autoFunding: false,
      riskTolerance: 'low' as const,
    },
  },
  {
    address: 'rGHXgzacLvRGLbkfDhJcpzoV2RPsFZDFuS',
    name: 'lonshrk',
    role: 'lender',
    balance: 25000,
    did: 'did:xrpl:V8H9I0J1:1704157900000',
    pseudonymousId: 'LENDER-lonshrk',
    createdAt: Date.now() - 86400000 * 75,
    lastActive: Date.now() - 3600000,
    preferences: {
      notifications: false,
      autoFunding: false,
      riskTolerance: 'low' as const,
    },
  },
];

// Reputation scores for all users
export const TEST_REPUTATION: ReputationScore[] = [
  {
    did: 'did:xrpl:N1A2B3C4:1704157200000',
    pseudonymousId: 'USER-MARIA789',
    trustScore: 92,
    totalLoans: 8,
    successfulRepayments: 8,
    defaultedLoans: 0,
    averageRepaymentTime: 25,
    verificationLevel: 'enhanced',
    lastUpdated: Date.now() - 86400000 * 5,
    categories: {
      education: 0,
      healthcare: 0,
      business: 20,
      agriculture: 80,
      emergency: 0,
    },
  },
  {
    did: 'did:xrpl:P2B3C4D5:1704157200000',
    pseudonymousId: 'USER-AHMED456',
    trustScore: 88,
    totalLoans: 5,
    successfulRepayments: 5,
    defaultedLoans: 0,
    averageRepaymentTime: 18,
    verificationLevel: 'enhanced',
    lastUpdated: Date.now() - 86400000 * 3,
    categories: {
      education: 10,
      healthcare: 30,
      business: 60,
      agriculture: 0,
      emergency: 0,
    },
  },
  {
    did: 'did:xrpl:Q3C4D5E6:1704157200000',
    pseudonymousId: 'USER-PRIYA123',
    trustScore: 76,
    totalLoans: 12,
    successfulRepayments: 10,
    defaultedLoans: 2,
    averageRepaymentTime: 28,
    verificationLevel: 'basic',
    lastUpdated: Date.now() - 86400000 * 7,
    categories: {
      education: 70,
      healthcare: 0,
      business: 20,
      agriculture: 0,
      emergency: 10,
    },
  },
  {
    did: 'did:xrpl:R4D5E6F7:1704157200000',
    pseudonymousId: 'USER-CARLOS890',
    trustScore: 68,
    totalLoans: 3,
    successfulRepayments: 2,
    defaultedLoans: 1,
    averageRepaymentTime: 35,
    verificationLevel: 'basic',
    lastUpdated: Date.now() - 86400000 * 2,
    categories: {
      education: 0,
      healthcare: 0,
      business: 100,
      agriculture: 0,
      emergency: 0,
    },
  },
];

// Test loans with various statuses
export const TEST_LOANS: DatabaseLoan[] = [
  // Available loans (PENDING)
  {
    id: 'loan-001',
    borrowerAddress: 'rPsaLGFwviwB3wJrjTUb5tkdnqpGv82qf4',
    borrowerDID: 'did:xrpl:N1A2B3C4:1704157200000',
    pseudonymousId: 'USER-MARIA789',
    amount: 2500,
    currency: 'RLUSD',
    purpose: 'Agricultural equipment for organic farming startup',
    tags: ['#agriculture', '#business', '#organic'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    interestRate: 6.8,
    repaymentPeriod: 45,
    riskScore: 92,
    viewCount: 23,
    interestedLenders: ['rS5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9T4', 'rT6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0U5'],
  },
  {
    id: 'loan-002',
    borrowerAddress: 'rP2B3C4D5E6F7G8H9I0J1K2L3M4N5O6Q1',
    borrowerDID: 'did:xrpl:P2B3C4D5:1704157200000',
    pseudonymousId: 'USER-AHMED456',
    amount: 1800,
    currency: 'RLUSD',
    purpose: 'Medical treatment for family member',
    tags: ['#healthcare', '#emergency'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    interestRate: 7.2,
    repaymentPeriod: 30,
    riskScore: 88,
    viewCount: 18,
    interestedLenders: ['rU7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1V6'],
  },
  {
    id: 'loan-003',
    borrowerAddress: 'rQ3C4D5E6F7G8H9I0J1K2L3M4N5O6P7R2',
    borrowerDID: 'did:xrpl:Q3C4D5E6:1704157200000',
    pseudonymousId: 'USER-PRIYA123',
    amount: 3200,
    currency: 'RLUSD',
    purpose: 'University tuition for computer science degree',
    tags: ['#education', '#technology'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    interestRate: 8.5,
    repaymentPeriod: 60,
    riskScore: 76,
    viewCount: 31,
    interestedLenders: ['rS5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9T4', 'rV8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2W7'],
  },
  {
    id: 'loan-004',
    borrowerAddress: 'rR4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8S3',
    borrowerDID: 'did:xrpl:R4D5E6F7:1704157200000',
    pseudonymousId: 'USER-CARLOS890',
    amount: 900,
    currency: 'RLUSD',
    purpose: 'Small restaurant equipment repair',
    tags: ['#business', '#foodService'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 0.5,
    updatedAt: Date.now() - 86400000 * 0.5,
    interestRate: 9.8,
    repaymentPeriod: 21,
    riskScore: 68,
    viewCount: 7,
    interestedLenders: [],
  },

  // Funded loans
  {
    id: 'loan-005',
    borrowerAddress: 'rPsaLGFwviwB3wJrjTUb5tkdnqpGv82qf4',
    borrowerDID: 'did:xrpl:N1A2B3C4:1704157200000',
    pseudonymousId: 'USER-MARIA789',
    amount: 1500,
    currency: 'RLUSD',
    purpose: 'Seed purchase for farming season',
    tags: ['#agriculture'],
    status: 'FUNDED' as LoanStatus,
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 10,
    fundedAt: Date.now() - 86400000 * 10,
    lenderAddress: 'rS5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9T4',
    interestRate: 6.5,
    repaymentPeriod: 30,
    riskScore: 92,
    viewCount: 45,
    interestedLenders: ['rS5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9T4'],
    txHash: 'TX12345678901234567890ABCDEF123456789012345678',
    escrowId: 'escrow-12345-67890',
  },
  {
    id: 'loan-006',
    borrowerAddress: 'rP2B3C4D5E6F7G8H9I0J1K2L3M4N5O6Q1',
    borrowerDID: 'did:xrpl:P2B3C4D5:1704157200000',
    pseudonymousId: 'USER-AHMED456',
    amount: 2200,
    currency: 'RLUSD',
    purpose: 'Photography equipment for wedding business',
    tags: ['#business', '#creative'],
    status: 'FUNDED' as LoanStatus,
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 20,
    fundedAt: Date.now() - 86400000 * 20,
    lenderAddress: 'rT6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0U5',
    interestRate: 7.8,
    repaymentPeriod: 45,
    riskScore: 88,
    viewCount: 52,
    interestedLenders: ['rT6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0U5'],
    txHash: 'TX23456789012345678901BCDEF234567890123456789',
    escrowId: 'escrow-23456-78901',
  },

  // Repaid loans
  {
    id: 'loan-007',
    borrowerAddress: 'rQ3C4D5E6F7G8H9I0J1K2L3M4N5O6P7R2',
    borrowerDID: 'did:xrpl:Q3C4D5E6:1704157200000',
    pseudonymousId: 'USER-PRIYA123',
    amount: 1200,
    currency: 'RLUSD',
    purpose: 'Online course certification',
    tags: ['#education', '#technology'],
    status: 'REPAID' as LoanStatus,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 30,
    fundedAt: Date.now() - 86400000 * 55,
    repaidAt: Date.now() - 86400000 * 30,
    lenderAddress: 'rU7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1V6',
    interestRate: 8.0,
    repaymentPeriod: 30,
    riskScore: 76,
    viewCount: 28,
    interestedLenders: ['rU7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1V6'],
    txHash: 'TX34567890123456789012CDEF345678901234567890',
    repaymentTxHash: 'REPAY567890123456789ABCDEF567890123456789012',
    escrowId: 'escrow-34567-89012',
  },
  {
    id: 'loan-008',
    borrowerAddress: 'rPsaLGFwviwB3wJrjTUb5tkdnqpGv82qf4',
    borrowerDID: 'did:xrpl:N1A2B3C4:1704157200000',
    pseudonymousId: 'USER-MARIA789',
    amount: 800,
    currency: 'RLUSD',
    purpose: 'Fertilizer for crop production',
    tags: ['#agriculture'],
    status: 'REPAID' as LoanStatus,
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 60,
    fundedAt: Date.now() - 86400000 * 85,
    repaidAt: Date.now() - 86400000 * 60,
    lenderAddress: 'rV8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2W7',
    interestRate: 6.2,
    repaymentPeriod: 25,
    riskScore: 92,
    viewCount: 15,
    interestedLenders: ['rV8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2W7'],
    txHash: 'TX45678901234567890123DEF456789012345678901',
    repaymentTxHash: 'REPAY678901234567890BCDEF678901234567890123',
    escrowId: 'escrow-45678-90123',
  },
];

// Seed function to populate database
export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Seeding database with test data...');
    
    // Initialize database
    await database.init();
    
    // Clear existing data
    await database.clearAllData();
    
    // Seed users
    console.log('👥 Creating test accounts...');
    for (const user of TEST_ACCOUNTS) {
      await database.createUser(user);
    }
    
    // Seed reputation scores
    console.log('⭐ Setting up reputation scores...');
    for (const reputation of TEST_REPUTATION) {
      await database.updateReputation(reputation);
    }
    
    // Seed loans
    console.log('💰 Creating test loans...');
    for (const loan of TEST_LOANS) {
      await database.createLoan(loan);
    }
    
    // Create test transactions
    console.log('📊 Creating transaction history...');
    const testTransactions: Transaction[] = [
      {
        id: 'tx-001',
        type: 'loan_funded',
        fromAddress: 'rS5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9T4',
        toAddress: 'rPsaLGFwviwB3wJrjTUb5tkdnqpGv82qf4',
        amount: 1500,
        currency: 'RLUSD',
        txHash: 'TX12345678901234567890ABCDEF123456789012345678',
        loanId: 'loan-005',
        escrowId: 'escrow-12345-67890',
        timestamp: Date.now() - 86400000 * 10,
        status: 'confirmed',
      },
      {
        id: 'tx-002',
        type: 'loan_funded',
        fromAddress: 'rT6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0U5',
        toAddress: 'rP2B3C4D5E6F7G8H9I0J1K2L3M4N5O6Q1',
        amount: 2200,
        currency: 'RLUSD',
        txHash: 'TX23456789012345678901BCDEF234567890123456789',
        loanId: 'loan-006',
        escrowId: 'escrow-23456-78901',
        timestamp: Date.now() - 86400000 * 20,
        status: 'confirmed',
      },
      {
        id: 'tx-003',
        type: 'repayment',
        fromAddress: 'rQ3C4D5E6F7G8H9I0J1K2L3M4N5O6P7R2',
        toAddress: 'rU7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1V6',
        amount: 1296, // 1200 + 8% interest
        currency: 'RLUSD',
        txHash: 'REPAY567890123456789ABCDEF567890123456789012',
        loanId: 'loan-007',
        timestamp: Date.now() - 86400000 * 30,
        status: 'confirmed',
      },
      {
        id: 'tx-004',
        type: 'repayment',
        fromAddress: 'rPsaLGFwviwB3wJrjTUb5tkdnqpGv82qf4',
        toAddress: 'rV8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2W7',
        amount: 849.6, // 800 + 6.2% interest
        currency: 'RLUSD',
        txHash: 'REPAY678901234567890BCDEF678901234567890123',
        loanId: 'loan-008',
        timestamp: Date.now() - 86400000 * 60,
        status: 'confirmed',
      },
    ];
    
    for (const transaction of testTransactions) {
      await database.createTransaction(transaction);
    }
    
    // Create test escrows
    console.log('🔒 Setting up escrow data...');
    const testEscrows: EscrowData[] = [
      {
        id: 'escrow-12345-67890',
        loanId: 'loan-005',
        lenderAddress: 'rS5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9T4',
        borrowerAddress: 'rPsaLGFwviwB3wJrjTUb5tkdnqpGv82qf4',
        amount: 1500,
        currency: 'RLUSD',
        createdAt: Date.now() - 86400000 * 10,
        releaseConditions: {
          type: 'time_based',
          releaseTime: Date.now() + 86400000 * 20, // 20 days from now
        },
        status: 'funded',
        txHash: 'TX12345678901234567890ABCDEF123456789012345678',
      },
      {
        id: 'escrow-23456-78901',
        loanId: 'loan-006',
        lenderAddress: 'rT6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0U5',
        borrowerAddress: 'rP2B3C4D5E6F7G8H9I0J1K2L3M4N5O6Q1',
        amount: 2200,
        currency: 'RLUSD',
        createdAt: Date.now() - 86400000 * 20,
        releaseConditions: {
          type: 'time_based',
          releaseTime: Date.now() + 86400000 * 25, // 25 days from now
        },
        status: 'funded',
        txHash: 'TX23456789012345678901BCDEF234567890123456789',
      },
    ];
    
    for (const escrow of testEscrows) {
      await database.createEscrow(escrow);
    }
    
    console.log('✅ Database seeded successfully!');
    console.log(`Created ${TEST_ACCOUNTS.length} test accounts`);
    console.log(`Created ${TEST_LOANS.length} test loans`);
    console.log(`Created ${testTransactions.length} test transactions`);
    console.log(`Created ${testEscrows.length} test escrows`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Function to get random test user for quick switching
export function getRandomTestUser(excludeAddress?: string): DatabaseUser {
  const availableUsers = TEST_ACCOUNTS.filter(user => user.address !== excludeAddress);
  return availableUsers[Math.floor(Math.random() * availableUsers.length)];
}

// Function to get users by role
export function getTestUsersByRole(role: 'borrower' | 'lender'): DatabaseUser[] {
  return TEST_ACCOUNTS.filter(user => user.role === role);
} 