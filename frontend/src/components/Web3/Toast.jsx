import React, { useEffect, useState } from 'react';
import './Toast.css';
import { LuCheck, LuX, LuAlertCircle } from 'react-icons/lu';

const Toast = ({ message = '', type = 'info', duration = 4000, onClose = () => {} }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!isVisible || !message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <LuCheck size={20} />;
      case 'error':
        return <LuX size={20} />;
      case 'warning':
        return <LuAlertCircle size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-message">
        {message}
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
