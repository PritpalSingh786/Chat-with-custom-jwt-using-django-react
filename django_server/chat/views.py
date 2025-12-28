from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message

class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user1 = request.query_params.get("senderId")
        user2 = request.query_params.get("receiverId")

        if not user1 or not user2:
            return Response({"message": "senderId and receiverId required"}, status=400)

        messages = Message.objects.filter(
            senderId_id__in=[user1, user2],
            receiverId_id__in=[user1, user2]
        ).order_by("createdAt")

        result = [
            {
                "senderId": msg.senderId_id,
                "receiverId": msg.receiverId_id,
                "message": msg.message,
                "createdAt": msg.createdAt,
            }
            for msg in messages
        ]

        return Response(result)
