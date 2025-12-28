from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('jwtauth.urls')),
    path('', include('chat.urls')),
    path('', include('post.urls')),
]
