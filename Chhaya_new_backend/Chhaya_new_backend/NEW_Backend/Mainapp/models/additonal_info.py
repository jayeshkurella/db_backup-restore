import uuid
from django.db import models

from Mainapp.models.person import Person

from .user import User

class AdditionalInfo(models.Model):
    class CasteChoices(models.TextChoices):
        SC = 'sc', 'Scheduled Caste (SC)'
        ST = 'st', 'Scheduled Tribe (ST)'
        OBC = 'obc', 'Other Backward Class (OBC)'
        OPEN = 'open', 'Open/General'

    class MaritalStatusChoices(models.TextChoices):
        MARRIED = 'married', 'Married'
        SINGLE = 'single', 'Single'
        DIVORCED = 'divorced', 'Divorced'
        WIDOW = 'widow', 'Widow/Widower'

    class IdTypeChoices(models.TextChoices):
        AADHAR = 'aadhar', 'Aadhar'
        PAN = 'pan', 'PAN'
        DL = 'dl', 'Driving License'
        PASSPORT = 'passport', 'Passport'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    caste = models.CharField(max_length=10, choices=CasteChoices.choices)
    subcaste = models.CharField(max_length=50, blank=True, null=True)
    marital_status = models.CharField(max_length=10, choices=MaritalStatusChoices.choices)
    religion = models.CharField(max_length=50, blank=True, null=True)
    mother_tongue = models.CharField(max_length=50, blank=True, null=True)
    languages = models.CharField(max_length=50, blank=True, null=True, help_text="Comma-separated languages")
    id_type = models.CharField(max_length=10, choices=IdTypeChoices.choices)
    id_no = models.CharField(max_length=50, unique=True, help_text="Unique identification number")
    education_details = models.CharField(max_length=50, blank=True, null=True)
    occupation_details = models.CharField(max_length=50, blank=True, null=True)

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    person = models.ForeignKey(Person, on_delete=models.SET_NULL,null=True, blank=True,related_name="additional_info",)


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")


    def __str__(self):
        return f"Additional Info - {self.person.first_name}"
