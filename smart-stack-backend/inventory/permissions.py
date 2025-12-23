from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsManagerOrReadOnly(BasePermission):
    """
    Manager: Full access
    Staff: Read-only
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role == "manager":
            return True

        # staff → GET, HEAD, OPTIONS only
        return request.method in SAFE_METHODS
