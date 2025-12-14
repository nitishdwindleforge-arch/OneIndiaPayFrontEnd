import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const AddMoneyModal = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create payment order using PaymentService
      const orderResponse = await apiService.createOrder({
        amount: parseFloat(amount),
        currency: 'INR',
        receipt: `receipt_${user.id}_${Date.now()}`,
        notes: 'Wallet credit'
      });

      // Step 2: Initiate transaction using TransactionService
      const transactionResponse = await apiService.initiateTransaction({
        userId: user.id,
        amount: parseFloat(amount),
        description: 'Credit card to wallet transfer'
      });

      // Store order and transaction data for payment page
      localStorage.setItem('pendingTransaction', JSON.stringify({
        transactionId: transactionResponse.data.transactionId,
        orderId: orderResponse.data.orderId,
        razorpayOrderId: transactionResponse.data.razorpayOrderId,
        amount: parseFloat(amount),
        userAmount: transactionResponse.data.userAmount, // Amount after commission deductions
        currency: 'INR',
        userId: user.id
      }));

      // Navigate to frontend payment page
      navigate('/payment');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating payment order');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content glass-effect"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Add Money to Wallet</h2>
            <button className="modal-close" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Amount (₹)</label>
              <div className="input-wrapper">
                <FiCreditCard className="input-icon" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max="500000"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="amount-suggestions">
              <p>Quick amounts:</p>
              <div className="suggestion-buttons">
                {[100, 500, 1000, 2000, 5000].map((suggestedAmount) => (
                  <button
                    key={suggestedAmount}
                    type="button"
                    className="suggestion-btn"
                    onClick={() => setAmount(suggestedAmount.toString())}
                  >
                    ₹{suggestedAmount}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              className="modal-submit-btn"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <div className="loader"></div> : 'Proceed to Payment'}
            </motion.button>
          </form>

          <div className="payment-info">
            <p>💳 Secure payment powered by Razorpay</p>
            <p>🔒 Your payment details are encrypted and secure</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddMoneyModal;