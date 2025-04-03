import React, { useState, useEffect } from 'react';
import './TransactionHistory.css';

const TransactionHistory = ({ transactions, refreshTransactions, isLoading }) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5); // Show 5 transactions per page
  
  // Reset to page 1 when transactions change
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  // Function to open the Solana Explorer for a transaction
  const openExplorer = (signature) => {
    if (signature) {
      window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');
    }
  };

  // Get current transactions for pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Calculate total pages
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="transaction-history">
      <div className="transaction-header">
        <h2>Transaction History</h2>
        <div className="transaction-actions">
          <button 
            className="refresh-button"
            onClick={refreshTransactions}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {isLoading && transactions.length === 0 ? (
        <div className="loading-transactions">
          <p>Loading transaction history...</p>
        </div>
      ) : transactions.length > 0 ? (
        <div className="transactions-container">
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((tx) => (
                  <tr key={tx.id} className={`transaction-row ${tx.status.toLowerCase()}`}>
                    <td className="transaction-type">{tx.type}</td>
                    <td className="transaction-details">{tx.details}</td>
                    <td className="transaction-time">{tx.timestamp}</td>
                    <td className="transaction-status">{tx.status}</td>
                    <td className="transaction-actions">
                      {tx.signature && (
                        <button
                          className="explorer-button"
                          onClick={() => openExplorer(tx.signature)}
                        >
                          View on Explorer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={goToPreviousPage} 
                disabled={currentPage === 1}
                className="pagination-button"
              >
                &laquo; Previous
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`pagination-page-button ${currentPage === number ? 'active' : ''}`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next &raquo;
              </button>
            </div>
          )}
          
          <div className="pagination-info">
            Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length} transactions
          </div>
        </div>
      ) : (
        <div className="no-transactions">
          <p>No transactions found for this wallet on the Solana devnet.</p>
          <p>Create or mint tokens to see your transactions here.</p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;