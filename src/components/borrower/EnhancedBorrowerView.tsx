'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  UserIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { useAccount } from '@/lib/contexts/AccountContext';
import { LoanRequest, LoanStatus, LOAN_CATEGORIES } from '@/types';
import { getTestnetExplorerLink } from '@/lib/xrpl/escrow';
import { 
  testXRPLConnection, 
  createTestnetFundedWallet, 
  sendRealXRPPayment, 
  getAccountBalance,
  DEMO_TESTNET_WALLETS,
  generateMockDID, 
  generatePseudonymousId 
} from '@/lib/xrpl/client';

// Performance optimized form state
interface LoanFormState {
  amount: string;
  purpose: string;
  selectedTags: string[];
  repaymentPeriod: string;
  customPurpose: string;
}

const initialFormState: LoanFormState = {
  amount: '',
  purpose: '',
  selectedTags: [],
  repaymentPeriod: '30',
  customPurpose: '',
};

export default function EnhancedBorrowerView() {
  const { account, updateUserBalance, refreshAccountData, createLoan, repayLoan } = useAccount();
  
  // Optimized state management
  const [formState, setFormState] = useState<LoanFormState>(initialFormState);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [repayingLoans, setRepayingLoans] = useState<Set<string>>(new Set());

  // Memoized calculations for performance
  const calculatedMetrics = useMemo(() => {
    const totalBorrowed = loanRequests
      .filter(req => req.status === 'FUNDED' || req.status === 'REPAID')
      .reduce((sum, req) => sum + req.amount, 0);
    
    const pendingAmount = loanRequests
      .filter(req => req.status === 'PENDING')
      .reduce((sum, req) => sum + req.amount, 0);
    
    const approvalRate = loanRequests.length > 0 
      ? (loanRequests.filter(req => req.status !== 'PENDING' && req.status !== 'DEFAULTED').length / loanRequests.length) * 100
      : 0;

    return {
      totalBorrowed,
      pendingAmount,
      approvalRate,
      averageAmount: loanRequests.length > 0 ? totalBorrowed / loanRequests.length : 0,
      creditUtilization: account.availableBalance > 0 ? (totalBorrowed / account.availableBalance) * 100 : 0
    };
  }, [loanRequests, account.availableBalance]);

  const calculateInterestRate = useCallback((trustScore: number): number => {
    const baseRate = 12.0;
    const discount = (trustScore / 100) * 4;
    return Math.round((baseRate - discount) * 10) / 10;
  }, []);

  const calculateRiskScore = useCallback((trustScore: number): number => {
    return Math.min(100, Math.max(20, trustScore + Math.random() * 20 - 10));
  }, []);

  const handleRepayLoan = async (loan: LoanRequest) => {
    if (!account.currentUser || !loan.escrowId) {
      alert('❌ Cannot repay loan: Missing user or escrow information');
      return;
    }

    // Get the borrower's seed from demo wallets
    const borrowerWallet = Object.values(DEMO_TESTNET_WALLETS).find(
      wallet => wallet.address === account.currentUser?.address
    );

    if (!borrowerWallet) {
      alert('❌ Cannot repay loan: Borrower wallet not found in demo wallets');
      return;
    }

    const confirmed = confirm(
      `🔄 Repay Loan\n\n` +
      `Loan Amount: $${loan.amount.toLocaleString()} RLUSD\n` +
      `Interest Rate: ${loan.interestRate}%\n` +
      `Total Repayment: $${(loan.amount * (1 + (loan.interestRate || 0) / 100)).toLocaleString()}\n\n` +
      `This will send 1 XRP to Maria Santos (rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh) as proof of repayment.\n\n` +
      `Continue with repayment?`
    );

    if (!confirmed) return;

    setRepayingLoans(prev => new Set(prev).add(loan.id));

    try {
      console.log('🚀 Starting loan repayment process...');
      
      const repaymentResult = await repayLoan(
        loan.id,
        borrowerWallet.seed,
        loan.escrowId,
        loan.amount
      );

      if (repaymentResult.success && repaymentResult.txHash) {
        // Show success message with transaction details but don't auto-open
        alert(
          `✅ Loan Repaid Successfully!\n\n` +
          `🔗 Transaction Hash: ${repaymentResult.txHash}\n` +
          `💰 Amount: 1 XRP sent to Maria Santos\n\n` +
          `Click the "View TX" button in the loan table to view the transaction on the explorer.\n\n` +
          `Your loan has been marked as repaid. Thank you for using MicroLoanX!`
        );
        
        // Refresh loan data
        await loadUserLoanHistory();
        
      } else {
        alert(
          `❌ Loan Repayment Failed\n\n` +
          `Error: ${repaymentResult.error || 'Unknown error occurred'}\n\n` +
          `Please check your wallet balance and try again.`
        );
      }
    } catch (error) {
      console.error('❌ Error during loan repayment:', error);
      alert('❌ Loan repayment failed. Check console for details.');
    } finally {
      setRepayingLoans(prev => {
        const newSet = new Set(prev);
        newSet.delete(loan.id);
        return newSet;
      });
    }
  };

  const loadUserLoanHistory = useCallback(async () => {
    if (!account.currentUser || !account.databaseInitialized) return;
    
    try {
      // Load real loans from database
      const { database } = await import('@/lib/database/db');
      const allLoans = await database.getAllLoans();
      
      // Filter loans for current user
      const userLoans = allLoans.filter(loan => 
        loan.borrowerAddress === account.currentUser?.address
      );
      
      setLoanRequests(userLoans);
    } catch (error) {
      console.error('Failed to load loan history:', error);
      setLoanRequests([]);
    }
  }, [account.currentUser, account.databaseInitialized]);

  // Load user data on mount and user change
  useEffect(() => {
    if (account.currentUser && account.databaseInitialized) {
      loadUserLoanHistory();
    }
  }, [account.currentUser, account.databaseInitialized, loadUserLoanHistory]);

  const handleFormChange = useCallback((field: keyof LoanFormState, value: string | string[]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setFormState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!account.currentUser) return;

      const userDID = account.currentUser.did || generateMockDID(account.currentUser.address).id;
      const pseudonymousId = account.currentUser.pseudonymousId || generatePseudonymousId(userDID);
      
      const finalPurpose = formState.purpose === 'other' ? formState.customPurpose : formState.purpose;
      const trustScore = account.userReputation?.trustScore || 50;
      
      const loanData = {
        amount: parseFloat(formState.amount),
        currency: 'RLUSD',
        purpose: finalPurpose,
        tags: formState.selectedTags,
        status: 'PENDING' as LoanStatus,
        interestRate: calculateInterestRate(trustScore),
        repaymentPeriod: parseInt(formState.repaymentPeriod),
        riskScore: calculateRiskScore(trustScore),
      };

      // Save to database so it appears in marketplace
      await createLoan(loanData);

      // Also add to local state for immediate UI update
      const newRequest: LoanRequest = {
        id: `loan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        borrowerAddress: account.currentUser.address,
        borrowerDID: userDID,
        pseudonymousId: pseudonymousId,
        ...loanData,
        createdAt: Date.now(),
      };
      
      setLoanRequests(prev => [newRequest, ...prev]);
      setFormState(initialFormState);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      
    } catch (error) {
      console.error('Error creating loan request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: LoanStatus) => {
    switch (status) {
      case 'PENDING': return <ClockIcon className="h-5 w-5" />;
      case 'FUNDED': return <CheckCircleIcon className="h-5 w-5" />;
      case 'REPAID': return <CheckCircleIcon className="h-5 w-5" />;
      case 'DEFAULTED': return <XCircleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 80) return { label: 'Low Risk', color: 'bg-success-500/20 text-success-400' };
    if (riskScore >= 60) return { label: 'Medium Risk', color: 'bg-warning-500/20 text-warning-400' };
    return { label: 'High Risk', color: 'bg-error-500/20 text-error-400' };
  };

  if (!account.currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">Please log in to access borrower dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-20 right-4 z-50 glass-card border-success-400/30 bg-success-500/10 max-w-sm"
          >
            <div className="flex items-center space-x-3 p-4">
              <CheckCircleIcon className="h-6 w-6 text-success-400 flex-shrink-0" />
              <div>
                <p className="text-success-200 font-bold">Request Submitted!</p>
                <p className="text-success-300 text-sm">Your loan request is now under review</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced User Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-100">{account.currentUser.name}</h3>
                <div className="space-y-1">
                  <p className="text-slate-400">ID: {account.currentUser.pseudonymousId || 'Generating...'}</p>
                  <p className="text-slate-500 text-sm font-mono">DID: {account.currentUser.did ? `${account.currentUser.did.slice(0, 25)}...` : 'Not generated'}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <ShieldCheckIcon className="h-4 w-4 text-success-400" />
                    <span className="text-success-400 text-sm font-medium">Verified Borrower</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-50/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-slate-100">{loanRequests.length}</p>
                <p className="text-slate-400 text-xs">Total Requests</p>
              </div>
              <div className="bg-dark-50/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-success-400">{calculatedMetrics.approvalRate.toFixed(1)}%</p>
                <p className="text-slate-400 text-xs">Approval Rate</p>
              </div>
              <div className="bg-dark-50/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-slate-100">${calculatedMetrics.averageAmount.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">Avg Amount</p>
              </div>
              <div className="bg-dark-50/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-secondary-400">{calculatedMetrics.creditUtilization.toFixed(1)}%</p>
                <p className="text-slate-400 text-xs">Credit Util.</p>
              </div>
            </div>
          </div>

          {/* Reputation Score */}
          {account.userReputation && (
            <div className="bg-gradient-to-br from-secondary-500/10 to-primary-500/10 rounded-xl p-6 border border-secondary-400/20">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-slate-100 mb-2">
                  {account.userReputation.trustScore}/100
                </div>
                <p className="text-secondary-400 font-medium">Trust Score</p>
              </div>
              
              <div className="w-full bg-dark-100 rounded-full h-3 mb-4">
                <motion.div 
                  className="bg-gradient-to-r from-secondary-500 to-accent-400 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${account.userReputation.trustScore}%` }}
                  transition={{ duration: 1.5 }}
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Successful Loans:</span>
                  <span className="text-success-400 font-medium">{account.userReputation.successfulRepayments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Repayment:</span>
                  <span className="text-slate-200 font-medium">{account.userReputation.averageRepaymentTime}d</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verification:</span>
                  <span className="text-secondary-400 font-medium capitalize">{account.userReputation.verificationLevel}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Analytics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass-card text-center">
          <CurrencyDollarIcon className="h-12 w-12 text-success-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">${calculatedMetrics.totalBorrowed.toLocaleString()}</p>
          <p className="text-slate-400 mt-2">Total Borrowed</p>
          <div className="flex items-center justify-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-success-400 mr-1" />
            <span className="text-success-400 text-sm">+12.5%</span>
          </div>
        </div>

        <div className="glass-card text-center">
          <ClockIcon className="h-12 w-12 text-warning-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">${calculatedMetrics.pendingAmount.toLocaleString()}</p>
          <p className="text-slate-400 mt-2">Pending Requests</p>
          <div className="flex items-center justify-center mt-2">
            <ClockIcon className="h-4 w-4 text-warning-400 mr-1" />
            <span className="text-warning-400 text-sm">Processing</span>
          </div>
        </div>

        <div className="glass-card text-center">
          <ChartBarIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">{calculatedMetrics.approvalRate.toFixed(1)}%</p>
          <p className="text-slate-400 mt-2">Approval Rate</p>
          <div className="flex items-center justify-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-success-400 mr-1" />
            <span className="text-success-400 text-sm">Excellent</span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Loan Request Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex items-center mb-6">
          <PlusIcon className="h-8 w-8 text-secondary-400 mr-3" />
          <h2 className="text-2xl font-bold gradient-text">Create New Loan Request</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                💰 Loan Amount (RLUSD)
              </label>
              <input
                type="number"
                value={formState.amount}
                onChange={(e) => handleFormChange('amount', e.target.value)}
                className="input-primary"
                placeholder="e.g., 1,000"
                min="10"
                max="25000"
                step="1"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500 mt-1">Min: $10, Max: $25,000</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                📅 Repayment Period
              </label>
              <select
                value={formState.repaymentPeriod}
                onChange={(e) => handleFormChange('repaymentPeriod', e.target.value)}
                className="input-primary"
                required
                disabled={isSubmitting}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="21">21 days</option>
                <option value="30">30 days</option>
                <option value="45">45 days</option>
                <option value="60">60 days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">
              📝 Purpose Category
            </label>
            <select
              value={formState.purpose}
              onChange={(e) => handleFormChange('purpose', e.target.value)}
              className="input-primary"
              required
              disabled={isSubmitting}
            >
              <option value="">Select purpose...</option>
              {LOAN_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label} {category.tag}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">
              🏷️ Additional Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {LOAN_CATEGORIES.map((category) => (
                <motion.button
                  key={category.tag}
                  type="button"
                  onClick={() => handleTagToggle(category.tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    formState.selectedTags.includes(category.tag)
                      ? `${category.color} text-white`
                      : 'bg-dark-50/30 text-slate-400 hover:bg-dark-50/50'
                  }`}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.tag}
                </motion.button>
              ))}
            </div>
          </div>
          
          {formState.purpose === 'other' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-bold text-slate-200 mb-2">
                📋 Describe your purpose
              </label>
              <textarea
                value={formState.customPurpose}
                onChange={(e) => handleFormChange('customPurpose', e.target.value)}
                className="input-primary"
                placeholder="Please describe your loan purpose..."
                rows={3}
                required
                disabled={isSubmitting}
              />
            </motion.div>
          )}

          {/* Loan Preview */}
          {formState.amount && account.userReputation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-500/10 border border-secondary-400/30 rounded-xl p-4"
            >
              <h4 className="font-bold text-slate-200 mb-3 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Loan Preview
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Interest Rate:</span>
                  <span className="text-secondary-400 font-bold ml-2">
                    {calculateInterestRate(account.userReputation.trustScore)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Total Repayment:</span>
                  <span className="text-slate-200 font-bold ml-2">
                    ${(parseFloat(formState.amount) * (1 + calculateInterestRate(account.userReputation.trustScore) / 100)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Risk Score:</span>
                  <span className="text-warning-400 font-bold ml-2">
                    {calculateRiskScore(account.userReputation.trustScore)}/100
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Processing Time:</span>
                  <span className="text-slate-200 font-bold ml-2">2-4 hours</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary w-full flex items-center justify-center space-x-3 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5" />
                <span>Submit Loan Request</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Testnet Transaction Testing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-accent-500/10 to-warning-500/10 border border-accent-500/30 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-warning-500 rounded-lg flex items-center justify-center">
            <BeakerIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Real Testnet Transactions</h3>
            <p className="text-sm text-slate-300">Test actual XRPL functionality with live testnet blockchain</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* XRPL Connection Status */}
          <div className="bg-dark-800/60 rounded-lg p-4 border border-slate-600/30">
            <h4 className="font-medium text-white mb-3 flex items-center">
              <div className="w-2 h-2 bg-success-400 rounded-full mr-2 animate-pulse"></div>
              XRPL Connection Status
            </h4>
            <button
              onClick={async () => {
                const result = await testXRPLConnection();
                if (result.success) {
                  alert(`✅ XRPL Connected!\nNetwork: ${result.data?.network}\nLedger: ${result.data?.ledger_index}`);
                } else {
                  alert(`❌ Connection Failed: ${result.message}`);
                }
              }}
              className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Test Connection
            </button>
          </div>

          {/* Create New Testnet Wallet */}
          <div className="bg-dark-800/60 rounded-lg p-4 border border-slate-600/30">
            <h4 className="font-medium text-white mb-3">Create Funded Testnet Wallet</h4>
            <button
              onClick={async () => {
                try {
                  const result = await createTestnetFundedWallet();
                  const message = `🎉 New Wallet Created!\n\nAddress: ${result.wallet.address}\nFunded: ${result.funded ? 'Yes' : 'No'}\nBalance: ${result.balance || 0} XRP\n\n💡 Copy this address for testing!`;
                  alert(message);
                  console.log('New testnet wallet:', result);
                } catch (error) {
                  console.error('Failed to create wallet:', error);
                  alert('❌ Failed to create wallet. Check console for details.');
                }
              }}
              className="w-full px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Create & Fund Wallet
            </button>
          </div>

          {/* Real XRP Payment */}
          <div className="bg-dark-800/60 rounded-lg p-4 border border-slate-600/30 md:col-span-2">
            <h4 className="font-medium text-white mb-3">Send Real XRP Payment</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Destination Address</label>
                  <input
                    type="text"
                    placeholder="rXXXXXXXXXX... (e.g., rDdECVmwpkRo8FtY3ywCYhHX8VfuSAqghj)"
                    className="w-full px-3 py-2 bg-dark-700/90 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-primary-500 focus:bg-dark-600 transition-all text-sm"
                    id="toAddress"
                  />
                  <div className="mt-1 text-xs text-slate-500">
                    Quick fill: 
                    <button 
                      onClick={() => {
                        const input = document.getElementById('toAddress') as HTMLInputElement;
                        if (input) input.value = DEMO_TESTNET_WALLETS.lender1.address;
                      }}
                      className="ml-1 text-primary-400 hover:text-primary-300 underline"
                    >
                      Lender1
                    </button>
                    ,
                    <button 
                      onClick={() => {
                        const input = document.getElementById('toAddress') as HTMLInputElement;
                        if (input) input.value = DEMO_TESTNET_WALLETS.lender2.address;
                      }}
                      className="ml-1 text-primary-400 hover:text-primary-300 underline"
                    >
                      Lender2
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Amount (XRP)</label>
                  <input
                    type="number"
                    placeholder="e.g., 1.5"
                    step="0.000001"
                    min="0.000001"
                    max="1000"
                    className="w-full px-3 py-2 bg-dark-700/90 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-primary-500 focus:bg-dark-600 transition-all text-sm"
                    id="xrpAmount"
                  />
                  <div className="mt-1 text-xs text-slate-500">
                    Min: 0.000001 XRP, Max: 1000 XRP
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  const toAddressInput = document.getElementById('toAddress') as HTMLInputElement;
                  const amountInput = document.getElementById('xrpAmount') as HTMLInputElement;
                  
                  const toAddress = toAddressInput?.value?.trim();
                  const amount = amountInput?.value?.trim();
                  
                  if (!toAddress || !amount) {
                    alert('⚠️ Please enter both destination address and amount');
                    return;
                  }

                  // Additional client-side validation
                  if (!/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(toAddress)) {
                    alert('❌ Invalid XRPL address format. Address must start with "r" and be 25-34 characters long.');
                    return;
                  }

                  const amountNumber = parseFloat(amount);
                  if (isNaN(amountNumber) || amountNumber <= 0) {
                    alert('❌ Invalid amount. Must be a positive number.');
                    return;
                  }

                  if (amountNumber < 0.000001) {
                    alert('❌ Amount too small. Minimum is 0.000001 XRP.');
                    return;
                  }

                  if (amountNumber > 1000) {
                    alert('❌ Amount too large. Maximum is 1000 XRP for demo.');
                    return;
                  }

                  try {
                    // Use the first demo wallet as sender
                    const result = await sendRealXRPPayment(
                      DEMO_TESTNET_WALLETS.borrower1.seed,
                      toAddress,
                      amount,
                      'MicroLoanX Test Payment'
                    );
                    
                    if (result.success) {
                      const message = `🎉 Payment Successful!\n\nTransaction Hash: ${result.txHash}\nLedger Index: ${result.ledgerIndex}\n\n🔍 View on Explorer:\nhttps://testnet.xrpl.org/transactions/${result.txHash}`;
                      alert(message);
                      console.log('Payment result:', result);
                      
                      // Clear form on success
                      toAddressInput.value = '';
                      amountInput.value = '';
                    } else {
                      alert(`❌ Payment Failed: ${result.error}`);
                    }
                  } catch (error) {
                    console.error('Payment error:', error);
                    alert('❌ Payment failed. Check console for details.');
                  }
                }}
                className="w-full px-4 py-2 bg-warning-600 hover:bg-warning-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send XRP Payment
              </button>
            </div>
          </div>

          {/* Check Account Balance */}
          <div className="bg-dark-800/60 rounded-lg p-4 border border-slate-600/30">
            <h4 className="font-medium text-white mb-3">Check Account Balance</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="XRPL Address"
                className="w-full px-3 py-2 bg-dark-700/90 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-primary-500 focus:bg-dark-600 transition-all text-sm"
                id="balanceAddress"
              />
              <button
                onClick={async () => {
                  const address = (document.getElementById('balanceAddress') as HTMLInputElement)?.value;
                  
                  if (!address) {
                    alert('⚠️ Please enter an address');
                    return;
                  }

                  try {
                    const balance = await getAccountBalance(address);
                    const message = `💰 Account Balance\n\nAddress: ${address.slice(0, 12)}...${address.slice(-8)}\nXRP: ${balance.xrp.toFixed(6)}\nRLUSD: ${balance.rlusd.toFixed(2)}`;
                    alert(message);
                    console.log('Balance result:', balance);
                  } catch (error) {
                    console.error('Balance check error:', error);
                    alert('❌ Failed to check balance. Check console for details.');
                  }
                }}
                className="w-full px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Check Balance
              </button>
            </div>
          </div>
        </div>

        {/* Demo Wallet Info */}
        <div className="bg-dark-800/60 rounded-lg p-4 border border-slate-600/30">
          <h4 className="font-medium text-white mb-3">Demo Testnet Wallets</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(DEMO_TESTNET_WALLETS).map(([key, wallet]) => (
              <div key={key} className="text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
                  <span className="font-medium text-white">{wallet.name}</span>
                </div>
                <div className="font-mono text-xs text-slate-400 bg-dark-700/50 rounded px-2 py-1">
                  {wallet.address}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Loan History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-2" />
            Loan History
          </h2>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <CalendarIcon className="h-4 w-4" />
            <span>Last 30 days</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-400/20">
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Amount</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Purpose</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Rate</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Risk</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Created</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loanRequests.map((request, index) => {
                  const riskBadge = getRiskBadge(request.riskScore || 50);
                  return (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-slate-400/10 hover:bg-slate-400/5"
                    >
                      <td className="py-4 px-2">
                        <div className="font-bold text-slate-100">
                          ${request.amount.toLocaleString()} RLUSD
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="max-w-xs">
                          <p className="text-slate-200 font-medium truncate">{request.purpose}</p>
                          {request.tags && request.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {request.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-xs bg-secondary-500/20 text-secondary-300 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`status-badge status-${request.status.toLowerCase()} flex items-center space-x-2`}>
                          {getStatusIcon(request.status)}
                          <span>{request.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-secondary-400 font-medium">
                          {request.interestRate ? `${request.interestRate}%` : 'TBD'}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskBadge.color}`}>
                          {riskBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-slate-400 text-sm">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        {request.status === 'FUNDED' ? (
                          <motion.button
                            onClick={() => handleRepayLoan(request)}
                            disabled={repayingLoans.has(request.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              repayingLoans.has(request.id)
                                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                : 'bg-success-600 hover:bg-success-700 text-white hover:scale-105'
                            }`}
                            whileHover={!repayingLoans.has(request.id) ? { scale: 1.05 } : {}}
                            whileTap={!repayingLoans.has(request.id) ? { scale: 0.95 } : {}}
                          >
                            {repayingLoans.has(request.id) ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                                <span>Repaying...</span>
                              </div>
                            ) : (
                              '💰 Repay Loan'
                            )}
                          </motion.button>
                        ) : request.txHash ? (
                          <motion.a
                            href={getTestnetExplorerLink(request.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary-400 hover:text-secondary-300 text-sm font-medium"
                            whileHover={{ scale: 1.05 }}
                          >
                            View TX →
                          </motion.a>
                        ) : request.repaymentTxHash ? (
                          <motion.a
                            href={getTestnetExplorerLink(request.repaymentTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-success-400 hover:text-success-300 text-sm font-medium"
                            whileHover={{ scale: 1.05 }}
                          >
                            Repayment TX →
                          </motion.a>
                        ) : (
                          <span className="text-slate-500 text-sm">Pending</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {loanRequests.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No loan requests yet</p>
            <p className="text-slate-500">Create your first loan request to get started</p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 