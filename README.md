# OneIndia Pay Frontend

A modern React frontend for the OneIndia Pay payment gateway system with role-based dashboards and secure payment integration.

## Features

### 🔐 Authentication
- Login/Signup with role-based access
- JWT token management
- Protected routes

### 👥 Role-Based Dashboards
- **Admin**: User management, commission settings, notifications, queries
- **Super Distributor**: Network management, user commission updates
- **Distributor**: User management, commission tracking
- **Retailer**: Basic wallet and transaction management

### 💳 Payment Integration
- Razorpay payment gateway integration
- Secure wallet top-up functionality
- Real-time transaction processing
- Payment completion callbacks

### 📊 Features
- Real-time wallet balance
- Transaction history with filters (day/week/month)
- CSV export functionality
- BBPS bill payment services (UI ready)
- Responsive design with animations

## Tech Stack

- **React 18** - Frontend framework
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Axios** - API calls
- **React Toastify** - Notifications
- **React Icons** - Icons
- **Razorpay** - Payment gateway

## Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Login/Signup components
│   ├── Dashboard/      # Role-based dashboards
│   ├── Payment/        # Payment integration
│   └── Common/         # Shared components
├── contexts/           # React contexts
├── services/           # API services
└── utils/             # Utility functions
```

## API Integration

The frontend integrates with the following microservices:

- **AuthService** (Port 8081) - Authentication
- **UserService** (Port 8082) - User management
- **WalletService** (Port 8083) - Wallet operations
- **PaymentService** (Port 8084) - Payment processing
- **TransactionService** (Port 8085) - Transaction management
- **CommissionService** (Port 8086) - Commission management

## Environment Setup

Ensure all backend services are running on their respective ports before starting the frontend.

## Payment Flow

1. User clicks "Add Money" in dashboard
2. Enters amount and confirms
3. Transaction is initiated via TransactionService
4. User is redirected to payment page
5. Razorpay checkout opens for payment
6. On successful payment, transaction is completed
7. Wallet balance is updated
8. User returns to dashboard

## Design Features

- **Glass morphism** design elements
- **Parallax backgrounds**
- **Smooth animations** with Framer Motion
- **Responsive design** for all devices
- **OneIndia Pay branding** with custom color scheme
- **Paytm-inspired** UI patterns

## Security

- JWT token-based authentication
- Protected API routes
- Secure payment processing via Razorpay
- Input validation and sanitization