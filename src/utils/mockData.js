// Mock data for development when backend services are not fully integrated

export const mockUsers = {
  admin: {
    id: 1,
    username: 'admin',
    email: 'sivakotivishnudipesh@gmail.com',
    phone: '9999999999',
    role: 'ADMIN'
  },
  superDistributor: {
    id: 2,
    username: 'superdist',
    email: 'superdist@oneindiapay.com',
    phone: '9999999998',
    role: 'SUPER_DISTRIBUTOR'
  },
  distributor: {
    id: 3,
    username: 'distributor',
    email: 'dist@oneindiapay.com',
    phone: '9999999997',
    role: 'DISTRIBUTOR'
  },
  retailer: {
    id: 4,
    username: 'retailer',
    email: 'retailer@oneindiapay.com',
    phone: '9999999996',
    role: 'RETAILER'
  }
};

export const mockLogin = (username, password) => {
  // Simple mock authentication
  const user = Object.values(mockUsers).find(u => 
    u.username === username || u.email === username
  );
  
  if (user && (password === 'password' || password === 'Vishnu@23')) {
    return {
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: user
      }
    };
  }
  
  throw new Error('Invalid credentials');
};