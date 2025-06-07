import { Client, Wallet, xrpToDrops, dropsToXrp, Payment, TxResponse, AccountInfoRequest, AccountInfoResponse, LedgerRequest, LedgerResponse, convertStringToHex, convertHexToString, TrustSet } from 'xrpl';
import { database, Transaction as DBTransaction, EscrowData } from '@/lib/database/db';
import { LoanRequest, ReputationScore } from '@/types';

// XRPL Configuration
export const XRPL_CONFIG = {
  // Use Testnet for development
  TESTNET_URL: 'wss://s.altnet.rippletest.net:51233',
  // MAINNET_URL: 'wss://xrplcluster.com', // For production
  
  // RLUSD Configuration (for testnet)
  RLUSD_CURRENCY: 'RLUSD',
  RLUSD_ISSUER: 'rMxCkbT7MWcnBo4kNQWFdaSWpaDUK6Ffa',  // Example issuer
  
  // Network settings
  NETWORK_ID: 'testnet',
  FEE_DROPS: '12', // Standard fee in drops
};

// Wallet Management
export interface ManagedWallet {
  address: string;
  seed: string;
  wallet: Wallet;
  balance: {
    xrp: number;
    rlusd: number;
  };
  trustLines: Array<{
    currency: string;
    issuer: string;
    limit: string;
    balance: string;
  }>;
}

export interface XRPLTransaction {
  id: string;
  type: 'payment' | 'escrow_create' | 'escrow_finish' | 'escrow_cancel' | 'trust_set';
  hash?: string;
  result?: string;
  timestamp: number;
  fromAddress: string;
  toAddress?: string;
  amount: {
    value: string;
    currency: string;
    issuer?: string;
  };
  metadata?: Record<string, any>;
  validated?: boolean;
}

class EnhancedXRPLClient {
  private client: Client;
  private isConnected: boolean = false;
  private wallets: Map<string, ManagedWallet> = new Map();
  private connectionRetries: number = 0;
  private maxRetries: number = 3;

  constructor() {
    this.client = new Client(XRPL_CONFIG.TESTNET_URL, {
      connectionTimeout: 10000,
      maxFeeXRP: '2', // Maximum fee for any transaction
    });
    
    // Set up connection event handlers
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connected', () => {
      console.log('✅ Connected to XRPL Testnet');
      this.isConnected = true;
      this.connectionRetries = 0;
    });

    this.client.on('disconnected', (code: number) => {
      console.log(`❌ Disconnected from XRPL (code: ${code})`);
      this.isConnected = false;
      
      // Auto-reconnect logic
      if (this.connectionRetries < this.maxRetries) {
        setTimeout(() => {
          this.connectionRetries++;
          console.log(`🔄 Reconnecting to XRPL (attempt ${this.connectionRetries}/${this.maxRetries})`);
          this.connect();
        }, 2000 * this.connectionRetries);
      }
    });

    this.client.on('error', (error: any) => {
      console.error('❌ XRPL Client Error:', error);
    });
  }

  async connect(): Promise<boolean> {
    try {
      if (this.isConnected) return true;
      
      console.log('🔄 Connecting to XRPL Testnet...');
      await this.client.connect();
      return this.isConnected;
    } catch (error) {
      console.error('❌ Failed to connect to XRPL:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
        this.isConnected = false;
      }
    } catch (error) {
      console.error('❌ Error disconnecting from XRPL:', error);
    }
  }

  // Wallet Management
  async createWallet(): Promise<ManagedWallet> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      // Generate new wallet
      const wallet = Wallet.generate();
      
      // For testnet, we can fund the wallet automatically
      await this.fundTestnetWallet(wallet.address);
      
      // Get initial balance and trust lines
      const accountInfo = await this.getAccountInfo(wallet.address);
      const trustLines = await this.getTrustLines(wallet.address);
      
      const managedWallet: ManagedWallet = {
        address: wallet.address,
        seed: wallet.seed!,
        wallet,
        balance: {
          xrp: parseFloat(dropsToXrp(accountInfo.result.account_data.Balance.toString())),
          rlusd: 0, // Will be updated after trust line setup
        },
        trustLines,
      };

      this.wallets.set(wallet.address, managedWallet);
      
      console.log(`✅ Created wallet: ${wallet.address}`);
      return managedWallet;
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  async importWallet(seed: string): Promise<ManagedWallet> {
    try {
      const wallet = Wallet.fromSeed(seed);
      
      // Get account info and trust lines
      const accountInfo = await this.getAccountInfo(wallet.address);
      const trustLines = await this.getTrustLines(wallet.address);
      
      const managedWallet: ManagedWallet = {
        address: wallet.address,
        seed,
        wallet,
        balance: {
          xrp: parseFloat(dropsToXrp(accountInfo.result.account_data.Balance.toString())),
          rlusd: this.getRLUSDBalance(trustLines),
        },
        trustLines,
      };

      this.wallets.set(wallet.address, managedWallet);
      
      console.log(`✅ Imported wallet: ${wallet.address}`);
      return managedWallet;
    } catch (error) {
      console.error('❌ Error importing wallet:', error);
      throw new Error('Failed to import wallet');
    }
  }

  async getWallet(address: string): Promise<ManagedWallet | null> {
    const wallet = this.wallets.get(address);
    if (wallet) {
      // Refresh balance
      await this.updateWalletBalance(address);
      return this.wallets.get(address) || null;
    }
    return null;
  }

  async getAllWallets(): Promise<ManagedWallet[]> {
    return Array.from(this.wallets.values());
  }

  // Account Operations
  async getAccountInfo(address: string): Promise<AccountInfoResponse> {
    const request: AccountInfoRequest = {
      command: 'account_info',
      account: address,
      ledger_index: 'validated',
    };

    return await this.client.request(request);
  }

  async getTrustLines(address: string): Promise<any[]> {
    try {
      const response = await this.client.request({
        command: 'account_lines',
        account: address,
        ledger_index: 'validated',
      });
      
      return response.result.lines || [];
    } catch (error) {
      console.error('❌ Error getting trust lines:', error);
      return [];
    }
  }

  async updateWalletBalance(address: string): Promise<void> {
    const wallet = this.wallets.get(address);
    if (!wallet) return;

    try {
      const [accountInfo, trustLines] = await Promise.all([
        this.getAccountInfo(address),
        this.getTrustLines(address)
      ]);

      wallet.balance.xrp = parseFloat(dropsToXrp(accountInfo.result.account_data.Balance.toString()));
      wallet.balance.rlusd = this.getRLUSDBalance(trustLines);
      wallet.trustLines = trustLines;
      
      this.wallets.set(address, wallet);
    } catch (error) {
      console.error('❌ Error updating wallet balance:', error);
    }
  }

  private getRLUSDBalance(trustLines: any[]): number {
    const rlusdLine = trustLines.find(line => 
      line.currency === XRPL_CONFIG.RLUSD_CURRENCY && 
      line.account === XRPL_CONFIG.RLUSD_ISSUER
    );
    return rlusdLine ? parseFloat(rlusdLine.balance) : 0;
  }

  // Trust Line Operations
  async createRLUSDTrustLine(walletAddress: string, limit: string = '1000000'): Promise<XRPLTransaction> {
    const wallet = this.wallets.get(walletAddress);
    if (!wallet) throw new Error('Wallet not found');

    try {
      const trustSetTransaction: TrustSet = {
        TransactionType: 'TrustSet',
        Account: walletAddress,
        LimitAmount: {
          currency: XRPL_CONFIG.RLUSD_CURRENCY,
          issuer: XRPL_CONFIG.RLUSD_ISSUER,
          value: limit,
        },
        Fee: XRPL_CONFIG.FEE_DROPS,
      };

      const prepared = await this.client.autofill(trustSetTransaction);
      const signed = wallet.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      const transaction: XRPLTransaction = {
        id: `trust_${Date.now()}`,
        type: 'trust_set',
        hash: result.result.hash,
        result: typeof result.result.meta === 'object' && result.result.meta && 'TransactionResult' in result.result.meta 
          ? (result.result.meta as any).TransactionResult 
          : 'unknown',
        timestamp: Date.now(),
        fromAddress: walletAddress,
        amount: {
          value: limit,
          currency: XRPL_CONFIG.RLUSD_CURRENCY,
          issuer: XRPL_CONFIG.RLUSD_ISSUER,
        },
        validated: result.result.validated,
      };

      // Update wallet balance after trust line creation
      await this.updateWalletBalance(walletAddress);

      console.log(`✅ RLUSD Trust line created for ${walletAddress}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error creating RLUSD trust line:', error);
      throw new Error('Failed to create RLUSD trust line');
    }
  }

  // Payment Operations
  async sendPayment(
    fromAddress: string,
    toAddress: string,
    amount: string,
    currency: string = 'XRP',
    issuer?: string
  ): Promise<XRPLTransaction> {
    const wallet = this.wallets.get(fromAddress);
    if (!wallet) throw new Error('Sender wallet not found');

    try {
      let amountObj: any;
      
      if (currency === 'XRP') {
        amountObj = xrpToDrops(amount);
      } else {
        amountObj = {
          currency,
          value: amount,
          issuer: issuer || XRPL_CONFIG.RLUSD_ISSUER,
        };
      }

      const payment: Payment = {
        TransactionType: 'Payment',
        Account: fromAddress,
        Destination: toAddress,
        Amount: amountObj,
        Fee: XRPL_CONFIG.FEE_DROPS,
      };

      const prepared = await this.client.autofill(payment);
      const signed = wallet.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      const transaction: XRPLTransaction = {
        id: `payment_${Date.now()}`,
        type: 'payment',
        hash: result.result.hash,
        result: typeof result.result.meta === 'object' && result.result.meta && 'TransactionResult' in result.result.meta 
          ? (result.result.meta as any).TransactionResult 
          : 'unknown',
        timestamp: Date.now(),
        fromAddress,
        toAddress,
        amount: {
          value: amount,
          currency,
          issuer,
        },
        validated: result.result.validated,
      };

      // Update both wallet balances
      await Promise.all([
        this.updateWalletBalance(fromAddress),
        this.updateWalletBalance(toAddress),
      ]);

      // Store transaction in database
      await this.storeTransaction(transaction);

      console.log(`✅ Payment sent: ${amount} ${currency} from ${fromAddress} to ${toAddress}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error sending payment:', error);
      throw new Error('Failed to send payment');
    }
  }

  // Loan and Escrow Operations
  async createLoanEscrow(
    lenderAddress: string,
    borrowerAddress: string,
    amount: string,
    loanMetadata: any,
    releaseTime: number
  ): Promise<{
    success: boolean;
    escrowId?: string;
    txHash?: string;
    error?: string;
  }> {
    try {
      // For now, we'll use a simple payment-based escrow
      // In production, you'd use actual XRPL Escrow objects
      
      const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create escrow entry in database
      const escrowData: EscrowData = {
        id: escrowId,
        loanId: loanMetadata.loanId || `loan_${Date.now()}`,
        lenderAddress,
        borrowerAddress,
        amount: parseFloat(amount),
        currency: XRPL_CONFIG.RLUSD_CURRENCY,
        createdAt: Date.now(),
        releaseConditions: {
          type: 'time_based',
          releaseTime: Date.now() + (releaseTime * 24 * 60 * 60 * 1000), // Convert days to ms
        },
        status: 'created',
      };

      // For demo purposes, we'll simulate the escrow creation
      // In production, this would create an actual XRPL Escrow transaction
      const transaction = await this.sendPayment(
        lenderAddress,
        borrowerAddress,
        amount,
        XRPL_CONFIG.RLUSD_CURRENCY
      );

      escrowData.txHash = transaction.hash;
      escrowData.status = 'funded';

      // Store escrow data
      await database.createEscrow(escrowData);

      // Store loan transaction
      const dbTransaction: DBTransaction = {
        id: `tx_${Date.now()}`,
        type: 'loan_funded',
        fromAddress: lenderAddress,
        toAddress: borrowerAddress,
        amount: parseFloat(amount),
        currency: XRPL_CONFIG.RLUSD_CURRENCY,
        txHash: transaction.hash,
        loanId: escrowData.loanId,
        escrowId,
        timestamp: Date.now(),
        status: 'confirmed',
        metadata: loanMetadata,
      };

      await database.createTransaction(dbTransaction);

      console.log(`✅ Loan escrow created: ${escrowId}`);
      return {
        success: true,
        escrowId,
        txHash: transaction.hash,
      };
    } catch (error) {
      console.error('❌ Error creating loan escrow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Testnet Utilities
  async fundTestnetWallet(address: string): Promise<void> {
    try {
      // Use XRPL Testnet Faucet
      const faucetUrl = 'https://faucet.altnet.rippletest.net/accounts';
      const response = await fetch(faucetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: address,
          xrpAmount: '1000', // Fund with 1000 XRP
        }),
      });

      if (response.ok) {
        console.log(`✅ Funded testnet wallet: ${address}`);
        
        // Wait a bit for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update wallet balance
        await this.updateWalletBalance(address);
      } else {
        console.warn(`⚠️ Failed to fund wallet via faucet: ${address}`);
      }
    } catch (error) {
      console.error('❌ Error funding testnet wallet:', error);
    }
  }

  // Transaction History
  async getTransactionHistory(address: string, limit: number = 50): Promise<XRPLTransaction[]> {
    try {
      const response = await this.client.request({
        command: 'account_tx',
        account: address,
        limit: limit.toString(),
        ledger_index_min: -1,
        ledger_index_max: -1,
      });

      return response.result.transactions.map((tx: any) => ({
        id: tx.hash || `tx_${Date.now()}`,
        type: tx.tx?.TransactionType?.toLowerCase() || 'unknown',
        hash: tx.hash,
        result: tx.meta?.TransactionResult || 'unknown',
        timestamp: this.rippleTimeToUnixTime(tx.tx?.date || 0),
        fromAddress: tx.tx?.Account || '',
        toAddress: tx.tx?.Destination,
        amount: this.parseAmount(tx.tx?.Amount),
        validated: tx.validated,
        metadata: tx.meta,
      } as XRPLTransaction));
    } catch (error) {
      console.error('❌ Error getting transaction history:', error);
      return [];
    }
  }

  // Utility Methods
  private async storeTransaction(transaction: XRPLTransaction): Promise<void> {
    const dbTransaction: DBTransaction = {
      id: transaction.id,
      type: transaction.type as any,
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress || '',
      amount: parseFloat(transaction.amount.value),
      currency: transaction.amount.currency,
      txHash: transaction.hash,
      timestamp: transaction.timestamp,
      status: transaction.validated ? 'confirmed' : 'pending',
      metadata: transaction.metadata,
    };

    await database.createTransaction(dbTransaction);
  }

  private rippleTimeToUnixTime(rippleTime: number): number {
    // Ripple Epoch starts January 1, 2000 (00:00 UTC)
    const RIPPLE_EPOCH_OFFSET = 946684800000; // milliseconds
    return rippleTime * 1000 + RIPPLE_EPOCH_OFFSET;
  }

  private parseAmount(amount: any): { value: string; currency: string; issuer?: string } {
    if (typeof amount === 'string') {
      // XRP amount in drops
      return {
        value: dropsToXrp(amount),
        currency: 'XRP',
      };
    } else if (typeof amount === 'object') {
      // IOU amount
      return {
        value: amount.value,
        currency: amount.currency,
        issuer: amount.issuer,
      };
    }
    
    return { value: '0', currency: 'UNKNOWN' };
  }

  // Network Status
  async getNetworkInfo(): Promise<any> {
    try {
      const ledgerRequest: LedgerRequest = {
        command: 'ledger',
        ledger_index: 'validated',
      };

      const response: LedgerResponse = await this.client.request(ledgerRequest);
      return {
        ledgerIndex: response.result.ledger_index,
        ledgerHash: response.result.ledger_hash,
        closeTime: (response.result as any).close_time,
        closeTimeHuman: (response.result as any).close_time_human,
        totalCoins: (response.result as any).total_coins,
        validatedLedgers: (response.result as any).validated_ledgers,
      };
    } catch (error) {
      console.error('❌ Error getting network info:', error);
      return null;
    }
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.wallets.clear();
  }
}

// Singleton instance
export const xrplClient = new EnhancedXRPLClient();

// Helper functions for components
export const formatXRPAddress = (address: string): string => {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

export const getTestnetExplorerLink = (txHash: string): string => {
  return `https://testnet.xrpl.org/transactions/${txHash}`;
};

export const formatCurrency = (amount: number, currency: string = 'RLUSD'): string => {
  return `${amount.toLocaleString()} ${currency}`;
};

// Reputation and DID helpers
export const generateDIDFromAddress = (address: string): string => {
  return `did:xrpl:${address.slice(0, 8)}:${Date.now()}`;
};

export const generatePseudonymousId = (did: string): string => {
  const hash = did.split(':').join('').toUpperCase();
  return `USER-${hash.slice(0, 8)}`;
}; 