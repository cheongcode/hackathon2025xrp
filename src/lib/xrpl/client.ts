import { Client, Wallet, dropsToXrp, xrpToDrops } from 'xrpl';

// XRPL Testnet client
let client: Client | null = null;

export const getXRPLClient = async (): Promise<Client> => {
  if (!client || !client.isConnected()) {
    client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    console.log('Connected to XRPL Testnet');
  }
  return client;
};

export const disconnectClient = async (): Promise<void> => {
  if (client && client.isConnected()) {
    await client.disconnect();
    console.log('Disconnected from XRPL Testnet');
  }
};

// RLUSD Token Information (Testnet)
export const RLUSD_CURRENCY = {
  currency: 'USD',
  issuer: 'rMxCKbgQg5F7jNCar7oUKhFcSPvRw6w7wF', // RLUSD issuer on testnet
};

// Mock DID structure for demonstration
export interface MockDID {
  id: string;
  publicKey: string;
  created: number;
  controller: string;
}

// Reputation Score Interface
export interface ReputationScore {
  did: string;
  totalLoans: number;
  successfulRepayments: number;
  defaultedLoans: number;
  averageRepaymentTime: number; // in days
  trustScore: number; // 0-100
  lastUpdated: number;
}

// Generate mock DID for demo purposes
export const generateMockDID = (walletAddress: string): MockDID => {
  const timestamp = Date.now();
  return {
    id: `did:xrpl:${walletAddress.slice(2, 10)}:${timestamp}`,
    publicKey: `key-${Math.random().toString(36).substr(2, 16)}`,
    created: timestamp,
    controller: walletAddress,
  };
};

// Calculate reputation score
export const calculateReputationScore = (
  totalLoans: number,
  successfulRepayments: number,
  defaultedLoans: number,
  averageRepaymentTime: number
): number => {
  if (totalLoans === 0) return 50; // Neutral score for new borrowers
  
  const successRate = (successfulRepayments / totalLoans) * 100;
  const timelinessBonus = Math.max(0, 30 - averageRepaymentTime) * 2; // Bonus for faster repayment
  const penaltyForDefaults = defaultedLoans * 10;
  
  const score = Math.min(100, Math.max(0, successRate + timelinessBonus - penaltyForDefaults));
  return Math.round(score);
};

// Mock user wallets for demonstration
export const DEMO_WALLETS = {
  borrower1: {
    address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    secret: 'sEdTM1uX8pu2do5XvTnutH6HsouMaM2', // Test wallet - DO NOT use in production
    role: 'borrower',
  },
  borrower2: {
    address: 'rUn84CJowRBX4T9w7qjpDC8BreMnqZNYhh',
    secret: 'sEdSKaCy2JT7JaM7v95H9SxkhP9wS2r', // Test wallet - DO NOT use in production
    role: 'borrower',
  },
  lender1: {
    address: 'rDdECVmwpkRo8FtY3ywCYhHX8VfuSAqghj',
    secret: 'sEd7rBGm5kxzauSTuuQNrvpF8ZyMbL2', // Test wallet - DO NOT use in production
    role: 'lender',
  },
  lender2: {
    address: 'rPp4qpHWGYBV8wC5KvCf5G8aGBkR5kZ4Ts',
    secret: 'sEdVFhpXCkemvPs6aH5caSx83BjnvR7', // Test wallet - DO NOT use in production
    role: 'lender',
  },
};

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  if (currency === 'XRP') {
    return `${amount.toLocaleString()} XRP`;
  }
  return `${amount.toLocaleString()} ${currency}`;
};

export const generatePseudonymousId = (did: string): string => {
  // Generate a pseudonymous ID based on DID for privacy
  const hash = did.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `User-${Math.abs(hash).toString(36).slice(0, 8).toUpperCase()}`;
};

export { dropsToXrp, xrpToDrops }; 