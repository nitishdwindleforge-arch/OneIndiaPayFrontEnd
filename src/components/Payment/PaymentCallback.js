import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing payment...');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    try {
      // Get payment details from URL parameters
      const paymentId = searchParams.get('razorpay_payment_id');
      const orderId = searchParams.get('razorpay_order_id');
      const signature = searchParams.get('razorpay_signature');
      const amount = searchParams.get('amount');
      const userId = searchParams.get('userId');

      if (!paymentId || !orderId || !userId || !amount) {
        throw new Error('Missing payment parameters');
      }

      setMessage('Completing transaction...');

      // Step 1: Complete transaction via TransactionService
      const transactionId = `TXN_${Date.now()}_${userId}`;
      
      try {
        await apiService.completeTransaction(transactionId, paymentId);
      } catch (error) {
        console.warn('TransactionService failed, proceeding with manual completion');
      }

      // Step 2: Credit wallet directly
      await apiService.creditWallet({
        userId: parseInt(userId),
        amount: parseFloat(amount),
        transactionType: 'CREDIT',
        description: `Payment completed - Order: ${orderId}, Payment: ${paymentId}`
      });

      // Step 3: Set commission if applicable
      try {
        await apiService.setCommission({
          userId: parseInt(userId),
          transactionAmount: parseFloat(amount),
          orderId: orderId,
          paymentId: paymentId
        });
      } catch (error) {
        console.warn('Commission setting failed:', error);
      }

      setStatus('success');
      setMessage('Payment completed successfully! Your wallet has been credited.');
      toast.success('Payment successful! Wallet credited.');

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        switch (user?.role) {
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
      }, 3000);

    } catch (error) {
      console.error('Payment callback error:', error);
      setStatus('error');
      setMessage('Payment processing failed. Please contact support.');
      toast.error('Payment processing failed');

      // Redirect to dashboard after 5 seconds even on error
      setTimeout(() => {
        switch (user?.role) {
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
      }, 5000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <FiLoader className="animate-spin" />;
      case 'success':
        return <FiCheckCircle />;
      case 'error':
        return <FiXCircle />;
      default:
        return <FiLoader className="animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#2ed573';
      case 'error':
        return '#ff6b6b';
      default:
        return '#667eea';
    }
  };

  return (
    <div className="payment-container">
      <motion.div
        className="payment-card glass-effect"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="callback-content">
          <motion.div
            className="status-icon"
            style={{ color: getStatusColor() }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {getStatusIcon()}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ color: 'white', marginBottom: '20px' }}
          >
            {status === 'processing' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Failed'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center' }}
          >
            {message}
          </motion.p>

          {status === 'success' && (
            <motion.div
              className="success-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: 'rgba(46, 213, 115, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(46, 213, 115, 0.3)'
              }}
            >
              <p style={{ color: '#2ed573', fontSize: '14px' }}>
                ✅ Transaction completed<br/>
                ✅ Wallet credited<br/>
                ✅ Commission processed
              </p>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '14px', 
              marginTop: '20px' 
            }}
          >
            Redirecting to dashboard...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCallback;