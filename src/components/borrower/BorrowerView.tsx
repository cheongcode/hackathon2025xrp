'use client';

import { useState, useEffect } from 'react';
import { User, LoanRequest, LoanStatus, LOAN_CATEGORIES, ReputationScore } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, CurrencyDollarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { createLoanRequest, getReputationScore, getUserEscrows, getTestnetExplorerLink } from '@/lib/xrpl/escrow';
import { generateMockDID, generatePseudonymousId, formatCurrency } from '@/lib/xrpl/client';

interface BorrowerViewProps {
  user: User;
}

const mockInitialRequests: LoanRequest[] = [
  {
    id: 'loan-001',
    borrowerAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    borrowerDID: 'did:xrpl:Hb9CJAWy:1704157200000',
    pseudonymousId: 'USER-HB9C1234',
    amount: 1000,
    currency: 'RLUSD',
    purpose: 'Small business expansion - inventory purchase',
    tags: ['#business'],
    status: 'FUNDED' as LoanStatus,
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    fundedAt: Date.now() - 86400000 * 4, // 4 days ago
    interestRate: 8.5,
    repaymentPeriod: 30,
    riskScore: 75,
    txHash: '1234567890ABCDEF1234567890ABCDEF12345678',
  },
  {
    id: 'loan-002',
    borrowerAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    borrowerDID: 'did:xrpl:Hb9CJAWy:1704157200000',
    pseudonymousId: 'USER-HB9C1234',
    amount: 500,
    currency: 'RLUSD',
    purpose: 'Emergency medical expenses',
    tags: ['#healthcare', '#emergency'],
    status: 'PENDING' as LoanStatus,
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    interestRate: 9.0,
    repaymentPeriod: 21,
    riskScore: 65,
  },
];

export default function BorrowerView({ user }: BorrowerViewProps) {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [repaymentPeriod, setRepaymentPeriod] = useState('30');
  const [customPurpose, setCustomPurpose] = useState('');
  
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>(mockInitialRequests);
  const [userReputation, setUserReputation] = useState<ReputationScore | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load user reputation if DID exists
    if (user.did) {
      const reputation = getReputationScore(user.did);
      if (reputation) {
        setUserReputation(reputation);
      }
    }
    
    // Load user's existing escrows
    const userEscrows = getUserEscrows(user.address);
    console.log('User escrows:', userEscrows);
  }, [user]);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate DID if user doesn't have one
      const userDID = user.did || generateMockDID(user.address).id;
      const pseudonymousId = user.pseudonymousId || generatePseudonymousId(userDID);
      
      // Determine final purpose
      const finalPurpose = purpose === 'other' ? customPurpose : purpose;
      
      // Create loan metadata
      const loanMetadata = {
        purpose: finalPurpose,
        borrowerDID: userDID,
        pseudonymousId: pseudonymousId,
        tags: selectedTags,
        requestedAmount: parseFloat(amount),
        currency: 'RLUSD',
        repaymentPeriod: parseInt(repaymentPeriod),
        interestRate: calculateInterestRate(userReputation?.trustScore || 50),
        riskScore: calculateRiskScore(userReputation?.trustScore || 50),
        createdAt: Date.now(),
      };

      // Create loan request
      const requestId = createLoanRequest(loanMetadata);

      const newRequest: LoanRequest = {
        id: requestId,
        borrowerAddress: user.address,
        borrowerDID: userDID,
        pseudonymousId: pseudonymousId,
        amount: parseFloat(amount),
        currency: 'RLUSD',
        purpose: finalPurpose,
        tags: selectedTags,
        status: 'PENDING' as LoanStatus,
        createdAt: Date.now(),
        interestRate: loanMetadata.interestRate,
        repaymentPeriod: parseInt(repaymentPeriod),
        riskScore: loanMetadata.riskScore,
      };
      
      setLoanRequests([newRequest, ...loanRequests]);
      
      // Reset form
      setAmount('');
      setPurpose('');
      setSelectedTags([]);
      setRepaymentPeriod('30');
      setCustomPurpose('');
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      
    } catch (error) {
      console.error('Error creating loan request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateInterestRate = (trustScore: number): number => {
    // Higher trust score = lower interest rate
    const baseRate = 12.0;
    const discount = (trustScore / 100) * 4; // Up to 4% discount
    return Math.round((baseRate - discount) * 10) / 10;
  };

  const calculateRiskScore = (trustScore: number): number => {
    return Math.min(100, Math.max(20, trustScore + Math.random() * 20 - 10));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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

  const totalBorrowed = loanRequests
    .filter(req => req.status === 'FUNDED' || req.status === 'REPAID')
    .reduce((sum, req) => sum + req.amount, 0);

  const pendingAmount = loanRequests
    .filter(req => req.status === 'PENDING')
    .reduce((sum, req) => sum + req.amount, 0);

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
              <span className="text-success-200 font-bold">Loan request submitted successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile & Reputation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <UserIcon className="h-12 w-12 text-secondary-400" />
            <div>
              <h3 className="text-2xl font-bold text-slate-100">{user.name}</h3>
              <p className="text-slate-400">Pseudonymous ID: {user.pseudonymousId || 'Generating...'}</p>
              <p className="text-slate-500 text-sm">DID: {user.did ? `${user.did.slice(0, 25)}...` : 'Not generated'}</p>
            </div>
          </div>
          
          {userReputation && (
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <ShieldCheckIcon className="h-6 w-6 text-secondary-400" />
                <span className="text-xl font-bold text-slate-100">{userReputation.trustScore}/100</span>
              </div>
              <p className="text-slate-400 text-sm">Trust Score</p>
              <div className="w-32 bg-dark-100 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-secondary-500 to-accent-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${userReputation.trustScore}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Reputation Breakdown */}
        {userReputation && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-100">{userReputation.totalLoans}</p>
              <p className="text-slate-400 text-sm">Total Loans</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-400">{userReputation.successfulRepayments}</p>
              <p className="text-slate-400 text-sm">Successful</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-100">{userReputation.averageRepaymentTime}d</p>
              <p className="text-slate-400 text-sm">Avg Repayment</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-400">{userReputation.verificationLevel}</p>
              <p className="text-slate-400 text-sm">Verification</p>
            </div>
          </div>
        )}
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
          <p className="text-3xl font-bold text-slate-100">{formatCurrency(totalBorrowed, 'RLUSD')}</p>
          <p className="text-base text-slate-400 mt-2">Total Borrowed</p>
        </div>
        <div className="glass-card text-center">
          <ClockIcon className="h-12 w-12 text-warning-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">{formatCurrency(pendingAmount, 'RLUSD')}</p>
          <p className="text-base text-slate-400 mt-2">Pending Requests</p>
        </div>
        <div className="glass-card text-center">
          <CheckCircleIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-slate-100">{loanRequests.length}</p>
          <p className="text-base text-slate-400 mt-2">Total Requests</p>
        </div>
      </motion.div>

      {/* Create Loan Request Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex items-center mb-8">
          <PlusIcon className="h-8 w-8 text-secondary-400 mr-3" />
          <h2 className="text-3xl font-bold gradient-text">
            Create New Loan Request
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="amount" className="block text-lg font-bold text-slate-200 mb-3">
                💰 Amount (RLUSD)
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-primary"
                placeholder="e.g., 1000"
                min="10"
                max="25000"
                step="1"
                required
                disabled={isSubmitting}
              />
              <p className="text-sm text-slate-500 mt-2">Minimum: $10 RLUSD, Maximum: $25,000 RLUSD</p>
            </div>
            
            <div>
              <label htmlFor="repaymentPeriod" className="block text-lg font-bold text-slate-200 mb-3">
                📅 Repayment Period
              </label>
              <motion.select
                whileFocus={{ scale: 1.02 }}
                value={repaymentPeriod}
                onChange={(e) => setRepaymentPeriod(e.target.value)}
                className="input-primary"
                required
                disabled={isSubmitting}
              >
                <option value="7" className="bg-dark-100 text-slate-300">7 days</option>
                <option value="14" className="bg-dark-100 text-slate-300">14 days</option>
                <option value="21" className="bg-dark-100 text-slate-300">21 days</option>
                <option value="30" className="bg-dark-100 text-slate-300">30 days</option>
                <option value="45" className="bg-dark-100 text-slate-300">45 days</option>
                <option value="60" className="bg-dark-100 text-slate-300">60 days</option>
              </motion.select>
            </div>
          </div>

          <div>
            <label htmlFor="purpose" className="block text-lg font-bold text-slate-200 mb-3">
              📝 Purpose Category
            </label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="input-primary"
              required
              disabled={isSubmitting}
            >
              <option value="" className="bg-dark-100 text-slate-300">Select purpose category...</option>
              {LOAN_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value} className="bg-dark-100 text-slate-300">
                  {category.label} {category.tag}
                </option>
              ))}
            </motion.select>
          </div>

          {/* Tags Selection */}
          <div>
            <label className="block text-lg font-bold text-slate-200 mb-3">
              🏷️ Additional Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-3">
              {LOAN_CATEGORIES.map((category) => (
                <motion.button
                  key={category.tag}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTagToggle(category.tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedTags.includes(category.tag)
                      ? `${category.color} text-white`
                      : 'bg-dark-50/30 text-slate-400 hover:bg-dark-50/50'
                  }`}
                  disabled={isSubmitting}
                >
                  {category.tag}
                </motion.button>
              ))}
            </div>
          </div>
          
          {purpose === 'other' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label htmlFor="customPurpose" className="block text-lg font-bold text-slate-200 mb-3">
                📋 Describe your purpose
              </label>
              <textarea
                id="customPurpose"
                value={customPurpose}
                onChange={(e) => setCustomPurpose(e.target.value)}
                className="input-primary"
                placeholder="Please describe the purpose of your loan..."
                rows={3}
                required
                disabled={isSubmitting}
              />
            </motion.div>
          )}

          {/* Interest Rate Preview */}
          {amount && userReputation && (
            <div className="bg-secondary-500/10 border border-secondary-400/30 rounded-xl p-6">
              <h4 className="text-lg font-bold text-slate-200 mb-2">💡 Loan Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Estimated Interest Rate:</span>
                  <span className="text-secondary-400 font-bold ml-2">{calculateInterestRate(userReputation.trustScore)}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Risk Score:</span>
                  <span className="text-warning-400 font-bold ml-2">{calculateRiskScore(userReputation.trustScore)}/100</span>
                </div>
              </div>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary w-full flex items-center justify-center space-x-3 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <PlusIcon className="h-6 w-6" />
                <span>Submit Loan Request</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Loan Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card"
      >
        <h2 className="text-3xl font-bold gradient-text mb-8 flex items-center">
          📊 Your Loan Requests
        </h2>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Interest Rate</th>
                <th>Period</th>
                <th>Created</th>
                <th>Transaction</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loanRequests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-secondary-500/10"
                  >
                    <td className="font-bold text-slate-100">
                      {formatCurrency(request.amount, request.currency)}
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
                    <td className="text-slate-200">
                      {request.interestRate ? `${request.interestRate}%` : 'TBD'}
                    </td>
                    <td className="text-slate-200">
                      {request.repaymentPeriod ? `${request.repaymentPeriod}d` : 'TBD'}
                    </td>
                    <td className="text-slate-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {request.txHash ? (
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          href={getTestnetExplorerLink(request.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-secondary-400 hover:text-secondary-300 transition-colors text-sm"
                        >
                          <span>View TX</span>
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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