import uuid
from django.db import models



class Hospital(models.Model):
    class HospitalTypeChoices(models.TextChoices):
        GOVERNMENT = 'gvt', 'Government'
        NON_GOVERNMENT = 'nongvt', 'Non-Government'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address_id = models.UUIDField()
    contact_id = models.UUIDField()
    type = models.CharField(max_length=10, choices=HospitalTypeChoices.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")


    def __str__(self):
        return self.name