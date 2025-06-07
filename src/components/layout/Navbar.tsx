'use client';

import React, { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import {
  UserIcon,
  ChevronDownIcon,
  ArrowsRightLeftIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  BellIcon,
  WalletIcon,
  ShieldCheckIcon,
  EyeIcon,
  BanknotesIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAccount, ViewMode } from '@/lib/contexts/AccountContext';
import { MOCK_USERS } from '@/types';

interface NavbarProps {
  onAccountSwitch?: () => void;
}

export default function Navbar({ onAccountSwitch }: NavbarProps) {
  const { 
    account, 
    switchUser, 
    switchViewMode, 
    logout,
    refreshAccountData,
    canAccessBorrower,
    canAccessLender 
  } = useAccount();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleUserSwitch = async (userId: string) => {
    try {
      await switchUser(userId);
      onAccountSwitch?.();
    } catch (error) {
      console.error('Failed to switch user:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAccountData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewModeSwitch = (mode: ViewMode) => {
    switchViewMode(mode);
  };

  if (!account.currentUser) {
    return (
      <nav className="bg-dark-900/80 backdrop-blur-lg border-b border-slate-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-secondary-400 mr-3" />
              <h1 className="text-xl font-bold gradient-text">MicroLoanX</h1>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-dark-900/95 backdrop-blur-lg border-b border-slate-400/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center cursor-pointer"
            >
              <SparklesIcon className="h-8 w-8 text-secondary-400 mr-3" />
              <h1 className="text-xl font-bold gradient-text">MicroLoanX</h1>
            </motion.div>
          </div>

          {/* Center - View Mode Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-dark-50/20 rounded-lg p-1">
              <motion.button
                onClick={() => handleViewModeSwitch('borrower')}
                disabled={!canAccessBorrower}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  account.viewMode === 'borrower'
                    ? 'bg-gradient-to-r from-secondary-600 to-primary-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-50/30'
                } ${!canAccessBorrower ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={canAccessBorrower ? { scale: 1.02 } : {}}
                whileTap={canAccessBorrower ? { scale: 0.98 } : {}}
              >
                <UserIcon className="h-4 w-4" />
                <span>Borrower</span>
              </motion.button>
              
              <motion.button
                onClick={() => handleViewModeSwitch('lender')}
                disabled={!canAccessLender}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  account.viewMode === 'lender'
                    ? 'bg-gradient-to-r from-success-600 to-accent-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-50/30'
                } ${!canAccessLender ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={canAccessLender ? { scale: 1.02 } : {}}
                whileTap={canAccessLender ? { scale: 0.98 } : {}}
              >
                <BanknotesIcon className="h-4 w-4" />
                <span>Lender</span>
              </motion.button>
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center space-x-2 bg-success-500/10 border border-success-400/30 rounded-lg px-3 py-2"
            >
              <WalletIcon className="h-4 w-4 text-success-400" />
              <span className="text-success-400 font-medium">
                ${account.availableBalance.toLocaleString()} RLUSD
              </span>
            </motion.div>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-dark-50/30 rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 glass-card border-slate-400/30 shadow-xl z-50"
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-slate-100 mb-3">Notifications</h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-success-500/10 border border-success-400/30 rounded-lg">
                          <p className="text-success-400 text-sm font-medium">Loan Approved</p>
                          <p className="text-slate-300 text-xs">Your $500 loan request has been approved</p>
                        </div>
                        <div className="p-3 bg-secondary-500/10 border border-secondary-400/30 rounded-lg">
                          <p className="text-secondary-400 text-sm font-medium">New Opportunity</p>
                          <p className="text-slate-300 text-xs">5 new loan requests match your criteria</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-dark-50/30 rounded-lg transition-all duration-300 disabled:opacity-50"
              whileHover={!isRefreshing ? { scale: 1.05 } : {}}
              whileTap={!isRefreshing ? { scale: 0.95 } : {}}
            >
              <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 p-2 text-slate-200 hover:bg-dark-50/30 rounded-lg transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-100">{account.currentUser?.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{account.currentUser?.role}</p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-slate-400" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-80 glass-card border-slate-400/30 shadow-xl z-50">
                  <div className="p-4">
                    {/* Current User Info */}
                    <div className="border-b border-slate-400/20 pb-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{account.currentUser.name}</p>
                          <p className="text-sm text-slate-400">{account.currentUser.address.slice(0, 8)}...{account.currentUser.address.slice(-4)}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <ShieldCheckIcon className="h-3 w-3 text-success-400" />
                            <span className="text-xs text-success-400 font-medium">Verified</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Switch User */}
                    <div className="mb-4">
                      <p className="text-sm font-bold text-slate-200 mb-2">Switch Account</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {MOCK_USERS.map((user) => (
                          <Menu.Item key={user.address}>
                            {({ active }) => (
                              <button
                                onClick={() => handleUserSwitch(user.address)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center space-x-3 ${
                                  active ? 'bg-secondary-500/20 text-secondary-300' : 'text-slate-300 hover:bg-dark-50/30'
                                } ${account.currentUser && account.currentUser.address === user.address ? 'bg-primary-500/20 text-primary-300' : ''}`}
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  user.role === 'lender' ? 'bg-success-500' : 'bg-secondary-500'
                                }`}>
                                  {user.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-xs opacity-70">{user.role} • ${user.balance?.toLocaleString() || '0'}</p>
                                </div>
                                {account.currentUser && account.currentUser.address === user.address && (
                                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                                )}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="border-t border-slate-400/20 pt-4 space-y-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center space-x-3 ${
                              active ? 'bg-slate-400/10 text-slate-200' : 'text-slate-300'
                            }`}
                          >
                            <CogIcon className="h-4 w-4" />
                            <span>Settings</span>
                          </button>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center space-x-3 ${
                              active ? 'bg-slate-400/10 text-slate-200' : 'text-slate-300'
                            }`}
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span>Privacy Settings</span>
                          </button>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center space-x-3 ${
                              active ? 'bg-error-500/20 text-error-300' : 'text-slate-300 hover:text-error-400'
                            }`}
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>

      {/* Loading Bar */}
      {account.loading && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          className="h-1 bg-gradient-to-r from-secondary-500 to-primary-500"
        />
      )}
    </nav>
  );
} 