from django.contrib import admin
from Mainapp.models.person import Person


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ("sr_no", "full_name", "type", "gender", "age", "birth_date",
                    "height", "weight", "blood_group", "complexion",
                    "eye_color", "hair_type", "hair_color",
                    "hospital", "_is_confirmed", "_is_deleted", "created_at")

    list_filter = ("type", "gender", "blood_group", "complexion",
                   "eye_color", "hair_type", "hair_color", "Body_Condition",
                   "_is_confirmed", "_is_deleted", "hospital")

    search_fields = ("full_name", "distinctive_mark", "birth_mark", "document_ids")

    ordering = ("-created_at",)

    readonly_fields = ("created_at", "updated_at")

    list_per_page = 20  # Paginate for better performance

    fieldsets = (
        ("Basic Information", {
            "fields": ("full_name", "type", "gender", "birth_date", "age", "birthplace")
        }),
        ("Physical Characteristics", {
            "fields": ("height", "weight", "complexion", "eye_color", "hair_color", "hair_type", "blood_group")
        }),
        ("Medical & Identification", {
            "fields": ("condition", "Body_Condition", "birth_mark", "distinctive_mark")
        }),
        ("Additional Details", {
            "fields": ("hospital", "document_ids")
        }),
        ("System Information", {
            "fields": ("created_by", "updated_by", "created_at", "updated_at", "_is_confirmed", "_is_deleted")
        }),
    )

    def sr_no(self, obj):
        """ Generate serial number dynamically """
        return list(self.get_queryset(None)).index(obj) + 1

    sr_no.short_description = "Sr. No."  # Column name in admin

    def has_delete_permission(self, request, obj=None):
        """ Disable delete permission in admin """
        return False

    def has_add_permission(self, request):
        """ Disable adding new records from the admin """
        return False
