'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from '@/lib/contexts/AccountContext';
import { 
  UserCircleIcon, 
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  EyeIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  UserGroupIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { DatabaseUser } from '@/lib/database/db';

export default function Navbar() {
  const { account, switchUser, switchViewMode, logout, getAllUsers, canAccessLender } = useAccount();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Load available users when component mounts
  useEffect(() => {
    loadAvailableUsers();
  }, [account.databaseInitialized]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMobileMenu && !(event.target as Element).closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  const loadAvailableUsers = async () => {
    if (account.databaseInitialized) {
      try {
        const users = await getAllUsers();
        setAvailableUsers(users);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    }
  };

  const handleUserSwitch = async (userId: string) => {
    setLoading(true);
    try {
      await switchUser(userId);
      setShowAccountSelector(false);
      setShowUserMenu(false);
      setShowMobileMenu(false);
    } catch (error) {
      console.error('Failed to switch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewModeSwitch = (mode: 'borrower' | 'lender') => {
    switchViewMode(mode);
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowAccountSelector(false);
    setShowMobileMenu(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'borrower':
        return <UserCircleIcon className="h-4 w-4" />;
      case 'lender':
        return <BanknotesIcon className="h-4 w-4" />;
      default:
        return <UserGroupIcon className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'borrower':
        return 'text-secondary-400';
      case 'lender':
        return 'text-success-400';
      default:
        return 'text-slate-400';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'borrower':
        return 'bg-secondary-500/20 text-secondary-200 border-secondary-400/30';
      case 'lender':
        return 'bg-success-500/20 text-success-200 border-success-400/30';
      default:
        return 'bg-slate-500/20 text-slate-200 border-slate-400/30';
    }
  };

  // Non-authenticated navbar
  if (!account.isAuthenticated) {
    return (
      <nav className="bg-dark-900/95 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50 shadow-2xl">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <motion.div 
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-responsive-lg gradient-text-premium font-bold">MicroLoanX</h1>
                  <p className="text-xs text-slate-400 hidden sm:block">XRP Lending Platform</p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAccountSelector(true)}
                className="btn-primary text-responsive-sm py-2 sm:py-3 px-4 sm:px-6"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                Select Test Account
              </motion.button>
            </div>
          </div>
        </div>

        {/* Account Selector Modal */}
        <AnimatePresence>
          {showAccountSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowAccountSelector(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card-premium max-w-md w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-responsive-lg gradient-text font-bold">Select Test Account</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAccountSelector(false)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-slate-400" />
                  </motion.button>
                </div>

                <div className="space-y-3">
                  {availableUsers.map((user, index) => (
                    <motion.button
                      key={user.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => handleUserSwitch(user.address)}
                      disabled={loading}
                      className="w-full p-4 bg-dark-50/20 hover:bg-dark-50/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-responsive-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                              {user.name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`status-badge text-xs ${getRoleBadgeColor(user.role)}`}>
                                {user.role}
                              </span>
                              {user.role === 'lender' && (
                                <StarIcon className="h-3 w-3 text-yellow-400" />
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
                      </div>
                      
                      <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                        <span>Balance: ${user.balance?.toLocaleString() || '0'}</span>
                        {account.userReputation && (
                          <div className="flex items-center space-x-1">
                            <ShieldCheckIcon className="h-3 w-3" />
                            <span>{account.userReputation.trustScore}/100</span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <ArrowPathIcon className="h-6 w-6 text-primary-400" />
                    </motion.div>
                    <span className="ml-2 text-slate-400">Switching account...</span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-dark-900/95 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50 shadow-2xl">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <motion.div 
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </motion.div>
                <div className="hidden sm:block">
                  <h1 className="text-responsive-lg gradient-text-premium font-bold">MicroLoanX</h1>
                  <p className="text-xs text-slate-400">XRP Lending Platform</p>
                </div>
              </motion.div>

              {/* Desktop View Mode Switcher */}
              <div className="hidden lg:flex items-center space-x-2 bg-dark-800/50 rounded-xl p-1.5 border border-slate-700/50">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewModeSwitch('borrower')}
                  className={`px-4 py-2 rounded-lg text-responsive-sm font-semibold transition-all duration-300 ${
                    account.viewMode === 'borrower'
                      ? 'bg-secondary-600 text-white shadow-lg shadow-secondary-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-dark-700/50'
                  }`}
                >
                  <UserCircleIcon className="h-4 w-4 inline mr-2" />
                  Borrower
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewModeSwitch('lender')}
                  disabled={!canAccessLender}
                  className={`px-4 py-2 rounded-lg text-responsive-sm font-semibold transition-all duration-300 ${
                    account.viewMode === 'lender'
                      ? 'bg-success-600 text-white shadow-lg shadow-success-500/30'
                      : canAccessLender
                      ? 'text-slate-400 hover:text-white hover:bg-dark-700/50'
                      : 'text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <BanknotesIcon className="h-4 w-4 inline mr-2" />
                  Lender
                  {!canAccessLender && (
                    <div className="inline-block ml-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Balance and Reputation Display */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-4 bg-dark-800/50 rounded-xl px-4 py-2.5 border border-slate-700/50"
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    <BanknotesIcon className="h-5 w-5 text-success-400" />
                  </motion.div>
                  <div>
                    <p className="text-xs text-slate-400">Balance</p>
                    <p className="text-responsive-sm font-bold text-slate-100">
                      ${account.availableBalance.toLocaleString()} RLUSD
                    </p>
                  </div>
                </div>
                
                {account.userReputation && (
                  <div className="flex items-center space-x-2 border-l border-slate-700 pl-4">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      <ShieldCheckIcon className="h-5 w-5 text-accent-400" />
                    </motion.div>
                    <div>
                      <p className="text-xs text-slate-400">Trust Score</p>
                      <p className="text-responsive-sm font-bold text-slate-100">
                        {account.userReputation.trustScore}/100
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-dark-800/50 hover:bg-dark-700/50 rounded-xl px-4 py-2.5 transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {account.currentUser?.name.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-responsive-sm font-semibold text-slate-100">
                        {account.currentUser?.name || 'Unknown User'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`status-badge text-xs ${getRoleBadgeColor(account.currentUser?.role || 'user')}`}>
                          {account.currentUser?.role || 'user'}
                        </span>
                        {account.currentUser?.role === 'lender' && (
                          <StarIcon className="h-3 w-3 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                  </motion.div>
                </motion.button>

                {/* Desktop User Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 glass-card-premium border border-slate-600/50 shadow-2xl"
                    >
                      <div className="p-4 border-b border-slate-600/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {account.currentUser?.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-responsive-md font-bold text-slate-100">
                              {account.currentUser?.name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {getRoleIcon(account.currentUser?.role || 'user')}
                              <span className={`text-responsive-sm ${getRoleColor(account.currentUser?.role || 'user')}`}>
                                {account.currentUser?.role || 'user'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <motion.button
                          whileHover={{ scale: 1.02, x: 5 }}
                          onClick={() => setShowAccountSelector(true)}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-dark-50/20 rounded-lg transition-colors text-left"
                        >
                          <UserGroupIcon className="h-5 w-5 text-slate-400" />
                          <span className="text-responsive-sm text-slate-300">Switch Account</span>
                          <ChevronRightIcon className="h-4 w-4 text-slate-500 ml-auto" />
                        </motion.button>

                        <motion.a
                          href="/testnet"
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-dark-50/20 rounded-lg transition-colors text-left"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <SparklesIcon className="h-5 w-5 text-accent-400" />
                          <span className="text-responsive-sm text-slate-300">Testnet Lab</span>
                          <ChevronRightIcon className="h-4 w-4 text-slate-500 ml-auto" />
                        </motion.a>

                        <motion.button
                          whileHover={{ scale: 1.02, x: 5 }}
                          onClick={() => {/* Add settings handler */}}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-dark-50/20 rounded-lg transition-colors text-left"
                        >
                          <Cog6ToothIcon className="h-5 w-5 text-slate-400" />
                          <span className="text-responsive-sm text-slate-300">Settings</span>
                          <ChevronRightIcon className="h-4 w-4 text-slate-500 ml-auto" />
                        </motion.button>

                        <div className="border-t border-slate-600/30 my-2" />

                        <motion.button
                          whileHover={{ scale: 1.02, x: 5 }}
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-error-500/10 hover:text-error-300 rounded-lg transition-colors text-left"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 text-error-400" />
                          <span className="text-responsive-sm text-slate-300">Sign Out</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors border border-slate-700/50"
              >
                <motion.div
                  animate={{ rotate: showMobileMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {showMobileMenu ? (
                    <XMarkIcon className="h-6 w-6 text-slate-300" />
                  ) : (
                    <Bars3Icon className="h-6 w-6 text-slate-300" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-800/50 bg-dark-900/98 backdrop-blur-xl mobile-menu-container"
            >
              <div className="container-responsive py-4">
                {/* Mobile User Info */}
                <div className="flex items-center space-x-3 p-4 bg-dark-800/30 rounded-xl mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {account.currentUser?.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-responsive-md font-bold text-slate-100">
                      {account.currentUser?.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`status-badge text-xs ${getRoleBadgeColor(account.currentUser?.role || 'user')}`}>
                        {account.currentUser?.role}
                      </span>
                      {account.currentUser?.role === 'lender' && (
                        <StarIcon className="h-3 w-3 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Balance Display */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-dark-800/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BanknotesIcon className="h-5 w-5 text-success-400" />
                      <span className="text-xs text-slate-400">Balance</span>
                    </div>
                    <p className="text-responsive-md font-bold text-slate-100">
                      ${account.availableBalance.toLocaleString()}
                    </p>
                  </div>
                  
                  {account.userReputation && (
                    <div className="bg-dark-800/30 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ShieldCheckIcon className="h-5 w-5 text-accent-400" />
                        <span className="text-xs text-slate-400">Trust Score</span>
                      </div>
                      <p className="text-responsive-md font-bold text-slate-100">
                        {account.userReputation.trustScore}/100
                      </p>
                    </div>
                  )}
                </div>

                {/* Mobile View Mode Switcher */}
                <div className="mb-6">
                  <p className="text-responsive-sm text-slate-400 mb-3 font-medium">View Mode</p>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewModeSwitch('borrower')}
                      className={`p-3 rounded-xl text-responsive-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        account.viewMode === 'borrower'
                          ? 'bg-secondary-600 text-white shadow-lg'
                          : 'bg-dark-800/30 text-slate-400 hover:bg-dark-700/50'
                      }`}
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      <span>Borrower</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewModeSwitch('lender')}
                      disabled={!canAccessLender}
                      className={`p-3 rounded-xl text-responsive-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        account.viewMode === 'lender'
                          ? 'bg-success-600 text-white shadow-lg'
                          : canAccessLender
                          ? 'bg-dark-800/30 text-slate-400 hover:bg-dark-700/50'
                          : 'bg-dark-800/20 text-slate-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <BanknotesIcon className="h-5 w-5" />
                      <span>Lender</span>
                      {!canAccessLender && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Mobile Menu Items */}
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => setShowAccountSelector(true)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-dark-50/20 rounded-xl transition-colors text-left"
                  >
                    <UserGroupIcon className="h-5 w-5 text-slate-400" />
                    <span className="text-responsive-sm text-slate-300">Switch Account</span>
                    <ChevronRightIcon className="h-4 w-4 text-slate-500 ml-auto" />
                  </motion.button>

                  <motion.a
                    href="/testnet"
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-dark-50/20 rounded-lg transition-colors text-left"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <SparklesIcon className="h-5 w-5 text-accent-400" />
                    <span className="text-responsive-sm text-slate-300">Testnet Lab</span>
                    <ChevronRightIcon className="h-4 w-4 text-slate-500 ml-auto" />
                  </motion.a>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => {/* Add settings handler */}}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-dark-50/20 rounded-xl transition-colors text-left"
                  >
                    <Cog6ToothIcon className="h-5 w-5 text-slate-400" />
                    <span className="text-responsive-sm text-slate-300">Settings</span>
                    <ChevronRightIcon className="h-4 w-4 text-slate-500 ml-auto" />
                  </motion.button>

                  <div className="border-t border-slate-600/30 my-3" />

                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-error-500/10 hover:text-error-300 rounded-xl transition-colors text-left"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 text-error-400" />
                    <span className="text-responsive-sm text-slate-300">Sign Out</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Account Selector Modal - Enhanced for Mobile */}
      <AnimatePresence>
        {showAccountSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowAccountSelector(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card-premium w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-responsive-lg gradient-text-premium font-bold">Select Account</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAccountSelector(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-slate-400" />
                </motion.button>
              </div>

              <div className="space-y-3">
                {availableUsers.map((user, index) => (
                  <motion.button
                    key={user.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => handleUserSwitch(user.address)}
                    disabled={loading}
                    className="w-full p-4 bg-dark-50/20 hover:bg-dark-50/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-responsive-md font-semibold text-slate-100 group-hover:text-white transition-colors">
                            {user.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`status-badge text-xs ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                            {user.role === 'lender' && (
                              <StarIcon className="h-3 w-3 text-yellow-400" />
                            )}
                            {user.address === account.currentUser?.address && (
                              <CheckBadgeIcon className="h-4 w-4 text-success-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      {!loading && (
                        <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
                      )}
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-slate-400">
                      <div>
                        <span className="block">Balance</span>
                        <span className="text-slate-300 font-medium">
                          ${user.balance?.toLocaleString() || '0'}
                        </span>
                      </div>
                      {account.userReputation && (
                        <div>
                          <span className="block">Trust Score</span>
                          <div className="flex items-center space-x-1">
                            <ShieldCheckIcon className="h-3 w-3 text-accent-400" />
                            <span className="text-slate-300 font-medium">{account.userReputation.trustScore}/100</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <ArrowPathIcon className="h-8 w-8 text-primary-400" />
                  </motion.div>
                  <span className="ml-3 text-responsive-sm text-slate-300">Switching account...</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 