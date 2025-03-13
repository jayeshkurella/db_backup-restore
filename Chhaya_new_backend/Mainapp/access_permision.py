from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        print("Authenticated:", request.user.is_authenticated)
        print("User Type:", getattr(request.user, 'user_type', None))
        return request.user.is_authenticated and getattr(request.user, 'user_type', '') == 'admin'


class IsFamilyUser(BasePermission):
    """Allows access only to Family users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'family'


class IsOfficerUser(BasePermission):
    """Allows access only to Officer users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'officer'


class IsReportingUser(BasePermission):
    """Allows access only to Reporting users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'reporting'


class IsVolunteerUser(BasePermission):
    """Allows access only to Volunteer users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'volunteer'


class IsPoliceStationUser(BasePermission):
    """Allows access only to Police Station users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'police_station'


class IsMedicalStaffUser(BasePermission):
    """Allows access only to Medical Staff users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'medical_staff'
