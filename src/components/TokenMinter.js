import React, { useState } from 'react';
import './TokenMinter.css';

const TokenMinter = ({ mintToken, tokens, isLoading }) => {
  const [mintAddress, setMintAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [useCustomDestination, setUseCustomDestination] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    mintToken(mintAddress, parseFloat(amount), useCustomDestination ? destinationAddress : null);
    // Reset form
    setAmount('');
    setDestinationAddress('');
    setUseCustomDestination(false);
  };

  return (
    <div className={`token-minter ${expanded ? 'expanded' : ''}`}>
      <div className="card-header" onClick={() => setExpanded(!expanded)}>
        <h3>Mint Tokens</h3>
        <span className="toggle-icon">{expanded ? '−' : '+'}</span>
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="mint-form">
          <div className="form-group">
            <label htmlFor="mintAddress">Token Mint Address:</label>
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
            <label htmlFor="amount">Amount to Mint:</label>
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

          <div className="form-check">
            <input
              type="checkbox"
              id="useCustomDestination"
              checked={useCustomDestination}
              onChange={(e) => setUseCustomDestination(e.target.checked)}
            />
            <label htmlFor="useCustomDestination">
              Mint to a different wallet
            </label>
          </div>

          {useCustomDestination && (
            <div className="form-group">
              <label htmlFor="destinationAddress">Destination Wallet Address:</label>
              <input
                type="text"
                id="destinationAddress"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Enter destination wallet address"
                required={useCustomDestination}
              />
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="mint-button" 
              disabled={isLoading}
            >
              {isLoading ? 'Minting...' : 'Mint Tokens'}
            </button>
          </div>

          <div className="info-box">
            <p><strong>Note:</strong> You can only mint tokens for which you are the mint authority.</p>
            <p>Minting requires SOL for transaction fees.</p>
          </div>
        </form>
      )}
    </div>
  );
};

export default TokenMinter;