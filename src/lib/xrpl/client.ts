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
    
    const balanceString = accountInfo.result.account_data.Balance?.toString() || '0';
    const xrpBalance = parseFloat(dropsToXrp(balanceString));
    
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

// Consolidated pseudonymous ID generation (removing duplicate)
export const generatePseudonymousId = (did: string): string => {
  const hash = did.split(':').join('').toUpperCase();
  return `USER-${hash.slice(0, 8)}`;
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

// Enhanced testnet functionality for real transactions
export const createTestnetFundedWallet = async (): Promise<{ wallet: Wallet; funded: boolean; balance?: number }> => {
  try {
    const client = await getXRPLClient();
    const newWallet = Wallet.generate(); // Generate a truly random wallet
    
    console.log('🔑 Generated new testnet wallet:', newWallet.address);
    
    // Try to fund the wallet using testnet faucet
    try {
      const fundResult = await client.fundWallet(newWallet);
      console.log('💰 Successfully funded wallet with:', fundResult.balance, 'XRP');
      
      // Get the actual balance after funding
      const balance = await getAccountBalance(newWallet.address);
      
      return { 
        wallet: newWallet, 
        funded: true, 
        balance: balance.xrp 
      };
    } catch (fundError) {
      console.warn('⚠️ Auto-funding failed, wallet created but not funded:', fundError);
      return { wallet: newWallet, funded: false };
    }
  } catch (error) {
    console.error('❌ Failed to create testnet wallet:', error);
    throw error;
  }
};

// Real XRP transaction with proper validation
export const sendRealXRPPayment = async (
  fromSeed: string,
  toAddress: string,
  amountXRP: string,
  memo?: string
): Promise<{ success: boolean; txHash?: string; error?: string; ledgerIndex?: number }> => {
  try {
    const client = await getXRPLClient();
    const senderWallet = Wallet.fromSeed(fromSeed);
    
    console.log(`💸 Sending ${amountXRP} XRP from ${senderWallet.address} to ${toAddress}`);
    
    // Verify sender has sufficient balance
    const senderBalance = await getAccountBalance(senderWallet.address);
    const amountToSend = parseFloat(amountXRP);
    
    if (senderBalance.xrp < amountToSend + 0.00001) { // Include fee buffer
      throw new Error(`Insufficient balance. Have: ${senderBalance.xrp} XRP, Need: ${amountToSend} XRP`);
    }
    
    // Prepare payment transaction
    const payment: Payment = {
      TransactionType: 'Payment',
      Account: senderWallet.address,
      Destination: toAddress,
      Amount: xrpToDrops(amountXRP),
    };
    
    // Add memo if provided
    if (memo) {
      payment.Memos = [{
        Memo: {
          MemoData: Buffer.from(memo, 'utf8').toString('hex').toUpperCase(),
          MemoType: Buffer.from('microloanx-payment', 'utf8').toString('hex').toUpperCase(),
        }
      }];
    }
    
    // Auto-fill transaction details
    const prepared = await client.autofill(payment);
    console.log('📝 Prepared transaction:', {
      fee: dropsToXrp(prepared.Fee),
      sequence: prepared.Sequence,
      lastLedgerSequence: prepared.LastLedgerSequence
    });
    
    // Sign the transaction
    const signed = senderWallet.sign(prepared);
    console.log('✍️ Transaction signed:', signed.hash);
    
    // Submit and wait for validation
    const result = await client.submitAndWait(signed.tx_blob);
    
    if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta && result.result.meta.TransactionResult === 'tesSUCCESS') {
      console.log('✅ Payment successful!', {
        hash: result.result.hash,
        ledgerIndex: result.result.ledger_index,
        fee: dropsToXrp(result.result.tx_json?.Fee?.toString() || '0')
      });
      
      return {
        success: true,
        txHash: result.result.hash,
        ledgerIndex: result.result.ledger_index
      };
    } else {
      const errorCode = (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) 
        ? result.result.meta.TransactionResult 
        : 'UNKNOWN_ERROR';
      console.error('❌ Payment failed:', errorCode);
      return {
        success: false,
        error: `Transaction failed with code: ${errorCode}`
      };
    }
    
  } catch (error) {
    console.error('❌ Error sending XRP payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Get transaction details from XRPL
export const getTransactionDetails = async (txHash: string) => {
  try {
    const client = await getXRPLClient();
    
    const response = await client.request({
      command: 'tx',
      transaction: txHash
    });
    
    const tx = response.result;
    const hash = tx.hash || txHash; // Use provided hash if tx.hash is undefined
    
    return {
      success: true,
      hash,
      ledgerIndex: tx.ledger_index,
      date: (tx as any).date,
      transactionType: (tx as any).TransactionType,
      account: (tx as any).Account,
      destination: (tx as any).Destination,
      amount: (tx as any).Amount,
      fee: (tx as any).Fee,
      result: (tx.meta as any)?.TransactionResult,
      validated: tx.validated,
      explorerUrl: getTestnetExplorerUrl(hash)
    };
  } catch (error) {
    console.error('❌ Error getting transaction details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction not found'
    };
  }
};

// Account transaction history
export const getAccountTransactionHistory = async (address: string, limit: number = 20) => {
  try {
    const client = await getXRPLClient();
    
    const response = await client.request({
      command: 'account_tx',
      account: address,
      limit,
      ledger_index_min: -1,
      ledger_index_max: -1
    }) as any; // Using any to handle the response type
    
    return {
      success: true,
      transactions: (response.result.transactions || []).map((tx: any) => ({
        hash: tx.hash,
        ledgerIndex: tx.ledger_index,
        date: tx.date,
        transactionType: tx.TransactionType || tx.tx?.TransactionType,
        account: tx.Account || tx.tx?.Account,
        destination: tx.Destination || tx.tx?.Destination,
        amount: tx.Amount || tx.tx?.Amount,
        fee: tx.Fee || tx.tx?.Fee,
        result: tx.meta?.TransactionResult,
        validated: tx.validated,
        explorerUrl: getTestnetExplorerUrl(tx.hash || '')
      }))
    };
  } catch (error) {
    console.error('❌ Error getting transaction history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get transaction history',
      transactions: []
    };
  }
};

// Helper functions that were in enhanced-client
export const generateDIDFromAddress = (address: string): string => {
  return `did:xrpl:${address.slice(0, 8)}:${Date.now()}`;
};

export const generatePseudonymousIdFromDID = (did: string): string => {
  const hash = did.split(':').join('').toUpperCase();
  return `USER-${hash.slice(0, 8)}`;
};

export const formatXRPAddress = (address: string): string => {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

// Testnet wallet seeds for demo (DO NOT use in production)
export const DEMO_TESTNET_WALLETS = {
  borrower1: {
    seed: 'sEdTM1uX8pu2do5XvTnutH6HsouMaM2',
    address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    name: 'Maria Santos (Testnet)',
  },
  borrower2: {
    seed: 'sEdSKaCy2JT7JaM7v95H9SxkhP9wS2r', 
    address: 'rUn84CJowRBX4T9w7qjpDC8BreMnqZNYhh',
    name: 'Ahmed Hassan (Testnet)',
  },
  lender1: {
    seed: 'sEd7rBGm5kxzauSTuuQNrvpF8ZyMbL2',
    address: 'rDdECVmwpkRo8FtY3ywCYhHX8VfuSAqghj', 
    name: 'Jennifer Chen (Testnet)',
  },
  lender2: {
    seed: 'sEdVFhpXCkemvPs6aH5caSx83BjnvR7',
    address: 'rPp4qpHWGYBV8wC5KvCf5G8aGBkR5kZ4Ts',
    name: 'Sarah Williams (Testnet)',
  },
}; 