import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [type, setType] = useState('info');

  const showToast = (msg, toastType = 'info') => {
    setMessage(msg);
    setType(toastType);
    window.clearTimeout(window.toastTimer);
    window.toastTimer = window.setTimeout(() => setMessage(null), 3600);
  };

  return (
    <ToastContext.Provider value={{ showToast, showError: (msg) => showToast(msg, 'error'), showSuccess: (msg) => showToast(msg, 'success') }}>
      {children}
      {message && (
        <div className={`toast ${type}`}>
          <span>{message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
