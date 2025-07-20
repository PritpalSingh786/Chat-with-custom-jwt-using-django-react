# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PostSerializer, NotificationSerializer
from rest_framework.permissions import IsAuthenticated
from post.consumers import NotificationConsumer
from .models import Notification
from django.core.mail import send_mail
from jwtauth.models import CustomUser

class PostCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            post = serializer.save()
            invited_users = serializer.validated_data['invitedPostUsers']
            invited_user_ids = [user.id for user in invited_users]

            notify_text = f"{request.user.userId} invited you to '{post.postTitle}'"
            NotificationConsumer.notify_and_save(request.user.id, invited_user_ids, notify_text)
            subject = 'Regarding post invitation'
            # Fetch email addresses of all invited users
            invited_emails = CustomUser.objects.filter(id__in=invited_user_ids).values_list('email', flat=True)
            send_mail(
                subject,
                notify_text,
                'singhpritpal225@gmail.com',  # From email
                list(invited_emails),             # To email
                fail_silently=False,
            )
            return Response({"message": "Post created successfully", "postId": post.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationView(APIView):
    # authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        page = int(request.query_params.get('page', 1))
        perPage = int(request.query_params.get('perPage', 10))
        offset = (page - 1) * perPage
        notifications = Notification.objects.filter(invitedUsersIds=request.user.id).order_by('-updatedAt')
        total = notifications.count()
        paginated = notifications[offset:offset+perPage]
        serializer = NotificationSerializer(paginated, many=True)
        return Response({
            "notifications": serializer.data,
            "pagination": {
                "total": total,
                "page": page,
                "perPage": perPage,
                "totalPages": (total + perPage - 1) // perPage
            }
        })