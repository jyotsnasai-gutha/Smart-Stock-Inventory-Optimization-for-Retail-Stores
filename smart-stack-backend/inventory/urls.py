from rest_framework.routers import DefaultRouter
from .views import *
router=DefaultRouter()
router.register("products",ProductViewSet)
router.register("stores",StoreViewSet)
router.register("stock",StockViewSet)
router.register("transactions",TransactionViewSet)
urlpatterns = router.urls
