from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Store, Product, Stock, Transaction

User = get_user_model()

# =========================
# JWT LOGIN (Email as Username)
# =========================
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

User = get_user_model()

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Inject custom claims
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required")

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        data = super().validate({
            self.username_field: email,
            "password": password
        })

        # Extra info for response payload
        data["email"] = user.email
        data["role"] = user.role
        return data

# =========================
# STORE
# =========================
class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = "__all__"

# =========================
# PRODUCT
# =========================
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"

# =========================
# STOCK
# =========================
class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    sku = serializers.CharField(source="product.sku", read_only=True)
    store_name = serializers.CharField(source="store.name", read_only=True)

    class Meta:
        model = Stock
        fields = [
            "id",
            "store",
            "store_name",
            "product",
            "product_name",
            "sku",
            "quantity",
            "last_updated",
        ]

# =========================
# TRANSACTION
# =========================
class TransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    store_name = serializers.CharField(source="store.name", read_only=True)

    class Meta:
        model = Transaction
        fields = "__all__"

# =========================
# REORDER SUGGESTION (ML OUTPUT)
# =========================
class ReorderSuggestionSerializer(serializers.Serializer):
    sku = serializers.CharField()
    predicted_daily_demand = serializers.FloatField()
    current_stock = serializers.IntegerField()
    recommended_reorder_qty = serializers.IntegerField()

    def validate(self, data):
        if data["predicted_daily_demand"] < 0:
            raise serializers.ValidationError("Predicted demand cannot be negative")
        if data["current_stock"] < 0:
            raise serializers.ValidationError("Current stock cannot be negative")
        if data["recommended_reorder_qty"] < 0:
            raise serializers.ValidationError("Reorder quantity cannot be negative")
        return data
