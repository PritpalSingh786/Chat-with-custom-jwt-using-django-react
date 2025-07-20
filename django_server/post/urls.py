# urls.py
from django.urls import path
from .views import PostCreateView, NotificationView

urlpatterns = [
    path('createPost', PostCreateView.as_view(), name='create-post'),
    path('notifications', NotificationView.as_view(), name='notifications'),
]
