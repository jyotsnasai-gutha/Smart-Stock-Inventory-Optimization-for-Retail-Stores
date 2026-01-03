# Quick Reference - Smart Stock Inventory Frontend

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Access at: `http://localhost:5173/`

---

## 📋 Implemented Features

| # | Feature | Status | Manager | Staff |
|---|---------|--------|---------|-------|
| 1 | Login & JWT Auth | ✅ Complete | ✓ | ✓ |
| 2 | Role-Based Access | ✅ Complete | ✓ | ✓ |
| 3 | Dashboard | ✅ Complete | Full | Limited |
| 4 | Products CRUD | ✅ Complete | CRUD | Read |
| 5 | Store Management | ✅ Complete | CRUD | ✗ |
| 6 | Stock Management | ✅ Complete | CRUD | Read |
| 7 | Low Stock Alerts | ✅ Complete | ✓ | ✗ |
| 8 | Transactions | ✅ Complete | CRUD | Read |
| 9 | Sales Analytics | ✅ Complete | ✓ | ✓ |
| 10 | Reorder Predictions | ✅ Complete | ✓ | ✓ |
| 11 | ML Model Retrain | ✅ Complete | ✓ | ✗ |
| 12 | Logout/Session | ✅ Complete | ✓ | ✓ |

---

## 🔐 Authentication

### Token Claims Required
```json
{
  "id": "user-123",
  "name": "John Doe",
  "role": "manager|staff",
  "email": "john@example.com"
}
```

### Helper Functions
```javascript
const { 
  user,              // Current user object
  token,             // JWT token
  isManager,         // Boolean
  isStaff,           // Boolean
  hasRole,           // Function
  login,             // Async function
  logout,            // Function
  isAuthenticated    // Boolean
} = useAuth();
```

---

## 📁 File Structure

```
src/
├── App.jsx                    # Main layout & routing
├── AuthContext.jsx            # Auth logic & state
├── Login.jsx                  # Auth page
├── main.jsx                   # Entry point
└── pages/
    ├── Dashboard.jsx          # Summary metrics
    ├── Products.jsx           # Product management
    ├── Stores.jsx             # Store management
    ├── Stock.jsx              # Stock tracking
    ├── LowStockAlerts.jsx     # Alerts (manager only)
    ├── Transactions.jsx       # Transaction history
    ├── SalesTrendAnalytics.jsx    # Charts
    └── ReorderPredictions.jsx # ML predictions
```

---

## 🔌 API Endpoints

**Base**: `/api`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login/` | Authenticate user |
| GET | `/dashboard/summary/` | Dashboard data |
| GET/POST | `/products/` | List/Create products |
| PUT/DELETE | `/products/{id}/` | Update/Delete |
| GET/POST | `/stores/` | List/Create stores |
| PUT/DELETE | `/stores/{id}/` | Update/Delete |
| GET/POST | `/stock/` | List/Add stock |
| PUT | `/stock/{id}/` | Update stock |
| GET | `/alerts/low-stock/` | Low stock alerts |
| GET/POST | `/transactions/` | Transactions |
| GET | `/analytics/sales-trend/{sku}/` | Sales data |
| GET | `/analytics/reorder-predictions/` | ML predictions |
| GET | `/analytics/reorder-trend/` | Trend data |
| POST | `/ml/retrain/` | Retrain model |

**All endpoints require**: `Authorization: Bearer {token}`

---

## 🎨 UI Components Used

- **Material-UI (MUI)** - Cards, Dialogs, Tables, Buttons, Grids
- **Icons** - @mui/icons-material (Dashboard, Store, Analytics, etc.)
- **Charts** - Recharts (LineChart, BarChart, Line, Bar)
- **Form Fields** - TextField, Select with native HTML select

---

## 📊 Page Feature Matrix

### Dashboard
- Role-aware content
- Sales trend chart
- ML retrain button (manager)
- 4 summary cards

### Products
- Search & filter by category
- Add/Edit/Delete (manager)
- Responsive table layout
- Read-only for staff

### Stores
- Search functionality
- Full CRUD (manager only)
- Manager contact info
- Location tracking

### Stock
- Product filter
- Store filter
- Quantity updates (manager)
- Read-only for staff

### Low Stock Alerts
- Manager only
- Adjustable threshold
- Color-coded severity
- Auto-filtering

### Transactions
- Search by product
- Filter by type
- Add transaction (manager)
- Full history view

### Sales Analytics
- SKU selection
- Dual charts (Line & Area)
- Weekly trends
- Revenue tracking

### Reorder Predictions
- Prediction table
- Confidence indicators
- Trend chart
- Daily sales velocity

---

## 🧪 Testing

### Fallback Mock Data
All pages include mock data when API fails:
```javascript
// Example: Products
const mockProducts = [
  { id: 1, name: 'iPhone 15', price: 999, sku: 'SKU001' },
  // ...
];
```

### Dark Mode
Toggle in app header to test dark theme.

### Role Testing
- Login as "manager" → Access all features
- Login as "staff" → Limited access

---

## ⚙️ Configuration

### Environment Variables
Create `.env` file (optional):
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Vite Config
Edit `vite.config.js` for build options.

### ESLint
Run: `npm run lint`

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port in use | Vite auto-selects next port |
| Mock data showing | API error - check network tab |
| Dark mode not working | Hard refresh browser (Ctrl+Shift+R) |
| Login not working | Check token structure in Auth response |
| Role not detected | Ensure token has "role" claim |

---

## 📈 Performance Tips

1. ✅ Uses Material-UI for optimized rendering
2. ✅ Chart libraries load on-demand
3. ✅ Components only fetch data when needed
4. ✅ Mock data prevents blank screens
5. ✅ CSS-in-JS with Emotion for smaller bundles

---

## 🔄 Development Workflow

1. **Code Change** → Auto hot-reload
2. **Error** → Check browser console & network
3. **Test** → Use mock data by disconnecting API
4. **Build** → `npm run build`
5. **Deploy** → Upload `dist/` folder

---

## 📞 API Response Examples

### Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Dashboard Response
```json
{
  "total_products": 150,
  "total_stores": 12,
  "low_stock_count": 5,
  "total_sales": 45000,
  "data": [...]
}
```

### Products Response
```json
{
  "products": [
    { "id": 1, "name": "iPhone", "price": 999, "sku": "SKU001" }
  ]
}
```

---

## 🎓 Learning Resources

- **React Hooks**: useState, useEffect, useContext
- **Material-UI**: Card, Dialog, Table, Grid components
- **Recharts**: Line, Bar, LineChart, BarChart
- **JWT**: Token-based authentication
- **Vite**: Modern JavaScript bundler

---

**Status**: ✅ Production Ready  
**Last Updated**: December 29, 2025
