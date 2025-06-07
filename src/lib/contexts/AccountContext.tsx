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
};

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountState>(initialState);

  // Initialize account on mount
  useEffect(() => {
    initializeAccount();
  }, []);

  // Load user data when current user changes
  useEffect(() => {
    if (account.currentUser) {
      loadUserData();
    }
  }, [account.currentUser]);

  const initializeAccount = async () => {
    try {
      setAccount(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, automatically select first user
      const defaultUser = MOCK_USERS[0];
      
      setAccount(prev => ({
        ...prev,
        currentUser: defaultUser,
        isAuthenticated: true,
        availableBalance: defaultUser.balance || 10000,
        viewMode: defaultUser.role === 'lender' ? 'lender' : 'borrower',
        loading: false,
      }));
      
    } catch (error) {
      setAccount(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize account. Please refresh the page.',
      }));
    }
  };

  const loadUserData = async () => {
    if (!account.currentUser) return;

    try {
      // Load reputation data
      const reputationData = MOCK_REPUTATION_SCORES.find(
        rep => rep.did === account.currentUser?.did
      ) || getReputationScore(account.currentUser.address);

      // Generate DID if not exists
      if (!account.currentUser.did) {
        const mockDID = generateMockDID(account.currentUser.address);
        account.currentUser.did = mockDID.id;
      }

      // Generate pseudonymous ID if not exists
      if (!account.currentUser.pseudonymousId) {
        account.currentUser.pseudonymousId = generatePseudonymousId(
          account.currentUser.did || account.currentUser.address
        );
      }

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
      setAccount(prev => ({ ...prev, loading: true, error: null }));
      
      const newUser = MOCK_USERS.find(user => user.address === userId);
      if (!newUser) {
        throw new Error('User not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setAccount(prev => ({
        ...prev,
        currentUser: newUser,
        availableBalance: newUser.balance || 10000,
        viewMode: newUser.role === 'lender' ? 'lender' : 'borrower',
        loading: false,
        userLoans: [],
        userReputation: null,
        totalPortfolioValue: 0,
      }));

    } catch (error) {
      setAccount(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to switch user',
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
    });
  };

  const updateUserBalance = (amount: number) => {
    setAccount(prev => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance + amount),
    }));
  };

  const refreshAccountData = async () => {
    await loadUserData();
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

  const getAllUsers = async () => {
    // Implementation of getAllUsers function
    // This is a placeholder and should be replaced with the actual implementation
    return [];
  };

  const createLoan = async (loanData: any) => {
    // Implementation of createLoan function
    // This is a placeholder and should be replaced with the actual implementation
  };

  const fundLoan = async (loanId: string, lenderAddress: string, amount: number) => {
    // Implementation of fundLoan function
    // This is a placeholder and should be replaced with the actual implementation
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