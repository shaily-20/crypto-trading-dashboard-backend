# Crypto Trading Analytics Dashboard

A comprehensive backend system for cryptocurrency trading analytics that tracks trades, manages fund movements, calculates Profit & Loss, and generates detailed analytics reports.

## 🎯 Project Highlights

- **Complete REST API** with 30+ endpoints
-  **JWT Authentication** with role-based access control
-  **Advanced P&L Calculation** using weighted average cost basis
-  **Real-time Analytics** and reporting
-  **Admin Dashboard** with platform metrics
-  **Swagger API Documentation** included
-  **Production-ready** with error handling and validation

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB or PostgreSQL
- npm or yarn

### Installation

1. **Clone repository**
```bash
git clone https://github.com/shaily-20/crypto-trading-dashboard-backend.git
cd crypto-trading-dashboard/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Start development server**
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## 🔐 Authentication

All protected routes require JWT token in Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/trades
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Trader",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure123"
  }'
```

---

## 🛡️ Security Features

1. **Authentication**
   - JWT-based with 7-day expiration
   - Password hashing with bcryptjs
   - Role-based access control

2. **Validation**
   - Input validation on all endpoints
   - Type checking for numeric fields
   - Date format validation

3. **Security Headers**
   - Helmet.js for HTTP security headers
   - CORS configuration
   - Request size limits

4. **Authorization**
   - User can only access own data
   - Admin-only routes protected
   - Ownership verification on updates/deletes




---

## 📝 Next Steps (Optional Features)

1. **Frontend Dashboard** (React)
   - Trading chart visualization
   - Real-time P&L display
   - Transaction history UI

2. **Advanced Features**
   - Price alerts
   - Automated trading signals
   - Portfolio rebalancing
   - Tax report generation

3. **Integration**
   - Real cryptocurrency prices (CoinGecko API)
   - Email notifications
   - SMS alerts

4. **Testing**
   - Unit tests with Jest
   - Integration tests
   - Load testing
