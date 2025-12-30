from datetime import date, timedelta
from pathlib import Path

import pandas as pd
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db.models import Sum

from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Product, Store, Stock, Transaction, ReorderPrediction
from .serializers import (
    ProductSerializer,
    StoreSerializer,
    StockSerializer,
    TransactionSerializer,
    ReorderSuggestionSerializer,
    EmailTokenObtainPairSerializer
)
from .ml_service import generate_reorder_suggestions, predict_for_sku

# =========================
# GLOBALS
# =========================
User = get_user_model()
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# =========================
# PERMISSIONS
# =========================
class IsManagerOrReadOnly(BasePermission):
    """
    Manager: full access
    Staff: read-only
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.role == "manager":
            return True

        return request.method in SAFE_METHODS


# =========================
# PRODUCT
# =========================
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsManagerOrReadOnly]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "sku"]
    ordering_fields = ["name"]
    ordering = ["name"]


# =========================
# STORE
# =========================
class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsManagerOrReadOnly]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "location"]
    ordering_fields = ["name"]


# =========================
# STOCK
# =========================
class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.select_related("product", "store")
    serializer_class = StockSerializer
    permission_classes = [IsManagerOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["store", "product"]
    search_fields = ["product__name", "product__sku"]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def reorder_suggestions(self, request):
        csv_path = request.GET.get("csv")
        try:
            suggestions = generate_reorder_suggestions(csv_path=csv_path)
            serializer = ReorderSuggestionSerializer(suggestions, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": "Failed to generate suggestions", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =========================
# TRANSACTION
# =========================
class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related("product", "store")
    serializer_class = TransactionSerializer
    permission_classes = [IsManagerOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["product__sku", "store__name", "date"]
    search_fields = ["product__name", "store__location"]
    ordering_fields = ["date", "quantity_sold"]
    ordering = ["-date"]


# =========================
# ML / PREDICTIONS
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def predict_sku_api(request):
    sku = request.GET.get("sku")
    if not sku:
        return Response({"error": "SKU query parameter is required"}, status=400)

    try:
        result = predict_for_sku(sku)
        return Response(result)
    except Exception as e:
        return Response({"error": "Prediction failed", "details": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsManagerOrReadOnly])
def retrain_models_api(request):
    call_command("train_models", force=True)
    return Response({"message": "Models retrained successfully"})


# =========================
# ANALYTICS
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sales_trend_api(request, sku):
    days = int(request.GET.get("days", 30))
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    qs = (
        Transaction.objects
        .filter(product__sku=sku, date__range=[start_date, end_date])
        .values("date")
        .annotate(total_sold=Sum("quantity_sold"))
        .order_by("date")
    )
    return Response(list(qs))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reorder_predictions_api(request):
    data = list(ReorderPrediction.objects.values("sku", "predicted_qty", "generated_at"))
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reorder_trend_api(request):
    file_path = BASE_DIR / "reorder_predictions.csv"
    if not file_path.exists():
        return Response({"error": "Prediction file not found"}, status=404)

    df = pd.read_csv(file_path)
    return Response(df.to_dict(orient="records"))


# =========================
# DASHBOARD
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary_api(request):
    top_sku = (
        Transaction.objects
        .values("product__sku")
        .annotate(total=Sum("quantity_sold"))
        .order_by("-total")
        .first()
    )

    return Response({
        "total_products": Product.objects.count(),
        "total_stock": Stock.objects.aggregate(total=Sum("quantity"))["total"] or 0,
        "low_stock_items": Stock.objects.filter(quantity__lt=10).count(),
        "today_sales": Transaction.objects.filter(date=date.today()).aggregate(total=Sum("quantity_sold"))["total"] or 0,
        "top_sku": top_sku["product__sku"] if top_sku else None
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def low_stock_alerts_api(request):
    threshold = int(request.GET.get("threshold", 10))
    qs = Stock.objects.filter(quantity__lt=threshold).select_related("product", "store")
    data = [
        {
            "sku": s.product.sku,
            "product": s.product.name,
            "store": s.store.name,
            "quantity": s.quantity,
            "threshold": threshold
        }
        for s in qs
    ]
    return Response(data)


# =========================
# AUTH
# =========================
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    email = request.data.get("email")
    password = request.data.get("password")
    role = request.data.get("role", "staff")
    full_name = request.data.get("full_name")

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    if role not in ["manager", "staff"]:
        return Response({"error": "Invalid role"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        role=role
    )
    if full_name:
        user.full_name = full_name
        user.save()

    return Response({"success": "User created successfully"}, status=201)
