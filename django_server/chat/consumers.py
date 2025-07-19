import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message
from jwtauth.models import CustomUser
from asgiref.sync import sync_to_async
from datetime import datetime

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.userId = self.scope['url_route']['kwargs']['userId']
        self.room_group_name = f"chat_{self.userId}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        sender_id = data['senderId']
        receiver_id = data['receiverId']
        message = data['message']
        timestamp = datetime.now().isoformat()

        await self.save_message(sender_id, receiver_id, message)

        # Send to receiver and sender groups
        for user_id in [sender_id, receiver_id]:
            await self.channel_layer.group_send(
                f"chat_{user_id}",
                {
                    'type': 'chat_message',
                    'message': message,
                    'senderId': sender_id,
                    'receiverId': receiver_id,
                    'timestamp': timestamp
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @sync_to_async
    def save_message(self, sender_id, receiver_id, message):
        sender = CustomUser.objects.get(id=sender_id)
        receiver = CustomUser.objects.get(id=receiver_id)
        return Message.objects.create(senderId=sender, receiverId=receiver, message=message)
