import React, { useState } from 'react';
import './TokenCreator.css';

const TokenCreator = ({ createToken, isLoading }) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    createToken(tokenName, tokenSymbol, tokenDecimals);
    // Reset form
    setTokenName('');
    setTokenSymbol('');
    setTokenDecimals(9);
  };

  return (
    <div className={`token-creator ${expanded ? 'expanded' : ''}`}>
      <div className="card-header" onClick={() => setExpanded(!expanded)}>
        <h3>Create New Token</h3>
        <span className="toggle-icon">{expanded ? '−' : '+'}</span>
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="token-form">
          <div className="form-group">
            <label htmlFor="tokenName">Token Name:</label>
            <input
              type="text"
              id="tokenName"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="Enter token name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tokenSymbol">Token Symbol:</label>
            <input
              type="text"
              id="tokenSymbol"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="Enter token symbol"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tokenDecimals">Token Decimals:</label>
            <input
              type="number"
              id="tokenDecimals"
              value={tokenDecimals}
              onChange={(e) => setTokenDecimals(parseInt(e.target.value))}
              min="0"
              max="9"
              required
            />
            <span className="helper-text">Number of decimal places (0-9)</span>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="create-button" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Token'}
            </button>
          </div>

          <div className="info-box">
            <p><strong>Note:</strong> Creating a token requires SOL for transaction fees.</p>
            <p>You will be the mint authority for this token and can mint new tokens later.</p>
          </div>
        </form>
      )}
    </div>
  );
};

export default TokenCreator;