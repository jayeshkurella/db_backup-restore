from django.contrib import admin

from Mainapp.models import Address
from leaflet.admin import LeafletGeoAdmin


@admin.register(Address)
class AddressAdmin(LeafletGeoAdmin):
    list_display = ('sr_no', 'address_type', 'city', 'state', 'pincode', 'country', 'is_active', 'created_at', 'updated_at')
    list_filter = ('address_type', 'state', 'country', 'is_active', 'created_at')
    search_fields = ('street', 'appartment_no', 'appartment_name', 'village', 'city', 'district', 'state', 'pincode', 'country')
    ordering = ('-created_at',)

    fieldsets = (
        ('Basic Information', {'fields': ('address_type', 'is_active')}),
        ('Location Details', {'fields': ('street', 'appartment_no', 'appartment_name', 'village', 'city', 'district', 'state', 'pincode', 'country', 'landmark_details', 'location')}),
        ('Related Entities', {'fields': ('user', 'person', 'created_by', 'updated_by')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def sr_no(self, obj):
        queryset = Address.objects.order_by('created_at')
        return list(queryset).index(obj) + 1  # Auto-increment SR No
    sr_no.short_description = "SR No"

    readonly_fields = ('created_at', 'updated_at')

