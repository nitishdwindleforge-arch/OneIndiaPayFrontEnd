import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCheckCircle, FiClock, FiXCircle, FiBarChart } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

const TransactionStatsTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    fetchTransactionStats();
  }, []);

  const fetchTransactionStats = async () => {
    setLoading(true);
    try {
      const response = await apiService.getTransactionStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Error fetching transaction statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllTransactions();
      setAllTransactions(response.data);
      setShowAllTransactions(true);
    } catch (error) {
      toast.error('Error fetching all transactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading transaction statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="no-data">
        <p>No statistics available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="transactions-header">
        <h2>Transaction Statistics</h2>
        <motion.button
          className="refresh-btn"
          onClick={fetchTransactionStats}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Refresh
        </motion.button>
      </div>

      {/* Transaction Count Stats */}
      <div className="stats-section">
        <h3>Transaction Overview</h3>
        <div className="dashboard-grid">
          <motion.div 
            className="dashboard-card clickable-card"
            onClick={fetchAllTransactions}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="card-header">
              <div>
                <div className="card-title">Total Transactions</div>
                <div className="card-value">{stats.totalTransactions}</div>
                <div className="card-subtitle">Click to view all</div>
              </div>
              <FiBarChart className="card-icon" />
            </div>
          </motion.div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Completed</div>
                <div className="card-value">{stats.completedTransactions}</div>
                <div className="card-subtitle">Successful transactions</div>
              </div>
              <FiCheckCircle className="card-icon" style={{ color: '#2ed573' }} />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Pending</div>
                <div className="card-value">{stats.pendingTransactions}</div>
                <div className="card-subtitle">In progress</div>
              </div>
              <FiClock className="card-icon" style={{ color: '#ffc107' }} />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Failed</div>
                <div className="card-value">{stats.failedTransactions}</div>
                <div className="card-subtitle">Failed transactions</div>
              </div>
              <FiXCircle className="card-icon" style={{ color: '#ff6b6b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Amount Stats */}
      <div className="stats-section">
        <h3>Financial Overview</h3>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Total Credited</div>
                <div className="card-value">₹{stats.totalAmountCredited?.toFixed(2) || '0.00'}</div>
                <div className="card-subtitle">Money added to wallets</div>
              </div>
              <FiTrendingUp className="card-icon" style={{ color: '#2ed573' }} />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Total Debited</div>
                <div className="card-value">₹{stats.totalAmountDebited?.toFixed(2) || '0.00'}</div>
                <div className="card-subtitle">Money withdrawn</div>
              </div>
              <FiTrendingUp className="card-icon" style={{ color: '#ff6b6b' }} />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">User Amount</div>
                <div className="card-value">₹{stats.totalUserAmount?.toFixed(2) || '0.00'}</div>
                <div className="card-subtitle">Total to users</div>
              </div>
              <BiRupee className="card-icon" style={{ color: '#667eea' }} />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Total Commission</div>
                <div className="card-value">₹{stats.totalCommissionEarned?.toFixed(2) || '0.00'}</div>
                <div className="card-subtitle">Platform earnings</div>
              </div>
              <BiRupee className="card-icon" style={{ color: '#f39c12' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="stats-section">
        <h3>Commission Breakdown</h3>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Admin Commission</div>
                <div className="card-value">₹{stats.totalAdminCommission?.toFixed(2) || '0.00'}</div>
                <div className="card-subtitle">Platform commission</div>
              </div>
              <BiRupee className="card-icon" style={{ color: '#e74c3c' }} />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Parent Commission</div>
                <div className="card-value">₹{stats.totalParentCommission?.toFixed(2) || '0.00'}</div>
                <div className="card-subtitle">Referral commission</div>
              </div>
              <BiRupee className="card-icon" style={{ color: '#9b59b6' }} />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Success Rate</div>
                <div className="card-value">
                  {stats.totalTransactions > 0 
                    ? ((stats.completedTransactions / stats.totalTransactions) * 100).toFixed(1)
                    : '0.0'
                  }%
                </div>
                <div className="card-subtitle">Transaction success</div>
              </div>
              <FiCheckCircle className="card-icon" style={{ color: '#2ed573' }} />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <div className="card-title">Average Transaction</div>
                <div className="card-value">
                  ₹{stats.completedTransactions > 0 
                    ? (stats.totalAmountCredited / stats.completedTransactions).toFixed(2)
                    : '0.00'
                  }
                </div>
                <div className="card-subtitle">Per transaction</div>
              </div>
              <FiBarChart className="card-icon" style={{ color: '#17a2b8' }} />
            </div>
          </div>
        </div>
      </div>

      {/* All Transactions Table */}
      {showAllTransactions && (
        <div className="stats-section">
          <div className="transactions-header">
            <h3>All Transactions ({allTransactions.length})</h3>
            <button 
              onClick={() => setShowAllTransactions(false)}
              className="action-btn-small"
            >
              Hide
            </button>
          </div>
          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>User ID</th>
                  <th>Amount</th>
                  <th>User Amount</th>
                  <th>Admin Commission</th>
                  <th>Parent Commission</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions.map((transaction) => (
                  <tr key={transaction.transactionId}>
                    <td>{transaction.transactionId}</td>
                    <td>{transaction.userId}</td>
                    <td>₹{transaction.amount?.toFixed(2)}</td>
                    <td>₹{transaction.userAmount?.toFixed(2)}</td>
                    <td>₹{transaction.adminCommission?.toFixed(2)}</td>
                    <td>₹{transaction.parentCommission?.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${
                        transaction.status === 'COMPLETED' ? 'status-completed' :
                        transaction.status === 'PENDING' ? 'status-pending' : 'status-failed'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{transaction.type}</td>
                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TransactionStatsTab;