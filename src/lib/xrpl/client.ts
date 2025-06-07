import { Client, Wallet, dropsToXrp, xrpToDrops, Payment, TxResponse } from 'xrpl';

// XRPL Testnet client
let client: Client | null = null;
let isConnecting = false;

export const getXRPLClient = async (): Promise<Client> => {
  if (client && client.isConnected()) {
    return client;
  }

  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (client && client.isConnected()) {
      return client;
    }
  }

  try {
    isConnecting = true;
    console.log('🔄 Connecting to XRPL Testnet...');
    
    client = new Client('wss://s.altnet.rippletest.net:51233', {
      connectionTimeout: 10000,
      maxFeeXRP: '2',
    });
    
    await client.connect();
    console.log('✅ Connected to XRPL Testnet');
    
    // Test the connection
    const serverInfo = await client.request({
      command: 'server_info'
    });
    
    console.log('📊 XRPL Server Info:', {
      network: serverInfo.result.info.network_ledger,
      ledger_index: serverInfo.result.info.validated_ledger?.seq || 'unknown',
      server_version: serverInfo.result.info.build_version
    });
    
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to XRPL Testnet:', error);
    client = null;
    throw new Error('Failed to connect to XRPL Testnet. Please check your internet connection.');
  } finally {
    isConnecting = false;
  }
};

export const disconnectClient = async (): Promise<void> => {
  if (client && client.isConnected()) {
    try {
      await client.disconnect();
      console.log('✅ Disconnected from XRPL Testnet');
    } catch (error) {
      console.error('❌ Error disconnecting from XRPL:', error);
    }
    client = null;
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

// Enhanced demo wallets with proper testnet addresses
export const DEMO_WALLETS = {
  borrower1: {
    address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    secret: 'sEdTM1uX8pu2do5XvTnutH6HsouMaM2', // Test wallet - DO NOT use in production
    role: 'borrower',
    name: 'Maya Patel',
  },
  borrower2: {
    address: 'rUn84CJowRBX4T9w7qjpDC8BreMnqZNYhh',
    secret: 'sEdSKaCy2JT7JaM7v95H9SxkhP9wS2r', // Test wallet - DO NOT use in production
    role: 'borrower',
    name: 'Ahmed Hassan',
  },
  lender1: {
    address: 'rDdECVmwpkRo8FtY3ywCYhHX8VfuSAqghj',
    secret: 'sEd7rBGm5kxzauSTuuQNrvpF8ZyMbL2', // Test wallet - DO NOT use in production
    role: 'lender',
    name: 'Sarah Chen',
  },
  lender2: {
    address: 'rPp4qpHWGYBV8wC5KvCf5G8aGBkR5kZ4Ts',
    secret: 'sEdVFhpXCkemvPs6aH5caSx83BjnvR7', // Test wallet - DO NOT use in production
    role: 'lender',
    name: 'Michael Torres',
  },
};

// Wallet management functions
export const createTestWallet = async (): Promise<{ wallet: Wallet; funded: boolean }> => {
  try {
    const client = await getXRPLClient();
    const wallet = Wallet.generate();
    
    console.log('🔑 Generated new test wallet:', wallet.address);
    
    // Fund the wallet on testnet
    try {
      const fundResponse = await client.fundWallet(wallet);
      console.log('💰 Funded wallet with testnet XRP:', fundResponse.balance);
      return { wallet, funded: true };
    } catch (fundError) {
      console.warn('⚠️ Could not auto-fund wallet, manual funding required');
      return { wallet, funded: false };
    }
  } catch (error) {
    console.error('❌ Failed to create test wallet:', error);
    throw error;
  }
};

export const getAccountBalance = async (address: string): Promise<{ xrp: number; rlusd: number }> => {
  try {
    const client = await getXRPLClient();
    
    const accountInfo = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });
    
    const xrpBalance = parseFloat(dropsToXrp(accountInfo.result.account_data.Balance.toString()));
    
    // Get RLUSD balance from trust lines
    const accountLines = await client.request({
      command: 'account_lines',
      account: address,
      ledger_index: 'validated'
    });
    
    const rlusdLine = accountLines.result.lines.find(
      line => line.currency === 'USD' && line.account === RLUSD_CURRENCY.issuer
    );
    
    const rlusdBalance = rlusdLine ? parseFloat(rlusdLine.balance) : 0;
    
    return { xrp: xrpBalance, rlusd: rlusdBalance };
  } catch (error) {
    console.error('❌ Failed to get account balance:', error);
    return { xrp: 0, rlusd: 0 };
  }
};

export const sendXRPPayment = async (
  fromWallet: Wallet,
  toAddress: string,
  amount: string,
  memo?: string
): Promise<TxResponse> => {
  try {
    const client = await getXRPLClient();
    
    const payment: Payment = {
      TransactionType: 'Payment',
      Account: fromWallet.address,
      Destination: toAddress,
      Amount: xrpToDrops(amount),
    };
    
    if (memo) {
      payment.Memos = [{
        Memo: {
          MemoData: Buffer.from(memo, 'utf8').toString('hex').toUpperCase(),
          MemoType: Buffer.from('microloanx', 'utf8').toString('hex').toUpperCase(),
        }
      }];
    }
    
    const prepared = await client.autofill(payment);
    const signed = fromWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    console.log('✅ XRP Payment successful:', result.result.hash);
    return result;
  } catch (error) {
    console.error('❌ XRP Payment failed:', error);
    throw error;
  }
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

export const getTestnetExplorerUrl = (txHash: string): string => {
  return `https://testnet.xrpl.org/transactions/${txHash}`;
};

export const isValidXRPAddress = (address: string): boolean => {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address);
};

// Test XRPL connection
export const testXRPLConnection = async (): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    console.log('🧪 Testing XRPL connection...');
    const client = await getXRPLClient();
    
    // Test basic server info request
    const serverInfo = await client.request({
      command: 'server_info'
    });
    
    // Test ledger info request
    const ledgerInfo = await client.request({
      command: 'ledger',
      ledger_index: 'validated'
    });
    
    const result = {
      success: true,
      message: 'XRPL connection successful',
      data: {
        network: serverInfo.result.info.network_ledger,
        ledger_index: ledgerInfo.result.ledger.ledger_index,
        server_version: serverInfo.result.info.build_version,
        connection_time: new Date().toISOString()
      }
    };
    
    console.log('✅ XRPL connection test passed:', result.data);
    return result;
    
  } catch (error) {
    console.error('❌ XRPL connection test failed:', error);
    return {
      success: false,
      message: `XRPL connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export { dropsToXrp, xrpToDrops }; 