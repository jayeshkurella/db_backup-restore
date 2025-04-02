from django.contrib import admin
from .models import MissingPerson
from leaflet.admin import LeafletGeoAdmin

class MissingPersonAdmin(LeafletGeoAdmin):
    list_display = ('name', 'last_known_location', 'date_missing')

admin.site.register(MissingPerson, MissingPersonAdmin)