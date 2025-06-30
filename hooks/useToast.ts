import { useCallback, useState } from 'react';
import { ToastType } from '../components/ui/Toast';

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

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((
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
  }, []);

  const showSuccess = useCallback((message: string, action?: { label: string; onPress: () => void }) => {
    showToast(message, 'success', 3000, action);
  }, [showToast]);

  const showError = useCallback((message: string, action?: { label: string; onPress: () => void }) => {
    showToast(message, 'error', 4000, action);
  }, [showToast]);

  const showWarning = useCallback((message: string, action?: { label: string; onPress: () => void }) => {
    showToast(message, 'warning', 4000, action);
  }, [showToast]);

  const showInfo = useCallback((message: string, action?: { label: string; onPress: () => void }) => {
    showToast(message, 'info', 3000, action);
  }, [showToast]);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };
}
