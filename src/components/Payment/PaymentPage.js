import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCreditCard, FiShield } from 'react-icons/fi';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Payment.css';

const PaymentPage = () => {
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const pendingTransaction = localStorage.getItem('pendingTransaction');
    if (pendingTransaction) {
      setTransactionData(JSON.parse(pendingTransaction));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handlePayment = async () => {
    if (!transactionData) {
      toast.error('No transaction data found');
      return;
    }

    setLoading(true);
    console.log('Starting payment with data:', transactionData);



    // Real Razorpay payment for actual orders
    if (!window.Razorpay) {
      toast.error('Razorpay SDK not loaded. Please refresh the page.');
      setLoading(false);
      return;
    }

    try {
      console.log('Initializing Razorpay with order:', transactionData.orderId);
      
      const options = {
        key: 'rzp_test_Re1hn0ePs3Wiuj',
        amount: transactionData.amount * 100,
        currency: transactionData.currency,
        name: 'OneIndia Pay',
        description: 'Wallet Credit',
        order_id: transactionData.razorpayOrderId,
        handler: async (response) => {
          try {
            // Complete transaction - backend handles wallet credit and commission distribution
            await apiService.completeTransaction(transactionData.transactionId, response.razorpay_payment_id);

            localStorage.removeItem('pendingTransaction');
            toast.success('Payment completed successfully!');
            
            // Navigate to dashboard based on role
            const dashboardRoutes = {
              'ADMIN': '/admin',
              'SUPER_DISTRIBUTOR': '/super-distributor',
              'DISTRIBUTOR': '/distributor',
              'RETAILER': '/retailer'
            };
            navigate(dashboardRoutes[user.role] || '/login');
          } catch (error) {
            console.error('Payment completion error:', error);
            toast.error('Error completing payment. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.warning('Payment cancelled');
          }
        }
      };

      console.log('Creating Razorpay instance with options:', options);
      const rzp = new window.Razorpay(options);
      
      console.log('Opening Razorpay checkout...');
      rzp.open();
      
      setLoading(false);
    } catch (error) {
      console.error('Razorpay error:', error);
      toast.error('Error initiating payment: ' + error.message);
      setLoading(false);
    }
  };

  const handleBack = () => {
    localStorage.removeItem('pendingTransaction');
    switch (user.role) {
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'SUPER_DISTRIBUTOR':
        navigate('/super-distributor');
        break;
      case 'DISTRIBUTOR':
        navigate('/distributor');
        break;
      case 'RETAILER':
        navigate('/retailer');
        break;
      default:
        navigate('/login');
    }
  };

  if (!transactionData) {
    return <div className="loader"></div>;
  }

  return (
    <div className="payment-container">
      <motion.div
        className="payment-card glass-effect"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="payment-header">
          <button className="back-btn" onClick={handleBack}>
            <FiArrowLeft />
          </button>
          <h1>Complete Payment</h1>
        </div>

        <div className="payment-details">
          <div className="amount-display">
            <FiCreditCard className="amount-icon" />
            <div>
              <p>Amount to Pay</p>
              <h2>₹{transactionData.amount}</h2>
            </div>
          </div>

          <div className="transaction-info">
            {transactionData.transactionId && (
              <div className="info-row">
                <span>Transaction ID:</span>
                <span>{transactionData.transactionId}</span>
              </div>
            )}
            <div className="info-row">
              <span>Order ID:</span>
              <span>{transactionData.orderId}</span>
            </div>
            <div className="info-row">
              <span>Currency:</span>
              <span>{transactionData.currency}</span>
            </div>
          </div>
        </div>

        <motion.button
          className="pay-btn"
          onClick={handlePayment}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="loader"></div>
          ) : (
            <>
              <FiShield />
              Pay Securely with Razorpay
            </>
          )}
        </motion.button>

        <div className="security-info">
          <div className="security-item">
            <FiShield />
            <span>256-bit SSL Encryption</span>
          </div>
          <div className="security-item">
            <FiCreditCard />
            <span>PCI DSS Compliant</span>
          </div>
        </div>

        <div className="payment-methods">
          <p>Accepted Payment Methods:</p>
          <div className="method-icons">
            <span>💳 Credit Card</span>
            <span>💳 Debit Card</span>
            <span>🏦 Net Banking</span>
            <span>📱 UPI</span>
            <span>📱 Wallets</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;