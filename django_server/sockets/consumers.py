import json
from channels.generic.websocket import AsyncWebsocketConsumer
from chat.models import Message
from jwtauth.models import CustomUser
from asgiref.sync import sync_to_async
from datetime import datetime
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from post.models import Notification

class CommonConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.userId = self.scope['url_route']['kwargs']['userId']
        self.room_group_name = f"commonsocket_{self.userId}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    # Receiving frontend values of chat 
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
                f"commonsocket_{user_id}",
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
    
    # For sending notification to invited users
    def notify_and_save(invited_user_ids, message):
        users = CustomUser.objects.filter(id__in=invited_user_ids)

        # Save notification
        notification = Notification.objects.create(notifyTextMessage=message)
        notification.invitedUsersIds.set(users)

        # WebSocket notification
        channel_layer = get_channel_layer()
        for user in users:
            print("Sending to user:", user.id)
            async_to_sync(channel_layer.group_send)(
                f"commonsocket_{user.id}",
                {
                    "type": "send_notification",
                    "message": message
                }
            )

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))

