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

    class ComplexionChoices(models.TextChoices):
        DARK = 'dark', 'Dark'
        MEDIUM = 'medium', 'Medium'
        LIGHT = 'light', 'Light'
        FAIR = 'fair', 'Fair'
        DUSKY = 'dusky', 'Dusky'
        WHEATISH = 'wheatish', 'Wheatish'

    class Hair_colorChoices(models.TextChoices):
        BLACK = 'black', 'Black'
        BLUE = 'blue', 'Blue'
        BROWN = 'brown', 'Brown'
        GRAY = 'gray', 'Gray'
        GREEN = 'green', 'Green'
        PURPLE = 'purple', 'Purple'
        RED = 'red', 'Red'
        WHITE = 'white', 'White'
        YELLOW = 'yellow', 'Yellow'

    class Hair_typeChoices(models.TextChoices):
        STRAIGHT = 'STRAIGHT', 'Straight'
        DASHED = 'DASHED', 'Dashed'
        DOTTED = 'DOTTED', 'Dotted'
        LONG = 'LONG', 'Long'
        BROAD = 'BROAD', 'Broad'
        SHORT = 'SHORT', 'Short'
        WAVY = 'WAVY', 'Wavy'

    class Eye_colorChoices(models.TextChoices):
        BLUE = 'BLUE', 'Blue'
        BROWN = 'BROWN', 'Brown'
        GREEN = 'GREEN', 'Green'
        HAZEL = 'HAZEL', 'Hazel'
        RED = 'RED', 'Red'
        BLACK = 'BLACK', 'Black'
        GRAY = 'GRAY', 'Gray'
        YELLOW = 'YELLOW', 'Yellow'
        VIOLET = 'VIOLET', 'Violet'

    class BloodGroupChoices(models.TextChoices):
        O = 'O', 'O'
        A = 'A', 'A'
        B = 'B', 'B'
        AB = 'AB', 'AB'
    
    class ConditionChoices(models.TextChoices):
        MEMORY_LOSS = 'MEMORY_LOSS', 'Memory Loss'
        ANXIETY = 'ANXIETY', 'Anxiety'
        SHOCK = 'SHOCK', 'Shock'
        DEPRESSION = 'DEPRESSION', 'Depression'
        FATIGUE = 'FATIGUE', 'Fatigue'
        HEADACHE = 'HEADACHE', 'Headache'
        DIZZINESS = 'DIZZINESS', 'Dizzy'
        NAUSEARCH = 'NAUSEARCH', 'Nausea'
        CHEST_PAIN = 'CHEST_PAIN', 'Chest Pain'

    class BodyconditionChoices(models.TextChoices):
        DECOMPOSED = 'DECOMPOSED', 'Decomposed'
        INTACT = 'INTACT', 'Intact'
        SKELETAL = 'SKELETAL', 'Skeletal'
        BURNT = 'BURNT', 'Burnt'
        FRESH = 'FRESH', 'Fresh'
        NORMAL = 'NORMAL', 'Normal'
        UNSTABLE = 'UNSTABLE', 'Unstable'
        STABLE = 'STABLE', 'Stable'
        EXCESS = 'EXCESS', 'Excess'
        UNDERWEIGHT = 'UNDERWEIGHT', 'Underweight'
        OVERWEIGHT = 'OVERWEIGHT', 'Overweight'
        OBESE = 'OBESE', 'Obese'


    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=20, choices=TypeChoices.choices,db_index=True)
    full_name = models.CharField(max_length=100,blank=True, null=True,db_index=True)
    birth_date = models.DateField(blank=True, null=True,db_index=True)
    age = models.IntegerField(blank=True, null=True,db_index=True)
    birthtime = models.TimeField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GenderChoices.choices,blank=True, null=True,db_index=True)
    birthplace = models.CharField(max_length=255, null=True, blank=True,db_index=True)
    height = models.IntegerField(help_text="Height in CM",blank=True, null=True,db_index=True)
    weight = models.IntegerField(help_text="Weight in GMS",blank=True, null=True,db_index=True)
    blood_group = models.CharField(max_length=2, choices=BloodGroupChoices.choices,blank=True, null=True,db_index=True)
    complexion = models.CharField(max_length=50, choices=ComplexionChoices.choices,blank=True, null=True,db_index=True)
    hair_color = models.CharField(max_length=50, choices=Hair_colorChoices.choices, blank=True, null=True,db_index=True)
    hair_type = models.CharField(max_length=10, choices=Hair_typeChoices.choices, blank=True, null=True,db_index=True)
    eye_color = models.CharField(max_length=50, choices=Eye_colorChoices.choices, blank=True, null=True,db_index=True)
    condition = models.CharField(max_length=20, choices=ConditionChoices.choices, blank=True, null=True,db_index=True)
    Body_Condition = models.CharField(max_length=50, blank=True, null=True,choices=BodyconditionChoices.choices,db_index=True)
    birth_mark = models.CharField(max_length=50, blank=True, null=True)
    distinctive_mark = models.CharField(max_length=50, blank=True, null=True)
    photo_upload  = models.ImageField(upload_to='All_Photos/persons_photos/',blank=True, null=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True)
    document_ids = models.TextField(blank=True, null=True, help_text="Comma-separated document IDs")
    created_at = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True,blank=True, null=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set",db_index=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set",db_index=True)
    _is_deleted = models.BooleanField(default=False,db_index=True)
    _is_confirmed = models.BooleanField(default=False,db_index=True)

    def __str__(self):
        return f"{self.full_name} ({self.type})"

    class Meta:
        indexes = [
            models.Index(fields=["type","full_name","birth_date","age","gender"]),
            models.Index(fields=["height","weight","blood_group","complexion"]),
            models.Index(fields=["eye_color","hair_type","hair_color","condition"]),
            models.Index(fields=["photo_upload","distinctive_mark","birth_mark","Body_Condition"]),
            models.Index(fields=["hospital","document_ids"]),
            models.Index(fields=["created_by","updated_by"]),
            models.Index(fields=["_is_deleted","_is_confirmed"]),
        ]


