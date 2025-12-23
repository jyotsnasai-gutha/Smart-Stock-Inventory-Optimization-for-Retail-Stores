from rest_framework import serializers
from .models import Product,Store,Stock,Transaction

class ProductSerializer(serializers.ModelSerializer):
    class Meta: model=Product; fields='__all__'

class StoreSerializer(serializers.ModelSerializer):
    class Meta: model=Store; fields='__all__'

class StockSerializer(serializers.ModelSerializer):
    product=ProductSerializer()
    store=StoreSerializer()
    class Meta: model=Stock; fields='__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta: model=Transaction; fields='__all__'
