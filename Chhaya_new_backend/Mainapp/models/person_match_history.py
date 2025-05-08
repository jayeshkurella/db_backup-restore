import uuid
from django.db import models

from Mainapp.models import Person
from .user import User


class PersonMatchHistory(models.Model):

    MATCH_TYPE_CHOICES = [
        ('potential', 'Potential Match'),
        ('matched', 'Matched'),
        ('rejected', 'Rejected'),
        ('confirmed', 'Confirmed')
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    missing_person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='mp_matches')
    unidentified_person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='up_matches')
    match_type = models.CharField(max_length=20, choices=MATCH_TYPE_CHOICES)
    score = models.IntegerField(null=True, blank=True)  # Add this field
    match_parameters = models.JSONField(default=dict, help_text="Detailed matching parameters")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name="created_%(class)s_set")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name="updated_%(class)s_set")

