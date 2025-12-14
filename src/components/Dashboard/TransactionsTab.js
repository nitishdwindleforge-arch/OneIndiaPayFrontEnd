import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFilter } from 'react-icons/fi';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const TransactionsTab = ({ isAdmin = false }) => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let response;
      const today = new Date();
      
      if (isAdmin) {
        // Admin sees all transactions
        response = await apiService.getAllTransactions();
      } else {
        // Users see their own transactions
        switch (filter) {
          case 'day':
            response = await apiService.getUserTransactions(user.id);
            // Filter today's transactions
            break;
          case 'week':
            const weekNum = getWeekNumber(today);
            response = await apiService.getUserTransactionsByWeek(user.id, today.getFullYear(), weekNum);
            break;
          case 'month':
            response = await apiService.getUserTransactionsByMonth(user.id, today.getFullYear(), today.getMonth() + 1);
            break;
          default:
            response = await apiService.getUserTransactions(user.id);
        }
      }
      
      setTransactions(response.data || []);
    } catch (error) {
      toast.error('Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const downloadTransactions = () => {
    const csvContent = [
      ['Transaction ID', 'Amount', 'Status', 'Date', 'Type'].join(','),
      ...transactions.map(t => [
        t.transactionId,
        t.amount,
        t.status,
        new Date(t.createdAt).toLocaleDateString(),
        t.type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${filter}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      'COMPLETED': 'status-completed',
      'PENDING': 'status-pending',
      'FAILED': 'status-failed'
    };
    
    return (
      <span className={`status-badge ${statusClass[status] || 'status-pending'}`}>
        {status}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="transactions-container"
    >
      <div className="transactions-header">
        <h2>{isAdmin ? 'All Transactions' : 'My Transactions'}</h2>
        <div className="transactions-actions">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'day' ? 'active' : ''}`}
              onClick={() => setFilter('day')}
            >
              Today
            </button>
            <button
              className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
              onClick={() => setFilter('week')}
            >
              This Week
            </button>
            <button
              className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
              onClick={() => setFilter('month')}
            >
              This Month
            </button>
          </div>
          <motion.button
            className="download-btn"
            onClick={downloadTransactions}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiDownload />
            Download
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="loader"></div>
      ) : (
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>User Amount</th>
                {isAdmin && <th>Admin Commission</th>}
                {isAdmin && <th>Parent Commission</th>}
                <th>Status</th>
                <th>Type</th>
                <th>Date</th>
                {isAdmin && <th>User ID</th>}
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <motion.tr
                  key={transaction.transactionId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td>{transaction.transactionId}</td>
                  <td>₹{transaction.amount?.toFixed(2)}</td>
                  <td>₹{transaction.userAmount?.toFixed(2)}</td>
                  {isAdmin && <td>{transaction.adminCommission?.toFixed(2)}%</td>}
                  {isAdmin && <td>{transaction.parentCommission?.toFixed(2)}%</td>}
                  <td>{getStatusBadge(transaction.status)}</td>
                  <td>{transaction.type}</td>
                  <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  {isAdmin && <td>{transaction.userId}</td>}
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {transactions.length === 0 && (
            <div className="no-data">
              <p>No transactions found</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TransactionsTab;