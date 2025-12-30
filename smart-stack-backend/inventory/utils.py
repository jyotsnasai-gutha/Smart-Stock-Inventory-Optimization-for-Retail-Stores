from django.core.mail import send_mail
from django.conf import settings


def send_low_stock_email(stock_items):
    print("📧 Sending low stock email...")

    if not stock_items:
        print("⚠️ No low stock items found, email not sent.")
        return

    subject = "⚠️ Low Stock Alert - Smart Inventory"
    message = "The following items are low in stock:\n\n"

    for item in stock_items:
        message += (
            f"Product: {item.product.name}\n"
            f"SKU: {item.product.sku}\n"
            f"Store: {item.store.name}\n"
            f"Quantity: {item.quantity}\n"
            "--------------------------\n"
        )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,          # safer than DEFAULT_FROM_EMAIL
        ["varshapamisetty123@gmail.com"],  # your own Gmail for testing
        fail_silently=False,
    )

    print("✅ Low stock email sent successfully")
