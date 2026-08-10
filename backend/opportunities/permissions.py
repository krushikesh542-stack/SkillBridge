from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow object owners to edit/delete; others may read only."""

    def has_object_permission(self, request, view, obj):
        # SAFE methods are allowed for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        # For unsafe methods, only the creator may proceed
        return getattr(obj, "created_by", None) == request.user
