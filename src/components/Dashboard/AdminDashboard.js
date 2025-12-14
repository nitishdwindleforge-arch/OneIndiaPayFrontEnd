import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiSettings, FiBell, FiMessageSquare } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import DashboardLayout from './DashboardLayout';
import TransactionsTab from './TransactionsTab';
import BBPSServices from './BBPSServices';
import AddMoneyModal from './AddMoneyModal';
import TransactionStatsTab from './TransactionStatsTab';
import Queries from '../Queries/Queries';
import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingQueries: 0
  });
  const [users, setUsers] = useState([]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersResponse, transactionStatsResponse] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getTransactionStats()
      ]);
      
      setUsers(usersResponse.data);
      setStats({
        totalUsers: usersResponse.data.length,
        totalTransactions: transactionStatsResponse.data.totalTransactions || 0,
        totalRevenue: transactionStatsResponse.data.totalAmountCredited || 0,
        pendingQueries: 0
      });
    } catch (error) {
      toast.error('Error fetching dashboard data');
    }
  };

  const handleResetCommission = async () => {
    try {
      await apiService.updateDefaultCommission({
        adminCommissionRate: 2.0,
        parentCommissionRate: 1.0
      });
      toast.success('Default commission rates reset successfully');
    } catch (error) {
      toast.error('Error resetting commission rates');
    }
  };

  const handleStatusEdit = (userId, currentStatus) => {
    setEditingStatus(userId);
    setNewStatus(currentStatus);
  };

  const handleStatusUpdate = async (userId) => {
    try {
      await apiService.updateUser(userId, { status: newStatus });
      toast.success('User status updated successfully');
      setEditingStatus(null);
      fetchDashboardData();
    } catch (error) {
      toast.error('Error updating user status');
    }
  };

  const handleStatusCancel = () => {
    setEditingStatus(null);
    setNewStatus('');
  };

  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="dashboard-grid">
        <motion.div 
          className="dashboard-card clickable-card"
          onClick={() => setActiveTab('users')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="card-header">
            <div>
              <div className="card-title">Total Users</div>
              <div className="card-value">{stats.totalUsers}</div>
              <div className="card-subtitle">Click to view all users</div>
            </div>
            <FiUsers className="card-icon" />
          </div>
        </motion.div>

        <motion.div 
          className="dashboard-card clickable-card"
          onClick={() => setActiveTab('transactions')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="card-header">
            <div>
              <div className="card-title">Total Transactions</div>
              <div className="card-value">{stats.totalTransactions}</div>
              <div className="card-subtitle">Click to view all transactions</div>
            </div>
            <FiTrendingUp className="card-icon" />
          </div>
        </motion.div>

        <motion.div 
          className="dashboard-card clickable-card"
          onClick={() => setActiveTab('transaction-stats')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="card-header">
            <div>
              <div className="card-title">Total Revenue</div>
              <div className="card-value">₹{stats.totalRevenue}</div>
              <div className="card-subtitle">Click to view stats</div>
            </div>
            <FiTrendingUp className="card-icon" />
          </div>
        </motion.div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-title">Pending Queries</div>
              <div className="card-value">{stats.pendingQueries}</div>
              <div className="card-subtitle">Need attention</div>
            </div>
            <FiMessageSquare className="card-icon" />
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <motion.button
          className="action-btn"
          onClick={handleResetCommission}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiSettings />
          Reset Default Commission
        </motion.button>
      </div>
    </motion.div>
  );

  const renderUsers = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="transactions-container"
    >
      <div className="transactions-header">
        <h2>All Users ({users.length})</h2>
      </div>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Parent ID</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <span className={`status-badge ${
                  user.role === 'ADMIN' ? 'status-completed' :
                  user.role === 'SUPER_DISTRIBUTOR' ? 'status-pending' :
                  user.role === 'DISTRIBUTOR' ? 'status-failed' : 'status-completed'
                }`}>
                  {user.role}
                </span>
              </td>
              <td>{user.parentId || 'N/A'}</td>
              <td>
                {editingStatus === user.id ? (
                  <div className="status-edit-container">
                    <select 
                      value={newStatus} 
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="status-select"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="SUSPEND">SUSPEND</option>
                    </select>
                    <button 
                      onClick={() => handleStatusUpdate(user.id)}
                      className="status-btn status-btn-confirm"
                    >
                      ✓
                    </button>
                    <button 
                      onClick={handleStatusCancel}
                      className="status-btn status-btn-cancel"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="status-edit-container">
                    <span className={`status-badge ${
                      user.status === 'ACTIVE' ? 'status-completed' : 
                      user.status === 'PENDING' ? 'status-pending' : 'status-failed'
                    }`}>
                      {user.status || 'ACTIVE'}
                    </span>
                    <button 
                      onClick={() => handleStatusEdit(user.id, user.status || 'ACTIVE')}
                      className="status-btn status-btn-edit"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="transactions-container"
    >
      <div className="transactions-header">
        <h2>Notifications</h2>
      </div>
      <div className="notification-list">
        <div className="notification-item">
          <FiBell className="notification-icon" />
          <div>
            <h4>New User Registration</h4>
            <p>John Doe registered as Retailer</p>
            <small>2 hours ago</small>
          </div>
        </div>
      </div>
    </motion.div>
  );



  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'transactions':
        return <TransactionsTab isAdmin={true} />;
      case 'transaction-stats':
        return <TransactionStatsTab />;
      case 'bbps':
        return <BBPSServices />;
      case 'notifications':
        return renderNotifications();
      case 'queries':
        return <Queries />;
      case 'add-money':
        setShowAddMoney(true);
        setActiveTab('dashboard');
        return renderDashboard();
      default:
        return renderDashboard();
    }
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      role="ADMIN"
    >
      {renderContent()}
      {showAddMoney && (
        <AddMoneyModal 
          onClose={() => setShowAddMoney(false)}
          onSuccess={() => {
            setShowAddMoney(false);
            toast.success('Money added successfully!');
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;