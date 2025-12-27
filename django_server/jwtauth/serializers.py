from rest_framework import serializers
from .models import CustomUser

class UserSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["userId", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_userId(self, value):
        if CustomUser.objects.filter(userId=value).exists():
            raise serializers.ValidationError("UserId already taken")
        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already taken")
        return value

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'userId', 'email', 'createdAt', 'updatedAt']
