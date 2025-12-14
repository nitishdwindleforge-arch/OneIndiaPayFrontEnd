import React from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiDroplet, FiWifi, FiPhone, FiTv, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';

const BBPSServices = () => {
  const services = [
    { id: 'electricity', name: 'Electricity', icon: FiZap, color: '#f39c12' },
    { id: 'water', name: 'Water', icon: FiDroplet, color: '#3498db' },
    { id: 'gas', name: 'Gas', icon: FiZap, color: '#e74c3c' },
    { id: 'broadband', name: 'Broadband', icon: FiWifi, color: '#9b59b6' },
    { id: 'mobile', name: 'Mobile Recharge', icon: FiPhone, color: '#2ecc71' },
    { id: 'dth', name: 'DTH Recharge', icon: FiTv, color: '#e67e22' },
    { id: 'insurance', name: 'Insurance Premium', icon: FiCreditCard, color: '#34495e' },
    { id: 'loan', name: 'Loan EMI', icon: FiCreditCard, color: '#16a085' },
    { id: 'fastag', name: 'FASTag Recharge', icon: FiCreditCard, color: '#8e44ad' },
    { id: 'municipal', name: 'Municipal Tax', icon: FiCreditCard, color: '#d35400' },
    { id: 'education', name: 'Education Fee', icon: FiCreditCard, color: '#27ae60' },
    { id: 'hospital', name: 'Hospital Bills', icon: FiCreditCard, color: '#c0392b' }
  ];

  const handleServiceClick = (service) => {
    toast.info(`${service.name} service will be available soon!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="section-header">
        <h2>BBPS Bill Payment Services</h2>
        <p>Pay your bills instantly and securely</p>
      </div>

      <div className="bbps-grid">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            className="bbps-service"
            onClick={() => handleServiceClick(service)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: `0 10px 30px ${service.color}30`
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bbps-icon" style={{ color: service.color }}>
              <service.icon />
            </div>
            <h3>{service.name}</h3>
            <p>Pay bills instantly</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="bbps-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="info-card glass-effect">
          <h3>Why Choose Our BBPS Services?</h3>
          <ul>
            <li>✅ Instant bill payments</li>
            <li>✅ Secure transactions</li>
            <li>✅ Multiple payment options</li>
            <li>✅ 24/7 availability</li>
            <li>✅ Instant receipts</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BBPSServices;