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
    const xrpBalance = Number(dropsToXrp(balanceString));
    
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

// Simplified XRP payment function based on XRPL tutorial approach
export const sendRealXRPPayment = async (
  fromSeed: string,
  toAddress: string,
  amountXRP: string,
  memo?: string
): Promise<{ success: boolean; txHash?: string; error?: string; ledgerIndex?: number }> => {
  let client: Client | null = null;
  
  try {
    console.log('🚀 Starting XRP payment...', { 
      from: fromSeed.slice(0, 10) + '...', 
      to: toAddress, 
      amount: amountXRP 
    });
    
    // Input validation
    if (!fromSeed || !toAddress || !amountXRP) {
      return {
        success: false,
        error: 'Missing required parameters: fromSeed, toAddress, or amountXRP'
      };
    }

    // Validate amount
    const amount = parseFloat(amountXRP);
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: 'Invalid amount: must be a positive number'
      };
    }

    // Create a fresh client connection for this transaction
    client = new Client('wss://s.altnet.rippletest.net:51233');
    console.log('🔄 Connecting to XRPL Testnet...');
    await client.connect();
    console.log('✅ Connected to XRPL Testnet');

    // Create wallet from seed
    let senderWallet: Wallet;
    try {
      senderWallet = Wallet.fromSeed(fromSeed);
      console.log(`📍 Sender wallet address: ${senderWallet.address}`);
    } catch (error) {
      return {
        success: false,
        error: 'Invalid sender wallet seed'
      };
    }
    
    // Validate destination address
    const cleanDestination = toAddress.trim();
    if (!/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(cleanDestination)) {
      return {
        success: false,
        error: `Invalid destination address format: ${cleanDestination}`
      };
    }

    // Check balance using the tutorial's approach
    console.log('💰 Checking sender balance...');
    const senderBalance = await client.getXrpBalance(senderWallet.address);
    console.log(`💰 Sender balance: ${senderBalance} XRP`);
    
    if (parseFloat(senderBalance) < amount + 0.00001) {
      return {
        success: false,
        error: `Insufficient balance. Have: ${senderBalance} XRP, Need: ${amount} XRP (plus network fee)`
      };
    }

    // Create payment transaction using tutorial's approach
    const payment: Payment = {
      TransactionType: 'Payment',
      Account: senderWallet.address,
      Destination: cleanDestination,
      // @ts-ignore - Bypassing TypeScript error for xrpToDrops parameter
      Amount: xrpToDrops(amountXRP), // Convert XRP to drops
    };

    // Add memo if provided
    if (memo && memo.trim()) {
      payment.Memos = [{
        Memo: {
          MemoData: Buffer.from(memo.trim(), 'utf8').toString('hex').toUpperCase(),
          MemoType: Buffer.from('MicroLoanX', 'utf8').toString('hex').toUpperCase(),
        }
      }];
    }

    console.log('📝 Payment transaction:', {
      TransactionType: payment.TransactionType,
      Account: payment.Account,
      Destination: payment.Destination,
      Amount: payment.Amount
    });

    // Prepare transaction (auto-fill sequence, fee, etc.)
    console.log('⚙️ Preparing transaction...');
    const prepared = await client.autofill(payment);
    console.log('📋 Prepared transaction details:', {
      Account: prepared.Account,
      Destination: prepared.Destination,
      Amount: prepared.Amount,
      Fee: prepared.Fee,
      Sequence: prepared.Sequence
    });

    // Sign the transaction
    console.log('✍️ Signing transaction...');
    const signed = senderWallet.sign(prepared);
    const txHash = signed.hash;
    console.log(`✅ Transaction signed. Hash: ${txHash}`);

    // Submit transaction and wait for validation
    console.log('📤 Submitting transaction to XRPL...');
    const submitResult = await client.submitAndWait(signed.tx_blob);
    
    console.log('📥 Submit result:', {
      hash: submitResult.result.hash,
      ledgerIndex: submitResult.result.ledger_index,
      validated: submitResult.result.validated,
      resultCode: submitResult.result.meta && typeof submitResult.result.meta === 'object' && 'TransactionResult' in submitResult.result.meta 
        ? submitResult.result.meta.TransactionResult 
        : 'unknown'
    });

    // Check transaction result
    const isSuccessful = submitResult.result.meta && 
                        typeof submitResult.result.meta === 'object' && 
                        'TransactionResult' in submitResult.result.meta && 
                        submitResult.result.meta.TransactionResult === 'tesSUCCESS';

    if (isSuccessful) {
      // Use the hash from the result if available, otherwise use signed hash
      const finalHash = submitResult.result.hash || txHash;
      
      console.log('✅ Payment successful!', {
        hash: finalHash,
        ledgerIndex: submitResult.result.ledger_index
      });

      return {
        success: true,
        txHash: finalHash,
        ledgerIndex: submitResult.result.ledger_index
      };
    } else {
      const errorCode = submitResult.result.meta && 
                       typeof submitResult.result.meta === 'object' && 
                       'TransactionResult' in submitResult.result.meta 
                       ? submitResult.result.meta.TransactionResult 
                       : 'UNKNOWN_ERROR';
                       
      console.error('❌ Payment failed with code:', errorCode);
      return {
        success: false,
        error: `Transaction failed with code: ${errorCode}`
      };
    }

  } catch (error) {
    console.error('❌ Error in XRP payment:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific XRPL errors
      if (errorMessage.includes('invalid field Destination')) {
        errorMessage = 'Invalid destination address';
      } else if (errorMessage.includes('insufficient balance') || errorMessage.includes('unfunded')) {
        errorMessage = 'Insufficient XRP balance';
      } else if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
        errorMessage = 'Network connection error. Please try again.';
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  } finally {
    // Always disconnect the client
    if (client && client.isConnected()) {
      try {
        await client.disconnect();
        console.log('🔌 Disconnected from XRPL');
      } catch (disconnectError) {
        console.warn('⚠️ Error disconnecting:', disconnectError);
      }
    }
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
    address: 'rS5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9T4', // Match database Jennifer Chen address
    name: 'Jennifer Chen (Testnet)',
  },
  lender1_temp: {
    seed: 'TEMP_SEED_NEEDED', // You'll need to provide the seed for this address
    address: 'rPJnG9CLsyf4rqJe1pmpfRt43jFiK7jTyf',
    name: 'Jennifer Chen (Temp Testnet)',
  },
  lender2: {
    seed: 'sEdVFhpXCkemvPs6aH5caSx83BjnvR7',
    address: 'rU7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1V6', // Match database Sarah Williams address
    name: 'Sarah Williams (Testnet)',
  },
  loanshark: {
    seed: 'sEdTJq5yCVqWDqogNHmTEdvn7ePTACd',
    address: 'rGHXgzacLvRGLbkfDhJcpzoV2RPsFZDFuS',
    name: 'loanshark (Testnet)',
  },
};

// Debug function for testing XRP transactions
export const debugXRPTransaction = async () => {
  try {
    console.log('🔍 Starting XRP transaction debug...');
    
    // Test connection first
    const connectionTest = await testXRPLConnection();
    console.log('🌐 Connection test result:', connectionTest);
    
    if (!connectionTest.success) {
      console.error('❌ Connection failed, aborting debug');
      return;
    }
    
    // Test with a demo wallet
    const testWallet = DEMO_TESTNET_WALLETS.lender1;
    console.log('👤 Using test wallet:', testWallet.name, testWallet.address);
    
    // Check balance first
    const balance = await getAccountBalance(testWallet.address);
    console.log('💰 Wallet balance:', balance);
    
    if (balance.xrp < 1.1) {
      console.warn('⚠️ Insufficient balance for test transaction');
      return;
    }
    
    // Test transaction to Maria Santos
    const mariaSantosAddress = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
    console.log('📤 Testing transaction to Maria Santos:', mariaSantosAddress);
    
    const result = await sendRealXRPPayment(
      testWallet.seed,
      mariaSantosAddress,
      '0.1', // Small test amount
      'MicroLoanX Debug Test Transaction'
    );
    
    console.log('✅ Transaction result:', result);
    
    if (result.success && result.txHash) {
      const explorerUrl = getTestnetExplorerUrl(result.txHash);
      console.log('🔗 Explorer URL:', explorerUrl);
      
      // Test getting transaction details
      setTimeout(async () => {
        console.log('🔍 Fetching transaction details...');
        const details = await getTransactionDetails(result.txHash!);
        console.log('📋 Transaction details:', details);
      }, 5000);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Debug function error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).debugXRPTransaction = debugXRPTransaction;
}

// Browser console test function for debugging XRP transactions
export const testXRPPaymentInConsole = async () => {
  try {
    console.log('🧪 Starting XRP payment test...');
    
    // Use Jennifer Chen's testnet wallet (lender1)
    const testSeed = 'sEd7rBGm5kxzauSTuuQNrvpF8ZyMbL2';
    const mariaSantosAddress = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
    
    console.log('📋 Test parameters:');
    console.log('From: Jennifer Chen (lender1)');
    console.log('To: Maria Santos');
    console.log('Amount: 0.5 XRP');
    
    const result = await sendRealXRPPayment(
      testSeed,
      mariaSantosAddress,
      '0.5',
      'MicroLoanX Console Test Transaction'
    );
    
    console.log('🎯 Test result:', result);
    
    if (result.success && result.txHash) {
      const explorerUrl = `https://testnet.xrpl.org/transactions/${result.txHash}`;
      console.log('🌐 View transaction:', explorerUrl);
      
      // Try to open the explorer (if allowed by browser)
      try {
        window.open(explorerUrl, '_blank');
      } catch (e) {
        console.log('ℹ️ Could not auto-open explorer. Click the link above.');
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Test failed' };
  }
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testXRPPayment = testXRPPaymentInConsole;
  console.log('🔧 Debug function available: testXRPPayment()');
} 