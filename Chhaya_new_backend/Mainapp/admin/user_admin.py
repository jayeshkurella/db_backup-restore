from Mainapp.models import User
from django.contrib import admin


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ( 'email_id', 'is_staff', 'is_superuser')
    search_fields = ('email_id',)
    list_filter = ('is_staff', 'is_superuser')