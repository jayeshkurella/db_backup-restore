import uuid
from django.db import models

class Match(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = "pending", "Pending"
        RESOLVED = "resolved", "Resolved"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    person = models.ForeignKey('Person', on_delete=models.CASCADE, related_name='matches_initiated')
    match_person = models.ForeignKey('Person', on_delete=models.CASCADE, related_name='matches_received')
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.PENDING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")


    class Meta:
        unique_together = ('person', 'match_person')  # Prevents duplicate match entries

    def __str__(self):
        return f"Match: {self.person.first_name} ↔ {self.match_person.first_name} ({self.status})"
