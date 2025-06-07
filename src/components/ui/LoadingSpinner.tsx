'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, CurrencyDollarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'dots' | 'pulse' | 'orbit';
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const DefaultSpinner = ({ size = 'md', className = '' }: { size: string; className: string }) => (
  <motion.div
    className={`${sizeClasses[size as keyof typeof sizeClasses]} border-4 border-secondary-500/50 border-t-secondary-400 rounded-full ${className}`}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

const GradientSpinner = ({ size = 'md', className = '' }: { size: string; className: string }) => (
  <motion.div
    className={`${sizeClasses[size as keyof typeof sizeClasses]} relative ${className}`}
  >
    <motion.div
      className="absolute inset-0 rounded-full bg-gradient-to-r from-secondary-500 via-primary-500 to-accent-500"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      style={{ 
        background: 'conic-gradient(from 0deg, #06b6d4, #3b82f6, #f97316, #06b6d4)',
        mask: 'radial-gradient(circle at center, transparent 40%, black 41%)',
        WebkitMask: 'radial-gradient(circle at center, transparent 40%, black 41%)'
      }}
    />
  </motion.div>
);

const DotsSpinner = ({ size = 'md', className = '' }: { size: string; className: string }) => {
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`${dotSize} bg-secondary-400 rounded-full`}
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
  );
};

const PulseSpinner = ({ size = 'md', className = '' }: { size: string; className: string }) => (
  <motion.div
    className={`${sizeClasses[size as keyof typeof sizeClasses]} bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

const OrbitSpinner = ({ size = 'md', className = '' }: { size: string; className: string }) => {
  const containerSize = sizeClasses[size as keyof typeof sizeClasses];
  const orbitSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4';
  
  return (
    <div className={`${containerSize} relative ${className}`}>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className={`${orbitSize} bg-secondary-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2`} />
      </motion.div>
      <motion.div
        className="absolute inset-2"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <div className={`${orbitSize} bg-accent-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2`} />
      </motion.div>
      <motion.div
        className="absolute inset-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className={`${orbitSize} bg-primary-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2`} />
      </motion.div>
    </div>
  );
};

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  message, 
  className = '' 
}: LoadingSpinnerProps) {
  const renderSpinner = () => {
    switch (variant) {
      case 'gradient':
        return <GradientSpinner size={size} className={className} />;
      case 'dots':
        return <DotsSpinner size={size} className={className} />;
      case 'pulse':
        return <PulseSpinner size={size} className={className} />;
      case 'orbit':
        return <OrbitSpinner size={size} className={className} />;
      default:
        return <DefaultSpinner size={size} className={className} />;
    }
  };

  if (message) {
    return (
      <div className="flex flex-col items-center space-y-4">
        {renderSpinner()}
        <motion.p 
          className="text-slate-300 text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </div>
    );
  }

  return renderSpinner();
}

// Premium loading screens for different scenarios
export const LoanMarketplaceLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="text-center">
      <motion.div 
        className="relative w-24 h-24 mx-auto mb-8"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="absolute inset-0 border-4 border-secondary-500/30 rounded-full" />
        <motion.div
          className="absolute inset-2 border-4 border-accent-500/50 border-t-accent-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 border-4 border-primary-500/50 border-t-primary-400 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <CurrencyDollarIcon className="h-8 w-8 text-secondary-400" />
        </div>
      </motion.div>
      
      <motion.h3 
        className="text-xl font-bold gradient-text mb-4"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading Marketplace
      </motion.h3>
      
      <div className="space-y-2 text-sm text-slate-400">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          🔍 Scanning loan opportunities...
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          🔒 Verifying borrower credentials...
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          📊 Calculating risk assessments...
        </motion.p>
      </div>
    </div>
  </div>
);

export const XRPLConnectionLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <motion.div 
        className="relative w-20 h-20 mx-auto mb-6"
      >
        <motion.div
          className="absolute inset-0 border-4 border-accent-500/30 rounded-full"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              rotate: [0, -360],
              filter: [
                'hue-rotate(0deg)',
                'hue-rotate(360deg)'
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <ShieldCheckIcon className="h-8 w-8 text-accent-400" />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.h3 
        className="text-lg font-bold text-slate-200 mb-2"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Connecting to XRPL
      </motion.h3>
      
      <p className="text-sm text-slate-400">Establishing secure connection...</p>
    </div>
  </div>
); 