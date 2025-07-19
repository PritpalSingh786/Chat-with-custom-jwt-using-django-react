# urls.py
from django.urls import path
from .views import PostCreateView

urlpatterns = [
    path('createPost', PostCreateView.as_view(), name='create-post'),
]
