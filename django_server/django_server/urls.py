from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('jwtauth.urls')),
    path('api/messages/', include('chat.urls')),
    path('api/post/', include('post.urls')),
]
