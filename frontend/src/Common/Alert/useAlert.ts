// src/hooks/useAlert.ts
import { useState, useCallback } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback((state: AlertState) => {
    setAlert(state);
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return { alert, showAlert, hideAlert };
};