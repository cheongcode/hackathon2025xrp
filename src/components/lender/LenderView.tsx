'use client';

import { useState, useEffect } from 'react';
import { User, LoanRequest, LoanStatus, MOCK_REPUTATION_SCORES } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BanknotesIcon, 
  EyeIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { createLoanEscrow, getAvailableLoanRequests, getUserEscrows, getTestnetExplorerLink } from '@/lib/xrpl/escrow';
import { Wallet } from 'xrpl';

interface LenderViewProps {
  user: User;
}

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
    createdAt: Date.now() - 86400000 * 1, // 1 day ago
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
    purpose: 'Education - university fees',
    tags: ['#education'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
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
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    interestRate: 5.8,
    repaymentPeriod: 60,
    riskScore: 89,
  },
];

export default function LenderView({ user }: LenderViewProps) {
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
      createdAt: Date.now() - 86400000 * 10, // 10 days ago
      fundedAt: Date.now() - 86400000 * 9, // 9 days ago
      lenderAddress: user.address,
      escrowId: 'escrow-mock-1234567890',
      txHash: 'TX1234567890ABCDEF1234567890ABCDEF12345678',
      interestRate: 8.5,
      repaymentPeriod: 21,
      riskScore: 72,
    },
  ];

  const [availableLoans, setAvailableLoans] = useState<LoanRequest[]>(mockAvailableLoans);
  const [fundedLoans, setFundedLoans] = useState<LoanRequest[]>(mockFundedLoans);
  const [mounted, setMounted] = useState(false);
  const [fundingLoans, setFundingLoans] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Load user's funded loans (escrows)
    const userEscrows = getUserEscrows(user.address);
    console.log('User funded loans:', userEscrows);
  }, [user]);

  if (!mounted) {
    return null;
  }

  const handleFundLoan = async (request: LoanRequest) => {
    setFundingLoans(prev => new Set(prev).add(request.id));

    try {
      // Create a mock wallet for the lender
      const lenderWallet = new Wallet(user.address, 'mock-secret');
      
      // Create loan metadata
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

      // Simulate XRPL escrow creation
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
          lenderAddress: user.address,
          escrowId: result.escrowId,
          txHash: result.txHash,
        };

        setAvailableLoans(prev => prev.filter(loan => loan.id !== request.id));
        setFundedLoans(prev => [fundedRequest, ...prev]);
        
        setSuccessMessage(`Successfully funded $${request.amount} RLUSD loan!`);
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

  const getStatusIcon = (status: LoanStatus) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-5 w-5" />;
      case 'FUNDED':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'REPAID':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'DEFAULTED':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getBorrowerReputation = (borrowerDID: string) => {
    return MOCK_REPUTATION_SCORES.find(rep => rep.did === borrowerDID);
  };

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

  const totalFunded = fundedLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const activeFunded = fundedLoans.filter(loan => loan.status === 'FUNDED').length;

  return (
    <div className="space-y-10">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 glass-card border-success-400/30 bg-success-500/10"
          >
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-success-400" />
              <span className="text-success-200 font-bold">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lender Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <BanknotesIcon className="h-12 w-12 text-secondary-400" />
            <div>
              <h3 className="text-2xl font-bold text-slate-100">{user.name}</h3>
              <p className="text-slate-400">Professional Lender</p>
              <p className="text-slate-500 text-sm">Available Balance: ${user.balance?.toLocaleString() || '0'} RLUSD</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheckIcon className="h-6 w-6 text-success-400" />
              <span className="text-xl font-bold text-slate-100">100%</span>
            </div>
            <p className="text-slate-400 text-sm">Success Rate</p>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="glass-card text-center">
          <CurrencyDollarIcon className="h-12 w-12 text-success-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">${totalFunded.toLocaleString()}</p>
          <p className="text-base text-slate-400 mt-2">Total Funded</p>
        </div>
        <div className="glass-card text-center">
          <BanknotesIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">{activeFunded}</p>
          <p className="text-base text-slate-400 mt-2">Active Loans</p>
        </div>
        <div className="glass-card text-center">
          <ShieldCheckIcon className="h-12 w-12 text-accent-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">100%</p>
          <p className="text-base text-slate-400 mt-2">Success Rate</p>
        </div>
      </motion.div>

      {/* Available Loan Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex items-center mb-8">
          <EyeIcon className="h-8 w-8 text-secondary-400 mr-3" />
          <h2 className="text-3xl font-bold gradient-text">
            🔍 Available Loan Opportunities
          </h2>
        </div>
        
        <div className="grid gap-6">
          <AnimatePresence>
            {availableLoans.map((request, index) => {
              const reputation = getBorrowerReputation(request.borrowerDID || '');
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="glass-effect border border-slate-400/20 rounded-xl p-6 hover:border-secondary-400/30 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Loan Details */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-slate-100 mb-2">{request.purpose}</h4>
                          <div className="flex items-center space-x-3 mb-3">
                            <UserIcon className="h-4 w-4 text-slate-400" />
                            <span className="font-mono text-sm text-slate-300">
                              {request.pseudonymousId}
                            </span>
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

                      {/* Borrower Reputation */}
                      {reputation && (
                        <div className="mt-4 p-4 bg-secondary-500/10 border border-secondary-400/20 rounded-lg">
                          <h5 className="text-sm font-bold text-slate-200 mb-2">Borrower Reputation</h5>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400">Trust Score:</span>
                              <span className="text-secondary-400 font-bold ml-1">{reputation.trustScore}/100</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Total Loans:</span>
                              <span className="text-slate-200 font-bold ml-1">{reputation.totalLoans}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Success Rate:</span>
                              <span className="text-success-400 font-bold ml-1">
                                {Math.round((reputation.successfulRepayments / reputation.totalLoans) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col justify-center items-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFundLoan(request)}
                        disabled={fundingLoans.has(request.id)}
                        className={`btn-accent w-full flex items-center justify-center space-x-2 ${
                          fundingLoans.has(request.id) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {fundingLoans.has(request.id) ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Funding...</span>
                          </>
                        ) : (
                          <>
                            <BanknotesIcon className="h-5 w-5" />
                            <span>Fund Loan</span>
                          </>
                        )}
                      </motion.button>
                      
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Expected Return: ${(request.amount * (1 + (request.interestRate || 8) / 100)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Your Funded Loans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card"
      >
        <div className="flex items-center mb-8">
          <BanknotesIcon className="h-8 w-8 text-success-400 mr-3" />
          <h2 className="text-3xl font-bold gradient-text">
            💼 Your Investment Portfolio
          </h2>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Interest</th>
                <th>Funded Date</th>
                <th>Transaction</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {fundedLoans.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-secondary-500/10"
                  >
                    <td className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                      <span className="font-mono text-base text-slate-200">
                        {request.pseudonymousId || `${request.borrowerAddress.slice(0, 6)}...${request.borrowerAddress.slice(-4)}`}
                      </span>
                    </td>
                    <td className="font-bold text-success-400 text-lg">
                      ${request.amount.toLocaleString()} RLUSD
                    </td>
                    <td>
                      <div className="max-w-xs truncate text-slate-200">{request.purpose}</div>
                      {request.tags && request.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {request.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-xs bg-secondary-500/20 text-secondary-300 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`status-badge status-${request.status.toLowerCase()} flex items-center space-x-2`}
                      >
                        {getStatusIcon(request.status)}
                        <span>{request.status}</span>
                      </motion.span>
                    </td>
                    <td className="text-secondary-400 font-bold">
                      {request.interestRate}%
                    </td>
                    <td className="text-slate-400">
                      {request.fundedAt ? new Date(request.fundedAt).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      {request.txHash ? (
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          href={getTestnetExplorerLink(request.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-secondary-400 hover:text-secondary-300 transition-colors text-base font-medium"
                        >
                          <span>View TX</span>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </motion.a>
                      ) : (
                        <span className="text-slate-500 text-sm">Pending</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
} 