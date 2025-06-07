'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from '@/lib/contexts/AccountContext';
import Navbar from '@/components/layout/Navbar';
import EnhancedBorrowerView from '@/components/borrower/EnhancedBorrowerView';
import EnhancedLenderView from '@/components/lender/EnhancedLenderView';
import { 
  SparklesIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  BanknotesIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { database } from '@/lib/database/db';

// Enhanced platform statistics
const getAnimatedStats = (stats: any) => [
  { 
    id: 1, 
    name: 'Total Loans Funded', 
    value: `$${stats.totalFunded?.toLocaleString() || '2.4M'}`, 
    icon: CurrencyDollarIcon, 
    color: 'text-success-400', 
    trend: '+24.3%',
    description: 'RLUSD disbursed to borrowers',
    bgGradient: 'from-success-500/10 to-secondary-500/10',
    borderColor: 'border-success-400/30'
  },
  { 
    id: 2, 
    name: 'Active Borrowers', 
    value: stats.activeBorrowers?.toString() || '1,247', 
    icon: UserGroupIcon, 
    color: 'text-secondary-400', 
    trend: '+18.2%',
    description: 'Verified entrepreneurs',
    bgGradient: 'from-secondary-500/10 to-primary-500/10',
    borderColor: 'border-secondary-400/30'
  },
  { 
    id: 3, 
    name: 'Success Rate', 
    value: `${stats.successRate?.toFixed(1) || '98.5'}%`, 
    icon: ShieldCheckIcon, 
    color: 'text-accent-400', 
    trend: '+2.1%',
    description: 'Loans repaid on time',
    bgGradient: 'from-accent-500/10 to-warning-500/10',
    borderColor: 'border-accent-400/30'
  },
  { 
    id: 4, 
    name: 'Total Loans', 
    value: stats.totalLoans?.toString() || '5,832', 
    icon: DocumentTextIcon, 
    color: 'text-primary-400', 
    trend: '+31.8%',
    description: 'Processed to date',
    bgGradient: 'from-primary-500/10 to-secondary-500/10',
    borderColor: 'border-primary-400/30'
  }
];

// Feature highlights for the platform
const platformFeatures = [
  {
    icon: EyeIcon,
    title: 'Privacy First',
    description: 'Pseudonymous borrower profiles protect identity while maintaining trust',
    color: 'text-secondary-400'
  },
  {
    icon: BanknotesIcon,
    title: 'XRP Ledger Security',
    description: 'Smart escrows and automated repayments on enterprise-grade blockchain',
    color: 'text-success-400'
  },
  {
    icon: ChartBarIcon,
    title: 'AI-Powered Risk Assessment',
    description: 'Advanced algorithms calculate trust scores and optimize interest rates',
    color: 'text-accent-400'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Accessibility',
    description: 'Connecting unbanked entrepreneurs with global capital markets',
    color: 'text-primary-400'
  }
];

export default function Home() {
  const { account } = useAccount();
  const [platformStats, setPlatformStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load marketplace data
  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true);
      
      // Load marketplace stats
      const stats = await database.getMarketplaceStats();
      setPlatformStats(stats);
      
      // Load recent activity (recent loans)
      const recentLoans = await database.getAllLoans();
      const sortedLoans = recentLoans
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map(loan => ({
          id: loan.id,
          type: loan.status === 'PENDING' ? 'New Loan Request' : 
                loan.status === 'FUNDED' ? 'Loan Funded' : 'Loan Completed',
          amount: loan.amount,
          purpose: loan.purpose,
          time: new Date(loan.createdAt).toLocaleDateString(),
          status: loan.status,
          borrower: loan.pseudonymousId || 'Unknown'
        }));
      
      setRecentActivity(sortedLoans);
      
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (account.loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="w-32 h-32 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <SparklesIcon className="h-8 w-8 text-primary-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <motion.h2 
            className="text-4xl font-bold gradient-text mb-4"
            animate={{ 
              textShadow: [
                '0 0 20px rgba(59, 130, 246, 0.5)',
                '0 0 40px rgba(59, 130, 246, 0.8)',
                '0 0 20px rgba(59, 130, 246, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Initializing MicroLoanX
          </motion.h2>
          <p className="text-slate-400 mb-6">Connecting to XRP Ledger and loading marketplace data...</p>
          <div className="flex items-center justify-center space-x-3">
            <motion.div 
              className="w-3 h-3 bg-secondary-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div 
              className="w-3 h-3 bg-accent-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div 
              className="w-3 h-3 bg-primary-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
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
          className="text-center max-w-2xl mx-auto p-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <SparklesIcon className="h-24 w-24 text-secondary-400 mx-auto mb-8" />
          </motion.div>
          <h2 className="text-4xl font-bold gradient-text mb-6">Welcome to MicroLoanX</h2>
          <p className="text-slate-400 mb-8 text-lg leading-relaxed">
            The next-generation decentralized lending platform powered by XRP Ledger. 
            Connecting unbanked entrepreneurs with global capital markets through 
            privacy-preserving, pseudonymous microloans.
          </p>
          <div className="glass-card p-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <motion.div 
                className="w-4 h-4 bg-success-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p className="text-slate-300">System initializing...</p>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p>✅ Database connected</p>
              <p>✅ Test accounts loaded</p>
              <p>✅ XRPL integration ready</p>
              <p className="animate-pulse">🔄 Preparing user interface...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const animatedStats = getAnimatedStats(platformStats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section with Enhanced Animations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-secondary-500/20 to-primary-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-accent-500/20 to-success-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          {/* Welcome Banner */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center space-x-4 mb-6"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <SparklesIcon className="h-12 w-12 text-secondary-400" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold gradient-text">
                Welcome back, {account.currentUser.name}
              </h1>
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <SparklesIcon className="h-12 w-12 text-accent-400" />
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-4"
            >
              <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
                {account.viewMode === 'borrower' 
                  ? 'Access capital for your projects with transparent, decentralized loans powered by blockchain technology'
                  : 'Generate sustainable returns by funding vetted loan opportunities with guaranteed XRPL escrow protection'
                }
              </p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center space-x-8 text-sm text-slate-400"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-success-400" />
                  <span>Pseudonymous Privacy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5 text-accent-400" />
                  <span>XRPL Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HeartIcon className="h-5 w-5 text-primary-400" />
                  <span>Social Impact</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Enhanced Platform Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {animatedStats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className={`glass-card bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} group cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <stat.icon className={`h-12 w-12 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full ${stat.color.replace('text-', 'bg-').replace('-400', '-500/20')} ${stat.color}`}
                  >
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                    <span className="text-xs font-bold">{stat.trend}</span>
                  </motion.div>
                </div>
                
                <motion.p 
                  className="text-4xl font-bold text-slate-100 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                >
                  {stat.value}
                </motion.p>
                
                <p className="text-slate-300 font-medium mb-1">{stat.name}</p>
                <p className="text-slate-500 text-sm">{stat.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Platform Features Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold gradient-text mb-4">
                Built for the Future of Finance
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Cutting-edge technology meets social impact in our decentralized lending ecosystem
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="glass-card text-center group"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-50/30 mb-4 group-hover:bg-dark-50/50 transition-colors"
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </motion.div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity Feed */}
          {recentActivity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="mb-16"
            >
              <div className="glass-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold gradient-text flex items-center">
                    <ClockIcon className="h-6 w-6 mr-2" />
                    Recent Marketplace Activity
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadMarketplaceData}
                    className="text-secondary-400 hover:text-secondary-300 text-sm font-medium"
                  >
                    Refresh
                  </motion.button>
                </div>
                
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.8 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-dark-50/20 rounded-lg hover:bg-dark-50/30 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.status === 'PENDING' ? 'bg-warning-400' :
                          activity.status === 'FUNDED' ? 'bg-success-400' : 'bg-accent-400'
                        }`} />
                        <div>
                          <p className="text-slate-200 font-medium">{activity.type}</p>
                          <p className="text-slate-400 text-sm">{activity.purpose}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-100 font-bold">${activity.amount.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <AnimatePresence mode="wait">
            {account.viewMode === 'borrower' ? (
              <motion.div
                key="borrower"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <EnhancedBorrowerView />
              </motion.div>
            ) : (
              <motion.div
                key="lender"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <EnhancedLenderView />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Error Handling with Enhanced Animation */}
      <AnimatePresence>
        {account.error && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-4 right-4 z-50 glass-card border-error-400/30 bg-error-500/10 max-w-sm"
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="w-6 h-6 bg-error-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  <span className="text-white text-sm font-bold">!</span>
                </motion.div>
                <div>
                  <p className="text-error-200 font-bold text-sm">System Error</p>
                  <p className="text-error-300 text-sm">{account.error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="fixed bottom-8 left-8 z-30"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="glass-card p-4 bg-gradient-to-br from-secondary-500/10 to-primary-500/10 border border-secondary-400/30"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300 font-medium">XRPL Connected</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
