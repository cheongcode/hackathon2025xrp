'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BanknotesIcon, 
  EyeIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAccount } from '@/lib/contexts/AccountContext';
import { LoanRequest, LoanStatus, MOCK_REPUTATION_SCORES } from '@/types';
import { createLoanEscrow, getAvailableLoanRequests, getUserEscrows, getTestnetExplorerLink } from '@/lib/xrpl/escrow';
import { Wallet } from 'xrpl';

// Filter and sort options
interface FilterOptions {
  riskLevel: 'all' | 'low' | 'medium' | 'high';
  amountRange: 'all' | 'small' | 'medium' | 'large';
  category: 'all' | 'education' | 'healthcare' | 'business' | 'agriculture' | 'emergency';
  sortBy: 'amount' | 'risk' | 'interest' | 'created';
  sortOrder: 'asc' | 'desc';
}

const initialFilters: FilterOptions = {
  riskLevel: 'all',
  amountRange: 'all',
  category: 'all',
  sortBy: 'created',
  sortOrder: 'desc',
};

// Mock available loans with more variety
const mockAvailableLoans: LoanRequest[] = [
  {
    id: 'loan-available-001',
    borrowerAddress: 'rF8h3K2mN9pQsE7Lj6vRxC4wY1zB5tG3Mp',
    borrowerDID: 'did:xrpl:F8h3K2mN:1704157200000',
    pseudonymousId: 'USER-F8H3234D',
    amount: 2000,
    currency: 'RLUSD',
    purpose: 'Agricultural equipment purchase',
    tags: ['#agriculture', '#business'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 1,
    interestRate: 7.5,
    repaymentPeriod: 45,
    riskScore: 85,
  },
  {
    id: 'loan-available-002',
    borrowerAddress: 'rB2mL9kE8vR3qT7sF1nC6pX5jA4hD9wZ8',
    borrowerDID: 'did:xrpl:B2mL9kE8:1704157200000',
    pseudonymousId: 'USER-B2ML567E',
    amount: 750,
    currency: 'RLUSD',
    purpose: 'University tuition fees',
    tags: ['#education'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 3,
    interestRate: 6.5,
    repaymentPeriod: 30,
    riskScore: 92,
  },
  {
    id: 'loan-available-003',
    borrowerAddress: 'rUn84CJowRBX4T9w7qjpDC8BreMnqZNYhh',
    borrowerDID: 'did:xrpl:Un84CJow:1704157200000',
    pseudonymousId: 'USER-UN84567A',
    amount: 1500,
    currency: 'RLUSD',
    purpose: 'Small business expansion',
    tags: ['#business'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 2,
    interestRate: 5.8,
    repaymentPeriod: 60,
    riskScore: 89,
  },
  {
    id: 'loan-available-004',
    borrowerAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    borrowerDID: 'did:xrpl:Hb9CJAWy:1704157200000',
    pseudonymousId: 'USER-HB9C1234',
    amount: 500,
    currency: 'RLUSD',
    purpose: 'Emergency medical treatment',
    tags: ['#healthcare', '#emergency'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 0.5,
    interestRate: 9.2,
    repaymentPeriod: 14,
    riskScore: 72,
  },
  {
    id: 'loan-available-005',
    borrowerAddress: 'rC3nY8vK9eM2pL4sD7qE5wT1xF6gH8jI0',
    borrowerDID: 'did:xrpl:C3nY8vK9:1704157200000',
    pseudonymousId: 'USER-C3NY890F',
    amount: 3000,
    currency: 'RLUSD',
    purpose: 'Climate tech startup funding',
    tags: ['#climateAid', '#business'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 5,
    interestRate: 8.8,
    repaymentPeriod: 90,
    riskScore: 78,
  },
];

export default function EnhancedLenderView() {
  const { account, updateUserBalance } = useAccount();
  
  // State management
  const [availableLoans, setAvailableLoans] = useState<LoanRequest[]>(mockAvailableLoans);
  const [fundedLoans, setFundedLoans] = useState<LoanRequest[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [fundingLoans, setFundingLoans] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);

  // Load mock funded loans
  useEffect(() => {
    if (account.currentUser) {
      const mockFundedLoans: LoanRequest[] = [
        {
          id: 'loan-funded-001',
          borrowerAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
          borrowerDID: 'did:xrpl:Hb9CJAWy:1704157200000',
          pseudonymousId: 'USER-HB9C1234',
          amount: 1000,
          currency: 'RLUSD',
          purpose: 'Medical emergency',
          tags: ['#healthcare', '#emergency'],
          status: 'FUNDED' as LoanStatus,
          createdAt: Date.now() - 86400000 * 10,
          fundedAt: Date.now() - 86400000 * 9,
          lenderAddress: account.currentUser.address,
          escrowId: 'escrow-mock-1234567890',
          txHash: 'TX1234567890ABCDEF1234567890ABCDEF12345678',
          interestRate: 8.5,
          repaymentPeriod: 21,
          riskScore: 72,
        },
        {
          id: 'loan-funded-002',
          borrowerAddress: 'rF8h3K2mN9pQsE7Lj6vRxC4wY1zB5tG3Mp',
          borrowerDID: 'did:xrpl:F8h3K2mN:1704157200000',
          pseudonymousId: 'USER-F8H3234D',
          amount: 2500,
          currency: 'RLUSD',
          purpose: 'Education loan',
          tags: ['#education'],
          status: 'REPAID' as LoanStatus,
          createdAt: Date.now() - 86400000 * 45,
          fundedAt: Date.now() - 86400000 * 44,
          repaidAt: Date.now() - 86400000 * 14,
          lenderAddress: account.currentUser.address,
          escrowId: 'escrow-mock-0987654321',
          txHash: 'TX0987654321FEDCBA0987654321FEDCBA87654321',
          repaymentTxHash: 'REPAY123456789ABCDEF123456789ABCDEF123456',
          interestRate: 7.2,
          repaymentPeriod: 30,
          riskScore: 89,
        },
      ];
      setFundedLoans(mockFundedLoans);
    }
  }, [account.currentUser]);

  // Memoized filtered and sorted loans for performance
  const filteredLoans = useMemo(() => {
    let filtered = availableLoans.filter(loan => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          loan.purpose.toLowerCase().includes(searchLower) ||
          loan.pseudonymousId?.toLowerCase().includes(searchLower) ||
          loan.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Risk level filter
      if (filters.riskLevel !== 'all') {
        const riskScore = loan.riskScore || 50;
        if (filters.riskLevel === 'low' && riskScore < 80) return false;
        if (filters.riskLevel === 'medium' && (riskScore < 60 || riskScore >= 80)) return false;
        if (filters.riskLevel === 'high' && riskScore >= 60) return false;
      }

      // Amount range filter
      if (filters.amountRange !== 'all') {
        if (filters.amountRange === 'small' && loan.amount >= 1000) return false;
        if (filters.amountRange === 'medium' && (loan.amount < 1000 || loan.amount >= 3000)) return false;
        if (filters.amountRange === 'large' && loan.amount < 3000) return false;
      }

      // Category filter
      if (filters.category !== 'all') {
        const categoryTag = `#${filters.category}`;
        if (!loan.tags?.includes(categoryTag)) return false;
      }

      return true;
    });

    // Sort loans
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'amount':
          compareValue = a.amount - b.amount;
          break;
        case 'risk':
          compareValue = (a.riskScore || 50) - (b.riskScore || 50);
          break;
        case 'interest':
          compareValue = (a.interestRate || 0) - (b.interestRate || 0);
          break;
        case 'created':
          compareValue = a.createdAt - b.createdAt;
          break;
      }

      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [availableLoans, filters, searchTerm]);

  // Portfolio analytics
  const portfolioMetrics = useMemo(() => {
    const totalFunded = fundedLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const activeLoans = fundedLoans.filter(loan => loan.status === 'FUNDED').length;
    const completedLoans = fundedLoans.filter(loan => loan.status === 'REPAID').length;
    const totalInterestEarned = fundedLoans
      .filter(loan => loan.status === 'REPAID')
      .reduce((sum, loan) => sum + (loan.amount * (loan.interestRate || 0) / 100), 0);
    
    const averageReturn = completedLoans > 0 ? totalInterestEarned / completedLoans : 0;
    const successRate = fundedLoans.length > 0 ? (completedLoans / fundedLoans.length) * 100 : 0;

    return {
      totalFunded,
      activeLoans,
      completedLoans,
      totalInterestEarned,
      averageReturn,
      successRate,
      portfolioValue: totalFunded + totalInterestEarned,
    };
  }, [fundedLoans]);

  const handleFundLoan = async (request: LoanRequest) => {
    if (!account.currentUser) return;
    
    setFundingLoans(prev => new Set(prev).add(request.id));

    try {
      const lenderWallet = new Wallet(account.currentUser.address, 'mock-secret');
      
      const loanMetadata = {
        purpose: request.purpose,
        borrowerDID: request.borrowerDID || 'unknown',
        pseudonymousId: request.pseudonymousId || 'unknown',
        tags: request.tags || [],
        requestedAmount: request.amount,
        currency: request.currency,
        repaymentPeriod: request.repaymentPeriod || 30,
        interestRate: request.interestRate || 8.0,
        riskScore: request.riskScore || 50,
        createdAt: request.createdAt,
      };

      const result = await createLoanEscrow(
        lenderWallet,
        request.borrowerAddress,
        request.amount,
        loanMetadata,
        request.repaymentPeriod || 30
      );

      if (result.success) {
        const fundedRequest: LoanRequest = {
          ...request,
          status: 'FUNDED' as LoanStatus,
          fundedAt: Date.now(),
          lenderAddress: account.currentUser.address,
          escrowId: result.escrowId,
          txHash: result.txHash,
        };

        // Update state
        setAvailableLoans(prev => prev.filter(loan => loan.id !== request.id));
        setFundedLoans(prev => [fundedRequest, ...prev]);
        
        // Update user balance
        updateUserBalance(-request.amount);
        
        setSuccessMessage(`Successfully funded $${request.amount.toLocaleString()} RLUSD loan!`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      } else {
        console.error('Failed to fund loan:', result.error);
      }

    } catch (error) {
      console.error('Error funding loan:', error);
    } finally {
      setFundingLoans(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const getBorrowerReputation = useCallback((borrowerDID: string) => {
    return MOCK_REPUTATION_SCORES.find(rep => rep.did === borrowerDID);
  }, []);

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-success-400';
    if (riskScore >= 60) return 'text-warning-400';
    return 'text-error-400';
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 80) return 'Low Risk';
    if (riskScore >= 60) return 'Medium Risk';
    return 'High Risk';
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

  if (!account.currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BanknotesIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">Please log in to access lender dashboard</p>
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
                <p className="text-success-200 font-bold">Loan Funded!</p>
                <p className="text-success-300 text-sm">{successMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Lender Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-success-500 to-secondary-500 rounded-full flex items-center justify-center">
                <BanknotesIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-100">{account.currentUser.name}</h3>
                <div className="space-y-1">
                  <p className="text-slate-400">Professional Lender</p>
                  <p className="text-slate-500 text-sm">Available Balance: ${account.availableBalance.toLocaleString()} RLUSD</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <ShieldCheckIcon className="h-4 w-4 text-success-400" />
                    <span className="text-success-400 text-sm font-medium">Verified Lender</span>
                    <StarIcon className="h-4 w-4 text-warning-400" />
                    <span className="text-warning-400 text-sm font-medium">Premium Member</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-50/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-slate-100">{fundedLoans.length}</p>
                <p className="text-slate-400 text-xs">Total Funded</p>
              </div>
              <div className="bg-dark-50/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-success-400">{portfolioMetrics.successRate.toFixed(1)}%</p>
                <p className="text-slate-400 text-xs">Success Rate</p>
              </div>
              <div className="bg-dark-50/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-slate-100">${portfolioMetrics.totalInterestEarned.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">Interest Earned</p>
              </div>
              <div className="bg-dark-50/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-secondary-400">{portfolioMetrics.activeLoans}</p>
                <p className="text-slate-400 text-xs">Active Loans</p>
              </div>
            </div>
          </div>

          {/* Portfolio Performance */}
          <div className="bg-gradient-to-br from-success-500/10 to-secondary-500/10 rounded-xl p-6 border border-success-400/20">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-slate-100 mb-2">
                ${portfolioMetrics.portfolioValue.toLocaleString()}
              </div>
              <p className="text-success-400 font-medium">Portfolio Value</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Funded:</span>
                <span className="text-slate-200 font-medium">${portfolioMetrics.totalFunded.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interest Earned:</span>
                <span className="text-success-400 font-medium">${portfolioMetrics.totalInterestEarned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Return:</span>
                <span className="text-secondary-400 font-medium">{portfolioMetrics.averageReturn.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Score:</span>
                <span className="text-warning-400 font-medium">Low</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="glass-card text-center">
          <CurrencyDollarIcon className="h-12 w-12 text-success-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">${portfolioMetrics.totalFunded.toLocaleString()}</p>
          <p className="text-slate-400 mt-2">Total Funded</p>
          <div className="flex items-center justify-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-success-400 mr-1" />
            <span className="text-success-400 text-sm">+24.3%</span>
          </div>
        </div>

        <div className="glass-card text-center">
          <BanknotesIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">{portfolioMetrics.activeLoans}</p>
          <p className="text-slate-400 mt-2">Active Loans</p>
          <div className="flex items-center justify-center mt-2">
            <ClockIcon className="h-4 w-4 text-warning-400 mr-1" />
            <span className="text-warning-400 text-sm">Processing</span>
          </div>
        </div>

        <div className="glass-card text-center">
          <ShieldCheckIcon className="h-12 w-12 text-accent-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">{portfolioMetrics.successRate.toFixed(1)}%</p>
          <p className="text-slate-400 mt-2">Success Rate</p>
          <div className="flex items-center justify-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-success-400 mr-1" />
            <span className="text-success-400 text-sm">Excellent</span>
          </div>
        </div>

        <div className="glass-card text-center">
          <ChartBarIcon className="h-12 w-12 text-warning-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">${portfolioMetrics.totalInterestEarned.toLocaleString()}</p>
          <p className="text-slate-400 mt-2">Interest Earned</p>
          <div className="flex items-center justify-center mt-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-success-400 mr-1" />
            <span className="text-success-400 text-sm">+8.2%</span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Loan Marketplace */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-secondary-400 mr-3" />
            <h2 className="text-2xl font-bold gradient-text">Loan Marketplace</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>{filteredLoans.length} opportunities</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by purpose, borrower ID, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-primary pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value as any }))}
              className="input-primary text-sm"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk (80+)</option>
              <option value="medium">Medium Risk (60-79)</option>
              <option value="high">High Risk (&lt;60)</option>
            </select>

            <select
              value={filters.amountRange}
              onChange={(e) => setFilters(prev => ({ ...prev, amountRange: e.target.value as any }))}
              className="input-primary text-sm"
            >
              <option value="all">All Amounts</option>
              <option value="small">Small (&lt;$1K)</option>
              <option value="medium">Medium ($1K-$3K)</option>
              <option value="large">Large (&gt;$3K)</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
              className="input-primary text-sm"
            >
              <option value="all">All Categories</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="business">Business</option>
              <option value="agriculture">Agriculture</option>
              <option value="emergency">Emergency</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="input-primary text-sm"
            >
              <option value="created">Created Date</option>
              <option value="amount">Amount</option>
              <option value="risk">Risk Score</option>
              <option value="interest">Interest Rate</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
              className="input-primary text-sm"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        
        {/* Loan Opportunities */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredLoans.map((request, index) => {
              const reputation = getBorrowerReputation(request.borrowerDID || '');
              const expectedReturn = request.amount * (1 + (request.interestRate || 8) / 100);
              
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass-effect border border-slate-400/20 rounded-xl p-6 hover:border-secondary-400/30 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Loan Details */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-slate-100 mb-2">{request.purpose}</h4>
                          <div className="flex items-center space-x-3 mb-3">
                            <UserIcon className="h-4 w-4 text-slate-400" />
                            <span className="font-mono text-sm text-slate-300">
                              {request.pseudonymousId}
                            </span>
                            {reputation && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                reputation.trustScore >= 80 
                                  ? 'bg-success-500/20 text-success-400'
                                  : reputation.trustScore >= 60
                                  ? 'bg-warning-500/20 text-warning-400'
                                  : 'bg-error-500/20 text-error-400'
                              }`}>
                                Trust: {reputation.trustScore}/100
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {request.tags?.map((tag, i) => (
                              <span key={i} className="text-xs bg-secondary-500/20 text-secondary-300 px-3 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-success-400">${request.amount.toLocaleString()}</p>
                          <p className="text-slate-400 text-sm">RLUSD</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Interest Rate:</span>
                          <span className="text-secondary-400 font-bold ml-2">{request.interestRate}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Period:</span>
                          <span className="text-slate-200 font-bold ml-2">{request.repaymentPeriod}d</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Risk Score:</span>
                          <span className={`${getRiskColor(request.riskScore || 50)} font-bold ml-2`}>
                            {request.riskScore}/100 ({getRiskLabel(request.riskScore || 50)})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Created:</span>
                          <span className="text-slate-200 font-bold ml-2">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Borrower Info */}
                    {reputation && (
                      <div className="bg-dark-50/30 rounded-lg p-4">
                        <h5 className="text-sm font-bold text-slate-200 mb-3">Borrower Profile</h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Loans:</span>
                            <span className="text-slate-200 font-medium">{reputation.totalLoans}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Success Rate:</span>
                            <span className="text-success-400 font-medium">
                              {Math.round((reputation.successfulRepayments / reputation.totalLoans) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Avg Repayment:</span>
                            <span className="text-slate-200 font-medium">{reputation.averageRepaymentTime}d</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Verification:</span>
                            <span className="text-secondary-400 font-medium capitalize">{reputation.verificationLevel}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Area */}
                    <div className="flex flex-col justify-center">
                      <div className="mb-4 text-center">
                        <p className="text-sm text-slate-400 mb-1">Expected Return</p>
                        <p className="text-2xl font-bold text-success-400">
                          ${expectedReturn.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Profit: ${(expectedReturn - request.amount).toLocaleString()}
                        </p>
                      </div>
                      
                      <motion.button
                        onClick={() => handleFundLoan(request)}
                        disabled={fundingLoans.has(request.id) || account.availableBalance < request.amount}
                        className={`btn-accent w-full flex items-center justify-center space-x-2 ${
                          fundingLoans.has(request.id) || account.availableBalance < request.amount
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                        whileHover={!fundingLoans.has(request.id) && account.availableBalance >= request.amount ? { scale: 1.02 } : {}}
                        whileTap={!fundingLoans.has(request.id) && account.availableBalance >= request.amount ? { scale: 0.98 } : {}}
                      >
                        {fundingLoans.has(request.id) ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Funding...</span>
                          </>
                        ) : account.availableBalance < request.amount ? (
                          <>
                            <XCircleIcon className="h-5 w-5" />
                            <span>Insufficient Balance</span>
                          </>
                        ) : (
                          <>
                            <BanknotesIcon className="h-5 w-5" />
                            <span>Fund Loan</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredLoans.length === 0 && (
          <div className="text-center py-12">
            <EyeIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No loans match your criteria</p>
            <p className="text-slate-500">Try adjusting your filters to see more opportunities</p>
          </div>
        )}
      </motion.div>

      {/* Enhanced Portfolio Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-2" />
            Investment Portfolio
          </h2>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <CalendarIcon className="h-4 w-4" />
            <span>All time</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-400/20">
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Borrower</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Amount</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Purpose</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Interest</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Return</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Funded Date</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Transaction</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {fundedLoans.map((request, index) => {
                  const expectedReturn = request.amount * (1 + (request.interestRate || 0) / 100);
                  const profit = expectedReturn - request.amount;
                  
                  return (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-400/10 hover:bg-slate-400/5"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-5 w-5 text-slate-400" />
                          <span className="font-mono text-sm text-slate-200">
                            {request.pseudonymousId || `${request.borrowerAddress.slice(0, 6)}...${request.borrowerAddress.slice(-4)}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="font-bold text-success-400 text-lg">
                          ${request.amount.toLocaleString()}
                        </span>
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
                        <span className="text-secondary-400 font-bold">
                          {request.interestRate}%
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-sm">
                          <p className="text-slate-200 font-medium">${expectedReturn.toLocaleString()}</p>
                          <p className={`text-xs ${profit > 0 ? 'text-success-400' : 'text-slate-500'}`}>
                            +${profit.toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-slate-400 text-sm">
                          {request.fundedAt ? new Date(request.fundedAt).toLocaleDateString() : '-'}
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

        {fundedLoans.length === 0 && (
          <div className="text-center py-12">
            <BanknotesIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No funded loans yet</p>
            <p className="text-slate-500">Start funding loans to build your portfolio</p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 