# Smart Stock Inventory Frontend - Setup & Development Guide

## ✅ Implementation Complete

All 12 subtasks have been successfully implemented and the application is ready for development and testing.

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager
- Backend API running on your configured endpoint

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment (Optional)
Create a `.env` file in the root directory if you need custom API configuration:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Step 3: Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173/` (or next available port)

### Step 4: Build for Production
```bash
npm run build
```

## 🎯 Key Features Implemented

### Authentication & Authorization
- ✅ JWT token-based authentication
- ✅ Role-based access control (Manager vs Staff)
- ✅ Secure token storage in localStorage
- ✅ Automatic logout and session cleanup
- ✅ User role extraction from JWT payload

### Dashboard (Role-Aware)
- **Manager View**: All summary cards (Products, Stores, Low Stock, Sales)
- **Staff View**: Limited to Products and Sales data
- ✅ Real-time sales trend charts
- ✅ ML model retrain button (Manager only)
- ✅ Fallback mock data for offline testing

### Product Management
- ✅ List products with search and filters
- ✅ Add, Edit, Delete products (Manager only)
- ✅ Read-only access for staff
- ✅ Category-based filtering

### Store Management (Manager Only)
- ✅ Create, Read, Update, Delete stores
- ✅ Search by name or location
- ✅ Manager and phone contact info

### Stock Management
- ✅ View stock levels across all stores and products
- ✅ Filter by product and store
- ✅ Update stock quantities (Manager only)
- ✅ Read-only view for staff

### Low Stock Alerts (Manager Only)
- ✅ Configurable stock threshold
- ✅ Color-coded severity levels (Critical/Warning)
- ✅ Real-time alert filtering

### Transaction History
- ✅ Search and filter transactions
- ✅ Transaction types: Sale, Purchase, Adjustment
- ✅ Add transactions (Manager only)
- ✅ Full history view for both roles

### Sales Analytics
- ✅ Sales trend charts with SKU selection
- ✅ Line and bar chart visualizations
- ✅ Revenue and units tracking
- ✅ Both roles can access

### Reorder Predictions (ML)
- ✅ ML model predictions displayed in table format
- ✅ Confidence level indicators
- ✅ Prediction trend tracking
- ✅ Daily sales velocity display

## 🔐 Role-Based Features Summary

### Manager Role Has Access To:
- ✅ All Pages & Features
- ✅ Product CRUD operations
- ✅ Store management
- ✅ Stock updates
- ✅ Low stock alerts
- ✅ Add transactions
- ✅ ML model retraining
- ✅ Full dashboard with all metrics

### Staff Role Has Access To:
- ✅ Products (Read-only)
- ✅ Stock levels (Read-only)
- ✅ Transaction history (View-only)
- ✅ Sales analytics (View)
- ✅ Reorder predictions (View)
- ✅ Limited dashboard (Products & Sales only)

## 🔌 API Endpoints Expected

The frontend expects these endpoints to be implemented:

```
POST   /api/auth/login/                    # User authentication
GET    /api/dashboard/summary/             # Dashboard data
GET    /api/products/                      # List products
POST   /api/products/                      # Create product
PUT    /api/products/{id}/                 # Update product
DELETE /api/products/{id}/                 # Delete product
GET    /api/stores/                        # List stores
POST   /api/stores/                        # Create store
PUT    /api/stores/{id}/                   # Update store
DELETE /api/stores/{id}/                   # Delete store
GET    /api/stock/                         # List stock
POST   /api/stock/                         # Add stock
PUT    /api/stock/{id}/                    # Update stock
DELETE /api/stock/{id}/                    # Delete stock
GET    /api/alerts/low-stock/?threshold=X  # Low stock alerts
GET    /api/transactions/                  # List transactions
POST   /api/transactions/                  # Add transaction
GET    /api/analytics/sales-trend/{sku}/   # Sales trend data
GET    /api/analytics/reorder-predictions/ # ML predictions
GET    /api/analytics/reorder-trend/       # Reorder trends
POST   /api/ml/retrain/                    # Trigger model retraining
```

## 📝 Login Test Credentials

The app supports JWT authentication. When the backend returns a token with role information:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

The token should decode to something like:
```json
{
  "id": "user-123",
  "name": "John Manager",
  "username": "john",
  "role": "manager"
}
```

## 🎨 UI/UX Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode toggle
- ✅ Material-UI component library
- ✅ Smooth animations and transitions
- ✅ Loading states and error handling
- ✅ User-friendly dialogs for CRUD operations
- ✅ Gradient login page

## 🧪 Testing Offline

All page components have fallback mock data, allowing you to test the UI without a backend:

1. API calls that fail will trigger the fallback mock data
2. Alert messages indicate when using mock data
3. Perfect for frontend testing and development

## 📂 Project Structure

```
project_frontend/
├── src/
│   ├── App.jsx                 # Main app with routing
│   ├── AuthContext.jsx         # Authentication context
│   ├── Login.jsx               # Login/signup page
│   ├── main.jsx                # App entry point
│   ├── index.css               # Global styles
│   ├── App.css                 # App styles
│   ├── pages/
│   │   ├── Dashboard.jsx       # Dashboard
│   │   ├── Products.jsx        # Products CRUD
│   │   ├── Stores.jsx          # Stores management
│   │   ├── Stock.jsx           # Stock management
│   │   ├── LowStockAlerts.jsx  # Low stock alerts
│   │   ├── Transactions.jsx    # Transactions history
│   │   ├── SalesTrendAnalytics.jsx  # Sales charts
│   │   └── ReorderPredictions.jsx   # ML predictions
│   └── assets/                 # Images and static files
├── public/                     # Static assets
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint configuration
└── index.html                  # HTML entry point
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized `dist/` folder ready for deployment.

### Preview Production Build
```bash
npm run preview
```

## 🔧 Configuration

### Vite Configuration
Edit `vite.config.js` for custom build options.

### ESLint
Run `npm run lint` to check code quality.

## 📚 Dependencies

- **React 19.2.0** - UI library
- **Material-UI 7.3.5** - Component library
- **Recharts 3.4.1** - Charts and graphs
- **jwt-decode 4.0.0** - JWT token parsing
- **Vite 7.2.2** - Build tool

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is taken, Vite will automatically use the next available port (5174, 5175, etc.)

### Mock Data Issues
If mock data isn't showing, check the browser console for specific API error messages.

### Token Not Recognized
Ensure your JWT token includes at least these claims:
- `id` or `sub`
- `name` or `username`
- `role` (should be "manager" or "staff")

### Styling Issues
Clear cache and hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac) if styling looks incorrect.

## 📞 Support

For issues with:
- **Login**: Check token structure and AuthContext logic
- **Specific Pages**: Check component-level error messages
- **API Calls**: Check network tab for request/response details
- **Styling**: Clear browser cache and check dark mode toggle

## ✨ Next Steps

1. **Connect to Backend**: Update API endpoints in components
2. **Add Error Boundaries**: Wrap components in error boundary
3. **Implement Logging**: Add analytics/logging for production
4. **Set Up CI/CD**: Configure GitHub Actions or similar
5. **Add E2E Tests**: Implement Cypress or Playwright tests
6. **Performance Optimization**: Lazy load pages and components

## 📄 License

This project is part of the Smart Stock Inventory system.

---

**Status**: ✅ Ready for Development  
**Last Updated**: December 29, 2025  
**Version**: 1.0.0
