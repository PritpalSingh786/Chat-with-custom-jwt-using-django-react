# auth/models.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from common.models import CommonModel

class CustomUserManager(BaseUserManager):
    def create_user(self, userId, email, password=None, **extra_fields):
        if not userId:
            raise ValueError("The userId must be set")
        if not email:
            raise ValueError("The email must be set")
        
        email = self.normalize_email(email)
        user = self.model(userId=userId, email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, userId, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(userId, email, password, **extra_fields)

class CustomUser(CommonModel, AbstractBaseUser, PermissionsMixin):
    userId = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    isLogin = models.BooleanField(default=False)
    # connectionId = models.CharField(max_length=255, null=True, blank=True)

    # Required by Django
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'userId'
    REQUIRED_FIELDS = ['email']

    objects = CustomUserManager()

    def __str__(self):
        return self.userId
