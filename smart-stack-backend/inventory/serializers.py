from rest_framework import serializers
from .models import Store, Product, Stock, Transaction


class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class StockSerializer(serializers.ModelSerializer):
    sku = serializers.CharField(source="product.sku", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    category = serializers.CharField(source="product.category", read_only=True)
    unit_price = serializers.FloatField(source="product.unit_price", read_only=True)

    class Meta:
        model = Stock
        fields = [
            "id",
            "store",
            "product",
            "quantity",
            "sku",
            "product_name",
            "category",
            "unit_price",
        ]


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"


class ReorderSuggestionSerializer(serializers.Serializer):
    sku = serializers.CharField()
    predicted_daily_demand = serializers.FloatField()
    current_stock = serializers.IntegerField()
    recommended_reorder_qty = serializers.IntegerField()
