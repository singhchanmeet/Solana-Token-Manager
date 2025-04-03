import React, { useState } from 'react';
import './TokenSender.css';

const TokenSender = ({ sendToken, tokens, isLoading }) => {
  const [mintAddress, setMintAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendToken(mintAddress, parseFloat(amount), receiverAddress);
    // Reset form
    setAmount('');
    setReceiverAddress('');
  };

  return (
    <div className={`token-sender ${expanded ? 'expanded' : ''}`}>
      <div className="card-header" onClick={() => setExpanded(!expanded)}>
        <h3>Send Tokens</h3>
        <span className="toggle-icon">{expanded ? '−' : '+'}</span>
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="send-form">
          <div className="form-group">
            <label htmlFor="mintAddress">Token to Send:</label>
            {tokens.length > 0 ? (
              <select
                id="mintAddress"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                required
              >
                <option value="">Select a token</option>
                {tokens.map((token, index) => (
                  <option key={index} value={token.mint}>
                    {token.mint.slice(0, 10)}... (Balance: {token.balance})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="mintAddress"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="Enter token mint address"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount to Send:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0.000001"
              step="0.000001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="receiverAddress">Receiver's Wallet Address:</label>
            <input
              type="text"
              id="receiverAddress"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              placeholder="Enter receiver's address"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="send-button" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Tokens'}
            </button>
          </div>

          <div className="info-box">
            <p><strong>Note:</strong> Sending tokens requires SOL for transaction fees.</p>
            <p>Make sure the receiver's address is correct before sending.</p>
          </div>
        </form>
      )}
    </div>
  );
};

export default TokenSender;