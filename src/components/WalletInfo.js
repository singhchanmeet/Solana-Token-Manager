import React from 'react';
import './WalletInfo.css';

const WalletInfo = ({ publicKey, solBalance, tokens }) => {
  // Function to truncate public key for display
  const truncatePublicKey = (key) => {
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  return (
    <div className="wallet-info">
      <h2>Wallet Information</h2>
      
      <div className="wallet-address">
        <span className="label">Address:</span>
        <span className="value">{truncatePublicKey(publicKey)}</span>
        <button 
          className="copy-button" 
          onClick={() => {
            navigator.clipboard.writeText(publicKey);
            alert('Address copied to clipboard!');
          }}
        >
          Copy
        </button>
      </div>
      
      <div className="wallet-balance">
        <span className="label">SOL Balance:</span>
        <span className="value">{solBalance.toFixed(4)} SOL</span>
      </div>
      
      {tokens.length > 0 ? (
        <div className="token-list">
          <h3>Token Balances</h3>
          <ul>
            {tokens.map((token, index) => (
              <li key={index} className="token-item">
                <div className="token-mint">
                  <span className="label">Mint:</span>
                  <span className="value">{truncatePublicKey(token.mint)}</span>
                </div>
                <div className="token-balance">
                  <span className="label">Balance:</span>
                  <span className="value">{token.balance}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="no-tokens">
          <p>No tokens found in this wallet</p>
        </div>
      )}
    </div>
  );
};

export default WalletInfo;