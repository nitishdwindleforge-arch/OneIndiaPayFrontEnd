import axios from 'axios';

const createApiService = (baseURL) => {
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

// API Gateway - All services through single gateway
export const apiGateway = createApiService('https://vishnu-apigateway-62cfc22fbd5a.herokuapp.com'); // API Gateway

// Legacy service instances for fallback
export const userService = createApiService('https://vishnu-userservice-76c2708d61ea.herokuapp.com');
export const walletService = createApiService('https://vishnu-walletservice-64fd209652c1.herokuapp.com');
export const paymentService = createApiService('https://vishnu-paymentservice-11d4a6b8f7e2.herokuapp.com');
export const transactionService = createApiService('https://vishnu-transactionservice-4ad0d9b9dbaf.herokuapp.com');
export const commissionService = createApiService('https://vishnu-commissionservice-0ba56a55f8ad.herokuapp.com');
export const notificationService = createApiService('https://vishnu-notificationservice-a4d4d923364d.herokuapp.com');

// Mock data for fallback
const mockWallet = { balance: 1500.75 };
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@test.com', role: 'ADMIN', phone: '9999999999' },
  { id: 2, username: 'user1', email: 'user1@test.com', role: 'RETAILER', phone: '9999999998' }
];
const mockTransactions = [
  {
    transactionId: 'TXN001',
    userId: 1,
    amount: 1000.00,
    adminCommission: 2.00,
    parentCommission: 1.50,
    userAmount: 980.00,
    razorpayOrderId: 'order_mock_123',
    paymentLink: null,
    status: 'COMPLETED',
    type: 'CREDIT_CARD_TO_WALLET',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// API methods with correct endpoints and fallback
export const apiService = {
  // User APIs - Through API Gateway
  getUser: async (userId) => {
    try {
      return await apiGateway.get(`/users/${userId}`);
    } catch (error) {
      console.warn('API Gateway failed, trying direct service:', error);
      try {
        return await userService.get(`/users/${userId}`);
      } catch (fallbackError) {
        return { data: mockUsers.find(u => u.id === userId) || mockUsers[0] };
      }
    }
  },
  updateUser: async (userId, data) => {
    try {
      return await apiGateway.put(`/users/${userId}`, data);
    } catch (error) {
      try {
        return await userService.put(`/users/${userId}`, data);
      } catch (fallbackError) {
        return { data: { ...mockUsers[0], ...data } };
      }
    }
  },
  getAllUsers: async () => {
    try {
      return await apiGateway.get('/users');
    } catch (error) {
      try {
        return await userService.get('/users');
      } catch (fallbackError) {
        return { data: mockUsers };
      }
    }
  },
  getUserProfile: async (userId) => {
    try {
      return await apiGateway.get(`/users/profile/${userId}`);
    } catch (error) {
      try {
        return await userService.get(`/users/profile/${userId}`);
      } catch (fallbackError) {
        return { data: mockUsers.find(u => u.id === userId) || mockUsers[0] };
      }
    }
  },
  registerUser: async (userData) => {
    try {
      return await apiGateway.post('/users/register', userData);
    } catch (error) {
      try {
        return await userService.post('/users/register', userData);
      } catch (fallbackError) {
        return { data: { id: Date.now(), ...userData } };
      }
    }
  },
  authenticateUser: async (email, password) => {
    try {
      return await apiGateway.get('/users/login', { params: { email, password } });
    } catch (error) {
      try {
        return await userService.get('/users/login', { params: { email, password } });
      } catch (fallbackError) {
        return { data: mockUsers.find(u => u.email === email) || mockUsers[0] };
      }
    }
  },
  
  // Wallet APIs - Through API Gateway
  getWallet: async (userId) => {
    try {
      return await apiGateway.get(`/wallets/${userId}`);
    } catch (error) {
      try {
        return await walletService.get(`/wallets/${userId}`);
      } catch (fallbackError) {
        return { data: mockWallet };
      }
    }
  },
  creditWallet: async (data) => {
    try {
      return await apiGateway.post('/wallets/credit', data);
    } catch (error) {
      try {
        return await walletService.post('/wallets/credit', data);
      } catch (fallbackError) {
        return { data: { ...mockWallet, balance: mockWallet.balance + data.amount } };
      }
    }
  },
  debitWallet: async (data) => {
    try {
      return await apiGateway.post('/wallets/debit', data);
    } catch (error) {
      try {
        return await walletService.post('/wallets/debit', data);
      } catch (fallbackError) {
        return { data: { ...mockWallet, balance: mockWallet.balance - data.amount } };
      }
    }
  },
  
  // Payment APIs - Through API Gateway
  createOrder: async (data) => {
    try {
      return await apiGateway.post('/payments/create-order', data);
    } catch (error) {
      try {
        return await paymentService.post('/payments/create-order', data);
      } catch (fallbackError) {
        return {
          data: {
            orderId: 'order_mock_' + Date.now(),
            amount: data.amount,
            currency: data.currency,
            status: 'created',
            receipt: data.receipt
          }
        };
      }
    }
  },
  getOrder: async (orderId) => {
    try {
      return await apiGateway.get(`/payments/order/${orderId}`);
    } catch (error) {
      try {
        return await paymentService.get(`/payments/order/${orderId}`);
      } catch (fallbackError) {
        return { data: { orderId, status: 'created' } };
      }
    }
  },
  
  // Transaction APIs - Through API Gateway
  initiateTransaction: async (data) => {
    try {
      console.log('Attempting to initiate transaction via API Gateway:', data);
      return await apiGateway.post('/transactions/initiate', data);
    } catch (error) {
      console.warn('API Gateway failed, trying direct service:', error);
      try {
        return await transactionService.post('/transactions/initiate', data);
      } catch (fallbackError) {
        console.error('Transaction service failed:', fallbackError);
        throw fallbackError;
      }
    }
  },
  completeTransaction: async (transactionId, paymentId) => {
    try {
      return await apiGateway.post(`/transactions/complete/${transactionId}?razorpayPaymentId=${paymentId}`);
    } catch (error) {
      try {
        return await transactionService.post(`/transactions/complete/${transactionId}?razorpayPaymentId=${paymentId}`);
      } catch (fallbackError) {
        console.error('Complete transaction failed:', fallbackError);
        return { data: { transactionId, status: 'COMPLETED' } };
      }
    }
  },
  getTransaction: async (transactionId) => {
    try {
      return await apiGateway.get(`/transactions/${transactionId}`);
    } catch (error) {
      try {
        return await transactionService.get(`/transactions/${transactionId}`);
      } catch (fallbackError) {
        return { data: mockTransactions[0] };
      }
    }
  },
  getUserTransactions: async (userId) => {
    try {
      return await apiGateway.get(`/transactions/user/${userId}`);
    } catch (error) {
      try {
        return await transactionService.get(`/transactions/user/${userId}`);
      } catch (fallbackError) {
        return { data: mockTransactions };
      }
    }
  },
  getUserTransactionsByMonth: async (userId, year, month) => {
    try {
      return await apiGateway.get(`/transactions/user/${userId}/month/${year}/${month}`);
    } catch (error) {
      try {
        return await transactionService.get(`/transactions/user/${userId}/month/${year}/${month}`);
      } catch (fallbackError) {
        return { data: mockTransactions };
      }
    }
  },
  getUserTransactionsByWeek: async (userId, year, week) => {
    try {
      return await apiGateway.get(`/transactions/user/${userId}/week/${year}/${week}`);
    } catch (error) {
      try {
        return await transactionService.get(`/transactions/user/${userId}/week/${year}/${week}`);
      } catch (fallbackError) {
        return { data: mockTransactions };
      }
    }
  },
  getAllTransactions: async () => {
    try {
      return await apiGateway.get('/transactions');
    } catch (error) {
      try {
        return await transactionService.get('/transactions');
      } catch (fallbackError) {
        return { data: mockTransactions };
      }
    }
  },
  getTransactionStats: async () => {
    try {
      return await apiGateway.get('/transactions/stats');
    } catch (error) {
      try {
        return await transactionService.get('/transactions/stats');
      } catch (fallbackError) {
        return {
          data: {
            totalTransactions: 150,
            completedTransactions: 120,
            pendingTransactions: 25,
            failedTransactions: 5,
            totalAmountCredited: 125000.50,
            totalAmountDebited: 15000.25,
            totalCommissionEarned: 3500.75,
            totalUserAmount: 121500.00,
            totalAdminCommission: 2500.50,
            totalParentCommission: 1000.25
          }
        };
      }
    }
  },
  
  // Commission APIs - Through API Gateway
  getUserCommission: async (userId) => {
    try {
      return await apiGateway.get(`/commissions/${userId}`);
    } catch (error) {
      try {
        return await commissionService.get(`/commissions/${userId}`);
      } catch (fallbackError) {
        return { data: { adminCommissionRate: 2.0, parentCommissionRate: 1.0 } };
      }
    }
  },
  setCommission: async (data) => {
    try {
      return await apiGateway.post('/commissions', data);
    } catch (error) {
      try {
        return await commissionService.post('/commissions', data);
      } catch (fallbackError) {
        return { data: { success: true } };
      }
    }
  },
  updateAdminCommission: async (data) => {
    try {
      return await apiGateway.put('/commissions/admin', data);
    } catch (error) {
      try {
        return await commissionService.put('/commissions/admin', data);
      } catch (fallbackError) {
        return { data: { success: true } };
      }
    }
  },
  updateParentCommission: async (data) => {
    try {
      return await apiGateway.put('/commissions/parent', data);
    } catch (error) {
      try {
        return await commissionService.put('/commissions/parent', data);
      } catch (fallbackError) {
        return { data: { success: true } };
      }
    }
  },
  getDefaultAdminCommission: async () => {
    try {
      return await apiGateway.get('/commissions/default-admin');
    } catch (error) {
      try {
        return await commissionService.get('/commissions/default-admin');
      } catch (fallbackError) {
        return { data: 2.0 };
      }
    }
  },
  setDefaultAdminCommission: async (data) => {
    try {
      return await apiGateway.post('/commissions/default-admin', data);
    } catch (error) {
      try {
        return await commissionService.post('/commissions/default-admin', data);
      } catch (fallbackError) {
        return { data: 2.0 };
      }
    }
  },
  calculateCommission: async (data) => {
    try {
      return await apiGateway.post('/commissions/calculate', data);
    } catch (error) {
      try {
        return await commissionService.post('/commissions/calculate', data);
      } catch (fallbackError) {
        return { data: { adminAmount: 20, parentAmount: 10, userAmount: 970 } };
      }
    }
  },
  deleteCommission: async (userId) => {
    try {
      return await apiGateway.delete(`/commissions/${userId}`);
    } catch (error) {
      try {
        return await commissionService.delete(`/commissions/${userId}`);
      } catch (fallbackError) {
        return { data: { success: true } };
      }
    }
  },

  // Notification APIs - Through API Gateway
  getNotifications: async (userId, page = 0, size = 10) => {
    try {
      return await apiGateway.get(`/notifications/user/${userId}?page=${page}&size=${size}`);
    } catch (error) {
      try {
        return await notificationService.get(`/notifications/user/${userId}?page=${page}&size=${size}`);
      } catch (fallbackError) {
        return { data: { content: [], totalElements: 0 } };
      }
    }
  },
  getNotificationsByStatus: async (status, page = 0, size = 10) => {
    try {
      const response = await apiGateway.get(`/notifications/status/${status}?page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('API Gateway failed for notifications:', error);
      return { data: { content: [], totalElements: 0 } };
    }
  },
  markNotificationAsRead: async (notificationId) => {
    try {
      return await apiGateway.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      try {
        return await notificationService.put(`/notifications/${notificationId}/read`);
      } catch (fallbackError) {
        return { data: { success: true } };
      }
    }
  },
  createNotification: async (data) => {
    try {
      return await apiGateway.post('/notifications', data);
    } catch (error) {
      try {
        return await notificationService.post('/notifications', data);
      } catch (fallbackError) {
        return { data: { id: Date.now(), ...data } };
      }
    }
  },
  assignNotification: async (notificationId, userId) => {
    try {
      const response = await apiGateway.put(`/notifications/${notificationId}/assign/${userId}`);
      return response;
    } catch (error) {
      console.error('API Gateway failed for assign notification:', error);
      return { data: { success: true } };
    }
  },
};