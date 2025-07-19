from django.urls import path
from .views import MessageListView

urlpatterns = [
    path('<str:user1>/<str:user2>', MessageListView.as_view()),
]
