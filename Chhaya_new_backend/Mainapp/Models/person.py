import uuid
from django.conf import settings
from django.db import models

from .hospital import Hospital
from .user import User

class Person(models.Model):
    class TypeChoices(models.TextChoices):
        MISSING = 'Missing Person', 'Missing Person'
        Unidentified_Person = 'Unidentifed Person', 'Unidentifed Person'
        Unidnetified_Body = 'Unidentified Body', 'Unidentified Body'
    
    class GenderChoices(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'

    class BloodGroupChoices(models.TextChoices):
        O = 'O', 'O'
        A = 'A', 'A'
        B = 'B', 'B'
        AB = 'AB', 'AB'

    class HairTypeChoices(models.TextChoices):
        STRAIGHT = 'STRAIGHT', 'Straight'
    
    class ConditionChoices(models.TextChoices):
        MEMORY_LOSS = 'MEMORY_LOSS', 'Memory Loss'
        ANXIETY = 'ANXIETY', 'Anxiety'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=20, choices=TypeChoices.choices)
    first_name = models.CharField(max_length=50,null=True, blank=True)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50,null=True, blank=True)
    birth_date = models.DateField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    birthtime = models.TimeField(blank=True, null=True)

    gender = models.CharField(max_length=10, choices=GenderChoices.choices)
    birthplace = models.CharField(max_length=50)
    height = models.IntegerField(help_text="Height in CM")
    weight = models.IntegerField(help_text="Weight in GMS")
    blood_group = models.CharField(max_length=2, choices=BloodGroupChoices.choices)
    complexion = models.CharField(max_length=50)
    hair_color = models.CharField(max_length=50)
    hair_type = models.CharField(max_length=10, choices=HairTypeChoices.choices, blank=True, null=True)
    eye_color = models.CharField(max_length=50)
    condition = models.CharField(max_length=20, choices=ConditionChoices.choices, blank=True, null=True)
    birth_mark = models.CharField(max_length=50, blank=True, null=True)
    distinctive_mark = models.CharField(max_length=50, blank=True, null=True)
    photo = models.ImageField(upload_to='All_Photos/persons_photos/',blank=True, null=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True)
    document_ids = models.TextField(blank=True, null=True, help_text="Comma-separated document IDs")
    created_at = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True,blank=True, null=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")
    _is_deleted = models.BooleanField(default=False)  


    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.type})"

