'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'premium';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  showClose?: boolean;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({ 
  children, 
  position = 'top-right', 
  maxToasts = 5 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      showClose: true,
      ...toastData,
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto remove toast
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <div className={`fixed ${getPositionClasses()} z-50 max-w-sm w-full pointer-events-none`}>
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <ToastComponent
              key={toast.id}
              toast={toast}
              onRemove={removeToast}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
  index: number;
}

function ToastComponent({ toast, onRemove, index }: ToastComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-success-500/20 to-success-600/20',
          border: 'border-success-400/50',
          icon: <CheckCircleIcon className="h-6 w-6 text-success-400" />,
          titleColor: 'text-success-200'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-error-500/20 to-error-600/20',
          border: 'border-error-400/50',
          icon: <XCircleIcon className="h-6 w-6 text-error-400" />,
          titleColor: 'text-error-200'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-warning-500/20 to-warning-600/20',
          border: 'border-warning-400/50',
          icon: <ExclamationTriangleIcon className="h-6 w-6 text-warning-400" />,
          titleColor: 'text-warning-200'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-primary-500/20 to-primary-600/20',
          border: 'border-primary-400/50',
          icon: <InformationCircleIcon className="h-6 w-6 text-primary-400" />,
          titleColor: 'text-primary-200'
        };
      case 'premium':
        return {
          bg: 'bg-gradient-to-r from-secondary-500/20 via-primary-500/20 to-accent-500/20',
          border: 'border-secondary-400/50',
          icon: <SparklesIcon className="h-6 w-6 text-secondary-400" />,
          titleColor: 'text-secondary-200'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-slate-500/20 to-slate-600/20',
          border: 'border-slate-400/50',
          icon: <InformationCircleIcon className="h-6 w-6 text-slate-400" />,
          titleColor: 'text-slate-200'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: 100, 
        scale: 0.8,
        filter: 'blur(10px)'
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
        filter: 'blur(0px)',
        y: index * -80
      }}
      exit={{ 
        opacity: 0, 
        x: 100, 
        scale: 0.8,
        filter: 'blur(10px)',
        transition: { duration: 0.2 }
      }}
      transition={{ 
        type: "spring", 
        damping: 20, 
        stiffness: 300,
        duration: 0.4
      }}
      whileHover={{ 
        scale: 1.02,
        y: index * -80 - 5
      }}
      className={`
        glass-card-premium pointer-events-auto mb-4 p-4 min-w-0 max-w-sm
        ${styles.bg} ${styles.border}
        backdrop-blur-xl shadow-2xl
        hover:shadow-lg hover:shadow-secondary-500/20
        ${toast.type === 'premium' ? 'animate-glow' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <motion.div
          animate={toast.type === 'premium' ? {
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          } : {}}
          transition={toast.type === 'premium' ? {
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          } : {}}
          className="flex-shrink-0 mt-0.5"
        >
          {toast.icon || styles.icon}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.h4 
            className={`font-bold text-sm ${styles.titleColor} mb-1`}
            animate={isHovered ? { x: 2 } : { x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {toast.title}
          </motion.h4>
          
          {toast.message && (
            <p className="text-slate-300 text-xs leading-relaxed mb-3">
              {toast.message}
            </p>
          )}

          {/* Action Button */}
          {toast.action && (
            <motion.button
              onClick={toast.action.onClick}
              className="text-xs font-medium text-secondary-400 hover:text-secondary-300 transition-colors underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {toast.action.label}
            </motion.button>
          )}
        </div>

        {/* Close Button */}
        {toast.showClose && (
          <motion.button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-700/50 rounded"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <XMarkIcon className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Progress Bar for timed toasts */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

// Convenience functions for quick toast creation
export const showSuccessToast = (title: string, message?: string) => {
  // This would need to be used within a component with access to useToast
  return { type: 'success' as ToastType, title, message };
};

export const showErrorToast = (title: string, message?: string) => {
  return { type: 'error' as ToastType, title, message };
};

export const showWarningToast = (title: string, message?: string) => {
  return { type: 'warning' as ToastType, title, message };
};

export const showInfoToast = (title: string, message?: string) => {
  return { type: 'info' as ToastType, title, message };
};

export const showPremiumToast = (title: string, message?: string) => {
  return { type: 'premium' as ToastType, title, message };
}; 