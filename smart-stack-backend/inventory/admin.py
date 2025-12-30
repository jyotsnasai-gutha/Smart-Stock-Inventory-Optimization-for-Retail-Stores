from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Store, Product, Stock, Transaction, ReorderPrediction

admin.site.register(Store)
admin.site.register(Product)
admin.site.register(Stock)
admin.site.register(Transaction)
admin.site.register(ReorderPrediction)




@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ("email", "username", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")

    fieldsets = UserAdmin.fieldsets + (
        ("Role", {"fields": ("role",)}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Role", {"fields": ("role",)}),
    )

    search_fields = ("email", "username")
    ordering = ("email",)
