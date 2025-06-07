'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@/lib/contexts/AccountContext';
import Navbar from '@/components/layout/Navbar';
import EnhancedBorrowerView from '@/components/borrower/EnhancedBorrowerView';
import EnhancedLenderView from '@/components/lender/EnhancedLenderView';
import { SparklesIcon, CurrencyDollarIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const platformStats = [
  { id: 1, name: 'Total Loans Funded', value: '$2.4M', icon: CurrencyDollarIcon, color: 'text-success-400', trend: '+24.3%' },
  { id: 2, name: 'Active Borrowers', value: '1,247', icon: UserGroupIcon, color: 'text-secondary-400', trend: '+18.2%' },
  { id: 3, name: 'Success Rate', value: '98.5%', icon: ShieldCheckIcon, color: 'text-accent-400', trend: '+2.1%' },
];

export default function Home() {
  const { account } = useAccount();

  if (account.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 text-primary-400 animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Initializing MicroLoanX</h2>
          <p className="text-slate-400 mb-4">Connecting to XRP Ledger...</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!account.currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <SparklesIcon className="h-16 w-16 text-secondary-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold gradient-text mb-4">Welcome to MicroLoanX</h2>
          <p className="text-slate-400 mb-6">
            The next-generation decentralized lending platform powered by XRP Ledger
          </p>
          <div className="glass-card p-6">
            <p className="text-slate-300 text-sm">
              System initializing... Please wait while we set up your account.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-4">
        {/* Hero Section - Only show on first load or when appropriate */}
        {account.viewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
          >
            {/* Welcome Banner */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-3 mb-4"
              >
                <SparklesIcon className="h-8 w-8 text-secondary-400" />
                <h1 className="text-4xl md:text-5xl font-bold gradient-text">
                  Welcome back, {account.currentUser.name}
                </h1>
                <SparklesIcon className="h-8 w-8 text-accent-400" />
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-slate-300 max-w-2xl mx-auto"
              >
                {account.viewMode === 'borrower' 
                  ? 'Access capital for your projects with transparent, decentralized loans'
                  : 'Generate returns by funding vetted loan opportunities on the blockchain'
                }
              </motion.p>
            </div>

            {/* Platform Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {platformStats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="glass-card text-center hover:scale-105 transition-transform duration-300 group"
                >
                  <div className="flex items-center justify-center mb-4">
                    <stat.icon className={`h-10 w-10 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <p className="text-3xl font-bold text-slate-100 mb-1">{stat.value}</p>
                  <p className="text-slate-400 text-sm mb-2">{stat.name}</p>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-success-400 text-xs font-medium">{stat.trend}</span>
                    <span className="text-slate-500 text-xs">this month</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {account.viewMode === 'borrower' ? (
              <EnhancedBorrowerView />
            ) : (
              <EnhancedLenderView />
            )}
          </motion.div>
        </div>
      </main>

      {/* Error Handling */}
      {account.error && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed bottom-4 right-4 z-50 glass-card border-error-400/30 bg-error-500/10 max-w-sm"
        >
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-error-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <p className="text-error-200 font-bold text-sm">Error</p>
                <p className="text-error-300 text-sm">{account.error}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
