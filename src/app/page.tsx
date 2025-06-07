'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from '@/lib/contexts/AccountContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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
  HeartIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  BeakerIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { database } from '@/lib/database/db';

// Fixed particle positions to prevent hydration mismatch
const PARTICLE_POSITIONS = [
  { left: 10, top: 20 }, { left: 85, top: 15 }, { left: 25, top: 75 },
  { left: 70, top: 30 }, { left: 90, top: 85 }, { left: 15, top: 55 },
  { left: 60, top: 10 }, { left: 45, top: 90 }, { left: 30, top: 40 },
  { left: 80, top: 65 }, { left: 5, top: 80 }, { left: 95, top: 45 },
  { left: 50, top: 25 }, { left: 75, top: 70 }, { left: 20, top: 35 },
  { left: 65, top: 85 }, { left: 35, top: 60 }, { left: 55, top: 5 },
  { left: 40, top: 95 }, { left: 85, top: 50 }
];

const BACKGROUND_PARTICLES = [
  { left: 15, top: 25 }, { left: 80, top: 20 }, { left: 30, top: 70 },
  { left: 65, top: 35 }, { left: 85, top: 80 }, { left: 20, top: 50 },
  { left: 55, top: 15 }, { left: 40, top: 85 }, { left: 25, top: 45 },
  { left: 75, top: 60 }, { left: 10, top: 75 }, { left: 90, top: 40 },
  { left: 45, top: 30 }, { left: 70, top: 75 }, { left: 35, top: 10 }
];

// Enhanced platform statistics with responsive design
const getAnimatedStats = (stats: any) => [
  { 
    id: 1, 
    name: 'Total Loans Funded', 
    value: `$${stats.totalFunded?.toLocaleString() || '2.4M'}`, 
    icon: CurrencyDollarIcon, 
    color: 'text-success-400', 
    trend: '+24.3%',
    description: 'RLUSD disbursed globally',
    bgGradient: 'from-success-500/20 to-secondary-500/20',
    borderColor: 'border-success-400/40',
    iconBg: 'bg-success-500/20'
  },
  { 
    id: 2, 
    name: 'Active Borrowers', 
    value: stats.activeBorrowers?.toString() || '1,247', 
    icon: UserGroupIcon, 
    color: 'text-secondary-400', 
    trend: '+18.2%',
    description: 'Verified entrepreneurs',
    bgGradient: 'from-secondary-500/20 to-primary-500/20',
    borderColor: 'border-secondary-400/40',
    iconBg: 'bg-secondary-500/20'
  },
  { 
    id: 3, 
    name: 'Success Rate', 
    value: `${stats.successRate?.toFixed(1) || '98.5'}%`, 
    icon: ShieldCheckIcon, 
    color: 'text-accent-400', 
    trend: '+2.1%',
    description: 'Loans repaid on time',
    bgGradient: 'from-accent-500/20 to-warning-500/20',
    borderColor: 'border-accent-400/40',
    iconBg: 'bg-accent-500/20'
  },
  { 
    id: 4, 
    name: 'Total Loans', 
    value: stats.totalLoans?.toString() || '5,832', 
    icon: DocumentTextIcon, 
    color: 'text-primary-400', 
    trend: '+31.8%',
    description: 'Processed to date',
    bgGradient: 'from-primary-500/20 to-secondary-500/20',
    borderColor: 'border-primary-400/40',
    iconBg: 'bg-primary-500/20'
  }
];

// Enhanced platform features with modern icons and descriptions
const platformFeatures = [
  {
    icon: EyeIcon,
    title: 'Privacy First',
    description: 'Pseudonymous borrower profiles protect identity while maintaining trust through cryptographic verification',
    color: 'text-secondary-400',
    bgColor: 'bg-secondary-500/10',
    borderColor: 'border-secondary-400/30'
  },
  {
    icon: BanknotesIcon,
    title: 'XRP Ledger Security',
    description: 'Smart escrows and automated repayments on enterprise-grade blockchain infrastructure',
    color: 'text-success-400',
    bgColor: 'bg-success-500/10',
    borderColor: 'border-success-400/30'
  },
  {
    icon: BeakerIcon,
    title: 'AI-Powered Risk Assessment',
    description: 'Advanced machine learning algorithms calculate trust scores and optimize interest rates in real-time',
    color: 'text-accent-400',
    bgColor: 'bg-accent-500/10',
    borderColor: 'border-accent-400/30'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Accessibility',
    description: 'Connecting unbanked entrepreneurs worldwide with global capital markets and institutional investors',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
    borderColor: 'border-primary-400/30'
  }
];

// Innovation highlights for premium experience
const innovationHighlights = [
  {
    icon: RocketLaunchIcon,
    title: 'Instant Funding',
    description: 'Get approved and funded in minutes, not days',
    color: 'text-success-400'
  },
  {
    icon: LightBulbIcon,
    title: 'Smart Contracts',
    description: 'Automated, transparent, and secure transactions',
    color: 'text-accent-400'
  },
  {
    icon: FireIcon,
    title: 'Zero Hidden Fees',
    description: 'Complete transparency in all transactions',
    color: 'text-error-400'
  }
];

export default function Home() {
  const { account } = useAccount();
  const [platformStats, setPlatformStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load marketplace data on mount
  useEffect(() => {
    if (account.databaseInitialized && !account.loading) {
      loadMarketplaceData();
    }
  }, [account.databaseInitialized, account.loading]);

  const loadMarketplaceData = async () => {
    if (!account.databaseInitialized) {
      console.log('⏳ Database not ready yet, skipping marketplace data load');
      return;
    }

    try {
      setIsLoading(true);
      
      const stats = await database.getMarketplaceStats();
      setPlatformStats(stats);
      
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
      setPlatformStats({
        totalFunded: 0,
        activeBorrowers: 0,
        successRate: 0,
        totalLoans: 0,
        totalUsers: 0,
      });
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced loading screen with premium animations
  if (account.loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 relative overflow-hidden">
        {/* Background particles with fixed positions */}
        <div className="absolute inset-0 overflow-hidden">
          {PARTICLE_POSITIONS.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-secondary-400/30 rounded-full"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center relative z-10 container-responsive"
        >
          <div className="relative w-40 h-40 mx-auto mb-8">
            <div className="w-40 h-40 border-4 border-secondary-500/50 border-t-secondary-400 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-accent-500/50 border-t-accent-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            <div className="absolute inset-8 border-4 border-primary-500/50 border-t-primary-400 rounded-full animate-spin" style={{animationDelay: '0.5s', animationDuration: '2s'}}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <SparklesIcon className="h-12 w-12 text-primary-400" />
              </motion.div>
            </div>
          </div>

          <motion.h2 
            className="text-responsive-2xl gradient-text-premium mb-6"
            animate={{ 
              filter: [
                'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
                'drop-shadow(0 0 40px rgba(6, 182, 212, 0.8))',
                'drop-shadow(0 0 20px rgba(249, 115, 22, 0.5))'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Initializing MicroLoanX
          </motion.h2>
          
          <p className="text-responsive-md text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connecting to XRP Ledger and loading marketplace data...
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <motion.div 
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1], 
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </div>

          <div className="glass-card max-w-md mx-auto">
            <div className="space-y-3 text-responsive-sm text-slate-400">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 text-success-400 mr-3" />
                Database connected
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 text-success-400 mr-3" />
                Test accounts loaded
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
                className="flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 text-success-400 mr-3" />
                XRPL integration ready
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 }}
                className="flex items-center animate-pulse text-responsive-sm text-slate-400"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon className="h-5 w-5 text-accent-400 mr-3" />
                </motion.div>
                Preparing user interface...
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // User not authenticated state with enhanced design
  if (!account.currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 relative overflow-hidden">
        {/* Animated background elements */}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center container-responsive relative z-10"
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
            className="mb-8"
          >
            <SparklesIcon className="h-24 w-24 text-secondary-400 mx-auto" />
          </motion.div>

          <h2 className="text-responsive-3xl gradient-text-premium mb-8">
            Welcome to MicroLoanX
          </h2>
          
          <p className="text-responsive-lg text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            The next-generation decentralized lending platform powered by XRP Ledger. 
            Connecting unbanked entrepreneurs with global capital markets through 
            privacy-preserving, pseudonymous microloans.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            {innovationHighlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="glass-card text-center group hover:scale-105 transition-transform duration-300"
              >
                <highlight.icon className={`h-12 w-12 ${highlight.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`} />
                <h3 className="text-responsive-md font-bold text-slate-100 mb-2">{highlight.title}</h3>
                <p className="text-responsive-sm text-slate-400">{highlight.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="glass-card-premium max-w-lg mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <motion.div 
                className="w-4 h-4 bg-success-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p className="text-responsive-md text-slate-200 font-medium">System initializing...</p>
            </div>
            <div className="space-y-3 text-responsive-sm text-slate-400">
              <div className="flex items-center justify-between">
                <span>✅ Database connected</span>
                <CheckCircleIcon className="h-4 w-4 text-success-400" />
              </div>
              <div className="flex items-center justify-between">
                <span>✅ Test accounts loaded</span>
                <CheckCircleIcon className="h-4 w-4 text-success-400" />
              </div>
              <div className="flex items-center justify-between">
                <span>✅ XRPL integration ready</span>
                <CheckCircleIcon className="h-4 w-4 text-success-400" />
              </div>
              <div className="flex items-center justify-between animate-pulse">
                <span>🔄 Preparing user interface...</span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon className="h-4 w-4 text-accent-400" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const animatedStats = getAnimatedStats(platformStats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 relative">
      {/* Navigation */}
      <Navbar />

      {/* Enhanced Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative overflow-hidden"
      >
        {/* Advanced Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-r from-secondary-500/20 to-primary-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
            className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-r from-accent-500/20 to-success-500/20 rounded-full blur-3xl"
          />
          
          {/* Fixed position floating particles */}
          {BACKGROUND_PARTICLES.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-secondary-400/40 rounded-full"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>

        <div className="container-responsive py-12">
          {/* Welcome Banner - Reduced spacing */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="order-2 sm:order-1"
              >
                <SparklesIcon className="h-10 w-10 sm:h-12 sm:w-12 text-secondary-400" />
              </motion.div>
              
              <h1 className="text-responsive-3xl gradient-text-premium text-center order-1 sm:order-2">
                Welcome back, {account.currentUser.name}
              </h1>
              
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="order-3"
              >
                <SparklesIcon className="h-10 w-10 sm:h-12 sm:w-12 text-accent-400" />
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-4"
            >
              <p className="text-responsive-lg text-slate-200 max-w-4xl mx-auto leading-relaxed">
                {account.viewMode === 'borrower' 
                  ? 'Access capital for your projects with transparent, decentralized loans powered by blockchain technology and smart contract automation'
                  : 'Generate sustainable returns by funding vetted loan opportunities with guaranteed XRPL escrow protection and automated risk assessment'
                }
              </p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap items-center justify-center gap-6 text-responsive-sm text-slate-400"
              >
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <CheckCircleIcon className="h-5 w-5 text-success-400" />
                  <span>Pseudonymous Privacy</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <ShieldCheckIcon className="h-5 w-5 text-accent-400" />
                  <span>XRPL Security</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <HeartIcon className="h-5 w-5 text-primary-400" />
                  <span>Social Impact</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <RocketLaunchIcon className="h-5 w-5 text-secondary-400" />
                  <span>Instant Processing</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Enhanced Platform Statistics - Reduced spacing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12"
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
                className={`glass-card-premium bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} group cursor-pointer relative hover-lift`}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r from-success-500/20 to-success-400/20 border border-success-400/30 ${stat.color}`}
                  >
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                    <span className="text-xs font-bold">{stat.trend}</span>
                  </motion.div>
                </div>
                
                <motion.p 
                  className="text-responsive-lg font-bold text-slate-100 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                >
                  {stat.value}
                </motion.p>
                
                <p className="text-responsive-sm text-slate-200 font-semibold mb-1">{stat.name}</p>
                <p className="text-xs text-slate-400">{stat.description}</p>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>

          {/* Platform Features Showcase - Reduced spacing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-responsive-2xl gradient-text-premium mb-4">
                Built for the Future of Finance
              </h2>
              <p className="text-responsive-md text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Cutting-edge technology meets social impact in our decentralized lending ecosystem
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className={`glass-card text-center group ${feature.bgColor} border ${feature.borderColor} relative overflow-hidden hover-lift`}
                >
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-dark-50/20 mb-4 group-hover:bg-dark-50/40 transition-colors relative z-10"
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </motion.div>
                  
                  <h3 className="text-responsive-sm font-bold text-slate-100 mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed relative z-10">{feature.description}</p>
                  
                  {/* Animated background effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity Feed - Reduced spacing */}
          {recentActivity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="mb-12"
            >
              <div className="glass-card-premium">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h3 className="text-responsive-md gradient-text flex items-center mb-4 sm:mb-0">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Recent Marketplace Activity
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadMarketplaceData}
                    className="btn-secondary text-responsive-sm py-2 px-4"
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
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-dark-50/20 rounded-xl hover:bg-dark-50/30 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex items-start sm:items-center space-x-3 mb-2 sm:mb-0">
                        <motion.div 
                          className={`w-3 h-3 rounded-full mt-2 sm:mt-0 flex-shrink-0 ${
                            activity.status === 'PENDING' ? 'bg-warning-400' :
                            activity.status === 'FUNDED' ? 'bg-success-400' : 'bg-accent-400'
                          }`}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div>
                          <p className="text-responsive-sm text-slate-200 font-semibold group-hover:text-white transition-colors">
                            {activity.type}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {activity.purpose}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right ml-6 sm:ml-0">
                        <p className="text-responsive-sm text-slate-100 font-bold">
                          ${activity.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Dashboard Content - Reduced spacing */}
      <div className="container-responsive pb-12">
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

      {/* Enhanced Error Handling */}
      <AnimatePresence>
        {account.error && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-4 right-4 z-50 glass-card-premium border-error-400/30 bg-error-500/10 max-w-xs sm:max-w-sm"
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
                  <p className="text-error-200 font-bold text-responsive-sm">System Error</p>
                  <p className="text-error-300 text-responsive-xs mt-1">{account.error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Floating Status Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="fixed bottom-4 left-4 z-30 hidden sm:block"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="glass-card-premium bg-gradient-to-br from-secondary-500/10 to-primary-500/10 border border-secondary-400/30 p-3"
        >
          <div className="flex items-center space-x-2">
            <motion.div 
              className="w-2 h-2 bg-success-400 rounded-full"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity 
              }}
            />
            <span className="text-xs text-slate-300 font-medium">XRPL Connected</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
