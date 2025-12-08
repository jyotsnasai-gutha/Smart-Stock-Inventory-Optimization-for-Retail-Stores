from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import (
    ProductViewSet,
    StoreViewSet,
    StockViewSet,
    TransactionViewSet,
    predict_sku,
)

router = DefaultRouter()
router.register("products", ProductViewSet)
router.register("stores", StoreViewSet)
router.register("stock", StockViewSet)
router.register("transactions", TransactionViewSet)

urlpatterns = router.urls + [
    path("ml/predict/", predict_sku, name="predict-sku"),
]
