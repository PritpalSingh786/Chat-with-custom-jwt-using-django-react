import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message
from jwtauth.models import CustomUser
from asgiref.sync import sync_to_async
import datetime

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.userId = self.scope['url_route']['kwargs']['userId']
        self.room_group_name = f"chat_{self.userId}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        print(f"Connected to {self.room_group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"Disconnected from {self.room_group_name}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        senderId = data['senderId']
        receiverId = data['receiverId']
        message = data['message']

        await self.save_message(senderId, receiverId, message)

        await self.channel_layer.group_send(
            f"chat_{receiverId}",
            {
                'type': 'chat_message',
                'message': message,
                'senderId': senderId,
                'receiverId': receiverId,
                'timestamp': datetime.datetime.now().isoformat()
            }
        )

        await self.channel_layer.group_send(
            f"chat_{senderId}",
            {
                'type': 'chat_message',
                'message': message,
                'senderId': senderId,
                'receiverId': receiverId,
                'timestamp': datetime.datetime.now().isoformat()
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @sync_to_async
    def save_message(self, senderId, receiverId, message):
        print(senderId, "ssss")
        print(receiverId, "rec")
        print(message, "mmm")
        sender = CustomUser.objects.get(id=senderId)
        print(sender, "sennnnnn")
        receiver = CustomUser.objects.get(id=receiverId)
        print(receiver, "reeeeee")
        return Message.objects.create(
            senderId=sender,
            receiverId=receiver,
            message=message
        )
