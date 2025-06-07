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
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { DatabaseUser } from '@/lib/database/db';

export default function Navbar() {
  const { account, switchUser, switchViewMode, logout, getAllUsers, canAccessLender } = useAccount();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Load available users when component mounts
  useEffect(() => {
    loadAvailableUsers();
  }, [account.databaseInitialized]);

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
    } catch (error) {
      console.error('Failed to switch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewModeSwitch = (mode: 'borrower' | 'lender') => {
    switchViewMode(mode);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowAccountSelector(false);
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

  if (!account.isAuthenticated) {
    return (
      <nav className="bg-dark-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold gradient-text">MicroLoanX</h1>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAccountSelector(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                Select Test Account
              </motion.button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-dark-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold gradient-text">MicroLoanX</h1>
              </motion.div>

              {/* View Mode Switcher */}
              <div className="hidden md:flex items-center space-x-2 bg-dark-800/50 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeSwitch('borrower')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    account.viewMode === 'borrower'
                      ? 'bg-secondary-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  Borrower
                </button>
                <button
                  onClick={() => handleViewModeSwitch('lender')}
                  disabled={!canAccessLender}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    account.viewMode === 'lender'
                      ? 'bg-success-600 text-white shadow-lg'
                      : canAccessLender
                      ? 'text-slate-400 hover:text-white hover:bg-dark-700'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Lender
                </button>
              </div>
            </div>

            {/* User Info and Menu */}
            <div className="flex items-center space-x-4">
              {/* Balance Display */}
              <div className="hidden sm:flex items-center space-x-3 bg-dark-800/50 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2">
                  <BanknotesIcon className="h-4 w-4 text-success-400" />
                  <span className="text-sm font-medium text-slate-300">
                    ${account.availableBalance.toLocaleString()} RLUSD
                  </span>
                </div>
                {account.userReputation && (
                  <div className="flex items-center space-x-2 border-l border-slate-700 pl-3">
                    <ShieldCheckIcon className="h-4 w-4 text-accent-400" />
                    <span className="text-sm font-medium text-slate-300">
                      {account.userReputation.trustScore}/100
                    </span>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center`}>
                      <span className="text-sm font-bold text-white">
                        {account.currentUser?.name.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-white">
                        {account.currentUser?.name || 'Unknown User'}
                      </p>
                      <p className={`text-xs ${getRoleColor(account.currentUser?.role || '')}`}>
                        {account.currentUser?.role || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-dark-800 border border-slate-700 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {account.currentUser?.name.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{account.currentUser?.name}</p>
                            <p className="text-sm text-slate-400">{account.currentUser?.pseudonymousId}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              {getRoleIcon(account.currentUser?.role || '')}
                              <span className={`text-xs ${getRoleColor(account.currentUser?.role || '')}`}>
                                {account.currentUser?.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => setShowAccountSelector(true)}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-dark-700 rounded-md transition-colors"
                        >
                          <UserGroupIcon className="h-4 w-4" />
                          <span>Switch Account</span>
                        </button>
                        
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-dark-700 rounded-md transition-colors"
                        >
                          <Cog6ToothIcon className="h-4 w-4" />
                          <span>Settings</span>
                        </button>
                        
                        <div className="border-t border-slate-700 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Account Selector Modal */}
      <AnimatePresence>
        {showAccountSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAccountSelector(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
                <h3 className="text-xl font-bold gradient-text mb-2">Select Test Account</h3>
                <p className="text-sm text-slate-400">
                  Choose from pre-configured demo accounts to explore different user roles
                </p>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {availableUsers.map((user) => (
                    <motion.button
                      key={user.address}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUserSwitch(user.address)}
                      disabled={loading || user.address === account.currentUser?.address}
                      className={`w-full p-4 rounded-lg border transition-all text-left group ${
                        user.address === account.currentUser?.address
                          ? 'border-primary-500/50 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 shadow-lg ring-2 ring-primary-400/30'
                          : 'border-slate-600/50 hover:border-primary-400/50 bg-dark-700/30 hover:bg-gradient-to-r hover:from-primary-500/5 hover:to-secondary-500/5'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                          user.role === 'lender' ? 'from-success-500 to-accent-500' : 'from-primary-500 to-secondary-500'
                        } flex items-center justify-center ring-2 ring-offset-2 ring-offset-dark-800 ${
                          user.address === account.currentUser?.address ? 'ring-primary-400/50' : 'ring-transparent'
                        }`}>
                          <span className="text-lg font-bold text-white">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-white truncate">{user.name}</p>
                            {user.address === account.currentUser?.address && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-300 border border-primary-400/30">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {getRoleIcon(user.role)}
                            <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 text-sm">
                              ${(user.balance || 0).toLocaleString()} RLUSD
                            </span>
                          </div>
                          <div className="mt-1">
                            <p className="text-xs text-slate-500 font-mono truncate">
                              {user.pseudonymousId || user.address.slice(0, 12) + '...'}
                            </p>
                          </div>
                        </div>
                        {loading && user.address === account.currentUser?.address ? (
                          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-slate-500 group-hover:text-primary-400 transition-colors" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-700/50 bg-dark-900/50">
                <button
                  onClick={() => setShowAccountSelector(false)}
                  className="w-full px-4 py-2 bg-slate-600/80 hover:bg-slate-600 text-white rounded-lg transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 