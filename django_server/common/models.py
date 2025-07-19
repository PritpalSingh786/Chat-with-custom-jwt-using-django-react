# common/models.py
import uuid
from django.db import models

class CommonModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    isDeleted = models.BooleanField(default=False)

    class Meta:
        abstract = True
