from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email_id', 'phone_no', 'password']
        extra_kwargs = {'password': {'write_only': True}}

class AuthSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['register', 'login', 'logout','forgot_password', 'reset_password', 'change_password'])
    email_id = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(required=False)
    phone_no = serializers.CharField(required=False)
    otp = serializers.CharField(required=False)
    new_password = serializers.CharField(write_only=True, required=False)
