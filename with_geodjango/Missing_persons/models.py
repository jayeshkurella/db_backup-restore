
from datetime import datetime
from venv import logger
from django.db import models
from django.utils import timezone
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point 
from django.db import models as base_models

# model for the police station 
class Zone(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]

class Division(models.Model):
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name="divisions")
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return f"{self.name} "

    class Meta:
        indexes = [
            models.Index(fields=['zone', 'name']),
        ]

class PoliceStation(base_models.Model):
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name="police_stations")
    name = models.CharField(max_length=100, unique=True)
    address = models.TextField()
    telephone_no = models.CharField(max_length=15)
    photo_upload = models.ImageField(upload_to='ALLphotos/police-station/', blank=True, null=True, verbose_name="Photo Upload")
    
    # Adding geo fields for real-time location
    boundary = models.PolygonField(null=True, blank=True)  

    # Adding more geographical fields
    village = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    website = models.CharField(max_length=300, null=True , blank=True)
    def __str__(self):
        return f"{self.name}"

    class Meta:
        indexes = [
            models.Index(fields=['division', 'name']),
            models.Index(fields=['telephone_no']),
        ]

class Chowki(base_models.Model):
    police_station = models.ForeignKey(PoliceStation, on_delete=models.CASCADE, related_name="chowkis")
    police_station_name_and_address = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    name = models.CharField(max_length=100, unique=True)
    telephone_no = models.CharField(max_length=15)
    address = models.TextField()
    photo_upload = models.ImageField(upload_to='ALLphotos/police-chowkis/', blank=True, null=True, verbose_name="Photo Upload")
    
    # Adding geo fields for real-time location
    boundary = models.PolygonField(null=True, blank=True)  

    # Adding more geographical fields
    village = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    website = models.CharField(max_length=300, null=True , blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.police_station.name})"

    class Meta:
        indexes = [
            models.Index(fields=['police_station', 'name']),
            models.Index(fields=['telephone_no']),
        ]

# model for the hospital entity
class HospitalZone(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]

class HospitalDivision(models.Model):
    name = models.CharField(max_length=255)
    zone = models.ForeignKey(HospitalZone, related_name='divisions', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} "

    class Meta:
        indexes = [
            models.Index(fields=['zone', 'name']),
        ]

class Hospital(models.Model):
    name = models.CharField(max_length=255)
    entity_type = models.CharField(max_length=50, choices=[('Government', 'Government'), ('Private', 'Private')])
    division = models.ForeignKey(HospitalDivision, related_name='hospitals', on_delete=models.CASCADE)
    hospital_address = models.TextField(max_length=255)
    telephone_no = models.BigIntegerField(null=True , blank=True)
    photo_upload = models.ImageField(upload_to='ALLphotos/Hospitals/', blank=True, null=True, verbose_name="Photo Upload")
    city = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    website = models.CharField(max_length=300, null=True , blank=True)
    
    def __str__(self):
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=['division', 'name']),
            models.Index(fields=['entity_type']),
        ]


# models for the missing person , unindentified missing person and unindentified dead bdoy and voluenteers
class Contact(models.Model):
    
    CONTACT_TYPE_CHOICES = [
        ('Missing Person', 'Missing Person'),
        ('Undefined Missing Person', 'Undefined Missing Person'),
        ('Undefined Body', 'Undefined Body'),
        ('Volunteer', 'Volunteer'),
    ]

    CONTACT_SUBTYPE_CHOICES = [
        ('Personal', 'Personal'),
        ('Business', 'Business'),
        ('Emergency', 'Emergency'),
    ]

    phone_number = models.CharField(max_length=15, db_index=True)
    email = models.CharField(max_length=255, db_index=True)
    type = models.CharField(max_length=50, choices=CONTACT_TYPE_CHOICES, db_index=True)
    subtype = models.CharField(max_length=50, choices=CONTACT_SUBTYPE_CHOICES, db_index=True)
    company_name = models.CharField(max_length=255, null=True, blank=True)
    job_title = models.CharField(max_length=255, null=True, blank=True)
    website = models.CharField(max_length=255, null=True, blank=True)
    social_media_handles = models.CharField(max_length=255, null=True, blank=True)
    is_primary = models.BooleanField(default=False, db_index=True)
    created_date = models.DateField(auto_now_add=True)
    last_updated = models.DateField(auto_now=True)
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['type', 'subtype']),
            models.Index(fields=['email', 'is_primary']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['company_name']),
            models.Index(fields=['job_title']),
        ]

    def __str__(self):
        return f"{self.phone_number} ({self.type})"
    



class Address(models.Model):
    
    ADDRESS_TYPE_CHOICES = [
        ('Missing Person', 'Missing Person'),
        ('Undefined Missing Person', 'Undefined Missing Person'),
        ('Undefined Body', 'Undefined Body'),
        ('Volunteer', 'Volunteer'),
    ]

    ADDRESS_SUBTYPE_CHOICES = [
        ('Permanent Address', 'Permanent Address'),
        ('Current Address', 'Current Address'),
        ('Emergency', 'Emergency'),
        ('Person Founded', 'Person Founded'),
        ('Body Founded', 'Body Founded'),
    ]
    
    STATE_CHOICES = [
    ('Andhra Pradesh', 'Andhra Pradesh'),
    ('Arunachal Pradesh', 'Arunachal Pradesh'),
    ('Assam', 'Assam'),
    ('Bihar', 'Bihar'),
    ('Chhattisgarh', 'Chhattisgarh'),
    ('Goa', 'Goa'),
    ('Gujarat', 'Gujarat'),
    ('Haryana', 'Haryana'),
    ('Himachal Pradesh', 'Himachal Pradesh'),
    ('Jharkhand', 'Jharkhand'),
    ('Karnataka', 'Karnataka'),
    ('Kerala', 'Kerala'),
    ('Madhya Pradesh', 'Madhya Pradesh'),
    ('Maharashtra', 'Maharashtra'),
    ('Manipur', 'Manipur'),
    ('Meghalaya', 'Meghalaya'),
    ('Mizoram', 'Mizoram'),
    ('Nagaland', 'Nagaland'),
    ('Odisha', 'Odisha'),
    ('Punjab', 'Punjab'),
    ('Rajasthan', 'Rajasthan'),
    ('Sikkim', 'Sikkim'),
    ('Tamil Nadu', 'Tamil Nadu'),
    ('Telangana', 'Telangana'),
    ('Tripura', 'Tripura'),
    ('Uttar Pradesh', 'Uttar Pradesh'),
    ('Uttarakhand', 'Uttarakhand'),
    ('West Bengal', 'West Bengal'),
    ]
    
    COUNTRY_CHOICES = [
    ('India', 'India'),
    ('United States of America', 'United States of America'),
    ('China', 'China'),
    ('Japan', 'Japan'),
    ('Germany', 'Germany'),
    ('United Kingdom', 'United Kingdom'),
    ('France', 'France'),
    ('Brazil', 'Brazil'),
    ('Australia', 'Australia'),
    ('Canada', 'Canada')
    ]



    street = models.CharField(max_length=255, db_index=True)
    apartment_number = models.CharField(max_length=100, null=True, blank=True)
    village = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, db_index=True)
    district = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    state = models.CharField(max_length=255,choices=STATE_CHOICES, db_index=True)
    postal_code = models.CharField(max_length=20, db_index=True)
    country = models.CharField(max_length=255, choices =COUNTRY_CHOICES ,db_index=True)
    type = models.CharField(max_length=50, choices=ADDRESS_TYPE_CHOICES, db_index=True)
    subtype = models.CharField(max_length=50, choices=ADDRESS_SUBTYPE_CHOICES, db_index=True)
    landmark_details = models.CharField(max_length=255, null=True, blank=True)
    location = models.PointField(null=True, blank=True, db_index=True) 

    is_active = models.BooleanField(default=True, db_index=True)
    created_date = models.DateField(auto_now_add=True)
    last_updated = models.DateField(auto_now=True)
    country_code = models.CharField(max_length=10, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['city', 'state']),
            models.Index(fields=['postal_code', 'country']),
            models.Index(fields=['type', 'subtype']),
            models.Index(fields=['street', 'city']),
            models.Index(fields=['is_active', 'country_code']),
        ]

    def __str__(self):
        return f"{self.street}, {self.city}, {self.state} - {self.postal_code}"
    
class Volunteer(models.Model):
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Transgender', 'Transgender'),
    ]
    
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]
    
    SEARCH_GROUP_CHOICES = [
        ('Group A', 'Group A'),
        ('Group B', 'Group B'),
        ('Group C', 'Group C'),
    ]
    
    MODE_OF_SEARCH_CHOICES = [
        ('On Foot', 'On Foot'),
        ('Vehicle', 'Vehicle'),
        ('Drone', 'Drone'),
    ]
    
    # Personal Details
    full_name = models.CharField(max_length=255, db_index=True)
    dob = models.DateField(help_text="Date of Birth", db_index=True)
    photo_upload = models.ImageField(upload_to='ALLphotos/Volunteer/', null=True, blank=True, db_index=True)

    Age = models.PositiveIntegerField(blank=True, null=True, db_index=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    address = models.ForeignKey(Address, on_delete=models.CASCADE, related_name='volunteers', db_index=True,null=True, blank=True,)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='volunteers', db_index=True,null=True, blank=True,)
    
    # Assignment Info
    volunteer_group = models.CharField(max_length=50, choices=SEARCH_GROUP_CHOICES, db_index=True)
    assigned_region = models.CharField(max_length=100, help_text="Region assigned to the volunteer", db_index=True)
    search_start_date = models.DateField(db_index=True)
    search_end_date = models.DateField(blank=True, null=True, db_index=True)
    search_timing = models.TimeField(help_text="Timing for the volunteer's search", db_index=True)
    gps_tracker_enabled = models.BooleanField(default=False, help_text="Does the volunteer have GPS tracking?", db_index=True)
    mode_of_search = models.CharField(max_length=50, choices=MODE_OF_SEARCH_CHOICES, db_index=True)
    other_equipment_issued = models.TextField(max_length=100, blank=True, null=True, db_index=True)
    
    # Health and Emergency Details
    blood_group = models.CharField(max_length=20, choices=BLOOD_GROUP_CHOICES, db_index=True)
    known_allergies = models.TextField(max_length=100, blank=True, null=True, db_index=True)
    pre_existing_medical_conditions = models.TextField(max_length=200, blank=True, null=True, db_index=True)
    emergency_contact_name = models.CharField(max_length=50, db_index=True)
    emergency_contact_number = models.CharField(max_length=15, db_index=True)
    relationship_with_volunteer = models.CharField(max_length=50, help_text="Relationship with the volunteer (e.g., Father, Mother, Spouse)", db_index=True)
    
    # Feedback
    feedback_after_search = models.TextField(max_length=200, blank=True, null=True, db_index=True)
    issues_faced_during_search = models.TextField(max_length=200, blank=True, null=True, db_index=True)
    additional_suggestions = models.TextField(max_length=200, blank=True, null=True, db_index=True)
    is_deleted = models.BooleanField(default=False, db_index=True)
    
    def __str__(self):
        return self.full_name

    class Meta:
        indexes = [
            models.Index(fields=['full_name', 'dob', 'gender','photo_upload','is_active']),
            models.Index(fields=['address', 'contact']),
            models.Index(fields=['volunteer_group', 'assigned_region', 'search_start_date', 'search_end_date', 'search_timing']),
            models.Index(fields=['gps_tracker_enabled', 'mode_of_search', 'other_equipment_issued']),
            models.Index(fields=['blood_group', 'known_allergies', 'pre_existing_medical_conditions']),
            models.Index(fields=['emergency_contact_name', 'emergency_contact_number', 'relationship_with_volunteer']),
            models.Index(fields=['feedback_after_search', 'issues_faced_during_search', 'additional_suggestions']),
            models.Index(fields=['is_deleted']),
        ]
     
class MissingPerson(models.Model):
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    
    COMPLEXION_CHOICES = [
        ('Fair', 'Fair'),
        ('Dusky', 'Dusky'),
        ('Wheatish', 'Wheatish'),
        ('Dark', 'Dark'),
    ]
    
    HAIR_COLOR_CHOICES = [
        ('Black', 'Black'),
        ('Brown', 'Brown'),
        ('Grey', 'Grey'),
    ]
    
    HAIR_TYPE_CHOICES = [
        ('Straight', 'Straight'),
        ('Wavy', 'Wavy'),
        ('Curly', 'Curly'),
        ('Bald', 'Bald'),
    ]
    
    EYE_COLOR_CHOICES = [
        ('Dark Brown', 'Dark Brown'),
        ('Light Brown', 'Light Brown'),
        ('Hazel', 'Hazel'),
        ('Amber', 'Amber'),
        ('Green', 'Green'),
        ('Gray', 'Gray'),
    ]
    
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
    
    CASTE_CHOICES = [
        ('Open', 'Open'),
        ('SC', 'SC'),
        ('ST', 'ST'),
        ('OBC', 'OBC'),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Widowed', 'Widowed'),
    ]
    
    RELIGION_CHOICES = [
        ('Hindu', 'Hindu'),
        ('Muslim', 'Muslim'),
        ('Sikh', 'Sikh'),
        ('Christian', 'Christian'),
    ]
    
    LANGUAGE_CHOICES = [
        ('Hindi', 'Hindi'),
        ('English', 'English'),
        ('Marathi', 'Marathi'),
    ]

    IDENTIFICATION_CHOICES = [
        ('Aadhar Card', 'Aadhar Card'),
        ('Pan Card', 'Pan Card'),
        ('Driving License', 'Driving License'),
        ('Passport', 'Passport'),
        ('VoterID', 'VoterID'),
    ]
    
    RELATIONSHIP_CHOICES = [
        ('Father', 'Father'),
        ('Mother', 'Mother'),
        ('Brother', 'Brother'),
        ('Sister', 'Sister'),
        ('Friend', 'Friend'),
    ]
    
    CONDITION_GROUP_CHOICES = [
        ('Memory loss', 'Memory loss'),
        ('Shock', 'Shock'),
        ('Anxiety', 'Anxiety'),
        ('Depression', 'Depression'),
        ('Fatigue', 'Fatigue'),
        ('Headache', 'Headache'),
        ('Dizziness', 'Dizziness'),
        ('Nausea', 'Nausea'),
        ('Chest pain', 'Chest pain'),
        ('Shortness of breath', 'Shortness of breath'),
        ('Confusion', 'Confusion'),
        ('Hallucinations', 'Hallucinations'),
        ('Severe pain', 'Severe pain'),
        ('Paralysis', 'Paralysis'),
    ]

    CASE_STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Resolved', 'Resolved'),
        ('In Progress', 'In Progress'),
        ('Closed', 'Closed'),
        ('Reopened', 'Reopened'),
        ('Pending', 'Pending'),
        ('Found Alive', 'Found Alive'),
        ('Deceased', 'Deceased'),
    ]
    # missing person 
    
    unique_id = models.CharField(max_length=50, unique=True, blank=True, null=True, db_index=True)

    full_name = models.CharField(max_length=255, db_index=True)
    age = models.PositiveIntegerField(db_index=True,blank=True,null=True )
    date_of_birth = models.DateField(db_index=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, db_index=True)
    time_of_birth = models.TimeField(null=True, blank=True, db_index=True)
    place_of_birth = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    height = models.FloatField(help_text="Height in cm", db_index=True)
    weight = models.FloatField(help_text="Weight in kg", db_index=True)
    complexion = models.CharField(max_length=20, choices=COMPLEXION_CHOICES, db_index=True)
    hair_color = models.CharField(max_length=20, choices=HAIR_COLOR_CHOICES, db_index=True)
    hair_type = models.CharField(max_length=20, choices=HAIR_TYPE_CHOICES, db_index=True)
    eye_color = models.CharField(max_length=20, choices=EYE_COLOR_CHOICES, db_index=True)
    birth_mark = models.TextField(null=True, blank=True, db_index=True)
    distinctive_mark = models.TextField(null=True, blank=True, db_index=True)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, db_index=True)
    photo_upload = models.ImageField(upload_to='ALLphotos/Missingperson/', null=True, blank=True, db_index=True)
    
    address = models.ForeignKey(Address, on_delete=models.CASCADE, related_name='missing_person', null=True, db_index=True, blank=True,)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='missing_person', null=True, db_index=True, blank=True,)
    
    condition = models.CharField(max_length=20, choices=CONDITION_GROUP_CHOICES, null=True, blank=True, db_index=True)
    case_status = models.CharField(max_length=20, choices=CASE_STATUS_CHOICES, default='Pending', )
    # additional information
    caste = models.CharField(max_length=50, choices=CASTE_CHOICES, db_index=True,null=True, blank=True,)
    sub_caste = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, db_index=True)
    religion = models.CharField(max_length=50, choices=RELIGION_CHOICES, db_index=True)
    mother_tongue = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, db_index=True)
    other_known_languages = models.CharField(max_length=255, null=True, blank=True, help_text="Comma-separated list of languages", db_index=True)
    educational_details = models.TextField(null=True, blank=True, db_index=True)
    occupation = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    identification_details = models.CharField(max_length=50, choices=IDENTIFICATION_CHOICES, db_index=True)
    identification_card_no = models.CharField(null=True, blank=True, db_index=True)

    
    # missing details
    missing_time = models.TimeField(db_index=True)
    missing_date = models.DateField(db_index=True)
    location_details = models.TextField(null=True, blank=True, db_index=True)
    last_seen_location = models.TextField(null=True, blank=True, db_index=True)
    missing_location = models.PointField(null=True, blank=True,db_index=True)
    # police and legal info
    fir_number = models.PositiveIntegerField(db_index=True)
    fir_photo = models.BinaryField(null=True, blank=True, db_index=True)
    police_station_name_and_address = models.CharField(max_length=255, db_index=True,null=True, blank=True,)
    investigating_officer_name = models.CharField(max_length=255, db_index=True)
    investigating_officer_contact_number = models.CharField(max_length=15, db_index=True)
    
    # reporting person
    reportingperson_name = models.CharField(max_length=255, db_index=True)
    relationship_with_victim = models.CharField(max_length=50, choices=RELATIONSHIP_CHOICES, db_index=True)
    contact_numbers = models.CharField(max_length=20, db_index=True)
    email_address = models.EmailField(max_length=255, db_index=True)
    willing_to_volunteer = models.BooleanField(db_index=True)
    is_deleted = models.BooleanField(default=False, db_index=True)
    rematch_attempt = models.IntegerField(null=True, blank=True, default=0)
    consent = models.BooleanField(default=False)
    
    def generate_case_id(self):
        year_month = datetime.now().strftime("%Y-%m")  
        first_name = self.full_name.split()[0]  
        unique_id = f"{year_month}-{first_name[:5]}" 
        return unique_id

    def save(self, *args, **kwargs):
        if not self.unique_id:
            self.unique_id = self.generate_case_id()

        super().save(*args, **kwargs)
    

    class Meta:
        indexes = [
            models.Index(fields=['unique_id','full_name', 'age', 'date_of_birth', 'gender', 'time_of_birth', 'place_of_birth']),
            models.Index(fields=['height', 'weight', 'complexion', 'hair_color', 'hair_type', 'eye_color']),
            models.Index(fields=['birth_mark', 'distinctive_mark', 'blood_group']),
            
            models.Index(fields=['address', 'contact', 'condition']),
            
            models.Index(fields=['caste', 'sub_caste', 'marital_status', 'religion', 'mother_tongue']),
            models.Index(fields=['other_known_languages', 'educational_details', 'occupation', 'identification_details']),
            models.Index(fields=['identification_card_no']),
            
            models.Index(fields=['missing_time', 'missing_date','missing_location']),
            models.Index(fields=['location_details', 'last_seen_location']),
            
            models.Index(fields=['fir_number', 'fir_photo']),
            models.Index(fields=['police_station_name_and_address', 'investigating_officer_name', 'investigating_officer_contact_number']),
            
            models.Index(fields=['reportingperson_name', 'relationship_with_victim', 'contact_numbers', 'email_address']),
            models.Index(fields=['willing_to_volunteer', 'is_deleted']),
        ]
        
    def __str__(self):
        return self.full_name
        
class UnidentifiedBody(models.Model):
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Transgender', 'Transgender'),
    ]
    
    COMPLEXION_CHOICES = [
        ('Fair', 'Fair'),
        ('Dusky', 'Dusky'),
        ('Wheatish', 'Wheatish'),
        ('Dark', 'Dark'),
    ]
    
    HAIR_COLOR_CHOICES = [
        ('Black', 'Black'),
        ('Brown', 'Brown'),
        ('Grey', 'Grey'),
    ]
    
    HAIR_TYPE_CHOICES = [
        ('Straight', 'Straight'),
        ('Wavy', 'Wavy'),
        ('Curly', 'Curly'),
        ('Bald', 'Bald'),
    ]
    
    EYE_COLOR_CHOICES = [
        ('Dark Brown', 'Dark Brown'),
        ('Light Brown', 'Light Brown'),
        ('Hazel', 'Hazel'),
        ('Amber', 'Amber'),
        ('Green', 'Green'),
        ('Gray', 'Gray'),
    ]
    
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Widowed', 'Widowed'),
    ]

    CASE_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Found Alive_with_missing', 'Found Alive_with_missing'),
        ('Found_Alive_With_Unidentified', 'Found_Alive_With_Unidentified'),
    ]
   
    BODY_CONDITION_CHOICES = [
        ('Decomposed', 'Decomposed'),
        ('Intact', 'Intact'),
        ('Mummified', 'Mummified'),
        ('Skeletonized', 'Skeletonized'),
        ('Partially Decayed', 'Partially Decayed'),
        ('Emaciated', 'Emaciated'),
        ('Burnt', 'Burnt'),
        ('Traumatic Injury', 'Traumatic Injury'),
        ('Fresh', 'Fresh'),
    ]   
    
    # Personal Details
    unique_id = models.CharField(max_length=50, unique=True, blank=True, null=True, db_index=True)

    full_name = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    estimated_age = models.IntegerField(blank=True, null=True, db_index=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, db_index=True)
    date_found = models.DateField(db_index=True)
    marital_status = models.CharField(max_length=50, choices=MARITAL_STATUS_CHOICES, blank=True, null=True, verbose_name="Marital Status")
    condition = models.CharField(max_length=20, choices=BODY_CONDITION_CHOICES, blank=True, null=True, db_index=True)

    estimated_time_of_death = models.TimeField(blank=True, null=True, db_index=True)
    height = models.FloatField(help_text="Height in cm", db_index=True)
    weight = models.FloatField(help_text="Weight in kg", db_index=True)
    complexion = models.CharField(max_length=50, choices=COMPLEXION_CHOICES, db_index=True)
    hair_color = models.CharField(max_length=50, choices=HAIR_COLOR_CHOICES, db_index=True)
    hair_type = models.CharField(max_length=50, choices=HAIR_TYPE_CHOICES, db_index=True)
    eye_color = models.CharField(max_length=50, choices=EYE_COLOR_CHOICES, db_index=True)
    birth_mark = models.TextField(max_length=100, blank=True, null=True, db_index=True)
    other_distinctive_mark = models.TextField(max_length=100, blank=True, null=True, db_index=True)
    blood_group = models.CharField(max_length=20, choices=BLOOD_GROUP_CHOICES, db_index=True)
    body_photo_upload = models.FileField(upload_to='ALLphotos/Unidentified_Bodies/body_photos/', blank=True, null=True, db_index=True)
    clothing_description = models.TextField(max_length=100, blank=True, null=True, db_index=True)
    body_seen_details = models.TextField(max_length=100, blank=True, null=True, db_index=True)
    case_status = models.CharField(max_length=50, choices=CASE_STATUS_CHOICES, default='Pending', db_index=True)

    # Foreign keys (Contact and Address)
    address = models.ForeignKey(Address, on_delete=models.CASCADE, related_name='unidentified_bodies', null=True, db_index=True)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='unidentified_bodies', null=True, blank=True, db_index=True)
    
    Volunteers = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='unidentified_bodies', null=True, blank=True, db_index=True)

    # Legal and Police Info
    fir_number = models.IntegerField(help_text="FIR Number assigned for the case", db_index=True)
    fir_photo = models.FileField(upload_to='ALLphotos/Unidentified_Bodies/fir_photos/', blank=True, null=True, db_index=True)
    police_station_name_and_address = models.ForeignKey(Chowki, on_delete=models.CASCADE, related_name='unidentified_bodies', db_index=True)
    investigating_officer_name = models.CharField(max_length=50, help_text="Name of the investigating police officer", db_index=True)
    investigating_officer_contact_number = models.CharField(max_length=15, help_text="Contact number of the investigating officer", db_index=True)
    
    # Identification
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='unidentified_bodies', db_index=True)
    fingerprints_collected = models.FileField(upload_to='ALLphotos/Unidentified_Bodies/fingerprints/', blank=True, null=True, help_text="Upload fingerprints collected", db_index=True)
    dna_sample_collected = models.FileField(upload_to='ALLphotos/Unidentified_Bodies/dna_samples/', blank=True, null=True, help_text="Upload DNA samples collected", db_index=True)
    post_mortem_report_upload = models.FileField(upload_to='ALLphotos/Unidentified_Bodies/post_mortem_reports/', blank=True, null=True, help_text="Upload the post-mortem report", db_index=True)
    
    # Metadata
    created_date = models.DateTimeField(auto_now_add=True, db_index=True)
    last_updated = models.DateTimeField(auto_now=True, db_index=True)
    is_deleted = models.BooleanField(default=False, db_index=True)
    
    def generate_case_id(self):
        year_month = datetime.now().strftime("%Y-%m")
        existing_ids = self.__class__.objects.filter(unique_id__startswith=year_month).values_list('unique_id', flat=True)
        serial_numbers = [
            int(id.split('-')[-1]) for id in existing_ids if id.split('-')[-1].isdigit()]
        next_serial = max(serial_numbers, default=0) + 1
        unique_id = f"{year_month}-{next_serial:03d}" 
        return unique_id

    def save(self, *args, **kwargs):

        if not self.unique_id:
            self.unique_id = self.generate_case_id()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f" {self.full_name or 'Unknown'}"

    class Meta:
        indexes = [
            models.Index(fields=['full_name', 'estimated_age', 'gender', 'date_found', 'estimated_time_of_death']),
            models.Index(fields=['height', 'weight', 'complexion', 'hair_color', 'hair_type', 'eye_color']),
            models.Index(fields=['birth_mark', 'other_distinctive_mark', 'condition','blood_group']),
            
            models.Index(fields=['body_photo_upload', 'clothing_description', 'body_seen_details']),
            
            models.Index(fields=['address', 'contact']),
            
            models.Index(fields=['fir_number', 'fir_photo']),
            models.Index(fields=['police_station_name_and_address', 'investigating_officer_name', 'investigating_officer_contact_number']),
            
            models.Index(fields=['hospital', 'fingerprints_collected', 'dna_sample_collected', 'post_mortem_report_upload']),
            
            models.Index(fields=['created_date', 'last_updated', 'is_deleted']),
        ]
        
class UnidentifiedMissingPerson(models.Model):
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Transgender', 'Transgender'),
    ]

    COMPLEXION_CHOICES = [
        ('Fair', 'Fair'),
        ('Dusky', 'Dusky'),
        ('Wheatish', 'Wheatish'),
        ('Dark', 'Dark'),
    ]

    HAIR_COLOR_CHOICES = [
        ('Black', 'Black'),
        ('Brown', 'Brown'),
        ('Grey', 'Grey'),
    ]

    HAIR_TYPE_CHOICES = [
        ('Straight', 'Straight'),
        ('Wavy', 'Wavy'),
        ('Curly', 'Curly'),
        ('Bald', 'Bald'),
    ]

    EYE_COLOR_CHOICES = [
        ('Dark brown', 'Dark brown'),
        ('Light Brown', 'Light Brown'),
        ('Hazel', 'Hazel'),
        ('Amber', 'Amber'),
        ('Green', 'Green'),
        ('Gray', 'Gray'),
    ]

    CASTE_CHOICES = [
        ('Open', 'Open'),
        ('SC', 'SC'),
        ('ST', 'ST'),
    ]

    MARITAL_STATUS_CHOICES = [
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Widowed', 'Widowed'),
    ]

    RELIGION_CHOICES = [
        ('Hindu', 'Hindu'),
        ('Muslim', 'Muslim'),
        ('Sikh', 'Sikh'),
    ]

    LANGUAGE_CHOICES = [
        ('Hindi', 'Hindi'),
        ('Marathi', 'Marathi'),
        ('Bengali', 'Bengali'),
    ]

    CONDITION_CHOICES = [
        ('Memory loss', 'Memory loss'),
        ('Shock', 'Shock'),
        ('Injured', 'Injured'),
        ('Other', 'Other'),
    ]
    
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
    
    CASE_STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Resolved', 'Resolved'),
        ('In Progress', 'In Progress'),
        ('Closed', 'Closed'),
        ('Reopened', 'Reopened'),
        ('Pending', 'Pending'),
        ('Found Alive', 'Found Alive'),
        ('Deceased', 'Deceased'),
    ]

    CONDITION_GROUP_CHOICES = [
        ('Memory loss', 'Memory loss'),
        ('Shock', 'Shock'),
        ('Anxiety', 'Anxiety'),
        ('Depression', 'Depression'),
        ('Fatigue', 'Fatigue'),
        ('Headache', 'Headache'),
        ('Dizziness', 'Dizziness'),
        ('Nausea', 'Nausea'),
        ('Chest pain', 'Chest pain'),
        ('Shortness of breath', 'Shortness of breath'),
        ('Confusion', 'Confusion'),
        ('Hallucinations', 'Hallucinations'),
        ('Severe pain', 'Severe pain'),
        ('Paralysis', 'Paralysis'),
    ]

    unique_id = models.CharField(max_length=50, unique=True, blank=True, null=True, db_index=True)

    full_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Full Name")
    estimated_age = models.PositiveIntegerField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True, verbose_name="Date of Birth")
    gender = models.CharField(max_length=50, choices=GENDER_CHOICES, blank=True, null=True, verbose_name="Gender")
    height = models.FloatField(blank=True, null=True, verbose_name="Height (cm)")
    weight = models.FloatField(blank=True, null=True, verbose_name="Weight (kg)")
    birth_mark = models.TextField(max_length=255, blank=True, null=True)
    blood_group = models.CharField(max_length=50, choices=BLOOD_GROUP_CHOICES, blank=True, null=True, verbose_name="blood_group")
    condition = models.CharField(max_length=20, choices=CONDITION_GROUP_CHOICES, null=True, blank=True, db_index=True)
    complexion = models.CharField(max_length=50, choices=COMPLEXION_CHOICES, blank=True, null=True, verbose_name="Complexion")
    hair_color = models.CharField(max_length=50, choices=HAIR_COLOR_CHOICES, blank=True, null=True, verbose_name="Hair Color")
    hair_type = models.CharField(max_length=50, choices=HAIR_TYPE_CHOICES, blank=True, null=True, verbose_name="Hair Type")
    eye_color = models.CharField(max_length=50, choices=EYE_COLOR_CHOICES, blank=True, null=True, verbose_name="Eye Color")
    case_status = models.CharField(max_length=20, choices=CASE_STATUS_CHOICES, default='Pending', db_index=True)

    other_distinctive_mark = models.TextField(blank=True, null=True)
    photo_upload = models.ImageField(upload_to='ALLphotos/Unidnetified_missing_person/photos/', blank=True, null=True, verbose_name="Photo Upload")
    
    caste = models.CharField(max_length=50, choices=CASTE_CHOICES, blank=True, null=True, verbose_name="Caste")
    marital_status = models.CharField(max_length=50, choices=MARITAL_STATUS_CHOICES, blank=True, null=True, verbose_name="Marital Status")
    religion = models.CharField(max_length=50, choices=RELIGION_CHOICES, blank=True, null=True, verbose_name="Religion")
    other_known_languages = models.CharField(max_length=255, choices=LANGUAGE_CHOICES, blank=True, null=True, verbose_name="Other Known Languages")
    identification_details = models.TextField(blank=True, null=True, verbose_name="Identification Details")
    last_location = models.TextField(blank=True, null=True, verbose_name="Last Location of Missing Person")
    last_seen_details = models.TextField(blank=True, null=True, verbose_name="Last Seen Details/Sighting Details")
    condition_at_discovery = models.CharField(max_length=50, choices=CONDITION_CHOICES, blank=True, null=True, verbose_name="Condition at Discovery")
    
    reporting_person_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Name of Reporting Person")
    reporting_person_contact_number = models.CharField(max_length=15, blank=True, null=True, verbose_name="Contact Number(s)")
    reporting_person_email = models.EmailField(blank=True, null=True, verbose_name="Email Address")
    relationship_with_victim = models.CharField(max_length=255, blank=True, null=True, verbose_name="Relationship with Victim")
    availability_for_search_operations = models.CharField(max_length=50, blank=True, null=True, verbose_name="Availability for Search Operations")
    preferred_mode_of_communication = models.CharField(max_length=50, blank=True, null=True, verbose_name="Preferred Mode of Communication")
    access_to_vehicle = models.BooleanField(default=False, verbose_name="Access to Vehicle for Search Operations")
    
    special_skills = models.TextField(blank=True, null=True, verbose_name="Special Skills")
    previous_search_experience = models.TextField(blank=True, null=True, verbose_name="Details of Previous Search Experience")
    upload_evidence = models.FileField(upload_to='ALLphotos/Unidnetified_missing_person/evidence/', blank=True, null=True, verbose_name="Upload Evidence (e.g., photos, notes)")
    last_seen_date = models.DateField(null=True, blank=True)
    reported_date = models.DateField(null=True, blank=True)
    
    address = models.ForeignKey(Address, on_delete=models.CASCADE, related_name='Undefined_missing_person', null=True, blank=True)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='Undefined_missing_person', null=True, blank=True)
    
    Volunteers = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='Undefined_missing_person', null=True, blank=True, db_index=True)
    fir_number = models.IntegerField(help_text="FIR Number assigned for the case",blank=True, null=True, db_index=True)
    fir_photo = models.FileField(upload_to='ALLphotos/Unidnetified_missing_person/fir_photos/', blank=True, null=True, db_index=True)
    police_station_name_and_address = models.ForeignKey(Chowki, on_delete=models.CASCADE, related_name='Undefined_missing_person',blank=True, null=True, db_index=True)
    investigating_officer_name = models.CharField(max_length=50, help_text="Name of the investigating police officer", blank=True, null=True,db_index=True)
    investigating_officer_contact_number = models.CharField(max_length=15, help_text="Contact number of the investigating officer",blank=True, null=True, db_index=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='Undefined_missing_person',blank=True, null=True, db_index=True)
    
    is_deleted = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    def generate_case_id(self):
        year_month = datetime.now().strftime("%Y-%m")
        existing_ids = self.__class__.objects.filter(unique_id__startswith=year_month).values_list('unique_id', flat=True)
        serial_numbers = [
            int(id.split('-')[-1]) for id in existing_ids if id.split('-')[-1].isdigit()]
        next_serial = max(serial_numbers, default=0) + 1
        unique_id = f"{year_month}-{next_serial:03d}" 
        return unique_id

    def save(self, *args, **kwargs):

        if not self.unique_id:
            self.unique_id = self.generate_case_id()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f" {self.full_name or 'Unknown'}"

    class Meta:
        indexes = [
            models.Index(fields=['full_name', 'estimated_age', 'date_of_birth', 'gender', 'is_active']),
            
            models.Index(fields=['height', 'weight', 'complexion', 'hair_color', 'hair_type', 'eye_color']),
            
            models.Index(fields=['birth_mark', 'other_distinctive_mark', 'condition_at_discovery']),
            
            models.Index(fields=['identification_details', 'photo_upload', 'upload_evidence']),
            
            models.Index(fields=['last_location', 'last_seen_details', 'last_seen_date']),
            
            models.Index(fields=['reporting_person_name', 'reporting_person_contact_number', 'relationship_with_victim']),
            
            models.Index(fields=['availability_for_search_operations', 'preferred_mode_of_communication', 'access_to_vehicle']),
            
            models.Index(fields=['special_skills', 'previous_search_experience']),
            
            models.Index(fields=['is_deleted', 'is_active']),
            
            models.Index(fields=['address', 'contact']),
        ]


#model for the matching data between persons
class Match(models.Model):
    missing_person = models.ForeignKey(MissingPerson, on_delete=models.CASCADE, null=True, blank=True)
    undefined_missing_person = models.ForeignKey(UnidentifiedMissingPerson, on_delete=models.CASCADE, null=True, blank=True)
    unidentified_body = models.ForeignKey(UnidentifiedBody, on_delete=models.CASCADE, null=True, blank=True)
    match_percentage = models.FloatField()
    match_id = models.CharField(max_length=50,unique=True,null=True, blank=True)
    is_confirmed = models.BooleanField(default=False)
    match_type = models.CharField(max_length=50, default='Partial')  
    matching_criteria = models.JSONField(null=True, blank=True) 
    resolution_status = models.CharField(max_length=50, choices=[
        ('Pending', 'Pending'),
        ('Resolved - Found Alive', 'Resolved - Found Alive'),
        ('Resolved - Deceased', 'Resolved - Deceased')
    ], null=True,blank=True)
    date_matched = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    volunteer = models.ForeignKey('Volunteer', on_delete=models.SET_NULL, null=True, blank=True)
    is_rejected = models.BooleanField(default=False)
    
    class Meta:
        unique_together = (('missing_person', 'undefined_missing_person', 'unidentified_body', 'match_percentage', 'match_type'),)

    
    
    def __str__(self):
        if self.undefined_missing_person:
            return f"Match: {self.missing_person} - {self.undefined_missing_person} - {self.match_percentage}%"
        if self.unidentified_body:
            return f"Match: {self.missing_person} - {self.unidentified_body} - {self.match_percentage}%"
        return "No Match"
    
    def save(self, *args, **kwargs):
        if not self.match_id and self.missing_person:
            first_name = self.missing_person.full_name.split()[0] 
            year_month = datetime.now().strftime('%Y%m') 
            if self.unidentified_body:
                self.match_id = f"{year_month}-{first_name}-UB{self.unidentified_body.id}"
            elif self.undefined_missing_person:
                self.match_id = f"{year_month}-{first_name}-UP{self.undefined_missing_person.id}"
        super(Match, self).save(*args, **kwargs)

class BodyMatch(models.Model):
    # Foreign keys to link the body and the potential match
    unidentified_body = models.ForeignKey(UnidentifiedBody, on_delete=models.CASCADE)
    missing_person = models.ForeignKey(MissingPerson, on_delete=models.CASCADE, null=True, blank=True)
    undefined_missing_person = models.ForeignKey(UnidentifiedMissingPerson, on_delete=models.CASCADE, null=True, blank=True)

    match_percentage = models.FloatField()

    match_id = models.CharField(max_length=50, unique=True, null=True, blank=True)

    match_type = models.CharField(max_length=50, default='Partial')  
    matching_criteria = models.JSONField(null=True, blank=True)

    resolution_status = models.CharField(
        max_length=50, 
        choices=[
            ('Pending', 'Pending'),
            ('Resolved - Found Alive', 'Resolved - Found Alive'),
            ('Resolved - Deceased', 'Resolved - Deceased')
        ], 
        null=True, blank=True
    )

    # Date when the match was made
    date_matched = models.DateTimeField(auto_now_add=True)

    # Volunteer responsible for the match, optional
    # volunteer = models.ForeignKey('Volunteer', on_delete=models.SET_NULL, null=True, blank=True)

    # Boolean flag for whether the match was rejected
    is_rejected = models.BooleanField(default=False)

    class Meta:
        # Ensuring that the same body doesn't get matched multiple times to the same person
        unique_together = (('unidentified_body', 'missing_person', 'undefined_missing_person', 'match_percentage', 'match_type'),)

    def __str__(self):
        if self.missing_person:
            return f"Match: {self.unidentified_body} - {self.missing_person} - {self.match_percentage}%"
        elif self.undefined_missing_person:
            return f"Match: {self.unidentified_body} - {self.undefined_missing_person} - {self.match_percentage}%"
        return "No Match"

    def save(self, *args, **kwargs):
        # Automatically generate match_id if missing
        if not self.match_id:
            year_month = datetime.now().strftime('%Y%m')  # Example: 202412
            if self.missing_person:
                self.match_id = f"{year_month}-{self.missing_person.full_name.split()[0]}-MP{self.missing_person.id}"
            elif self.undefined_missing_person:
                self.match_id = f"{year_month}-{self.undefined_missing_person.full_name.split()[0]}-UMP{self.undefined_missing_person.id}"
            elif self.unidentified_body:
                self.match_id = f"{year_month}-{self.unidentified_body.unique_id}-UB{self.unidentified_body.id}"
        super(BodyMatch, self).save(*args, **kwargs)




# model for the resolved case
class ResolvedCase(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE,null=True, blank=True) 
    missing_person = models.ForeignKey(MissingPerson, on_delete=models.CASCADE,null=True, blank=True,)
    unidentified_missing_person = models.ForeignKey(UnidentifiedMissingPerson, null=True, blank=True, on_delete=models.CASCADE)
    unidentified_body = models.ForeignKey(UnidentifiedBody, null=True, blank=True, on_delete=models.CASCADE)
    confirmed_by_name = models.CharField(max_length=255,blank=True, null=True,)
    confirmed_by_contact = models.CharField(max_length=20,blank=True, null=True,)
    confirmed_by_relationship = models.CharField(max_length=255,blank=True, null=True,)
    notes = models.TextField(null=True, blank=True)
    report_number = models.CharField(max_length=50, unique=True, blank=True, null=True,editable=False)
    is_deleted = models.BooleanField(default=False)
    is_confirmed = models.BooleanField(default=False)
    def save(self, *args, **kwargs):
        if not self.report_number:
            self.report_number = self.generate_report_number()
    
        super().save(*args, **kwargs)

    def generate_report_number(self):
        current_year = timezone.now().strftime("%Y") 
        current_month = timezone.now().strftime("%m") 
         
        serial_number = ResolvedCase.objects.filter(
            report_number__startswith=f"CR{current_year}{current_month}"
        ).count() + 1 

        serial_number_str = str(serial_number).zfill(2)

        return f"CR{current_year}{current_month}-{serial_number_str}"

# model to store report in db
class CaseReport(models.Model):
    report_number = models.CharField(max_length=100,editable=False, db_index=True)
    missing_person_name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    status = models.CharField(max_length=50, db_index=True)
    date_reported = models.DateField(null=True, blank=True, db_index=True)
    reported_by = models.CharField(max_length=255, db_index=True)
    age = models.IntegerField(null=True, blank=True, db_index=True)
    gender = models.CharField(max_length=10, null=True, blank=True, db_index=True)
    last_known_location = models.TextField(null=True, blank=True, db_index=True)
    fir_number = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    police_station = models.ForeignKey('Chowki', null=True, blank=True, on_delete=models.SET_NULL, db_index=True)
    police_officer_assigned = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    case_duration = models.IntegerField(null=True, blank=True, db_index=True)
    resolution_summary = models.TextField(null=True, blank=True, db_index=True)
    matching_fields = models.CharField(max_length=255, db_index=True)
    match_type = models.CharField(max_length=255, null=True, blank=True)  
    MATCH_id =models.CharField(max_length=50, blank=True, null=True)

    closure_process = models.TextField(null=True, blank=True, db_index=True)
    legal_and_police_involvement = models.TextField(null=True, blank=True, db_index=True)
    hospital_and_forensic_involvement = models.TextField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    Hospital_pk = models.IntegerField(null=True, blank=True, db_index=True)  
    missing_person_pk = models.IntegerField(null=True, blank=True, db_index=True)  
    unidentified_body_pk = models.IntegerField(null=True, blank=True, db_index=True)  
    unidentified_missing_person_pk = models.IntegerField(null=True, blank=True, db_index=True)
    
      
    def __str__(self):
        return f"Report {self.report_number} -{self.status}"

    class Meta:
        indexes = [
            models.Index(fields=['report_number']),
            models.Index(fields=['missing_person_name', 'status']),
            models.Index(fields=['date_reported', 'created_at']),
        ]

# rejected records
class MatchRejection(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE,null=True, blank=True) 
    missing_person = models.ForeignKey(MissingPerson, on_delete=models.CASCADE)
    unidentified_body = models.ForeignKey(UnidentifiedBody, null=True, blank=True, on_delete=models.CASCADE)
    undefined_missing_person = models.ForeignKey(UnidentifiedMissingPerson, null=True, blank=True, on_delete=models.CASCADE)
    rejection_reason = models.TextField()  
    rejected_at = models.DateTimeField(auto_now_add=True)
    matched_percentage =models.FloatField(null=True, blank=True)
    MATCH_id = models.CharField(max_length=50, null=True, blank=True)
    def __str__(self):
        return f"Rejection for {self.missing_person.full_name} "
    
# model for previosly_matched data
class PreviouslyMatched(models.Model):
    missing_person = models.ForeignKey(MissingPerson, on_delete=models.CASCADE, related_name='previous_matches')
    undefined_missing_person = models.ForeignKey(UnidentifiedMissingPerson, on_delete=models.CASCADE, null=True, blank=True, related_name='matched_missing_persons')
    unidentified_body = models.ForeignKey(UnidentifiedBody, on_delete=models.CASCADE, null=True, blank=True, related_name='matched_missing_persons')
    match_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    match_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    matched_gender = models.CharField(max_length=50, blank=True, null=True)
    matched_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Match: {self.missing_person.full_name} -> {self.undefined_missing_person.full_name if self.undefined_missing_person else self.unidentified_body.full_name}"

    class Meta:
        unique_together = ('missing_person', 'undefined_missing_person', 'unidentified_body')