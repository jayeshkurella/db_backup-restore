import uuid
from django.db import models

from .address import Address
from .person import Person
from .user import User

class LastKnownDetails(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    person_photo = models.ImageField(blank=True, null=True, help_text="URL or Base64 encoded photo of the person")
    reference_photo = models.ImageField(blank=True, null=True, help_text="URL or Base64 encoded reference photo")
    missing_time = models.DateTimeField(help_text="Exact time the person was last seen")
    missing_date = models.DateTimeField(help_text="Date the person went missing")

    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)
    person = models.ForeignKey(Person, on_delete=models.SET_NULL,null=True, blank=True,related_name="last_known_details",)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")


    def __str__(self):
        return f"Last Known Details - {self.person.first_name} {self.person.last_name}"
