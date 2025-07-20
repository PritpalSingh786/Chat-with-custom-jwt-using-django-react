# serializers.py
from rest_framework import serializers
from .models import Post, Notification
from jwtauth.models import CustomUser

class PostSerializer(serializers.ModelSerializer):
    invitedPostUsers = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all()
    )

    class Meta:
        model = Post
        fields = ['postTitle', 'invitedPostUsers']

    def validate_invitedPostUsers(self, value):
        request_user = self.context['request'].user
        print(request_user, "reeeeee")

        if request_user in value:
            raise serializers.ValidationError("You cannot invite yourself.")

        if len(value) > 5:
            raise serializers.ValidationError("You cannot invite more than 5 users.")

        return value

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'notifyTextMessage', 'invitedUsersIds', 'createdAt', 'updatedAt']
