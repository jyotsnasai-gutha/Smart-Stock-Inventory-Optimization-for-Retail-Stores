# Inventory/management/commands/generate_reorders.py
from django.core.management.base import BaseCommand
from inventory.ml_service import generate_reorder_suggestions

import json

class Command(BaseCommand):
    help = "Generate reorder suggestions (print as JSON)"

    def handle(self, *args, **options):
        suggestions = generate_reorder_suggestions()
        self.stdout.write(json.dumps(suggestions, indent=2))
