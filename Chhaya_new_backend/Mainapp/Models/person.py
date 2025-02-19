import uuid
from django.db import models

class Person(models.Model):
    class TypeChoices(models.TextChoices):
        MISSING = 'm', 'Missing'
        UP = 'up', 'UP'
        UB = 'ub', 'UB'
    
    class GenderChoices(models.TextChoices):
        MALE = 'm', 'Male'
        FEMALE = 'f', 'Female'

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
    type = models.CharField(max_length=2, choices=TypeChoices.choices)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    dob = models.DateField()
    age = models.IntegerField()
    birthtime = models.TimeField()
    gender = models.CharField(max_length=1, choices=GenderChoices.choices)
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
    birth_mark_details = models.CharField(max_length=50, blank=True, null=True)
    photo = models.ImageField(blank=True, null=True)
    hospital = models.ForeignKey('Hospital', on_delete=models.SET_NULL, null=True, blank=True)
    document_ids = models.TextField(blank=True, null=True, help_text="Comma-separated document IDs")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")


    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.type})"

