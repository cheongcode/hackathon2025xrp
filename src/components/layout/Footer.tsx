'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon,
  HeartIcon,
  SparklesIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ArrowTopRightOnSquareIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const footerLinks = {
  platform: [
    { name: 'Borrower Dashboard', href: '#' },
    { name: 'Lender Portal', href: '#' },
    { name: 'Marketplace', href: '#' },
    { name: 'Testnet Lab', href: '/testnet' },
  ],
  resources: [
    { name: 'Documentation', href: '#' },
    { name: 'API Reference', href: '#' },
    { name: 'XRPL Integration', href: '#' },
    { name: 'Security Audit', href: '#' },
  ],
  community: [
    { name: 'Discord', href: '#' },
    { name: 'Twitter', href: '#' },
    { name: 'GitHub', href: '#' },
    { name: 'Blog', href: '#' },
  ],
  legal: [
    { name: 'Terms of Service', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Risk Disclosure', href: '#' },
    { name: 'Compliance', href: '#' },
  ]
};

const achievements = [
  {
    icon: CurrencyDollarIcon,
    label: 'Total Volume',
    value: '$2.4M+',
    color: 'text-success-400'
  },
  {
    icon: ShieldCheckIcon,
    label: 'Security Score',
    value: '99.9%',
    color: 'text-accent-400'
  },
  {
    icon: GlobeAltIcon,
    label: 'Global Reach',
    value: '45+ Countries',
    color: 'text-primary-400'
  },
  {
    icon: LightBulbIcon,
    label: 'Innovation',
    value: 'AI-Powered',
    color: 'text-secondary-400'
  }
];

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 border-t border-slate-800/50">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-gradient-to-r from-secondary-500/10 to-primary-500/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gradient-to-r from-accent-500/10 to-success-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container-responsive relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 py-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center space-x-4 mb-6">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrencyDollarIcon className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold gradient-text-premium">MicroLoanX</h3>
                  <p className="text-slate-400 text-sm">Decentralized Lending Platform</p>
                </div>
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-6 max-w-md">
                Empowering global entrepreneurs through privacy-preserving microloans 
                on the XRP Ledger. Building the future of decentralized finance, 
                one loan at a time.
              </p>

              {/* Achievements Grid */}
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-dark-50/20 rounded-xl p-4 text-center group hover:bg-dark-50/30 transition-colors"
                  >
                    <achievement.icon className={`h-6 w-6 ${achievement.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                    <p className="text-slate-100 font-bold text-sm">{achievement.value}</p>
                    <p className="text-slate-400 text-xs">{achievement.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Platform Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-slate-100 font-bold mb-4 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-2 text-secondary-400" />
                Platform
              </h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      className="text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center group"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-slate-100 font-bold mb-4 flex items-center">
                <BeakerIcon className="h-4 w-4 mr-2 text-accent-400" />
                Resources
              </h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      className="text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center group"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Community Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-slate-100 font-bold mb-4 flex items-center">
                <HeartIcon className="h-4 w-4 mr-2 text-primary-400" />
                Community
              </h4>
              <ul className="space-y-3">
                {footerLinks.community.map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      className="text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center group"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-slate-100 font-bold mb-4 flex items-center">
                <ShieldCheckIcon className="h-4 w-4 mr-2 text-success-400" />
                Legal
              </h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      className="text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center group"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-slate-800/50 py-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <span>© 2024 MicroLoanX. All rights reserved.</span>
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
                <span>Testnet Active</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>Built on</span>
              <motion.div 
                className="flex items-center space-x-2 text-accent-400 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <SparklesIcon className="h-4 w-4" />
                <span>XRP Ledger</span>
              </motion.div>
              <span>with</span>
              <motion.div 
                className="flex items-center space-x-1 text-primary-400"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  filter: [
                    'hue-rotate(0deg)',
                    'hue-rotate(360deg)'
                  ]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <HeartIcon className="h-4 w-4" />
                <span className="font-medium">by Developers</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-8 h-8 bg-gradient-to-r from-secondary-500/30 to-accent-500/30 rounded-full blur-sm"
        />
      </div>
    </footer>
  );
} 