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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAccount } from '@/lib/contexts/AccountContext';
import { LoanRequest, LoanStatus, LOAN_CATEGORIES, ReputationScore } from '@/types';
import { createLoanRequest, getReputationScore, getUserEscrows, getTestnetExplorerLink } from '@/lib/xrpl/escrow';
import { generateMockDID, generatePseudonymousId, formatCurrency } from '@/lib/xrpl/client';

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
  const { account, updateUserBalance, refreshAccountData } = useAccount();
  
  // Optimized state management
  const [formState, setFormState] = useState<LoanFormState>(initialFormState);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalRequests: 0,
    approvalRate: 0,
    averageAmount: 0,
    pendingAmount: 0,
    creditUtilization: 0
  });

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

  // Interest rate calculation with caching
  const calculateInterestRate = useCallback((trustScore: number): number => {
    const baseRate = 12.0;
    const discount = (trustScore / 100) * 4;
    return Math.round((baseRate - discount) * 10) / 10;
  }, []);

  const calculateRiskScore = useCallback((trustScore: number): number => {
    return Math.min(100, Math.max(20, trustScore + Math.random() * 20 - 10));
  }, []);

  // Load user data on mount and user change
  useEffect(() => {
    if (account.currentUser) {
      loadUserLoanHistory();
    }
  }, [account.currentUser]);

  const loadUserLoanHistory = async () => {
    if (!account.currentUser) return;
    
    try {
      // In a real app, this would fetch from API
      const userEscrows = getUserEscrows(account.currentUser.address);
      
      // Mock loan requests for demo
      const mockRequests: LoanRequest[] = [
        {
          id: 'loan-001',
          borrowerAddress: account.currentUser.address,
          borrowerDID: account.currentUser.did,
          pseudonymousId: account.currentUser.pseudonymousId,
          amount: 1000,
          currency: 'RLUSD',
          purpose: 'Small business expansion',
          tags: ['#business'],
          status: 'FUNDED' as LoanStatus,
          createdAt: Date.now() - 86400000 * 10,
          fundedAt: Date.now() - 86400000 * 9,
          interestRate: 8.5,
          repaymentPeriod: 30,
          riskScore: 75,
          txHash: 'TX1234567890ABCDEF',
        },
        {
          id: 'loan-002',
          borrowerAddress: account.currentUser.address,
          borrowerDID: account.currentUser.did,
          pseudonymousId: account.currentUser.pseudonymousId,
          amount: 500,
          currency: 'RLUSD',
          purpose: 'Emergency medical expenses',
          tags: ['#healthcare', '#emergency'],
          status: 'PENDING' as LoanStatus,
          createdAt: Date.now() - 86400000 * 2,
          interestRate: 9.0,
          repaymentPeriod: 21,
          riskScore: 65,
        },
      ];
      
      setLoanRequests(mockRequests);
    } catch (error) {
      console.error('Failed to load loan history:', error);
    }
  };

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
      
      const loanMetadata = {
        purpose: finalPurpose,
        borrowerDID: userDID,
        pseudonymousId: pseudonymousId,
        tags: formState.selectedTags,
        requestedAmount: parseFloat(formState.amount),
        currency: 'RLUSD',
        repaymentPeriod: parseInt(formState.repaymentPeriod),
        interestRate: calculateInterestRate(trustScore),
        riskScore: calculateRiskScore(trustScore),
        createdAt: Date.now(),
      };

      const requestId = createLoanRequest(loanMetadata);

      const newRequest: LoanRequest = {
        id: requestId,
        borrowerAddress: account.currentUser.address,
        borrowerDID: userDID,
        pseudonymousId: pseudonymousId,
        amount: parseFloat(formState.amount),
        currency: 'RLUSD',
        purpose: finalPurpose,
        tags: formState.selectedTags,
        status: 'PENDING' as LoanStatus,
        createdAt: Date.now(),
        interestRate: loanMetadata.interestRate,
        repaymentPeriod: parseInt(formState.repaymentPeriod),
        riskScore: loanMetadata.riskScore,
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
                        {request.txHash ? (
                          <motion.a
                            href={getTestnetExplorerLink(request.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary-400 hover:text-secondary-300 text-sm font-medium"
                            whileHover={{ scale: 1.05 }}
                          >
                            View TX →
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