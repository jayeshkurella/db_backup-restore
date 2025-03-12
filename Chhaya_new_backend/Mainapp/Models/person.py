import uuid
from django.conf import settings
from django.contrib.gis.db import models
from datetime import date
from .hospital import Hospital
from .user import User

class Person(models.Model):
    class TypeChoices(models.TextChoices):
        MISSING = 'Missing Person', 'Missing Person'
        Unidentified_Person = 'Unidentified Person', 'Unidentified Person'
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

    class AddressTypeChoices(models.TextChoices):
        PERMANENT = 'PERMANENT', 'Permanent'
        CURRENT = 'CURRENT', 'Current'
        OLD = 'OLD', 'Old'
        HOME = 'HOME', 'Home'
        OFFICE = 'OFFICE', 'Office'

    class StateChoices(models.TextChoices):
        ANDHRA_PRADESH = 'Andhra Pradesh', 'Andhra Pradesh'
        ARUNACHAL_PRADESH = 'Arunachal Pradesh', 'Arunachal Pradesh'
        ASSAM = 'Assam', 'Assam'
        BIHAR = 'Bihar', 'Bihar'
        CHHATTISGARH = 'Chhattisgarh', 'Chhattisgarh'
        GOA = 'Goa', 'Goa'
        GUJARAT = 'Gujarat', 'Gujarat'
        HARYANA = 'Haryana', 'Haryana'
        HIMACHAL_PRADESH = 'Himachal Pradesh', 'Himachal Pradesh'
        JHARKHAND = 'Jharkhand', 'Jharkhand'
        KARNATAKA = 'Karnataka', 'Karnataka'
        KERALA = 'Kerala', 'Kerala'
        MADHYA_PRADESH = 'Madhya Pradesh', 'Madhya Pradesh'
        MAHARASHTRA = 'Maharashtra', 'Maharashtra'
        MANIPUR = 'Manipur', 'Manipur'
        MEGHALAYA = 'Meghalaya', 'Meghalaya'
        MIZORAM = 'Mizoram', 'Mizoram'
        NAGALAND = 'Nagaland', 'Nagaland'
        ODISHA = 'Odisha', 'Odisha'
        PUNJAB = 'Punjab', 'Punjab'
        RAJASTHAN = 'Rajasthan', 'Rajasthan'
        SIKKIM = 'Sikkim', 'Sikkim'
        TAMIL_NADU = 'Tamil Nadu', 'Tamil Nadu'
        TELANGANA = 'Telangana', 'Telangana'
        TRIPURA = 'Tripura', 'Tripura'
        UTTAR_PRADESH = 'Uttar Pradesh', 'Uttar Pradesh'
        UTTARAKHAND = 'Uttarakhand', 'Uttarakhand'
        WEST_BENGAL = 'West Bengal', 'West Bengal'
        DELHI = 'Delhi', 'Delhi'

    class CountryChoices(models.TextChoices):
        INDIA = 'India', 'India'
        USA = 'United States of America', 'United States of America'
        CHINA = 'China', 'China'
        JAPAN = 'Japan', 'Japan'
        GERMANY = 'Germany', 'Germany'
        UK = 'United Kingdom', 'United Kingdom'
        FRANCE = 'France', 'France'
        BRAZIL = 'Brazil', 'Brazil'
        AUSTRALIA = 'Australia', 'Australia'
        CANADA = 'Canada', 'Canada'
        RUSSIA = 'Russia', 'Russia'
        ITALY = 'Italy', 'Italy'
        SOUTH_KOREA = 'South Korea', 'South Korea'
        MEXICO = 'Mexico', 'Mexico'
        SOUTH_AFRICA = 'South Africa', 'South Africa'
        INDONESIA = 'Indonesia', 'Indonesia'
        SAUDI_ARABIA = 'Saudi Arabia', 'Saudi Arabia'
        TURKEY = 'Turkey', 'Turkey'
        SPAIN = 'Spain', 'Spain'
        NETHERLANDS = 'Netherlands', 'Netherlands'



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
    blood_group = models.CharField(max_length=5, choices=BloodGroupChoices.choices,blank=True, null=True,db_index=True)
    complexion = models.CharField(max_length=50, choices=ComplexionChoices.choices,blank=True, null=True,db_index=True)
    hair_color = models.CharField(max_length=50, choices=Hair_colorChoices.choices, blank=True, null=True,db_index=True)
    hair_type = models.CharField(max_length=10, choices=Hair_typeChoices.choices, blank=True, null=True,db_index=True)
    eye_color = models.CharField(max_length=50, choices=Eye_colorChoices.choices, blank=True, null=True,db_index=True)
    condition = models.CharField(max_length=20, choices=ConditionChoices.choices, blank=True, null=True,db_index=True)
    Body_Condition = models.CharField(max_length=50, blank=True, null=True,choices=BodyconditionChoices.choices,db_index=True)
    birth_mark = models.CharField(max_length=50, blank=True, null=True)
    distinctive_mark = models.CharField(max_length=50, blank=True, null=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True)
    document_ids = models.TextField(blank=True, null=True, help_text="Comma-separated document IDs")
    created_at = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True,blank=True, null=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set",db_index=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set",db_index=True)
    _is_deleted = models.BooleanField(default=False,db_index=True)
    _is_confirmed = models.BooleanField(default=False,db_index=True)
    photo_photo = models.ImageField(blank=True, null=True, help_text="URL or Base64 encoded photo of the person",upload_to='All_Photos')

    date_reported = models.DateField(default=date.today)
    case_status = models.CharField(
        max_length=10,
        choices=[('Resolved', 'resolved'), ('Pending', 'pending'), ('Matched', 'matched')],
        default='pending',  # Ensure 'pending' is in lowercase to match the choice value
        db_index=True
    )

    address_type = models.CharField(max_length=50, choices=AddressTypeChoices.choices, db_index=True, blank=True,
                                    null=True)

    # Address Details
    street = models.CharField(max_length=50, blank=True, null=True)
    appartment_no = models.CharField(max_length=50, blank=True, null=True)
    appartment_name = models.CharField(max_length=50, blank=True, null=True)
    village = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    district = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    state = models.CharField(max_length=50, choices=StateChoices.choices, db_index=True, blank=True, null=True)
    pincode = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    country = models.CharField(max_length=50, help_text="Country code or ID", choices=CountryChoices.choices,
                               default="India", db_index=True, blank=True, null=True)
    landmark_details = models.CharField(max_length=200, blank=True, null=True)
    location = models.PointField(srid=4326, blank=True, null=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    country_code = models.CharField(max_length=10, db_index=True, null=True, blank=True)

    match_entity_id = models.UUIDField(
        blank=True,
        null=True,
        help_text="ID of the matched entity (Missing/Unidentified Person/Body)"
    )

    match_with= models.CharField(
        max_length=20,
        choices=[
            ('Missing Person', 'missing person'),
            ('Unidentified Person', 'unidentified person'),
            ('Unidentified Body', 'unidentified body'),
        ],
        blank=True,
        null=True,
        help_text="The type of the matched entity"
    )

    def __str__(self):
        return f"{self.full_name} ({self.type})"

    class Meta:
        indexes = [
            models.Index(fields=["type","full_name","birth_date","age","gender"]),
            models.Index(fields=["height","weight","blood_group","complexion"]),
            models.Index(fields=["eye_color","hair_type","hair_color","condition"]),
            models.Index(fields=["distinctive_mark","birth_mark","Body_Condition"]),
            models.Index(fields=["hospital","document_ids"]),
            models.Index(fields=["created_by","updated_by"]),
            models.Index(fields=["_is_deleted","_is_confirmed"]),
            models.Index(fields=["match_entity_id"]),
        ]


