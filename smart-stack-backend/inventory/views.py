from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product,Store,Stock,Transaction
from .serializers import *
from .ml_service import generate_reorder_suggestions

class ProductViewSet(viewsets.ModelViewSet):
    queryset=Product.objects.all()
    serializer_class=ProductSerializer

class StoreViewSet(viewsets.ModelViewSet):
    queryset=Store.objects.all()
    serializer_class=StoreSerializer

class StockViewSet(viewsets.ModelViewSet):
    queryset=Stock.objects.all()
    serializer_class=StockSerializer

    @action(detail=False,methods=["GET"])
    def reorder_suggestions(self,request):
        return Response(generate_reorder_suggestions())

class TransactionViewSet(viewsets.ModelViewSet):
    queryset=Transaction.objects.all()
    serializer_class=TransactionSerializer
