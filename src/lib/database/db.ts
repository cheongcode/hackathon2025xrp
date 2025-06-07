import { User, LoanRequest, LoanStatus, ReputationScore } from '@/types';

// IndexedDB Database Configuration
const DB_NAME = 'MicroLoanXDB';
const DB_VERSION = 1;

// Store Names
const STORES = {
  USERS: 'users',
  LOANS: 'loans',
  TRANSACTIONS: 'transactions',
  REPUTATION: 'reputation',
  ESCROWS: 'escrows',
} as const;

// Database Interface
export interface DatabaseUser extends User {
  passwordHash?: string;
  createdAt: number;
  lastActive: number;
  preferences: {
    notifications: boolean;
    autoFunding: boolean;
    riskTolerance: 'low' | 'medium' | 'high';
  };
}

export interface DatabaseLoan extends LoanRequest {
  createdAt: number;
  updatedAt: number;
  viewCount: number;
  interestedLenders: string[];
  documents?: string[];
}

export interface Transaction {
  id: string;
  type: 'loan_request' | 'loan_funded' | 'repayment' | 'escrow_create' | 'escrow_release';
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  txHash?: string;
  loanId?: string;
  escrowId?: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  metadata?: Record<string, any>;
}

export interface EscrowData {
  id: string;
  loanId: string;
  lenderAddress: string;
  borrowerAddress: string;
  amount: number;
  currency: string;
  createdAt: number;
  releaseConditions: {
    type: 'time_based' | 'condition_based';
    releaseTime?: number;
    conditions?: string[];
  };
  status: 'created' | 'funded' | 'released' | 'cancelled';
  txHash?: string;
  releaseTxHash?: string;
}

class MicroLoanDatabase {
  private db: IDBDatabase | null = null;
  private readonly dbName = DB_NAME;
  private readonly version = DB_VERSION;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Users Store
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'address' });
          userStore.createIndex('name', 'name', { unique: false });
          userStore.createIndex('role', 'role', { unique: false });
          userStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Loans Store
        if (!db.objectStoreNames.contains(STORES.LOANS)) {
          const loanStore = db.createObjectStore(STORES.LOANS, { keyPath: 'id' });
          loanStore.createIndex('borrowerAddress', 'borrowerAddress', { unique: false });
          loanStore.createIndex('lenderAddress', 'lenderAddress', { unique: false });
          loanStore.createIndex('status', 'status', { unique: false });
          loanStore.createIndex('createdAt', 'createdAt', { unique: false });
          loanStore.createIndex('amount', 'amount', { unique: false });
          loanStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }

        // Transactions Store
        if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
          const txStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
          txStore.createIndex('fromAddress', 'fromAddress', { unique: false });
          txStore.createIndex('toAddress', 'toAddress', { unique: false });
          txStore.createIndex('type', 'type', { unique: false });
          txStore.createIndex('timestamp', 'timestamp', { unique: false });
          txStore.createIndex('loanId', 'loanId', { unique: false });
        }

        // Reputation Store
        if (!db.objectStoreNames.contains(STORES.REPUTATION)) {
          const repStore = db.createObjectStore(STORES.REPUTATION, { keyPath: 'did' });
          repStore.createIndex('trustScore', 'trustScore', { unique: false });
          repStore.createIndex('userAddress', 'userAddress', { unique: false });
        }

        // Escrows Store
        if (!db.objectStoreNames.contains(STORES.ESCROWS)) {
          const escrowStore = db.createObjectStore(STORES.ESCROWS, { keyPath: 'id' });
          escrowStore.createIndex('loanId', 'loanId', { unique: false });
          escrowStore.createIndex('lenderAddress', 'lenderAddress', { unique: false });
          escrowStore.createIndex('borrowerAddress', 'borrowerAddress', { unique: false });
          escrowStore.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  // User Operations
  async createUser(user: DatabaseUser): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.USERS], 'readwrite');
    const store = transaction.objectStore(STORES.USERS);
    
    return new Promise((resolve, reject) => {
      const request = store.add(user);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(address: string): Promise<DatabaseUser | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.USERS], 'readonly');
    const store = transaction.objectStore(STORES.USERS);
    
    return new Promise((resolve, reject) => {
      const request = store.get(address);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers(): Promise<DatabaseUser[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.USERS], 'readonly');
    const store = transaction.objectStore(STORES.USERS);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(address: string, updates: Partial<DatabaseUser>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const user = await this.getUser(address);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates, updatedAt: Date.now() };
    
    const transaction = this.db.transaction([STORES.USERS], 'readwrite');
    const store = transaction.objectStore(STORES.USERS);
    
    return new Promise((resolve, reject) => {
      const request = store.put(updatedUser);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Loan Operations
  async createLoan(loan: DatabaseLoan): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.LOANS], 'readwrite');
    const store = transaction.objectStore(STORES.LOANS);
    
    return new Promise((resolve, reject) => {
      const request = store.add(loan);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLoan(id: string): Promise<DatabaseLoan | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.LOANS], 'readonly');
    const store = transaction.objectStore(STORES.LOANS);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getLoansBy(indexName: string, value: any): Promise<DatabaseLoan[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.LOANS], 'readonly');
    const store = transaction.objectStore(STORES.LOANS);
    const index = store.index(indexName);
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllLoans(): Promise<DatabaseLoan[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.LOANS], 'readonly');
    const store = transaction.objectStore(STORES.LOANS);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateLoan(id: string, updates: Partial<DatabaseLoan>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const loan = await this.getLoan(id);
    if (!loan) throw new Error('Loan not found');
    
    const updatedLoan = { ...loan, ...updates, updatedAt: Date.now() };
    
    const transaction = this.db.transaction([STORES.LOANS], 'readwrite');
    const store = transaction.objectStore(STORES.LOANS);
    
    return new Promise((resolve, reject) => {
      const request = store.put(updatedLoan);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Transaction Operations
  async createTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction([STORES.TRANSACTIONS], 'readwrite');
    const store = tx.objectStore(STORES.TRANSACTIONS);
    
    return new Promise((resolve, reject) => {
      const request = store.add(transaction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTransactionsByUser(address: string): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.TRANSACTIONS], 'readonly');
    const store = transaction.objectStore(STORES.TRANSACTIONS);
    
    const fromIndex = store.index('fromAddress');
    const toIndex = store.index('toAddress');
    
    const [fromTxs, toTxs] = await Promise.all([
      new Promise<Transaction[]>((resolve, reject) => {
        const request = fromIndex.getAll(address);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
      new Promise<Transaction[]>((resolve, reject) => {
        const request = toIndex.getAll(address);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    ]);
    
    // Combine and deduplicate
    const allTxs = [...fromTxs, ...toTxs];
    const uniqueTxs = allTxs.filter((tx, index, self) => 
      index === self.findIndex(t => t.id === tx.id)
    );
    
    return uniqueTxs.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Reputation Operations
  async updateReputation(reputation: ReputationScore): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.REPUTATION], 'readwrite');
    const store = transaction.objectStore(STORES.REPUTATION);
    
    return new Promise((resolve, reject) => {
      const request = store.put(reputation);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getReputation(did: string): Promise<ReputationScore | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.REPUTATION], 'readonly');
    const store = transaction.objectStore(STORES.REPUTATION);
    
    return new Promise((resolve, reject) => {
      const request = store.get(did);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Escrow Operations
  async createEscrow(escrow: EscrowData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.ESCROWS], 'readwrite');
    const store = transaction.objectStore(STORES.ESCROWS);
    
    return new Promise((resolve, reject) => {
      const request = store.add(escrow);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getEscrowsByLender(lenderAddress: string): Promise<EscrowData[]> {
    return this.getEscrowsBy('lenderAddress', lenderAddress);
  }

  async getEscrowsByBorrower(borrowerAddress: string): Promise<EscrowData[]> {
    return this.getEscrowsBy('borrowerAddress', borrowerAddress);
  }

  private async getEscrowsBy(indexName: string, value: string): Promise<EscrowData[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([STORES.ESCROWS], 'readonly');
    const store = transaction.objectStore(STORES.ESCROWS);
    const index = store.index(indexName);
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const storeNames = Object.values(STORES);
    const transaction = this.db.transaction(storeNames, 'readwrite');
    
    const clearPromises = storeNames.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
    
    await Promise.all(clearPromises);
  }

  async getMarketplaceStats() {
    const [loans, users] = await Promise.all([
      this.getAllLoans(),
      this.getAllUsers()
    ]);

    const totalFunded = loans
      .filter(loan => loan.status === 'FUNDED' || loan.status === 'REPAID')
      .reduce((sum, loan) => sum + loan.amount, 0);

    const activeBorrowers = new Set(
      loans.filter(loan => loan.status === 'FUNDED').map(loan => loan.borrowerAddress)
    ).size;

    const successfulLoans = loans.filter(loan => loan.status === 'REPAID').length;
    const totalCompletedLoans = loans.filter(loan => 
      loan.status === 'REPAID' || loan.status === 'DEFAULTED'
    ).length;

    const successRate = totalCompletedLoans > 0 
      ? (successfulLoans / totalCompletedLoans) * 100 
      : 0;

    return {
      totalFunded,
      activeBorrowers,
      successRate,
      totalLoans: loans.length,
      totalUsers: users.length,
      pendingLoans: loans.filter(loan => loan.status === 'PENDING').length,
    };
  }
}

// Singleton instance
export const database = new MicroLoanDatabase(); 