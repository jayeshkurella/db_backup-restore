from django.contrib import admin

from Mainapp.models import AdditionalInfo


@admin.register(AdditionalInfo)
class AdditionalInfoAdmin(admin.ModelAdmin):
    list_display = ('id', 'person', 'caste', 'subcaste', 'marital_status', 'religion', 'mother_tongue', 'id_type', 'id_no', 'education_details', 'occupation_details', 'created_at', 'updated_at')
    list_filter = ('caste', 'marital_status', 'id_type', 'created_at')
    search_fields = ('person__full_name', 'subcaste', 'religion', 'id_no')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Personal Details', {
            'fields': ('person', 'caste', 'subcaste', 'marital_status', 'religion', 'mother_tongue', 'other_known_languages')
        }),
        ('Identification', {
            'fields': ('id_type', 'id_no')
        }),
        ('Professional Details', {
            'fields': ('education_details', 'occupation_details')
        }),
        ('Meta Information', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at')
        }),
    )
