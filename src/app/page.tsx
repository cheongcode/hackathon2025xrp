'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { MOCK_USERS } from '@/types';
import BorrowerView from '@/components/borrower/BorrowerView';
import LenderView from '@/components/lender/LenderView';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, CurrencyDollarIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const stats = [
  { id: 1, name: 'Total Loans Funded', value: '$2.4M', icon: CurrencyDollarIcon, color: 'text-success-400' },
  { id: 2, name: 'Active Borrowers', value: '1,247', icon: UserGroupIcon, color: 'text-secondary-400' },
  { id: 3, name: 'Success Rate', value: '98.5%', icon: ShieldCheckIcon, color: 'text-accent-400' },
];

export default function Home() {
  const [selectedUser, setSelectedUser] = useState(MOCK_USERS[0]);
  const [mounted, setMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold gradient-text">Loading MicroLoanX...</h2>
          <p className="text-slate-400 mt-2">Initializing XRP Ledger connection...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center mb-8"
            >
              <SparklesIcon className="h-10 w-10 text-secondary-400 mr-3" />
              <h1 className="text-6xl md:text-8xl font-bold gradient-text">
                MicroLoanX
              </h1>
              <SparklesIcon className="h-10 w-10 text-accent-400 ml-3" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl text-slate-200 max-w-4xl mx-auto mb-4 font-medium"
            >
              Empowering financial inclusion through decentralized microloans
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-slate-400 max-w-2xl mx-auto mb-12"
            >
              Built on the XRP Ledger for secure, transparent, and instant cross-border lending
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="glass-card text-center hover:scale-105 transition-transform duration-300"
                >
                  <stat.icon className={`h-12 w-12 ${stat.color} mx-auto mb-4`} />
                  <p className="text-3xl font-bold text-slate-100">{stat.value}</p>
                  <p className="text-base text-slate-400 mt-2">{stat.name}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="glass-card gradient-border"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mb-10"
          >
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              🚀 Platform Demo
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              Experience our decentralized loan platform with mock users and real XRPL integration
            </p>

            <div className="mb-8">
              <label className="block text-lg font-bold text-slate-200 mb-4">
                👤 Select Demo User
              </label>
              <motion.select
                whileFocus={{ scale: 1.02 }}
                value={selectedUser.address}
                onChange={(e) => {
                  const user = MOCK_USERS.find(u => u.address === e.target.value);
                  if (user) setSelectedUser(user);
                }}
                className="input-primary w-full max-w-lg"
              >
                {MOCK_USERS.map((user) => (
                  <option key={user.address} value={user.address} className="bg-dark-100 text-slate-200">
                    {user.name} ({user.role}) - {user.address.slice(0, 8)}...
                  </option>
                ))}
              </motion.select>
            </div>
          </motion.div>

          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-2 rounded-2xl bg-dark-50/20 p-2 mb-8">
              {['💰 Borrower Portal', '🏦 Lender Dashboard'].map((category, index) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-xl py-4 text-lg font-bold leading-5 transition-all duration-300',
                      'ring-secondary-500 ring-opacity-60 ring-offset-2 ring-offset-transparent focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-gradient-to-r from-secondary-600 to-primary-600 text-white shadow-lg transform scale-105 shadow-secondary-500/40'
                        : 'text-slate-400 hover:bg-dark-50/30 hover:text-slate-200 hover:scale-102'
                    )
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>
            
            <Tab.Panels>
              <AnimatePresence mode="wait">
                <Tab.Panel key={`borrower-${selectedUser.address}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BorrowerView user={selectedUser} />
                  </motion.div>
                </Tab.Panel>
                <Tab.Panel key={`lender-${selectedUser.address}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LenderView user={selectedUser} />
                  </motion.div>
                </Tab.Panel>
              </AnimatePresence>
            </Tab.Panels>
          </Tab.Group>
        </motion.div>
      </div>
    </main>
  );
}
