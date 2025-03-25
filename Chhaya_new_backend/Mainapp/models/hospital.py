from django.conf import settings
from django.db import models
import uuid

from .address import Address


class Hospital(models.Model):
    class HospitalTypeChoices(models.TextChoices):
        GOVERNMENT = 'gvt', 'Government'
        NON_GOVERNMENT = 'nongvt', 'Non-Government'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital_photo =models.ImageField(upload_to='Hospitals_photos/', blank=True, null=True)
    name = models.CharField(max_length=255)
    address = models.ForeignKey(Address, on_delete=models.CASCADE,null=True, blank=True,)
    type = models.CharField(max_length=10, choices=HospitalTypeChoices.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")

    def __str__(self):
        return self.name