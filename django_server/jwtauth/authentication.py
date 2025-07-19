import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from jwtauth.models import CustomUser
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

class ExpiringTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])  # ✅ validates 'exp'
            user = CustomUser.objects.get(id=payload["id"])
            return (user, token)

        except ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired")

        except (InvalidTokenError, CustomUser.DoesNotExist):
            raise AuthenticationFailed("Invalid token")
