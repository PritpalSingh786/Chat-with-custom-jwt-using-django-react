from rest_framework import serializers
from .models import CustomUser

class UserSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['userId', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'userId', 'email', 'createdAt', 'updatedAt']
