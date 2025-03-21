from django.contrib import admin

from ..models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "created_at", "updated_at")
    list_filter = ("type", "created_at")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Document Details", {
            "fields": ("type", "document")
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at", "created_by", "updated_by")
        }),
    )