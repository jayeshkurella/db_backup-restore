from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework import status
from django.db.models import Q  # For search functionality

from Mainapp.Serializers.serializers import UserSerializer
from Mainapp.authentication.auth_serializer import User


class AdminUserApprovalView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]  # Only admin users can access this API

    def get(self, request):
        """Fetch users with 'pending' status and allow searching."""
        query = request.query_params.get("search", "")
        users = User.objects.filter(status=User.StatusChoices.HOLD)

        if query:
            users = users.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email_id__icontains=query) |
                Q(phone_no__icontains=query)
            )

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, user_id):
        """Approve, reject, or deactivate a user."""
        try:
            user = User.objects.get(id=user_id)
            action = request.data.get("action")

            if action == "approve" and user.status == User.StatusChoices.HOLD:
                user.status = User.StatusChoices.ACTIVE
            elif action == "reject" and user.status == User.StatusChoices.HOLD:
                user.status = User.StatusChoices.HOLD
            elif action == "deactivate" and user.status == User.StatusChoices.ACTIVE:
                user.status = User.StatusChoices.HOLD
            else:
                return Response({"error": "Invalid action or user state"}, status=status.HTTP_400_BAD_REQUEST)

            user.save()
            return Response({"message": f"User {action}d successfully"}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
