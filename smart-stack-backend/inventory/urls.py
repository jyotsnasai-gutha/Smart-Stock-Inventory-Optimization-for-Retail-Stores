from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProductViewSet,
    StoreViewSet,
    StockViewSet,
    TransactionViewSet,

    # ML / Analytics
    predict_sku_api,
    retrain_models_api,
    sales_trend_api,
    reorder_predictions_api,
    reorder_trend_api,

    # Dashboard / Alerts
    dashboard_summary_api,
    low_stock_alerts_api,

    # Auth
    EmailTokenObtainPairView,
    register_user,
)

# -------------------------
# Router setup
# -------------------------
router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="products")
router.register(r"stores", StoreViewSet, basename="stores")
router.register(r"stock", StockViewSet, basename="stock")
router.register(r"transactions", TransactionViewSet, basename="transactions")

# -------------------------
# URL patterns
# -------------------------
urlpatterns = [

    # -------- AUTH --------
    path("auth/login/", EmailTokenObtainPairView.as_view(), name="token-login"),
    path("auth/register/", register_user, name="user-register"),

    # -------- CRUD --------
    path("", include(router.urls)),

    # -------- ML --------
    path("ml/predict/", predict_sku_api, name="predict-sku"),
    path("ml/retrain/", retrain_models_api, name="retrain-models"),

    # -------- ANALYTICS --------
    path("analytics/sales-trend/<str:sku>/", sales_trend_api, name="sales-trend"),
    path("analytics/reorder-predictions/", reorder_predictions_api, name="reorder-predictions"),
    path("analytics/reorder-trend/", reorder_trend_api, name="reorder-trend"),

    # -------- DASHBOARD --------
    path("dashboard/summary/", dashboard_summary_api, name="dashboard-summary"),

    # -------- ALERTS --------
    path("alerts/low-stock/", low_stock_alerts_api, name="low-stock-alerts"),
]
