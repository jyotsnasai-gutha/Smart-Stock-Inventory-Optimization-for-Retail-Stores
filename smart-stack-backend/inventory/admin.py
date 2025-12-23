from django.contrib import admin
from .models import Store,Product,Stock,Transaction
admin.site.register(Store)
admin.site.register(Product)
admin.site.register(Stock)
admin.site.register(Transaction)
