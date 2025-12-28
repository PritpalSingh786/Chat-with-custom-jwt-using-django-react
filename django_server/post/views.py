# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PostSerializer, NotificationSerializer
from rest_framework.permissions import IsAuthenticated
from sockets.consumers import CommonConsumer
from .models import Notification
from django.core.mail import send_mail
from jwtauth.models import CustomUser
from django.db import transaction

class PostCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Save the post
                    post = serializer.save()
                    invited_users = serializer.validated_data['invitedPostUsers']
                    invited_user_ids = [user.id for user in invited_users]

                    # Notification content
                    notify_text = f"{request.user.userId} invited you to '{post.postTitle}'"
                    
                    # Notify and save notification
                    CommonConsumer.notify_and_save(invited_user_ids, notify_text)

                    # Get email addresses of invited users
                    invited_emails = CustomUser.objects.filter(id__in=invited_user_ids).values_list('email', flat=True)

                    # Send email (This will raise an exception if it fails)
                    send_mail(
                        subject='Regarding post invitation',
                        message=notify_text,
                        from_email='singhpritpal225@gmail.com',
                        recipient_list=list(invited_emails),
                        fail_silently=False,  # So failure raises exception
                    )

                    return Response({"message": "Post created successfully", "postId": post.id}, status=status.HTTP_201_CREATED)
            
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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