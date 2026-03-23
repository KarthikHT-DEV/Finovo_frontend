import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from '../components/CustomAlert';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState(null);

  const showAlert = useCallback((title, message, options = {}) => {
    setAlertConfig({
      title,
      message,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'CANCEL',
      onConfirm: () => {
        setAlertConfig(null);
        if (options.onConfirm) options.onConfirm();
      },
      onCancel: () => {
        setAlertConfig(null);
        if (options.onCancel) options.onCancel();
      },
      destructive: options.destructive || false,
      showCancel: !!options.onCancel || !!options.cancelText && options.cancelText !== 'CANCEL',
    });
  }, []);

  const hideAlert = useCallback(() => setAlertConfig(null), []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertConfig && (
        <CustomAlert
          visible={!!alertConfig}
          title={alertConfig.title}
          message={alertConfig.message}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.onCancel}
          destructive={alertConfig.destructive}
          showCancel={alertConfig.showCancel}
        />
      )}
    </AlertContext.Provider>
  );
};
