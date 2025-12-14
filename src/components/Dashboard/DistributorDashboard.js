import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiEdit } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import DashboardLayout from './DashboardLayout';
import TransactionsTab from './TransactionsTab';
import BBPSServices from './BBPSServices';
import AddMoneyModal from './AddMoneyModal';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const DistributorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalCommission: 0
  });
  const [myUsers, setMyUsers] = useState([]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users added by this distributor
      const usersResponse = await apiService.getAllUsers();
      const allUsers = usersResponse.data || [];
      const distributorUsers = allUsers.filter(u => u.parentId === user.id);
      
      setMyUsers(distributorUsers);
      setStats(prev => ({
        ...prev,
        totalUsers: distributorUsers.length
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleUpdateCommission = async (userId, newRates) => {
    try {
      await apiService.updateCommission(userId, newRates);
      toast.success('Commission rates updated successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Error updating commission rates');
    }
  };

  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-title">My Users</div>
              <div className="card-value">{stats.totalUsers}</div>
              <div className="card-subtitle">Added by me</div>
            </div>
            <FiUsers className="card-icon" />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-title">Total Transactions</div>
              <div className="card-value">{stats.totalTransactions}</div>
              <div className="card-subtitle">All time</div>
            </div>
            <FiTrendingUp className="card-icon" />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-title">Commission Earned</div>
              <div className="card-value">₹{stats.totalCommission}</div>
              <div className="card-subtitle">From user transactions</div>
            </div>
            <BiRupee className="card-icon" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderMyUsers = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="transactions-container"
    >
      <div className="transactions-header">
        <h2>My Users</h2>
      </div>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Commission Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {myUsers.map((userItem) => (
            <tr key={userItem.id}>
              <td>{userItem.username}</td>
              <td>{userItem.email}</td>
              <td>
                <span className="status-badge status-completed">
                  {userItem.role}
                </span>
              </td>
              <td>{userItem.phone}</td>
              <td>2.0%</td>
              <td>
                <motion.button
                  className="action-btn-small"
                  onClick={() => handleUpdateCommission(userItem.id, { rate: 2.5 })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit /> Update
                </motion.button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {myUsers.length === 0 && (
        <div className="no-data">
          <p>No users added yet</p>
        </div>
      )}
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'my-users':
        return renderMyUsers();
      case 'transactions':
        return <TransactionsTab />;
      case 'bbps':
        return <BBPSServices />;
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
      role="DISTRIBUTOR"
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

export default DistributorDashboard;