from django.contrib import admin
from Mainapp.models.person import Person
from leaflet.admin import LeafletGeoAdmin

@admin.register(Person)
class PersonAdmin(LeafletGeoAdmin):
    list_display = (
        "sr_no", "full_name", "type", "gender", "age", "birth_date","birthtime",
        "height", "weight", "blood_group", "complexion","photo_photo",
        "eye_color", "hair_type", "hair_color",
        'street', 'appartment_no', 'appartment_name', 'village', 'city', 'district', 'state', 'pincode', 'country',
        "hospital", "_is_confirmed", "_is_deleted", "case_status", "created_at","match_with","reported_date"
    )

    list_filter = (
        "type", "gender", "blood_group", "complexion",
        "eye_color", "hair_type", "hair_color", "Body_Condition",
        "_is_confirmed", "_is_deleted", "hospital",
        "condition", "state", "country", "address_type", "case_status"
    )

    search_fields = (
        "full_name", "distinctive_mark", "birth_mark", "document_ids",
        "city", "district", "village", "street", "landmark_details"
    )

    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Basic Information", {
            "fields": ("full_name", "type", "gender", "birth_date", "age", "birthplace","birthtime")
        }),
        ("Physical Characteristics", {
            "fields": ("height", "weight", "complexion", "eye_color", "hair_color", "hair_type", "blood_group","photo_photo")
        }),
        ("Medical & Identification", {
            "fields": ("condition", "Body_Condition", "birth_mark", "distinctive_mark")
        }),
        ("Address Information", {
            "fields": (
                "address_type", "street", "appartment_no", "appartment_name",
                "village", "city", "district", "state", "pincode",
                "country", "landmark_details", "location"
            )
        }),
        ("Case Management", {
            "fields": ("case_status",)
        }),
        ("Additional Details", {
            "fields": ("hospital", "document_ids")
        }),
        ("System Information", {
            "fields": ("created_by", "updated_by", "created_at", "updated_at", "_is_confirmed", "_is_deleted","match_with",'reported_date')
        }),
    )

    def sr_no(self, obj):
        """Generate serial number dynamically"""
        return list(self.get_queryset(None)).index(obj) + 1

    sr_no.short_description = "Sr. No."

    def has_delete_permission(self, request, obj=None):
        return True

    def has_add_permission(self, request):
        return True

    def delete_model(self, request, obj):
        obj._is_deleted = True
        obj.save()

    @admin.action(description='Soft delete selected persons')
    def soft_delete_selected(self, request, queryset):
        queryset.update(_is_deleted=True)

    actions = [soft_delete_selected]
