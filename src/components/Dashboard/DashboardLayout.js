import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiBell, FiMessageSquare, FiTrendingUp, FiSend } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';
import './Dashboard.css';

const DashboardLayout = ({ children, activeTab, setActiveTab, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchWalletBalance();
    if (role === 'ADMIN') {
      fetchUnreadNotifications();
    }
  }, [user, role]);

  const fetchWalletBalance = async () => {
    try {
      const response = await apiService.getWallet(user.id);
      setWalletBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await apiService.getNotificationsByStatus('UNREAD', 0, 1);
      setUnreadCount(response.data.totalElements || 0);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: FiCreditCard },
      { id: 'transactions', label: 'Transactions', icon: FiCreditCard },
      { id: 'bbps', label: 'BBPS Services', icon: FiCreditCard },
    ];

    const roleSpecificItems = {
      ADMIN: [
        { id: 'users', label: 'All Users', icon: FiUsers },
        { id: 'transaction-stats', label: 'Transaction Stats', icon: FiTrendingUp },
        { id: 'commission', label: 'Commission Settings', icon: FiSettings },
        { id: 'notifications', label: 'Notifications', icon: FiBell },
        { id: 'queries', label: 'Queries', icon: FiMessageSquare },
      ],
      SUPER_DISTRIBUTOR: [
        { id: 'my-users', label: 'My Users', icon: FiUsers },
      ],
      DISTRIBUTOR: [
        { id: 'my-users', label: 'My Users', icon: FiUsers },
      ],
      RETAILER: []
    };

    return [...baseItems, ...roleSpecificItems[role]];
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>OneIndia Pay</h2>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX />
          </button>
        </div>

        <div className="wallet-card">
          <div className="wallet-icon">
            <BiRupee />
          </div>
          <div className="wallet-info">
            <p>Wallet Balance</p>
            <h3>₹{walletBalance.toFixed(2)}</h3>
          </div>
          <div className="wallet-buttons">
            <motion.button 
              className="add-money-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('add-money')}
            >
              Add Money
            </motion.button>
            <motion.button 
              className="payout-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.info('Payout feature coming soon!')}
            >
              <FiSend />
              Payout
            </motion.button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {getMenuItems().map((item) => (
            <motion.button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              whileHover={{ x: 5 }}
            >
              <item.icon />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu />
            </button>
            <div className="header-info">
              <h1>Welcome, {user?.username}</h1>
              <p>{role.replace('_', ' ')}</p>
            </div>
          </div>
          {role === 'ADMIN' && (
            <div className="header-actions">
              <motion.button
                className="notification-btn"
                onClick={() => setActiveTab('notifications')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={`${unreadCount} unread notifications`}
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </motion.button>
            </div>
          )}
        </header>

        <div className="content-area">
          {children}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;