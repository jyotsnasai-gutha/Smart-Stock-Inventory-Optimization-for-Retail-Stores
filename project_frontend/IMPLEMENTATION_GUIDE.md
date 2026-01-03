# Smart Stock Inventory - Frontend Implementation Guide

## ✅ Implementation Status

All 12 subtasks have been successfully implemented:

### 1. **Login and Role Handling** ✅
- Enhanced `AuthContext.jsx` with JWT token management
- Extracts user role and name from token
- Stores token securely in localStorage
- Provides helper methods: `isManager()`, `isStaff()`, `hasRole()`
- Updated `Login.jsx` with proper error handling and loading states

### 2. **Role-Based Route Protection** ✅
- Implemented in `App.jsx` with conditional menu visibility
- Manager-only routes: Stores, Low Stock Alerts
- Staff can access: Dashboard, Products, Stock, Transactions, Analytics
- Routes that show "Access Denied" for unauthorized users
- Role checking at render level with `isManager()` and role-based UI

### 3. **Dashboard UI** ✅
- Created `Dashboard.jsx` with role-aware content
- **Manager View**: Total Products, Total Stores, Low Stock Items, Sales
- **Staff View**: Limited to Products and Sales data
- Includes sales trend chart with mock data fallback
- ML Model retrain button (Manager only)
- Shows loading and error states

### 4. **Products Listing and Management** ✅
- Created `Products.jsx` with full CRUD
- Search and filter by category
- **Manager**: Add, Edit, Delete buttons visible
- **Staff**: Read-only view
- Modal dialogs for add/edit operations
- API integration with fallback mock data

### 5. **Store Management UI** ✅
- Created `Stores.jsx` with CRUD operations
- Search functionality
- **Manager Only**: Full CRUD access
- Includes Manager, Location, and Phone fields
- Dialog-based form for add/edit

### 6. **Stock Management Interface** ✅
- Created `Stock.jsx` with filters
- Filter by Product and Store
- **Manager**: Can update stock quantities
- **Staff**: Read-only view
- Modal for updating stock quantities
- Dual-filter system for product and store

### 7. **Low Stock Alerts Page** ✅
- Created `LowStockAlerts.jsx` (Manager only)
- Adjustable stock threshold
- Color-coded severity (critical/warning)
- Auto-filters products below threshold
- Shows current stock vs threshold

### 8. **Transactions and Sales History** ✅
- Created `Transactions.jsx`
- Search and filter by transaction type
- **Manager**: Add transaction button
- Shows Product, Quantity, Price, Type, Date
- Transaction types: Sale, Purchase, Adjustment
- Dialog-based transaction entry

### 9. **Sales Trend Analytics** ✅
- Created `SalesTrendAnalytics.jsx`
- SKU selection dropdown
- Dual charts: Line (sales/revenue) and Bar (units)
- Shows weekly trends
- Both Manager and Staff can access

### 10. **Reorder Predictions** ✅
- Created `ReorderPredictions.jsx`
- Displays predicted reorder dates
- Confidence levels with color coding
- Shows current stock and daily sales
- Accuracy trend chart
- Accessible to both roles

### 11. **Model Retrain Action** ✅
- Retrain button in Dashboard (Manager only)
- Dialog confirmation
- Loading state during training
- Success/error messages
- POST to `/api/ml/retrain/` endpoint

### 12. **Logout and Session Handling** ✅
- Logout button in App header (Menu)
- Clears token from localStorage
- Resets user state
- Redirects to login automatically
- Protected routes inaccessible after logout

---

## 📁 Project Structure

```
src/
├── App.jsx                 # Main app with routing and layout
├── AuthContext.jsx         # Authentication context and hooks
├── Login.jsx              # Login/Signup page
├── main.jsx               # App entry point with AuthProvider
├── index.css              # Global styles
├── assets/                # Images and static files
└── pages/                 # Page components
    ├── Dashboard.jsx      # Dashboard with role-aware content
    ├── Products.jsx       # Products CRUD
    ├── Stores.jsx         # Stores management
    ├── Stock.jsx          # Stock levels and updates
    ├── LowStockAlerts.jsx # Low stock alerts (Manager only)
    ├── Transactions.jsx   # Transaction history
    ├── SalesTrendAnalytics.jsx  # Sales trends with charts
    └── ReorderPredictions.jsx   # ML predictions
```

---

## 🔐 Authentication Flow

### Login Process:
1. User enters username/password
2. POST to `/api/auth/login/`
3. Backend returns `access_token`
4. Token stored in localStorage
5. Token decoded using `jwt-decode`
6. User role extracted and stored in context
7. User object available globally via `useAuth()`

### Token Structure (Expected):
```json
{
  "id": "user-123",
  "sub": "user-123",
  "name": "John Manager",
  "username": "john_manager",
  "role": "manager",
  "email": "john@example.com"
}
```

### Logout Process:
1. User clicks logout
2. Token cleared from localStorage
3. User state reset to null
4. App redirects to login automatically

---

## 👥 Role-Based Access Control

### Manager Role:
- ✅ All pages accessible
- ✅ CRUD operations on Products, Stores, Stock
- ✅ View Low Stock Alerts
- ✅ Add Transactions
- ✅ Retrain ML Model
- ✅ Full Dashboard with all cards

### Staff Role:
- ✅ Products - Read Only
- ✅ Stock - Read Only
- ✅ Transactions - View, Cannot Add
- ✅ Sales Analytics - View
- ✅ Reorder Predictions - View
- ❌ Stores - No Access
- ❌ Low Stock Alerts - No Access
- ✅ Limited Dashboard view

---

## 🔌 API Endpoints Integration

All components are configured to call these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login/` | POST | User authentication |
| `/api/dashboard/summary/` | GET | Dashboard data |
| `/api/products/` | GET, POST | List and create products |
| `/api/products/{id}/` | PUT, DELETE | Update/delete product |
| `/api/stores/` | GET, POST | List and create stores |
| `/api/stores/{id}/` | PUT, DELETE | Update/delete store |
| `/api/stock/` | GET, POST | List stock items |
| `/api/stock/{id}/` | PUT | Update stock quantity |
| `/api/alerts/low-stock/` | GET | Get low stock alerts |
| `/api/transactions/` | GET, POST | Transactions list and add |
| `/api/analytics/sales-trend/{sku}/` | GET | Sales trends by SKU |
| `/api/analytics/reorder-predictions/` | GET | Reorder predictions |
| `/api/analytics/reorder-trend/` | GET | Reorder trend data |
| `/api/ml/retrain/` | POST | Retrain ML model |

**Note**: All endpoints expect JWT token in `Authorization: Bearer {token}` header.

---

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📦 Dependencies Used

- **React 19.2.0** - UI framework
- **Material-UI 7.3.5** - Component library
- **MUI Data Grid 8.18.0** - Tables (optional)
- **Recharts 3.4.1** - Charts and graphs
- **jwt-decode 4.0.0** - JWT token parsing
- **Emotion** - CSS-in-JS styling

---

## 🎨 Key Features

### 1. **Responsive Design**
- Mobile-friendly with Drawer navigation
- Flexible grid layouts
- Responsive tables

### 2. **Dark Mode Support**
- Toggle in app header
- Persists theme preference
- All components theme-aware

### 3. **Error Handling**
- API call error messages
- Fallback mock data for testing
- User-friendly error alerts

### 4. **Loading States**
- Circular progress indicators
- Disabled buttons during operations
- Clear loading feedback

### 5. **Form Validation**
- Required field checks
- Type validation
- User feedback via alerts

### 6. **Data Management**
- Real API integration
- Mock data fallback
- LocalStorage for session persistence

---

## 🧪 Testing the Application

### Demo Credentials:
Use any username/password combination (backend will validate)

### Test Data:
Mock data is provided as fallback when API calls fail:
- Sample products with pricing
- Sample stores with locations
- Sample transactions and stock

### Test Scenarios:

**1. Login as Manager:**
- Access all pages
- See full dashboard
- Create/edit/delete items
- Retrain model

**2. Login as Staff:**
- Limited dashboard
- View-only mode for most data
- No store/alert access
- Cannot add transactions

---

## 🔄 State Management

The app uses React Context API for global state:

```javascript
const { 
  user,              // { id, name, role, email }
  token,             // JWT token string
  loading,           // Boolean
  isManager,         // Boolean helper
  isStaff,           // Boolean helper
  login,             // Async function
  logout,            // Function
  hasRole,           // Function
  isAuthenticated    // Boolean
} = useAuth();
```

---

## 🛠️ Customization Guide

### Adding a New Page:

1. Create component in `src/pages/NewPage.jsx`
2. Import in `App.jsx`
3. Add menu item in `App.jsx` menuItems array
4. Add case in `renderContent()` switch
5. Set appropriate role requirements

### Adding an API Endpoint:

1. Update the endpoint URL
2. Add JWT token to headers
3. Handle response/errors
4. Provide mock data fallback

### Changing Role Names:

Update in:
- `AuthContext.jsx` - Default values
- `App.jsx` - Menu filtering logic
- Component-level checks

---

## 📝 Notes

- All components use Material-UI for consistent styling
- Charts use Recharts for visualization
- Token stored in `localStorage` (consider using secure storage in production)
- API calls timeout after 30s (default fetch)
- Mock data enables offline development/testing

---

## ✨ Production Checklist

- [ ] Replace mock API with real endpoints
- [ ] Implement secure token storage (httpOnly cookies)
- [ ] Add request timeout handling
- [ ] Implement request cancellation
- [ ] Add analytics tracking
- [ ] Set up error reporting
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Implement refresh token rotation
- [ ] Add comprehensive error pages
- [ ] Set up CI/CD pipeline
- [ ] Configure API base URL for environments

