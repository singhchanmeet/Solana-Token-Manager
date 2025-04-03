import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    // Auto-close notification after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        <span 
          className="notification-icon"
        >
          {type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
        </span>
        <span className="notification-message">{message}</span>
      </div>
      <button className="notification-close" onClick={onClose}>×</button>
    </div>
  );
};

export default Notification;