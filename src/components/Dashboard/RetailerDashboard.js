import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCreditCard } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import DashboardLayout from './DashboardLayout';
import TransactionsTab from './TransactionsTab';
import BBPSServices from './BBPSServices';
import AddMoneyModal from './AddMoneyModal';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const RetailerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    thisMonthTransactions: 0
  });
  const [showAddMoney, setShowAddMoney] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const transactionsResponse = await apiService.getUserTransactions(user.id);
      const transactions = transactionsResponse.data || [];
      
      const totalAmount = transactions.reduce((sum, t) => sum + (t.userAmount || 0), 0);
      const thisMonth = new Date().getMonth() + 1;
      const thisYear = new Date().getFullYear();
      
      const monthlyResponse = await apiService.getUserTransactionsByMonth(user.id, thisYear, thisMonth);
      const monthlyTransactions = monthlyResponse.data || [];

      setStats({
        totalTransactions: transactions.length,
        totalAmount: totalAmount,
        thisMonthTransactions: monthlyTransactions.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
              <div className="card-title">Total Transactions</div>
              <div className="card-value">{stats.totalTransactions}</div>
              <div className="card-subtitle">All time</div>
            </div>
            <FiCreditCard className="card-icon" />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-title">Total Amount</div>
              <div className="card-value">₹{stats.totalAmount.toFixed(2)}</div>
              <div className="card-subtitle">Credited to wallet</div>
            </div>
            <BiRupee className="card-icon" />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-title">This Month</div>
              <div className="card-value">{stats.thisMonthTransactions}</div>
              <div className="card-subtitle">Transactions</div>
            </div>
            <FiTrendingUp className="card-icon" />
          </div>
        </div>
      </div>

      <div className="welcome-message">
        <motion.div
          className="welcome-card glass-effect"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Welcome to OneIndia Pay!</h3>
          <p>Start by adding money to your wallet and explore our services.</p>
          <motion.button
            className="cta-btn"
            onClick={() => setShowAddMoney(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Money Now
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
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
      role="RETAILER"
    >
      {renderContent()}
      {showAddMoney && (
        <AddMoneyModal 
          onClose={() => setShowAddMoney(false)}
          onSuccess={() => {
            setShowAddMoney(false);
            fetchDashboardData();
            toast.success('Money added successfully!');
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default RetailerDashboard;