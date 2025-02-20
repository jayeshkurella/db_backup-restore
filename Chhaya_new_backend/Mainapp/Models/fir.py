import uuid
from django.db import models

from .contact import Contact
from .document import Document
from .police_station import PoliceStation
from .user import User

class FIR(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fir_no = models.CharField(max_length=50, unique=True, help_text="Unique FIR number")
    case_status = models.CharField(max_length=50, help_text="Current status of the case")
    investigation_officer_name = models.CharField(max_length=50, help_text="Name of the investigation officer")

    investigation_officer_contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True)
    police_station = models.ForeignKey(PoliceStation, on_delete=models.CASCADE)
    document = models.ForeignKey(Document, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")


    def __str__(self):
        return f"FIR {self.fir_no} - {self.case_status}"
