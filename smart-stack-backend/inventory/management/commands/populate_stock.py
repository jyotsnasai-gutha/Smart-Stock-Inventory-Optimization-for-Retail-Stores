import random 
from django.core.management.base import BaseCommand
from inventory.models import Product, Store, Stock

class Command(BaseCommand):
    help = "Auto-populate stock for all products in random stores"

    def handle(self, *args, **kwargs):
        products = Product.objects.all()
        stores = Store.objects.all()

        if not products.exists():
            self.stdout.write(self.style.ERROR("No products found."))
            return

        if not stores.exists():
            self.stdout.write(self.style.ERROR("No stores found."))
            return

        count = 0
        for product in products:
            # Pick a random store
            store = random.choice(stores)
            # Random quantity
            quantity = random.randint(20, 100)

            # Create or update stock entry
            stock_entry, created = Stock.objects.update_or_create(
                product=product,
                store=store,
                defaults={'quantity': quantity}
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Stock populated for {count} products."))
