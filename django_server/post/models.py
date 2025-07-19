# models.py
from django.db import models
from jwtauth.models import CustomUser
from common.models import CommonModel

class Post(CommonModel):
    postTitle = models.CharField(max_length=255)
    invitedPostUsers = models.ManyToManyField(CustomUser, related_name='invited_posts')
