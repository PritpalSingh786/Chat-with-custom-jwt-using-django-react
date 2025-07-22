import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from jwtauth.models import CustomUser

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.userId = self.scope['url_route']['kwargs']['userId']
        print("Connected User ID:", self.userId)
        # user = self.scope['user']
        # print(user.id, "iddddddddddddddd")

        self.group_name = f"user_{self.userId}_notifications"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))

    @classmethod
    def notify_and_save(cls, invited_user_ids, message):
        users = CustomUser.objects.filter(id__in=invited_user_ids)

        # Save notification
        notification = Notification.objects.create(notifyTextMessage=message)
        notification.invitedUsersIds.set(users)

        # WebSocket notification
        channel_layer = get_channel_layer()
        for user in users:
            print("Sending to user:", user.id)
            async_to_sync(channel_layer.group_send)(
                f"user_{user.id}_notifications",
                {
                    "type": "send_notification",
                    "message": message
                }
            )

