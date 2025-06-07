'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  GlobeAltIcon,
  EyeIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  BeakerIcon,
  ChartBarIcon,
  LockClosedIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    id: 'privacy',
    icon: EyeIcon,
    title: 'Privacy-First Lending',
    description: 'Pseudonymous borrower profiles protect identity while maintaining trust through advanced cryptographic verification and reputation systems.',
    color: 'from-secondary-500 to-primary-500',
    textColor: 'text-secondary-400',
    benefits: [
      'Zero identity exposure',
      'Cryptographic verification',
      'Reputation-based trust',
      'GDPR compliant'
    ],
    demo: {
      title: 'Privacy Demo',
      content: 'Borrower ID: USER-AB7F2D9E → Loan Request → Verified anonymously'
    }
  },
  {
    id: 'security',
    icon: ShieldCheckIcon,
    title: 'XRPL Security',
    description: 'Enterprise-grade blockchain infrastructure with automated smart escrows, multi-signature security, and transparent transaction logs.',
    color: 'from-success-500 to-accent-500',
    textColor: 'text-success-400',
    benefits: [
      'Smart contract escrows',
      'Multi-signature protection',
      'Immutable transaction logs',
      '99.99% uptime guarantee'
    ],
    demo: {
      title: 'Security Demo',
      content: 'Escrow Creation → Fund Lock → Automated Release → Verified Settlement'
    }
  },
  {
    id: 'ai',
    icon: LightBulbIcon,
    title: 'AI Risk Assessment',
    description: 'Advanced machine learning algorithms analyze borrower patterns, calculate dynamic risk scores, and optimize interest rates in real-time.',
    color: 'from-accent-500 to-warning-500',
    textColor: 'text-accent-400',
    benefits: [
      'Dynamic risk scoring',
      'ML-powered analysis',
      'Real-time optimization',
      'Predictive modeling'
    ],
    demo: {
      title: 'AI Demo',
      content: 'Risk Score: 85/100 → Interest Rate: 5.8% → Auto-calculated'
    }
  },
  {
    id: 'global',
    icon: GlobeAltIcon,
    title: 'Global Access',
    description: 'Connecting unbanked entrepreneurs worldwide with global capital markets through borderless, permissionless financial infrastructure.',
    color: 'from-primary-500 to-secondary-500',
    textColor: 'text-primary-400',
    benefits: [
      '24/7 global access',
      'No geographical limits',
      'Multi-currency support',
      'Instant settlements'
    ],
    demo: {
      title: 'Global Demo',
      content: 'Nairobi → London → Tokyo → New York → Connected'
    }
  }
];

const stats = [
  { label: 'Total Funded', value: '$2.4M+', icon: CurrencyDollarIcon },
  { label: 'Success Rate', value: '98.5%', icon: ChartBarIcon },
  { label: 'Avg. Processing', value: '< 2min', icon: ClockIcon },
  { label: 'Security Score', value: '99.9%', icon: LockClosedIcon }
];

export default function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <SparklesIcon className="h-8 w-8 text-white" />
        </motion.div>
        
        <h2 className="text-4xl md:text-5xl font-bold gradient-text-premium mb-6">
          Revolutionary DeFi Features
        </h2>
        
        <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Experience the future of decentralized lending with cutting-edge technology, 
          uncompromising security, and global accessibility.
        </p>
      </motion.div>

      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, y: -5 }}
            onHoverStart={() => setHoveredStat(index)}
            onHoverEnd={() => setHoveredStat(null)}
            className="glass-card text-center group cursor-pointer hover-lift"
          >
            <motion.div
              animate={hoveredStat === index ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-primary-500/30"
            >
              <stat.icon className="h-6 w-6 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
            <p className="text-slate-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
            className="glass-card-premium cursor-pointer group relative overflow-hidden card-hover-glow"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start space-x-4 mb-6">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow duration-300`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${feature.textColor} mb-2`}>
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Benefits List */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {feature.benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-2 text-sm text-slate-400"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Expandable Demo Section */}
              <AnimatePresence>
                {activeFeature === feature.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-slate-600/30 pt-6"
                  >
                    <div className="bg-dark-800/50 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center">
                        <BeakerIcon className="h-4 w-4 mr-2 text-accent-400" />
                        {feature.demo.title}
                      </h4>
                      <motion.code
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs text-secondary-300 bg-dark-900/50 rounded px-3 py-2 block font-mono"
                      >
                        {feature.demo.content}
                      </motion.code>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expand/Collapse Indicator */}
              <motion.div 
                className="flex items-center justify-center pt-4"
                animate={{ rotate: activeFeature === feature.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-6 h-1 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full opacity-60" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        viewport={{ once: true }}
        className="text-center mt-20"
      >
        <div className="glass-card-premium max-w-2xl mx-auto">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-20 h-20 bg-gradient-to-br from-secondary-500 via-primary-500 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <RocketLaunchIcon className="h-10 w-10 text-white" />
          </motion.div>
          
          <h3 className="text-2xl font-bold gradient-text-premium mb-4">
            Ready to Experience the Future?
          </h3>
          
          <p className="text-slate-300 mb-8 leading-relaxed">
            Join thousands of users already revolutionizing their financial future with MicroLoanX. 
            Start with our testnet environment and experience real blockchain transactions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Try Testnet Lab
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
            >
              <BeakerIcon className="h-5 w-5 mr-2" />
              View Documentation
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 