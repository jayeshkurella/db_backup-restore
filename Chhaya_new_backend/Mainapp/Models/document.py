import uuid
from django.db import models

from .user import User

class Document(models.Model):
    class DocumentTypeChoices(models.TextChoices):
        FIR = 'fir', 'FIR'
        ID = 'id', 'ID'
        DNA_REPORT = 'dna_report', 'DNA Report'
        POSTMORTEM_REPORT = 'postmortem_report', 'Postmortem Report'
        FINGERPRINT_REPORT = 'fingerprint_report', 'Fingerprint Report'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=20, choices=DocumentTypeChoices.choices,blank=True, null=True)
    document = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")


    def __str__(self):
        return f"{self.type} - {self.id}"