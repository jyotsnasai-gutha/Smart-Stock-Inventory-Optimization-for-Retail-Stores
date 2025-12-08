from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.core.management import call_command

from .models import Product, Store, Stock, Transaction
from .serializers import (
    ProductSerializer,
    StoreSerializer,
    StockSerializer,
    TransactionSerializer,
    ReorderSuggestionSerializer
)
from .ml_service import generate_reorder_suggestions, predict_for_sku


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

    @action(detail=False, methods=["GET"], permission_classes=[AllowAny])
    def reorder_suggestions(self, request):
        csv_path = request.GET.get("csv")
        suggestions = generate_reorder_suggestions(csv_path=csv_path)
        serializer = ReorderSuggestionSerializer(suggestions, many=True)
        return Response(serializer.data)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer


# Predict API (single SKU)
@api_view(["GET"])
@permission_classes([AllowAny])
def predict_sku(request):
    sku = request.GET.get("sku")
    if not sku:
        return Response({"error": "SKU parameter is required"}, status=400)

    try:
        result = predict_for_sku(sku)
        return Response(result)   # already contains sku + predicted value
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# Admin retrain
@api_view(["POST"])
@permission_classes([IsAdminUser])
def retrain_all(request):
    call_command("train_models", force=True)
    return Response({"status": "ok", "message": "All models retrained"})
