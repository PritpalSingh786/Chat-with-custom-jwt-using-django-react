from django.urls import re_path
from sockets.consumers import CommonConsumer

websocket_urlpatterns = [
    re_path(r'ws/commonsocket/(?P<userId>[^/]+)/$', CommonConsumer.as_asgi()),
]
