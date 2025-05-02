from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework import status
from django.db.models import Q
from django.utils.timezone import now


from Mainapp.authentication.auth_serializer import User, UserSerializer


class AdminUserApprovalView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Fetch all users grouped by status with counts and optional search."""
        query = request.query_params.get("search", "")

        base_queryset = User.objects.all()

        if query:
            base_queryset = base_queryset.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email_id__icontains=query) |
                Q(phone_no__icontains=query)
            )

        hold_users = base_queryset.filter(status=User.StatusChoices.HOLD)
        approved_users = base_queryset.filter(status=User.StatusChoices.ACTIVE)
        rejected_users = base_queryset.filter(status=User.StatusChoices.REJECTED)

        response_data = {
            "counts": {
                "hold": hold_users.count(),
                "approved": approved_users.count(),
                "rejected": rejected_users.count()
            },
            "data": {
                "hold": UserSerializer(hold_users, many=True).data,
                "approved": UserSerializer(approved_users, many=True).data,
                "rejected": UserSerializer(rejected_users, many=True).data
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            # Only admins can update the user
            if not request.user.is_authenticated or not request.user.is_staff:
                return Response({"error": "Unauthorized access"}, status=status.HTTP_403_FORBIDDEN)

            action = request.data.get("action")

            if action == "approve":
                user.status = User.StatusChoices.ACTIVE
            elif action == "reject":
                user.status = User.StatusChoices.REJECTED
            elif action == "hold":
                user.status = User.StatusChoices.HOLD
            else:
                return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

            user.status_updated_by = request.user
            user.status_updated_at = now()
            print("updated by",user.status_updated_by)
            user.save()
            return Response({"message": f"User {action}d successfully"}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
