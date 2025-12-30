from django.db import models
from django.contrib.auth.models import AbstractUser

# -------------------------
# Store Model
# -------------------------
class Store(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=255, default="Unknown")

    class Meta:
        ordering = ["name"]  # default ordering

    def __str__(self):
        return self.name


# -------------------------
# Custom User Model (Role-Based)
# -------------------------
class User(AbstractUser):
    email = models.EmailField(unique=True)
    ROLE_CHOICES = (
        ("manager", "Manager"),
        ("staff", "Staff")
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="staff")
    store = models.ForeignKey(
        Store, on_delete=models.SET_NULL, null=True, blank=True, related_name="users"
    )

    USERNAME_FIELD = "email"  # Use email as login field
    REQUIRED_FIELDS = ["username"]  # username still required for AbstractUser

    def __str__(self):
        return f"{self.email} ({self.role})"


# -------------------------
# Product Model
# -------------------------
class Product(models.Model):
    sku = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default="Uncategorized", blank=True)

    # Inventory control
    reorder_point = models.PositiveIntegerField(default=10)
    lead_time_days = models.PositiveIntegerField(default=7)
    safety_stock = models.PositiveIntegerField(default=5)

    # Pricing
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.sku} - {self.name}"


# -------------------------
# Stock Model
# -------------------------
class Stock(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="stocks")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stocks")
    quantity = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("store", "product")
        ordering = ["product__name"]

    def is_low_stock(self):
        return self.quantity < self.product.reorder_point

    def __str__(self):
        return f"{self.store} | {self.product} | Qty: {self.quantity}"


# -------------------------
# Transaction Model
# -------------------------
class Transaction(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="transactions")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="transactions")
    date = models.DateField(auto_now_add=True)
    quantity_sold = models.PositiveIntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        if not self.unit_price:
            self.unit_price = self.product.unit_price
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=["date"]),
            models.Index(fields=["product"]),
        ]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.product} | {self.quantity_sold} units | {self.date}"


# -------------------------
# Reorder Prediction (ML Output)
# -------------------------
class ReorderPrediction(models.Model):
    sku = models.CharField(max_length=100, unique=True)
    predicted_qty = models.IntegerField()
    generated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self):
        return f"{self.sku} -> {self.predicted_qty}"
