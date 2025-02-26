import uuid
from django.db import models




class Contact(models.Model):
    class ContactTypeChoices(models.TextChoices):
        PERSONAL = 'personal', 'Personal'
        OFFICE = 'office', 'Office'
        HOME = 'home', 'Home'

    class SocialMediaChoices(models.TextChoices):
        FACEBOOK = 'fb', 'Facebook'
        INSTAGRAM = 'insta', 'Instagram'
        X = 'x', 'X (Twitter)'
        THREADS = 'thread', 'Threads'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_no = models.CharField(max_length=13, unique=True)
    country_cd = models.CharField(max_length=5, help_text="Country Code")
    email_id = models.EmailField(max_length=150, unique=True)
    type = models.CharField(max_length=10, choices=ContactTypeChoices.choices)
    company_name = models.CharField(max_length=100, blank=True, null=True)
    job_title = models.CharField(max_length=50, blank=True, null=True)
    website_url = models.TextField(blank=True, null=True)
    social_media_availability = models.CharField(max_length=10, choices=SocialMediaChoices.choices, blank=True, null=True)
    additional_details = models.TextField(blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='contacts',null=True, blank=True,)
    hospital = models.ForeignKey('Hospital', on_delete=models.SET_NULL, null=True, blank=True,related_name='hospital_contact')
    police_station = models.ForeignKey('PoliceStation', on_delete=models.SET_NULL, null=True, blank=True, related_name="police_contact",)
    person = models.ForeignKey('Person', on_delete=models.SET_NULL, related_name="contacts",null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True,null=True, blank=True,)
    updated_at = models.DateTimeField(auto_now=True,null=True, blank=True,)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")


    def __str__(self):
        return f"{self.phone_no} ({self.type})"
