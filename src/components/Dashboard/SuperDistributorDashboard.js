import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiEdit, FiUserPlus } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import DashboardLayout from './DashboardLayout';
import TransactionsTab from './TransactionsTab';
import BBPSServices from './BBPSServices';
import AddMoneyModal from './AddMoneyModal';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const SuperDistributorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDistributors: 0,
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
      const usersResponse = await apiService.getAllUsers();
      const allUsers = usersResponse.data || [];
      const superDistributorUsers = allUsers.filter(u => u.parentId === user.id);
      const distributors = superDistributorUsers.filter(u => u.role === 'DISTRIBUTOR');
      
      setMyUsers(superDistributorUsers);
      setStats({
        totalUsers: superDistributorUsers.length,
        totalDistributors: distributors.length,
        totalCommission: 0 // Calculate from transactions
      });
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
              <div className="card-title">Total Users</div>
              <div className="card-value">{stats.totalUsers}</div>
              <div className="card-subtitle">Under my network</div>
            </div>
            <FiUsers className="card-icon" />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-title">Distributors</div>
              <div className="card-value">{stats.totalDistributors}</div>
              <div className="card-subtitle">Active distributors</div>
            </div>
            <FiUserPlus className="card-icon" />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-title">Commission Earned</div>
              <div className="card-value">₹{stats.totalCommission}</div>
              <div className="card-subtitle">From network</div>
            </div>
            <BiRupee className="card-icon" />
          </div>
        </div>
      </div>

      <div className="network-overview">
        <motion.div
          className="network-card glass-effect"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Network Overview</h3>
          <div className="network-stats">
            <div className="network-stat">
              <span className="stat-number">{stats.totalDistributors}</span>
              <span className="stat-label">Distributors</span>
            </div>
            <div className="network-stat">
              <span className="stat-number">{stats.totalUsers - stats.totalDistributors}</span>
              <span className="stat-label">Retailers</span>
            </div>
          </div>
        </motion.div>
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
        <h2>My Network Users</h2>
        <div className="filter-buttons">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Distributors</button>
          <button className="filter-btn">Retailers</button>
        </div>
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
                <span className={`status-badge ${
                  userItem.role === 'DISTRIBUTOR' ? 'status-completed' : 'status-pending'
                }`}>
                  {userItem.role}
                </span>
              </td>
              <td>{userItem.phone}</td>
              <td>{userItem.role === 'DISTRIBUTOR' ? '1.5%' : '2.0%'}</td>
              <td>
                <motion.button
                  className="action-btn-small"
                  onClick={() => handleUpdateCommission(userItem.id, { 
                    rate: userItem.role === 'DISTRIBUTOR' ? 2.0 : 2.5 
                  })}
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
          <p>No users in your network yet</p>
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
      role="SUPER_DISTRIBUTOR"
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

export default SuperDistributorDashboard;