from django.contrib import admin
from leaflet.admin import LeafletGeoAdmin
from Missing_persons.models import Address, BodyMatch, CaseReport, Chowki, Contact, Division, Hospital, HospitalDivision, HospitalZone, Match, MatchRejection, MissingPerson, PoliceStation, PreviouslyMatched, ResolvedCase, UnidentifiedBody, UnidentifiedMissingPerson, Volunteer, Zone

class MissingPersonAdmin(LeafletGeoAdmin):
    
    fields = ('unique_id','full_name', 'age', 'date_of_birth', 'gender', 'time_of_birth', 'place_of_birth','height', 'weight', 
              'complexion', 'hair_color', 'hair_type', 'eye_color', 'birth_mark', 'distinctive_mark', 'blood_group', 
              'photo_upload', 'address','contact','condition', 'case_status', 'location_details', 'last_seen_location','missing_date','missing_location',
              'missing_time', 'fir_number', 'police_station_name_and_address', 'investigating_officer_name', 
              'investigating_officer_contact_number', 'reportingperson_name', 'relationship_with_victim', 'contact_numbers', 
              'email_address', 'willing_to_volunteer', 'caste', 'sub_caste', 'marital_status', 'religion', 'mother_tongue', 
              'other_known_languages', 'educational_details', 'occupation', 'identification_details', 'identification_card_no', 'is_deleted')

    list_display = ['unique_id','full_name', 'age', 'date_of_birth', 'gender', 'time_of_birth', 'place_of_birth','height', 'weight', 
              'complexion', 'hair_color', 'hair_type', 'eye_color', 'case_status','birth_mark', 'distinctive_mark', 'blood_group', 
              'photo_upload', 'address','contact',  'location_details', 'last_seen_location','missing_date','missing_location',
              'missing_time', 'fir_number', 'police_station_name_and_address', 'investigating_officer_name', 
              'investigating_officer_contact_number', 'reportingperson_name', 'relationship_with_victim', 'contact_numbers', 
              'email_address', 'willing_to_volunteer', 'caste', 'sub_caste', 'marital_status', 'religion', 'mother_tongue', 
              'other_known_languages', 'educational_details', 'occupation', 'identification_details', 'identification_card_no', 'is_deleted']  
    
    search_fields = ['full_name', 'age', 'gender', 'date_of_birth']
    list_filter = ['gender', 'blood_group', 'marital_status']

class UnidentifiedMissingPersonAdmin(LeafletGeoAdmin):
    list_display = [
    'unique_id','full_name', 'estimated_age', 'gender', 'height', 'weight', 'birth_mark', 'complexion',
    'hair_color', 'hair_type','condition', 'eye_color', 'case_status',
    ]

    

    fieldsets = (
        ('Personal Details', {
            'fields': ('unique_id','full_name', 'estimated_age', 'date_of_birth','blood_group', 'gender', 'height', 'weight', 'complexion')
        }),
        ('Appearance', {
            'fields': ('birth_mark', 'hair_color', 'hair_type', 'eye_color', 'other_distinctive_mark','condition', 'photo_upload')
        }),
        ('Background Details', {
            'fields': ('caste', 'marital_status', 'religion', 'case_status','other_known_languages', 'identification_details')
        }),
        ('Last Seen Information', {
            'fields': ('last_location', 'last_seen_details', 'last_seen_date','condition_at_discovery')
        }),
        ('Reporting Information', {
            'fields': ('reporting_person_name', 'reporting_person_contact_number', 'reporting_person_email', 'relationship_with_victim','Volunteers'
                       ,'fir_number','fir_photo','hospital','police_station_name_and_address','investigating_officer_name','investigating_officer_contact_number')
        }),
        ('Search Assistance', {
            'fields': ('availability_for_search_operations', 'preferred_mode_of_communication', 'access_to_vehicle', 'special_skills', 'previous_search_experience', 'upload_evidence')
        }),
        ('Admin Details', {
            'fields': ('is_active', 'is_deleted', )
        }),
        ('Location and Contact Information', {
            'fields': ('address', 'contact')
        }),
    )

class UnidentifiedBodyAdmin(LeafletGeoAdmin):
    list_display = [
        'unique_id','full_name', 'estimated_age', 'gender', 'case_status','date_found', 'estimated_time_of_death', 'height', 'weight',
        'complexion', 'hair_color', 'hair_type', 'eye_color', 'birth_mark', 'other_distinctive_mark','marital_status', 'blood_group',
        'body_photo_upload', 'condition','clothing_description', 'body_seen_details', 'address', 'contact', 'fir_number',
        'fir_photo', 'Volunteers','police_station_name_and_address', 'investigating_officer_name', 
        'investigating_officer_contact_number',  'fingerprints_collected', 'dna_sample_collected',
        'post_mortem_report_upload', 'is_deleted'
    ]
    
    search_fields = ['full_name', 'fir_number', 'investigating_officer_name', 'police_station_name_and_address__name']
    list_filter = ['gender', 'complexion', 'blood_group', 'is_deleted']

    fieldsets = (
        ('Personal Details', {
            'fields': ('unique_id','full_name', 'estimated_age', 'gender', 'case_status','date_found','marital_status', 'estimated_time_of_death', 'height', 'weight', 'complexion', 'birth_mark', 'other_distinctive_mark')
        }),
        ('Appearance', {
            'fields': ('hair_color', 'hair_type', 'eye_color', 'blood_group', 'body_photo_upload', 'condition','clothing_description')
        }),
        ('Last Seen Information', {
            'fields': ('body_seen_details', 'address', 'contact')
        }),
        ('Legal and Police Information', {
            'fields': ('Volunteers','fir_number', 'fir_photo', 'police_station_name_and_address', 'investigating_officer_name', 'investigating_officer_contact_number')
        }),
        ('Medical and Identification Details', {
            'fields': ('hospital', 'fingerprints_collected', 'dna_sample_collected', 'post_mortem_report_upload')
        }),
        ('Administrative Information', {
            'fields': ('is_deleted',)
        }),
    )

class VolunteerAdmin(LeafletGeoAdmin):
    list_display = [
        'full_name', 'dob', 'Age','gender', 'is_active',  'volunteer_group', 'assigned_region',
        'search_start_date', 'search_end_date', 'search_timing', 'gps_tracker_enabled', 'mode_of_search',
        'other_equipment_issued', 'blood_group', 'known_allergies', 'pre_existing_medical_conditions',
        'emergency_contact_name', 'emergency_contact_number', 'relationship_with_volunteer', 'feedback_after_search',
        'issues_faced_during_search', 'additional_suggestions', 'address', 'contact','is_deleted'
    ]
    
    search_fields = ['full_name', 'assigned_region', 'emergency_contact_name']
    list_filter = ['gender', 'volunteer_group', 'mode_of_search', 'blood_group', 'is_active', 'is_deleted']

    fieldsets = (
        ('Personal Details', {
            'fields': ('full_name', 'Age','photo_upload','dob', 'gender', 'is_active')
        }),
        ('Contact Information', {
            'fields': ('address', 'contact')
        }),
        ('Assignment Information', {
            'fields': ('volunteer_group', 'assigned_region', 'search_start_date', 'search_end_date', 'search_timing', 'gps_tracker_enabled', 'mode_of_search', 'other_equipment_issued')
        }),
        ('Health and Emergency Details', {
            'fields': ('blood_group', 'known_allergies', 'pre_existing_medical_conditions', 'emergency_contact_name', 'emergency_contact_number', 'relationship_with_volunteer')
        }),
        ('Feedback and Suggestions', {
            'fields': ('feedback_after_search', 'issues_faced_during_search', 'additional_suggestions')
        }),
        ('Administrative Information', {
            'fields': ('is_deleted',)
        }),
    )
  
class ContactAdmin(LeafletGeoAdmin):
    list_display = ('phone_number', 'email', 'type', 'subtype', 'is_primary')
    list_filter = ('type', 'subtype', 'is_primary',  'company_name', 'job_title')
    search_fields = ('phone_number', 'email', 'type', 'subtype', 'company_name', 'job_title')
    fieldsets = (
        (None, {
            'fields': ('phone_number', 'email', 'type', 'subtype', 'subtype_detail')
        }),
        ('Professional Details', {
            'fields': ('company_name', 'job_title', 'website', 'social_media_handles')
        }),
        ('Additional Information', {
            'fields': ('is_primary', 'notes')
        }),
       
    )
    

class AddressAdmin(LeafletGeoAdmin):
    list_display = ('street', 'village','city','district', 'state', 'postal_code', 'country', 'type', 'subtype', 'is_active')
    list_filter = ('type', 'subtype', 'is_active', 'country', 'state', 'city')
    search_fields = ('street', 'city', 'state', 'postal_code', 'country')
    fieldsets = (
        (None, {
            'fields': ('street', 'apartment_number', 'village', 'city','district', 'state', 'postal_code', 'country', 'landmark_details', 'location')
        }),
        ('Address Type', {
            'fields': ('type', 'subtype')
        }),
        ('Status Information', {
            'fields': ('is_active', 'country_code')
        }),
        
    )
  
    
# Register the models with the Django admin
admin.site.register(MissingPerson, MissingPersonAdmin)
admin.site.register(UnidentifiedMissingPerson,UnidentifiedMissingPersonAdmin)
admin.site.register(UnidentifiedBody, UnidentifiedBodyAdmin)
admin.site.register(Volunteer,VolunteerAdmin)
admin.site.register(Contact,ContactAdmin) 
admin.site.register(Address,AddressAdmin)  



# for maching data
class MatchAdmin(admin.ModelAdmin):
    list_display = ("match_id",'get_missing_person', 'get_undefined_missing_person', 'get_unidentified_body', 'match_percentage')
    list_filter = ('match_percentage',)
    search_fields = ('missing_person__full_name', 'undefined_missing_person__full_name', 'unidentified_body__full_name')

    # Custom display methods
    def get_missing_person(self, obj):
        return obj.missing_person.full_name if obj.missing_person else "No Match"
    get_missing_person.short_description = 'Missing Person'

    def get_undefined_missing_person(self, obj):
        return obj.undefined_missing_person.full_name if obj.undefined_missing_person else "No Match"
    get_undefined_missing_person.short_description = 'Undefined Missing Person'

    def get_unidentified_body(self, obj):
        return obj.unidentified_body.full_name if obj.unidentified_body else "No Match"
    get_unidentified_body.short_description = 'Unidentified Body'

class BodyMatchAdmin(admin.ModelAdmin):
    list_display = ("match_id",'get_missing_person', 'get_undefined_missing_person', 'get_unidentified_body', 'match_percentage')
    list_filter = ('match_percentage',)
    search_fields = ('missing_person__full_name', 'undefined_missing_person__full_name', 'unidentified_body__full_name')

    # Custom display methods
    def get_missing_person(self, obj):
        return obj.missing_person.full_name if obj.missing_person else "No Match"
    get_missing_person.short_description = 'Missing Person'

    def get_undefined_missing_person(self, obj):
        return obj.undefined_missing_person.full_name if obj.undefined_missing_person else "No Match"
    get_undefined_missing_person.short_description = 'Undefined Missing Person'

    def get_unidentified_body(self, obj):
        return obj.unidentified_body.full_name if obj.unidentified_body else "No Match"
    get_unidentified_body.short_description = 'Unidentified Body'


admin.site.register(Match, MatchAdmin)
admin.site.register(BodyMatch, BodyMatchAdmin)

# for resolved case
class ResolvedCaseAdmin(admin.ModelAdmin):
    list_display = ('report_number','missing_person', 'unidentified_missing_person', 'unidentified_body', )
    readonly_fields = ('report_number',)
admin.site.register(ResolvedCase, ResolvedCaseAdmin)

# for the report
class CaseReportAdmin(admin.ModelAdmin):
    readonly_fields = (
        'report_number', 'missing_person_name', 'status', 'date_reported', 
        'reported_by', 'age', 'gender', 'last_known_location', 'fir_number', 'police_station', 
        'police_officer_assigned', 'case_duration', 'resolution_summary', 'matching_fields', 
        'closure_process', 'created_at'
    )
    list_filter = ('status', 'police_station', 'created_at', 'gender')
    search_fields = ('report_number', 'missing_person_name', 'fir_number')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

admin.site.register(CaseReport, CaseReportAdmin)


# Register the Zone model
@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('name',) 
    search_fields = ('name',)

@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ('name', 'zone')  
    search_fields = ('name',)
    list_filter = ('zone',) 

@admin.register(PoliceStation)
class PoliceStationAdmin(LeafletGeoAdmin):
    list_display = ('name', 'division') 
    search_fields = ('name',)
    list_filter = ('division',)  

@admin.register(Chowki)
class ChowkiAdmin(LeafletGeoAdmin):
    list_display = ('name','police_station')  
    search_fields = ('name',)
    list_filter = ('police_station',)  



# HospitalZone Model
class HospitalZoneAdmin(admin.ModelAdmin):
    list_display = ('name',)  
    search_fields = ('name',)  
    list_filter = ('name',)  
    
admin.site.register(HospitalZone, HospitalZoneAdmin)

class HospitalDivisionAdmin(admin.ModelAdmin):
    list_display = ('name', 'zone')  
    search_fields = ('name', 'zone__name')  
    list_filter = ('zone',) 
    
admin.site.register(HospitalDivision, HospitalDivisionAdmin)

class HospitalAdmin(admin.ModelAdmin):
    list_display = ('name', 'entity_type', 'division')  
    search_fields = ('name', 'entity_type', 'division__name')  
    list_filter = ('entity_type', 'division')  
    
admin.site.register(Hospital, HospitalAdmin)



# for the rejected persons
class MatchRejectionAdmin(admin.ModelAdmin):
    list_display = ('missing_person', 'unidentified_body', 'undefined_missing_person',"matched_percentage", 'rejection_reason', 'rejected_at')
    search_fields = ('missing_person__full_name', 'rejection_reason')
    date_hierarchy = 'rejected_at'
    ordering = ('-rejected_at',)
    readonly_fields = ('rejected_at',)  

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset
admin.site.register(MatchRejection, MatchRejectionAdmin)


# for the perviously_matched data
class PreviouslyMatchedAdmin(admin.ModelAdmin):
    list_display = (
        'missing_person', 'undefined_missing_person', 'unidentified_body', 'match_percentage', 
        'match_id', 'matched_gender', 'matched_at'
    )
    search_fields = ('missing_person__full_name', 'match_id')
    list_filter = ('matched_at',)
    list_per_page = 20  
    readonly_fields = ('match_id', 'matched_at')  

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'missing_person', 
            'undefined_missing_person', 
            'unidentified_body'
        )  
admin.site.register(PreviouslyMatched, PreviouslyMatchedAdmin)