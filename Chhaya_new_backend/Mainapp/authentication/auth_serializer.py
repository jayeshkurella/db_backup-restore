from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}


class AuthSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=['register', 'login', 'logout', 'forgot_password', 'reset_password', 'change_password',
                 'update_profile','delete_account'])

    email_id = serializers.EmailField(required=False)
    phone_no = serializers.CharField(required=False)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    user_type = serializers.CharField(required=False)
    sub_user_type = serializers.CharField(required=False, allow_blank=True)

    password = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)
    new_password2 = serializers.CharField(write_only=True, required=False)

    def validate(self, data):
        """Validate password and confirm password match."""
        action = data.get('action')

        if action == 'register' or action == 'reset_password':
            password = data.get('password')
            password2 = data.get('password2')

            if password and password2 and password != password2:
                raise serializers.ValidationError({'password2': "Passwords do not match."})

        if action == 'change_password':
            new_password = data.get('new_password')
            new_password2 = data.get('new_password2')

            if new_password and new_password2 and new_password != new_password2:
                raise serializers.ValidationError({'new_password2': "New passwords do not match."})

        return data

