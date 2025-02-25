
from django.contrib import admin

from .models.additonal_info import AdditionalInfo
from .models.address import Address
from .models.admin_user import AdminUser
from .models.consent import Consent
from .models.contact import Contact
from .models.document import Document
from .models.fir import FIR
from .models.hospital import Hospital
from .models.last_known_details import LastKnownDetails
from .models.match import Match
from .models.person_user import PersonUser
from .models.person import Person
from .models.police_station import PoliceStation
from leaflet.admin import LeafletGeoAdmin  # Import Leaflet admin

from .models.user import User

# Register your models
admin.site.register(AdditionalInfo)
@admin.register(Address)
class AddressAdmin(LeafletGeoAdmin):
    pass
    
admin.site.register(AdminUser)
admin.site.register(Consent)
admin.site.register(Contact)
admin.site.register(Document)
admin.site.register(FIR)
admin.site.register(Hospital)
admin.site.register(LastKnownDetails)
admin.site.register(Match)
admin.site.register(PersonUser)
admin.site.register(Person)
admin.site.register(PoliceStation)
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email_id', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email_id')
    list_filter = ('is_staff', 'is_superuser')