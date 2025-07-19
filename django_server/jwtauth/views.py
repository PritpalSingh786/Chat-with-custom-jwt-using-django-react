from django.shortcuts import render
# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from .serializers import UserSignupSerializer, UserListSerializer
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
import jwt
import datetime
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from rest_framework_simplejwt.tokens import RefreshToken

class SignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            if CustomUser.objects.filter(userId=serializer.validated_data['userId']).exists():
                return Response({"message": "UserId already taken"}, status=400)
            if CustomUser.objects.filter(email=serializer.validated_data['email']).exists():
                return Response({"message": "Email already taken"}, status=400)
            serializer.save(password=make_password(serializer.validated_data['password']))
            return Response({"message": "User registered successfully"}, status=201)
        return Response(serializer.errors, status=400)

class LoginView(APIView):
    def post(self, request):
        userId = request.data.get("userId")
        password = request.data.get("password")

        try:
            user = CustomUser.objects.get(userId=userId)

            if not check_password(password, user.password):
                return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

            # Mark user as logged in
            user.isLogin = True
            user.save()

            # Generate refresh and access tokens with custom claims
            # refresh = RefreshToken.for_user(user)
            # refresh['id'] = str(user.id)
            # refresh['userId'] = user.userId

            # Set custom payload without exp
            payload = {
                "id": str(user.id),
                "userId": user.userId,
                "type": "access",
                "iat": datetime.datetime.utcnow(),
                # "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=1)
                # Note: no 'exp' field
            }
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
            return Response({
                "message": "Login successful",
                "id": str(user.id),
                "userId": user.userId,
                "token": token,
                # "token": str(refresh.access_token),
                # "refresh": str(refresh),
            })

        except CustomUser.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        # userId = request.data.get("userId")
        userId = request.query_params.get("userId") 
        print(userId,"userId")
        try:
            user = CustomUser.objects.get(userId=userId)
            user.isLogin = False
            user.save()
            return Response({"message": "User logged out"})
        except CustomUser.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

class UserListView(APIView):
    # authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        page = int(request.query_params.get('page', 1))
        perPage = int(request.query_params.get('perPage', 10))
        offset = (page - 1) * perPage

        users = CustomUser.objects.exclude(userId=request.user.userId).order_by('-updatedAt')
        total = users.count()
        paginated = users[offset:offset+perPage]
        serializer = UserListSerializer(paginated, many=True)
        return Response({
            "users": serializer.data,
            "pagination": {
                "total": total,
                "page": page,
                "perPage": perPage,
                "totalPages": (total + perPage - 1) // perPage
            }
        })
