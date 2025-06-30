import React, { createContext, useContext, useState } from 'react';
import { Toast, ToastType } from '../components/ui/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number, action?: { label: string; onPress: () => void }) => void;
  showSuccess: (message: string, action?: { label: string; onPress: () => void }) => void;
  showError: (message: string, action?: { label: string; onPress: () => void }) => void;
  showWarning: (message: string, action?: { label: string; onPress: () => void }) => void;
  showInfo: (message: string, action?: { label: string; onPress: () => void }) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (
    message: string,
    type: ToastType = 'info',
    duration?: number,
    action?: { label: string; onPress: () => void }
  ) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
      action,
    });
  };

  const showSuccess = (message: string, action?: { label: string; onPress: () => void }) => {
    showToast(message, 'success', 3000, action);
  };

  const showError = (message: string, action?: { label: string; onPress: () => void }) => {
    showToast(message, 'error', 4000, action);
  };

  const showWarning = (message: string, action?: { label: string; onPress: () => void }) => {
    showToast(message, 'warning', 4000, action);
  };

  const showInfo = (message: string, action?: { label: string; onPress: () => void }) => {
    showToast(message, 'info', 3000, action);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
        action={toast.action}
      />
    </ToastContext.Provider>
  );
}
