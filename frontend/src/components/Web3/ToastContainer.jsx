import React, { useState, useCallback } from 'react';
import Toast from './Toast';
import './ToastContainer.css';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  // Hàm để thêm toast (được export qua context)
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  // Hàm để xóa toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Lưu các hàm vào window để có thể truy cập từ bất kỳ đâu
  React.useEffect(() => {
    window.toastManager = {
      addToast,
      removeToast,
      success: (message, duration) => addToast(message, 'success', duration || 3000),
      error: (message, duration) => addToast(message, 'error', duration || 4000),
      warning: (message, duration) => addToast(message, 'warning', duration || 3500),
      info: (message, duration) => addToast(message, 'info', duration || 3000),
    };
  }, [addToast, removeToast]);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
