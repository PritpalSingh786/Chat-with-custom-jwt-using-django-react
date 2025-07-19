from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Message
# from jwtauth.models import CustomUser

class MessageListView(APIView):
    def get(self, request, user1, user2):
        messages = Message.objects.filter(
            senderId__id__in=[user1, user2],
            receiverId__id__in=[user1, user2]
        ).order_by("createdAt")
        result = [{
            "senderId": msg.senderId.id if msg.senderId else None,
            "receiverId": msg.receiverId.id if msg.receiverId else None,
            "message": msg.message,
            "createdAt": msg.createdAt
        } for msg in messages]
        return Response(result)
