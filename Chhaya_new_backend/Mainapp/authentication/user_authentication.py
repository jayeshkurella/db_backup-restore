import uuid
from django.utils.timezone import now
from django.utils import timezone  # ✅ Correct

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from .auth_serializer import AuthSerializer
from django.contrib.auth import logout
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import random
from rest_framework import status
from django.db.utils import IntegrityError



from django.core.mail import send_mail  # For email functionality (optional)
from django.conf import settings

from ..Serializers.serializers import UserSerializer
from ..models import User

# class AuthAPIView(APIView):
#     authentication_classes = [TokenAuthentication]  # Require token authentication
#     permission_classes = [AllowAny]  # Allow all users by default
#
#     def post(self, request):
#         action = request.data.get("action")
#
#         # ✅ REGISTER USER
#         if action == "register":
#             email_id = request.data.get("email_id")
#             phone_no = request.data.get("phone_no")
#             password = request.data.get("password")
#             password2 = request.data.get("password2")  # Confirm password field
#             first_name = request.data.get("first_name")
#             last_name = request.data.get("last_name")
#             country_code = request.data.get("country_code")
#             user_type = request.data.get("user_type")
#             sub_user_type = request.data.get("sub_user_type")
#             is_consent = request.data.get("is_consent", False)
#
#             # ✅ Set status as "pending" by default (Admin will approve later)
#             status_value = "hold"
#
#             if not (email_id and phone_no and password and password2 and first_name and last_name):
#                 return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
#
#             # ✅ Check if passwords match
#             if password != password2:
#                 return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
#
#             if User.objects.filter(email_id=email_id).exists():
#                 return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
#
#             if User.objects.filter(phone_no=phone_no).exists():
#                 return Response({"error": "Phone number already used"}, status=status.HTTP_400_BAD_REQUEST)
#
#             user = User.objects.create(
#                 email_id=email_id,
#                 phone_no=phone_no,
#                 password=make_password(password),
#                 first_name=first_name,
#                 last_name=last_name,
#                 country_code=country_code,
#                 user_type=user_type,
#                 sub_user_type=sub_user_type,
#                 status=status_value,  # Set status to "hold"
#                 is_consent=is_consent
#             )
#
#             return Response({"message": "User registered successfully. Awaiting admin approval."},
#                             status=status.HTTP_201_CREATED)
#
#         # ✅ LOGIN USER
#         elif action == "login":
#             email_id = request.data.get("email_id", "").strip().lower()
#             password = request.data.get("password")
#
#             if not (email_id and password):
#                 return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
#
#             user = User.objects.filter(email_id=email_id).first()
#
#             if user:
#                 # 🚨 Restrict login if the user's status is not 'active'
#                 if user.status != User.StatusChoices.ACTIVE:
#                     return Response(
#                         {"error": "Your account is not approved yet. Please wait for admin approval."},
#                         status=status.HTTP_403_FORBIDDEN
#                     )
#
#                 # ✅ Check password and return token
#                 if check_password(password, user.password):
#                     token, created = Token.objects.get_or_create(user=user)
#                     return Response(
#                         {"message": "Login successful", "user_id": user.id, "token": token.key,
#                          "user_type": user.user_type},
#                         status=status.HTTP_200_OK
#                     )
#                 else:
#                     return Response({"error": "Incorrect password. Please try again."},
#                                     status=status.HTTP_400_BAD_REQUEST)
#
#             return Response({"error": "No account found with this email."}, status=status.HTTP_400_BAD_REQUEST)
#
#
#         # ✅ LOGOUT USER (Protected)
#         elif action == "logout":
#             if request.user.is_authenticated:
#                 request.user.auth_token.delete()  # Delete the token
#                 return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
#             return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
#
#         # ✅ FORGOT PASSWORD
#         elif action == "forgot-password":
#             email_id = request.data.get("email_id")
#             user = User.objects.filter(email_id=email_id).first()
#
#             if not user:
#                 return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
#
#             reset_token = str(uuid.uuid4())
#             user.reset_token = reset_token
#             user.reset_token_created_at = timezone.now()  # Store timestamp
#             user.save()
#
#             return Response({"message": "Password reset link sent", "reset_token": reset_token},
#                             status=status.HTTP_200_OK)
#
#
#         # ✅ RESET PASSWORD
#         elif action == "reset-password":
#             reset_token = request.data.get("reset_token")
#             new_password = request.data.get("new_password")
#
#             user = User.objects.filter(reset_token=reset_token).first()
#
#             if not user or not user.is_reset_token_valid():
#                 return Response({"error": "Invalid or expired reset token"}, status=status.HTTP_400_BAD_REQUEST)
#
#             user.set_password(new_password)
#             user.reset_token = None
#             user.reset_token_created_at = None
#             user.save()
#
#             return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
#
#
#         # ✅ CHANGE PASSWORD (Protected)
#         elif action == "change-password":
#             if not request.user.is_authenticated:
#                 return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
#
#             old_password = request.data.get("old_password")
#             new_password = request.data.get("new_password")
#
#             if not check_password(old_password, request.user.password):
#                 return Response({"error": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)
#
#             request.user.password = make_password(new_password)
#             request.user.save()
#             return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
#
#         return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
#



# class AuthAPIView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [AllowAny]  # Allow all users by default
#
#     def get_user_data(self, user):
#         return UserSerializer(user).data
#
#     def get(self, request, reset_token=None):
#         """
#         Handle GET request when user clicks on the reset link
#         """
#         if reset_token:
#             user = User.objects.filter(reset_token=reset_token).first()
#             if not user or not user.is_reset_token_valid():
#                 return Response({"error": "Invalid or expired reset token"}, status=status.HTTP_400_BAD_REQUEST)
#             return Response({"message": "Valid token. Proceed with password reset."}, status=status.HTTP_200_OK)
#
#         return Response({"error": "Reset token required"}, status=status.HTTP_400_BAD_REQUEST)
#
#     def post(self, request,reset_token=None):
#
#         action = request.data.get("action")
#
#         # ✅ REGISTER USER
#         if action == "register":
#             required_fields = ["email_id", "phone_no", "password", "password2", "first_name", "last_name"]
#             if not all(request.data.get(field) for field in required_fields):
#                 return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
#
#             email_id = request.data["email_id"]
#             phone_no = request.data["phone_no"]
#             password = request.data["password"]
#             password2 = request.data["password2"]
#             first_name = request.data["first_name"]
#             last_name = request.data["last_name"]
#             country_code = request.data.get("country_code", "")
#             user_type = request.data.get("user_type", "")
#             sub_user_type = request.data.get("sub_user_type", "")
#             is_consent = request.data.get("is_consent", False)
#
#             # ✅ Check if passwords match
#             if password != password2:
#                 return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
#
#             # ✅ Check for existing email and phone number
#             if User.objects.filter(email_id=email_id).exists():
#                 return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
#
#             if User.objects.filter(phone_no=phone_no).exists():
#                 return Response({"error": "Phone number already used"}, status=status.HTTP_400_BAD_REQUEST)
#
#             # ✅ Create user with status 'hold' (admin approval required)
#             user = User.objects.create(
#                 email_id=email_id,
#                 phone_no=phone_no,
#                 password=make_password(password),
#                 first_name=first_name,
#                 last_name=last_name,
#                 country_code=country_code,
#                 user_type=user_type,
#                 sub_user_type=sub_user_type,
#                 status="hold",
#                 is_consent=is_consent
#             )
#
#             return Response({
#                 "message": "User registered successfully. Awaiting admin approval.",
#                 "user": self.get_user_data(user)
#             }, status=status.HTTP_201_CREATED)
#
#         # ✅ LOGIN USER
#         elif action == "login":
#             email_id = request.data.get("email_id", "").strip().lower()
#             password = request.data.get("password")
#
#             if not (email_id and password):
#                 return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
#
#             user = User.objects.filter(email_id=email_id).first()
#
#             if not user:
#                 return Response({"error": "No account found with this email."}, status=status.HTTP_400_BAD_REQUEST)
#
#             # 🚨 Restrict login if the user's status is not 'active'
#             if user.status != User.StatusChoices.ACTIVE:
#                 return Response(
#                     {"error": "Your account is not approved yet. Please wait for admin approval."},
#                     status=status.HTTP_403_FORBIDDEN
#                 )
#
#             # ✅ Check password and return token
#             if check_password(password, user.password):
#                 token, created = Token.objects.get_or_create(user=user)
#                 return Response({
#                     "message": "Login successful",
#                     "token": token.key,
#                     "user": self.get_user_data(user)
#                 }, status=status.HTTP_200_OK)
#             else:
#                 return Response({"error": "Incorrect password. Please try again."}, status=status.HTTP_400_BAD_REQUEST)
#
#         # ✅ LOGOUT USER
#         elif action == "logout":
#             if request.user.is_authenticated:
#                 user_data = self.get_user_data(request.user)
#
#                 request.user.auth_token.delete()  # Delete the token
#                 return Response({
#                     "message": "Logout successful",
#                     "user": user_data
#                 }, status=status.HTTP_200_OK)
#                 return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
#
#         # ✅ FORGOT PASSWORD
#         elif action == "forgot-password":
#             email_id = request.data.get("email_id")
#             user = User.objects.filter(email_id=email_id).first()
#
#             if not user:
#                 return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
#
#             # ✅ Generate a secure reset token
#             reset_token = str(uuid.uuid4())
#             user.reset_token = reset_token
#             user.reset_token_created_at = timezone.now()
#             user.save()
#
#             # ✅ Send reset link via email (optional)
#             reset_url = f"http://127.0.0.1:8000/reset-password/{reset_token}/"
#             send_mail(
#                 "Password Reset Request",
#                 f"Click the link below to reset your password:\n{reset_url}\nThis link will expire in 30 minutes.",
#                 settings.DEFAULT_FROM_EMAIL,
#                 [email_id],
#                 fail_silently=False,
#             )
#
#             return Response(
#                 {"message": "Password reset link sent to your email.", "reset_token": reset_token},
#                 status=status.HTTP_200_OK
#             )
#
#         # ✅ RESET PASSWORD
#         if action == "reset-password":
#             reset_token = request.data.get("reset_token")  # ✅ Get reset_token from request body
#             new_password = request.data.get("new_password")
#
#             user = User.objects.filter(reset_token=reset_token).first()
#             if not user or not user.is_reset_token_valid():
#                 return Response({"error": "Invalid or expired reset token"}, status=status.HTTP_400_BAD_REQUEST)
#
#             user.set_password(new_password)
#             user.reset_token = None
#             user.reset_token_created_at = None
#             user.save()
#
#             return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
#
#
#         # ✅ CHANGE PASSWORD
#         elif action == "change-password":
#             if not request.user.is_authenticated:
#                 return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
#
#             old_password = request.data.get("old_password")
#             new_password = request.data.get("new_password")
#
#             if not check_password(old_password, request.user.password):
#                 return Response({"error": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)
#
#             request.user.set_password(new_password)
#             request.user.save()
#             return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
#
#             # ✅ UPDATE USER PROFILE
#         elif action == "update-profile":
#             if not request.user.is_authenticated:
#                 return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
#
#             user = request.user
#             serializer = UserSerializer(user, data=request.data, partial=True)
#
#             if not serializer.is_valid():
#                 return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
#
#             # Additional validation for phone number if needed
#             new_phone_no = request.data.get('phone_no')
#             if new_phone_no and new_phone_no != user.phone_no:
#                 if User.objects.filter(phone_no=new_phone_no).exists():
#                     return Response({"error": "Phone number already in use"}, status=status.HTTP_400_BAD_REQUEST)
#
#             serializer.save()
#             return Response({
#                 "message": "Profile updated successfully",
#                 "user": serializer.data
#             }, status=status.HTTP_200_OK)
#
#         return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
#
#         return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class AuthAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]  # Allow all users by default

    def get_user_data(self, user):
        """Return serialized user data"""
        return UserSerializer(user).data

    def get(self, request, reset_token=None):
        """Handle GET request when user clicks on the reset link"""
        if reset_token:
            user = User.objects.filter(reset_token=reset_token).first()
            if not user or not user.is_reset_token_valid():
                return Response({"error": "Invalid or expired reset token"}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "Valid token. Proceed with password reset."}, status=status.HTTP_200_OK)

        return Response({"error": "Reset token required"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, reset_token=None):
        action = request.data.get("action")

        # ✅ REGISTER USER
        if action == "register":
            return self.register_user(request)

        # ✅ LOGIN USER
        elif action == "login":
            return self.login_user(request)

        # ✅ LOGOUT USER
        elif action == "logout":
            return self.logout_user(request)

        # ✅ FORGOT PASSWORD
        elif action == "forgot-password":
            return self.forgot_password(request)

        # ✅ RESET PASSWORD
        elif action == "reset-password":
            return self.reset_password(request)

        # ✅ CHANGE PASSWORD
        elif action == "change-password":
            return self.change_password(request)

        # ✅ UPDATE PROFILE
        elif action == "update-profile":
            return self.update_profile(request)

        elif action == "delete_profile":
            return self.delete_profile(request)

        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

    # =================== HELPER FUNCTIONS =================== #

    def register_user(self, request):
        """Handles user registration"""
        required_fields = ["email_id", "phone_no", "password", "password2", "first_name", "last_name"]
        if not all(request.data.get(field) for field in required_fields):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        email_id = request.data["email_id"]
        phone_no = request.data["phone_no"]
        password = request.data["password"]
        password2 = request.data["password2"]
        first_name = request.data["first_name"]
        last_name = request.data["last_name"]
        country_code = request.data.get("country_code", "")
        user_type = request.data.get("user_type", "")
        sub_user_type = request.data.get("sub_user_type", "")
        is_consent = request.data.get("is_consent", False)

        # ✅ Check if passwords match
        if password != password2:
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Check for existing email and phone number
        if User.objects.filter(email_id=email_id).exists():
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(phone_no=phone_no).exists():
            return Response({"error": "Phone number already used"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Create user with status 'hold' (admin approval required)
        user = User.objects.create(
            email_id=email_id,
            phone_no=phone_no,
            password=make_password(password),
            first_name=first_name,
            last_name=last_name,
            country_code=country_code,
            user_type=user_type,
            sub_user_type=sub_user_type,
            status="hold",
            is_consent=is_consent
        )

        return Response({
            "message": "User registered successfully. Awaiting admin approval.",
            "user": self.get_user_data(user)
        }, status=status.HTTP_201_CREATED)

    def login_user(self, request):
        """Handles user login"""
        email_id = request.data.get("email_id", "").strip().lower()
        password = request.data.get("password")

        if not (email_id and password):
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email_id=email_id).first()
        if not user:
            return Response({"error": "No account found with this email."}, status=status.HTTP_400_BAD_REQUEST)

        if user.status != User.StatusChoices.ACTIVE:
            return Response({"error": "Your account is not approved yet. Please wait for admin approval."}, status=status.HTTP_403_FORBIDDEN)

        if check_password(password, user.password):
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful",
                "token": token.key,
                "user": self.get_user_data(user)
            }, status=status.HTTP_200_OK)

        return Response({"error": "Incorrect password. Please try again."}, status=status.HTTP_400_BAD_REQUEST)

    def logout_user(self, request):
        """Handles user logout"""
        if request.user.is_authenticated:
            request.user.auth_token.delete()
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    def forgot_password(self, request):
        """Handles forgot password functionality"""
        email_id = request.data.get("email_id")
        user = User.objects.filter(email_id=email_id).first()

        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

        reset_token = str(uuid.uuid4())
        user.reset_token = reset_token
        user.reset_token_created_at = timezone.now()
        user.save()

        reset_url = f"http://127.0.0.1:8000/reset-password/{reset_token}/"
        send_mail(
            "Password Reset Request",
            f"Click the link below to reset your password:\n{reset_url}\nThis link will expire in 30 minutes.",
            settings.DEFAULT_FROM_EMAIL,
            [email_id],
            fail_silently=False,
        )

        return Response({"message": "Password reset link sent to your email.", "reset_token": reset_token}, status=status.HTTP_200_OK)

    def reset_password(self, request):
        """Handles password reset"""
        reset_token = request.data.get("reset_token")
        new_password = request.data.get("new_password")

        user = User.objects.filter(reset_token=reset_token).first()
        if not user or not user.is_reset_token_valid():
            return Response({"error": "Invalid or expired reset token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_created_at = None
        user.save()

        return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)

    def change_password(self, request):
        """Handles password change for authenticated users"""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not check_password(old_password, request.user.password):
            return Response({"error": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

    def update_profile(self, request):
        """Handles profile update"""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user  # Current user instance

        # ✅ Validate email and phone uniqueness before updating
        new_email = request.data.get('email_id')
        new_phone_no = request.data.get('phone_no')

        if new_email and new_email != user.email_id and User.objects.filter(email_id=new_email).exists():
            return Response({"error": "Email is already registered with another account"},
                            status=status.HTTP_400_BAD_REQUEST)

        if new_phone_no and new_phone_no != user.phone_no and User.objects.filter(phone_no=new_phone_no).exists():
            return Response({"error": "Phone number is already in use"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Prevent users from changing sensitive fields (Return Error)
        restricted_fields = ["user_type", "sub_user_type", "status", "password", "is_superuser"]
        attempted_changes = [field for field in restricted_fields if field in request.data]

        if attempted_changes:
            return Response(
                {"error": f"You are not allowed to update the following fields: {', '.join(attempted_changes)}"},
                status=status.HTTP_403_FORBIDDEN
            )

        # ✅ Use Serializer for updating user profile safely
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully", "user": serializer.data},
                            status=status.HTTP_200_OK)

        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ DELETE ACCOUNT

    def delete_profile(self, request):
        """Handles user account deletion"""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        # ✅ Optional password confirmation before deletion
        password = request.data.get("password")
        if password and not check_password(password, request.user.password):
            return Response({"error": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Retrieve user data before deletion (for response)
        user = request.user
        user_data = self.get_user_data(user)

        # ✅ Delete the user account (consider soft delete if needed)
        user.delete()

        return Response({
            "message": "Account deleted successfully",
            "user": user_data
        }, status=status.HTTP_200_OK)


