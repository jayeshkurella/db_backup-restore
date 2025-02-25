import uuid
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import User
from .auth_serializer import AuthSerializer
from django.contrib.auth import logout
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import random




class AuthAPIView(APIView):
    
    def post(self, request):
        
        action = request.data.get("action")  

        if action == "register":
            username = request.data.get("username")
            email_id = request.data.get("email_id")
            phone_no = request.data.get("phone_no")
            password = request.data.get("password")

            if not (username and email_id and phone_no and password):
                return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email_id=email_id).exists():
                return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create(
                username=username,
                email_id=email_id,  
                phone_no=phone_no,
                password=make_password(password)
            )
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

        elif action == "login":
            email_id = request.data.get("email_id")
            password = request.data.get("password")

            if not (email_id and password):
                return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(email_id=email_id).first()  
            if user and check_password(password, user.password):
                return Response({"message": "Login successful", "user_id": user.id}, status=status.HTTP_200_OK)
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        
        elif action == "logout":
            logout(request)
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

        elif action == "forgot-password":
            email_id = request.data.get("email_id")
            user = User.objects.filter(email_id=email_id).first()  

            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

            reset_token = str(uuid.uuid4())  
            user.reset_token = reset_token
            user.save()
            return Response({"message": "Password reset link sent", "reset_token": reset_token}, status=status.HTTP_200_OK)

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

        elif action == "change-password":
            user_id = request.data.get("user_id")
            old_password = request.data.get("old_password")
            new_password = request.data.get("new_password")

            user = User.objects.filter(id=user_id).first()
            if not user or not check_password(old_password, user.password):
                return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

            user.password = make_password(new_password)
            user.save()
            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

    
    
       