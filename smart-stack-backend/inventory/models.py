from django.db import models

class Store(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    sku = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, null=True, blank=True)
    reorder_point = models.IntegerField(default=10)
    lead_time_days = models.IntegerField(default=7)
    safety_stock = models.IntegerField(default=5)

    # NEW FIELD (Real-time price)
        
    unit_price = models.FloatField(default=0.0)

    def __str__(self):
        return self.name


class Stock(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)

    class Meta:
        unique_together = (("store", "product"),)


class Transaction(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    date = models.DateField()
    qty = models.IntegerField()

    # NEW FIELD (Historical price)
    unit_price = models.FloatField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Automatically store current product price when transaction occurs
        if self.unit_price is None:
            self.unit_price = self.product.unit_price
        super().save(*args, **kwargs)
