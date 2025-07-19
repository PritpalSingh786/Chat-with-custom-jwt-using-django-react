from django.db import models
from common.models import CommonModel
from jwtauth.models import CustomUser

class Message(CommonModel):
    senderId = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='sent_messages')
    receiverId = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='received_messages')
    message = models.TextField(null=True, blank=True)
