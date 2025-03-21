from django.contrib import admin
from ..models import Contact

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('phone_no', 'email_id', 'type', 'user', 'hospital', 'police_station', 'is_primary', 'created_at')
    list_filter = ('type', 'is_primary', 'created_at')
    search_fields = ('phone_no', 'email_id', 'company_name')
    ordering = ('-created_at',)
