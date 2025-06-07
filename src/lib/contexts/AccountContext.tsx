'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoanRequest, ReputationScore } from '@/types';
import { MOCK_USERS, MOCK_REPUTATION_SCORES } from '@/types';
import { getReputationScore, getUserEscrows } from '@/lib/xrpl/escrow';
import { generateMockDID, generatePseudonymousId } from '@/lib/xrpl/client';
import { database, DatabaseUser } from '@/lib/database/db';
import { seedDatabase, TEST_ACCOUNTS, getTestUsersByRole } from '@/lib/database/seed-data';

export type UserRole = 'borrower' | 'lender' | 'admin';
export type ViewMode = 'borrower' | 'lender';

export interface AccountState {
  currentUser: DatabaseUser | null;
  isAuthenticated: boolean;
  viewMode: ViewMode;
  userLoans: LoanRequest[];
  userReputation: ReputationScore | null;
  availableBalance: number;
  totalPortfolioValue: number;
  loading: boolean;
  error: string | null;
  marketplaceStats: {
    totalFunded: number;
    activeBorrowers: number;
    successRate: number;
    totalLoans: number;
    totalUsers: number;
  };
  databaseInitialized: boolean;
}

export interface AccountContextType {
  account: AccountState;
  switchUser: (userId: string) => Promise<void>;
  switchViewMode: (mode: ViewMode) => void;
  logout: () => void;
  updateUserBalance: (amount: number) => void;
  refreshAccountData: () => Promise<void>;
  canAccessBorrower: boolean;
  canAccessLender: boolean;
  getAllUsers: () => Promise<DatabaseUser[]>;
  createLoan: (loanData: any) => Promise<void>;
  fundLoan: (loanId: string, lenderAddress: string, amount: number) => Promise<void>;
  initializeDatabase: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const initialState: AccountState = {
  currentUser: null,
  isAuthenticated: false,
  viewMode: 'borrower',
  userLoans: [],
  userReputation: null,
  availableBalance: 0,
  totalPortfolioValue: 0,
  loading: true,
  error: null,
  marketplaceStats: {
    totalFunded: 0,
    activeBorrowers: 0,
    successRate: 0,
    totalLoans: 0,
    totalUsers: 0,
  },
  databaseInitialized: false,
};

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountState>(initialState);

  // Initialize account on mount
  useEffect(() => {
    initializeAccount();
  }, []);

  // Load user data when current user changes
  useEffect(() => {
    if (account.currentUser && account.databaseInitialized) {
      loadUserData();
    }
  }, [account.currentUser, account.databaseInitialized]);

  const initializeDatabase = async () => {
    try {
      console.log('🔄 Initializing database...');
      setAccount(prev => ({ ...prev, loading: true, error: null }));
      
      // Initialize and seed the database
      await seedDatabase();
      
      // Load marketplace stats
      const stats = await database.getMarketplaceStats();
      
      setAccount(prev => ({
        ...prev,
        databaseInitialized: true,
        marketplaceStats: stats,
      }));
      
      console.log('✅ Database initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      setAccount(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize database. Please refresh the page.',
      }));
    }
  };

  const initializeAccount = async () => {
    try {
      setAccount(prev => ({ ...prev, loading: true, error: null }));
      
      // First initialize the database
      await initializeDatabase();
      
      // Get all users from database
      const users = await database.getAllUsers();
      
      if (users.length === 0) {
        throw new Error('No users found in database');
      }
      
      // For demo, automatically select first borrower
      const defaultUser = users.find(user => user.role === 'borrower') || users[0];
      
      setAccount(prev => ({
        ...prev,
        currentUser: defaultUser,
        isAuthenticated: true,
        availableBalance: defaultUser.balance || 10000,
        viewMode: defaultUser.role === 'lender' ? 'lender' : 'borrower',
        loading: false,
      }));
      
    } catch (error) {
      console.error('Failed to initialize account:', error);
      setAccount(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize account. Please refresh the page.',
      }));
    }
  };

  const loadUserData = async () => {
    if (!account.currentUser || !account.databaseInitialized) return;

    try {
      // Load reputation data from database
      const reputationData = await database.getReputation(account.currentUser.did || '');

      setAccount(prev => ({
        ...prev,
        userReputation: reputationData,
        userLoans: [], // Will be populated by individual components
        totalPortfolioValue: 0, // Will be calculated by components
      }));

    } catch (error) {
      console.error('Failed to load user data:', error);
      setAccount(prev => ({
        ...prev,
        error: 'Failed to load user data',
      }));
    }
  };

  const switchUser = async (userId: string) => {
    try {
      console.log('🔄 Switching to user:', userId);
      setAccount(prev => ({ ...prev, loading: true, error: null }));
      
      // Ensure database is initialized
      if (!account.databaseInitialized) {
        await initializeDatabase();
      }
      
      const newUser = await database.getUser(userId);
      if (!newUser) {
        throw new Error(`User with ID ${userId} not found`);
      }

      console.log('✅ Found user:', newUser.name, newUser.role);

      // Simulate API call for realistic UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Load reputation data for new user
      let userReputation = null;
      try {
        userReputation = await database.getReputation(newUser.did || '');
      } catch (error) {
        console.warn('Could not load reputation for user:', error);
      }

      setAccount(prev => ({
        ...prev,
        currentUser: newUser,
        isAuthenticated: true,
        availableBalance: newUser.balance || 10000,
        viewMode: newUser.role === 'lender' ? 'lender' : 'borrower',
        loading: false,
        userLoans: [],
        userReputation,
        totalPortfolioValue: 0,
        error: null,
      }));

      console.log('✅ Successfully switched to user:', newUser.name);

    } catch (error) {
      console.error('❌ Failed to switch user:', error);
      setAccount(prev => ({
        ...prev,
        loading: false,
        error: `Failed to switch user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    }
  };

  const switchViewMode = (mode: ViewMode) => {
    if (!canAccessMode(mode)) {
      setAccount(prev => ({
        ...prev,
        error: `You don't have access to ${mode} dashboard`,
      }));
      return;
    }

    setAccount(prev => ({
      ...prev,
      viewMode: mode,
      error: null,
    }));
  };

  const logout = () => {
    setAccount({
      ...initialState,
      loading: false,
      databaseInitialized: account.databaseInitialized,
    });
  };

  const updateUserBalance = (amount: number) => {
    setAccount(prev => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance + amount),
    }));
  };

  const refreshAccountData = async () => {
    if (account.databaseInitialized) {
      await loadUserData();
      // Refresh marketplace stats
      const stats = await database.getMarketplaceStats();
      setAccount(prev => ({
        ...prev,
        marketplaceStats: stats,
      }));
    }
  };

  const canAccessMode = (mode: ViewMode): boolean => {
    if (!account.currentUser) return false;
    
    // Users can access their primary role + borrower mode (everyone can borrow)
    if (mode === 'borrower') return true;
    if (mode === 'lender') return account.currentUser.role === 'lender';
    
    return false;
  };

  const canAccessBorrower = canAccessMode('borrower');
  const canAccessLender = canAccessMode('lender');

  const getAllUsers = async (): Promise<DatabaseUser[]> => {
    if (!account.databaseInitialized) {
      return [];
    }
    return await database.getAllUsers();
  };

  const createLoan = async (loanData: any) => {
    if (!account.databaseInitialized || !account.currentUser) {
      throw new Error('Database not initialized or user not authenticated');
    }
    
    const loan = {
      ...loanData,
      id: `loan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      borrowerAddress: account.currentUser.address,
      borrowerDID: account.currentUser.did,
      pseudonymousId: account.currentUser.pseudonymousId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewCount: 0,
      interestedLenders: [],
    };
    
    await database.createLoan(loan);
  };

  const fundLoan = async (loanId: string, lenderAddress: string, amount: number) => {
    if (!account.databaseInitialized) {
      throw new Error('Database not initialized');
    }
    
    await database.updateLoan(loanId, {
      status: 'FUNDED',
      lenderAddress,
      fundedAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const contextValue: AccountContextType = {
    account,
    switchUser,
    switchViewMode,
    logout,
    updateUserBalance,
    refreshAccountData,
    canAccessBorrower,
    canAccessLender,
    getAllUsers,
    createLoan,
    fundLoan,
    initializeDatabase,
  };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
} 
export default AccountProvider; 