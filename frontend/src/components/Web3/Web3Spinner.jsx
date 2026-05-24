import React from 'react';
import './Web3Spinner.css';

const Web3Spinner = ({ isVisible, message = 'Đang xử lý...' }) => {
  if (!isVisible) return null;

  return (
    <div className="web3-spinner-overlay">
      <div className="web3-spinner-container">
        <div className="spinner-loading">
          <div className="spinner-animation"></div>
        </div>
        <p className="spinner-text">{message}</p>
      </div>
    </div>
  );
};

export default Web3Spinner;
