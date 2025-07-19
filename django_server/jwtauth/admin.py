from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser

class CustomUserAdmin(BaseUserAdmin):
    model = CustomUser

    list_display = ('userId', 'email', 'is_staff', 'is_superuser', 'isLogin')
    search_fields = ('userId', 'email')
    ordering = ('createdAt',)

    # ✅ Make timestamps read-only (so admin doesn't try to edit them)
    readonly_fields = ('createdAt', 'updatedAt')

    # ✅ Use these for editing existing user
    fieldsets = (
        (None, {'fields': ('userId', 'email', 'password', 'connectionId')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Timestamps', {'fields': ('createdAt', 'updatedAt')}),  # ✅ Safe now
    )

    # ✅ For creating new user, don't include readonly fields
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('userId', 'email', 'password1', 'password2', 'is_staff', 'is_superuser')}
        ),
    )

admin.site.register(CustomUser, CustomUserAdmin)
