import uuid
from django.db import models

class Address(models.Model):
    class AddressTypeChoices(models.TextChoices):
        PERMANENT = 'PERMANENT', 'Permanent'
        CURRENT = 'CURRENT', 'Current'
        OLD = 'OLD', 'Old'
        HOME = 'HOME', 'Home'
        OFFICE = 'OFFICE', 'Office'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=10, choices=AddressTypeChoices.choices)
    street = models.CharField(max_length=50)
    appartment_no = models.CharField(max_length=50, blank=True, null=True)
    appartment_name = models.CharField(max_length=50, blank=True, null=True)
    village = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    pincode = models.CharField(max_length=50)
    country = models.CharField(max_length=50, help_text="Country code or ID")
    landmark_details = models.CharField(max_length=200, blank=True, null=True)
    lat = models.CharField(max_length=50, blank=True, null=True)
    lang = models.CharField(max_length=50, blank=True, null=True)

    user = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True)
    police_station = models.ForeignKey( 'PoliceStation', on_delete=models.CASCADE, related_name='addresses')
    person = models.ForeignKey('Person', on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")


    def __str__(self):
        return f"{self.type} - {self.city}, {self.state} ({self.pincode})"
