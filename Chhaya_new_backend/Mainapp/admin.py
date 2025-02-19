from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .Models.additonal_info import AdditionalInfo
from .Models.address import Address
from .Models.admin_user import AdminUser
from .Models.consent import Consent
from .Models.contact import Contact
from .Models.document import Document
from .Models.fir import FIR
from .Models.hospital import Hospital
from .Models.last_known_details import LastKnownDetails
from .Models.match import Match
from .Models.person_user import PersonUser
from .Models.person import Person
from .Models.police_station import PoliceStation
from .Models.user import User

# Register your models
admin.site.register(AdditionalInfo)
admin.site.register(Address)
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
admin.site.register(User)