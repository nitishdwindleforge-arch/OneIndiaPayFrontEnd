import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import SuperDistributorDashboard from './components/Dashboard/SuperDistributorDashboard';
import DistributorDashboard from './components/Dashboard/DistributorDashboard';
import RetailerDashboard from './components/Dashboard/RetailerDashboard';
import PaymentPage from './components/Payment/PaymentPage';
import PaymentCallback from './components/Payment/PaymentCallback';
import ProtectedRoute from './components/Common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <div className="parallax-bg"></div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/admin" element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/super-distributor" element={
              <ProtectedRoute role="SUPER_DISTRIBUTOR">
                <SuperDistributorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/distributor" element={
              <ProtectedRoute role="DISTRIBUTOR">
                <DistributorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/retailer" element={
              <ProtectedRoute role="RETAILER">
                <RetailerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;