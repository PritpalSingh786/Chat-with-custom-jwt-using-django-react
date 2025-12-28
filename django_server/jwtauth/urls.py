# auth/urls.py
from django.urls import path
from .views import SignupView, LoginView, LogoutView, UserListView

urlpatterns = [
    path('createUser', SignupView.as_view()),
    path('login', LoginView.as_view()),
    path('logout', LogoutView.as_view()),
    path('users', UserListView.as_view())
]
