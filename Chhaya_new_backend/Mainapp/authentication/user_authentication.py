import uuid
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import User
from .auth_serializer import AuthSerializer
from django.contrib.auth import logout
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import random
from rest_framework import status
from django.db.utils import IntegrityError




class AuthAPIView(APIView):
    authentication_classes = [TokenAuthentication]  # Require token authentication
    permission_classes = [AllowAny]  # Allow all users by default

    def post(self, request):
        action = request.data.get("action")

        # ✅ REGISTER USER
        if action == "register":
            email_id = request.data.get("email_id")
            phone_no = request.data.get("phone_no")
            password = request.data.get("password")
            password2 = request.data.get("password2")  # Confirm password field
            first_name = request.data.get("first_name")
            last_name = request.data.get("last_name")
            country_code = request.data.get("country_code")
            user_type = request.data.get("user_type")
            sub_user_type = request.data.get("sub_user_type")
            is_consent = request.data.get("is_consent", False)

            # ✅ Set status as "pending" by default (Admin will approve later)
            status_value = "hold"

            if not (email_id and phone_no and password and password2 and first_name and last_name):
                return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Check if passwords match
            if password != password2:
                return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email_id=email_id).exists():
                return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(phone_no=phone_no).exists():
                return Response({"error": "Phone number already used"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create(
                email_id=email_id,
                phone_no=phone_no,
                password=make_password(password),
                first_name=first_name,
                last_name=last_name,
                country_code=country_code,
                user_type=user_type,
                sub_user_type=sub_user_type,
                status=status_value,  # Set status to "hold"
                is_consent=is_consent
            )

            return Response({"message": "User registered successfully. Awaiting admin approval."},
                            status=status.HTTP_201_CREATED)

        # ✅ LOGIN USER
        elif action == "login":
            email_id = request.data.get("email_id", "").strip().lower()
            password = request.data.get("password")

            if not (email_id and password):
                return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(email_id=email_id).first()

            if user:
                # 🚨 Restrict login if the user's status is not 'active'
                if user.status != User.StatusChoices.ACTIVE:
                    return Response(
                        {"error": "Your account is not approved yet. Please wait for admin approval."},
                        status=status.HTTP_403_FORBIDDEN
                    )

                # ✅ Check password and return token
                if check_password(password, user.password):
                    token, created = Token.objects.get_or_create(user=user)
                    return Response(
                        {"message": "Login successful", "user_id": user.id, "token": token.key,
                         "user_type": user.user_type},
                        status=status.HTTP_200_OK
                    )
                else:
                    return Response({"error": "Incorrect password. Please try again."},
                                    status=status.HTTP_400_BAD_REQUEST)

            return Response({"error": "No account found with this email."}, status=status.HTTP_400_BAD_REQUEST)


        # ✅ LOGOUT USER (Protected)
        elif action == "logout":
            if request.user.is_authenticated:
                request.user.auth_token.delete()  # Delete the token
                return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        # ✅ FORGOT PASSWORD
        elif action == "forgot-password":
            email_id = request.data.get("email_id")
            user = User.objects.filter(email_id=email_id).first()

            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

            reset_token = str(uuid.uuid4())
            user.reset_token = reset_token
            user.save()
            return Response({"message": "Password reset link sent", "reset_token": reset_token}, status=status.HTTP_200_OK)

        # ✅ RESET PASSWORD
        elif action == "reset-password":
            reset_token = request.data.get("reset_token")
            new_password = request.data.get("new_password")

            user = User.objects.filter(reset_token=reset_token).first()
            if not user:
                return Response({"error": "Invalid reset token"}, status=status.HTTP_400_BAD_REQUEST)

            user.password = make_password(new_password)
            user.reset_token = None
            user.save()
            return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)

        # ✅ CHANGE PASSWORD (Protected)
        elif action == "change-password":
            if not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

            old_password = request.data.get("old_password")
            new_password = request.data.get("new_password")

            if not check_password(old_password, request.user.password):
                return Response({"error": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)

            request.user.password = make_password(new_password)
            request.user.save()
            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
