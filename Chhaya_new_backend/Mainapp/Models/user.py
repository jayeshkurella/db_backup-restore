from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid

class UserManager(BaseUserManager):
    def create_user(self, username, email_id, phone_no, password=None, **extra_fields):
        if not email_id:
            raise ValueError("The Email field must be set")
        email_id = self.normalize_email(email_id)
        user = self.model(username=username, email_id=email_id, phone_no=phone_no, **extra_fields)
        user.set_password(password) 
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email_id, phone_no, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email_id, phone_no, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    class UserTypeChoices(models.TextChoices):
        REPORTING = 'reporting', 'Reporting'
        VOLUNTEER = 'volunteer', 'Volunteer'
        FAMILY = 'family', 'Family'
        ADMIN = 'admin', 'Admin'
        SUB_ADMIN = 'sub-admin', 'Sub-Admin'
        OFFICER = 'officer', 'Officer'
        POLICE_STATION = 'police_station', 'Police Station'
        HOSPITAL = 'hospital', 'Hospital',
        Developer = 'Developer', 'Developer'

    class FamilySubTypeChoices(models.TextChoices):
        FATHER = 'father', 'Father'
        MOTHER = 'mother', 'Mother'
        SON = 'son', 'Son'
        DAUGHTER = 'daughter', 'Daughter'
        BROTHER = 'brother', 'Brother'
        SISTER = 'sister', 'Sister'
        RELATIVE = 'relative', 'Relative'

    class OfficerSubTypeChoices(models.TextChoices):
        OFFICER_LEVEL1 = 'officer-level1', 'Officer Level 1'
        OFFICER_LEVEL2 = 'officer-level2', 'Officer Level 2'
        DETECTIVE = 'detective', 'Detective'
        INVESTIGATOR = 'investigator', 'Investigator'

    class PoliceStationSubTypeChoices(models.TextChoices):
        INSPECTOR = 'inspector', 'Inspector'
        CONSTABLE = 'constable', 'Constable'
        HEAD_CONSTABLE = 'head_constable', 'Head Constable'
        SUB_INSPECTOR = 'sub_inspector', 'Sub Inspector'

    class HospitalSubTypeChoices(models.TextChoices):
        DOCTOR = 'doctor', 'Doctor'
        NURSE = 'nurse', 'Nurse'
        MEDICAL_ASSISTANT = 'medical_assistant', 'Medical Assistant'
        RECEPTIONIST = 'receptionist', 'Receptionist'

    class StatusChoices(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        HOLD = 'hold', 'Hold'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=20, choices=UserTypeChoices.choices, default=UserTypeChoices.REPORTING)
    sub_user_type = models.CharField(max_length=20, blank=True, null=True)

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    username = models.CharField(max_length=50, unique=True)
    email_id = models.EmailField(max_length=50, unique=True)
    phone_no = models.CharField(max_length=10, unique=True)
    country_code = models.CharField(max_length=5, blank=True, null=True)

    password = models.CharField(max_length=255)
    salt = models.CharField(max_length=7, blank=True, null=True)

    is_consent = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.ACTIVE)

    person = models.ForeignKey('Person', on_delete=models.SET_NULL, null=True, blank=True)
    contact = models.ForeignKey('Contact', on_delete=models.SET_NULL, related_name='user_contact', null=True, blank=True)
    consent_id = models.ForeignKey('consent', on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.UUIDField(null=True, blank=True)
    updated_by = models.UUIDField(null=True, blank=True)
    is_superuser = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email_id'
    REQUIRED_FIELDS = ['username', 'phone_no']

    def save(self, *args, **kwargs):
        # Ensure sub_user_type is valid based on user_type
        valid_subtypes = {
            self.UserTypeChoices.FAMILY: dict(self.FamilySubTypeChoices.choices),
            self.UserTypeChoices.OFFICER: dict(self.OfficerSubTypeChoices.choices),
            self.UserTypeChoices.POLICE_STATION: dict(self.PoliceStationSubTypeChoices.choices),
            self.UserTypeChoices.HOSPITAL: dict(self.HospitalSubTypeChoices.choices),
        }

        if self.user_type in valid_subtypes:
            if self.sub_user_type not in valid_subtypes[self.user_type]:
                raise ValueError(f"Invalid sub_user_type '{self.sub_user_type}' for user_type '{self.user_type}'")

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.user_type} - {self.sub_user_type})" if self.sub_user_type else f"{self.username} ({self.user_type})"

 