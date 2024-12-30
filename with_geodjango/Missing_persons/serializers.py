
from rest_framework import serializers
from .models import Address, CaseReport, Chowki, Contact, Division, Hospital, HospitalDivision, HospitalZone, MatchRejection, MissingPerson, PoliceStation, UnidentifiedBody, UnidentifiedMissingPerson, Volunteer,Match, Zone
from django.contrib.gis.geos import Point, Polygon
# from rest_framework_gis.fields import GeoField
  
     
class ChowkiSerializer(serializers.ModelSerializer):
    police_station_name = serializers.CharField(source='police_station.name', read_only=True)  # Police Station Name
    division_name = serializers.CharField(source='police_station.division.name', read_only=True)  # Division Name
    zone_name = serializers.CharField(source='police_station.division.zone.name', read_only=True)  # Zone Name


    class Meta:
        model = Chowki
        fields = '__all__'

class PoliceStationNestedSerializer(serializers.ModelSerializer):
    division = serializers.PrimaryKeyRelatedField(read_only=True)
    zone_name = serializers.CharField(source='division.zone.name', read_only=True)  # Get zone name from division
    division_name = serializers.CharField(source='division.name', read_only=True)
    chowkis = ChowkiSerializer(many=True, read_only=True) 
    
  
    class Meta:
        model = PoliceStation
        fields = '__all__'

class DivisionNestedSerializer(serializers.ModelSerializer):
    zone = serializers.PrimaryKeyRelatedField(read_only=True, source='zone.id')
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    stations = PoliceStationNestedSerializer(many=True, read_only=True, source='police_stations')

    class Meta:
        model = Division
        fields = ['zone', 'id', 'name', 'stations']

class ZoneSerializer(serializers.ModelSerializer):
    divisions = DivisionNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Zone
        fields = ['id', 'name', 'divisions']
       

# for the hospital entity
class HospitalZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalZone
        fields = ['id', 'name']  

class HospitalDivisionSerializer(serializers.ModelSerializer):
    zone = HospitalZoneSerializer(read_only=True)

    class Meta:
        model = HospitalDivision
        fields = ['id', 'name', 'zone'] 

class HospitalSerializer(serializers.ModelSerializer):
    division = HospitalDivisionSerializer(read_only=True)
    hospital_division_name = serializers.CharField(source='division.name', read_only=True)
    hospital_zone_name = serializers.CharField(source='division.zone.name', read_only=True)

    class Meta:
        model = Hospital
        fields = '__all__'


# for the all persons serializers 
class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
 
class VolunteerSerializer(serializers.ModelSerializer):
    # Nested serializers for contacts and addresses
    contact = ContactSerializer()
    address = AddressSerializer()

    class Meta:
        model = Volunteer
        fields = '__all__'

    def create(self, validated_data):
        # Extract nested data
        contact_data = validated_data.pop('contact')
        address_data = validated_data.pop('address')

        # Create the contact and address first
        contact = Contact.objects.create(**contact_data)
        address = Address.objects.create(**address_data)

        # Create the volunteer with the contact and address
        volunteer = Volunteer.objects.create(contact=contact, address=address, **validated_data)
        return volunteer

    def update(self, instance, validated_data):
        # Extract nested data
        contact_data = validated_data.pop('contact')
        address_data = validated_data.pop('address')

        # Update or create contact
        contact, created = Contact.objects.update_or_create(
            id=instance.contact.id, defaults=contact_data
        )

        # Update or create address
        address, created = Address.objects.update_or_create(
            id=instance.address.id, defaults=address_data
        )

        # Update volunteer fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
      
        
class MissingPersonSerializer(serializers.ModelSerializer):
    contact = ContactSerializer()
    address = AddressSerializer()
    police_station_name_and_address = PoliceStationNestedSerializer()

    class Meta:
        model = MissingPerson
        fields = '__all__'

    def create(self, validated_data):
        
        # Handle nested fields for contact and address
        contact_data = validated_data.pop('contact', None)
        address_data = validated_data.pop('address', None)
        police_station_data = validated_data.pop('police_station_name_and_address', None)

        # Create contact and address instances if present
        contact = Contact.objects.create(**contact_data) if contact_data else None
        address = Address.objects.create(**address_data) if address_data else None
        police_station = PoliceStation.objects.create(**police_station_data) if police_station_data else None

        # Create MissingPerson instance with nested data and Point field
        missing_person = MissingPerson.objects.create(
            contact=contact,
            address=address,
            police_station_name_and_address=police_station,
            **validated_data
        )
        return missing_person

    def update(self, instance, validated_data):
        contact_data = validated_data.pop('contact', None)
        address_data = validated_data.pop('address', None)
        police_station_data = validated_data.pop('police_station_name_and_address', None)

        # Update contact and address if data is provided
        if contact_data:
            for attr, value in contact_data.items():
                setattr(instance.contact, attr, value)
            instance.contact.save()

        if address_data:
            for attr, value in address_data.items():
                setattr(instance.address, attr, value)
            instance.address.save()
            
        if police_station_data:
            for attr, value in police_station_data.items():
                setattr(instance.police_station_name_and_address, attr, value)
            instance.police_station_name_and_address.save()

        # Update MissingPerson instance fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
class UndefinedMissingpersonSerializer(serializers.ModelSerializer):
    address = AddressSerializer()  
    contact = ContactSerializer() 
    police_station_name_and_address = ChowkiSerializer()
    hospital =HospitalSerializer()
    Volunteers =VolunteerSerializer()
     

    class Meta:
        model = UnidentifiedMissingPerson
        fields = '__all__' 

    def create(self, validated_data):
        address_data = validated_data.pop('address')
        contact_data = validated_data.pop('contact')
        police_station_data = validated_data.pop('police_station_name_and_address', None)
        Hospital_Data = validated_data.pop('hospital', None)
        Volunteer_Data =validated_data.pop('Volunteers')

        # Create Address instance
        address = Address.objects.create(**address_data)
        contact = Contact.objects.create(**contact_data)
        police_station = Chowki.objects.create(**police_station_data) if police_station_data else None
        Hospital_Datas = Hospital.objects.create(**Hospital_Data) if Hospital_Data else None
        Volunteerss = Volunteer.objects.create(**Volunteer_Data) if Volunteer_Data else None

        # Create unidentified missing person instance with the created Address and Contact
        personal_details = UnidentifiedMissingPerson.objects.create(
            address=address,
            contact=contact,
            police_station_name_and_address=police_station,
            hospital = Hospital_Datas,
            Volunteers = Volunteerss,
            **validated_data
        )

        return personal_details

    def update(self, instance, validated_data):
        address_data = validated_data.pop('address', None)
        contact_data = validated_data.pop('contact', None)
        police_station_data = validated_data.pop('police_station_name_and_address', None)
        Hospital_Data = validated_data.pop('hospital', None)
        Volunteers_Dataa = validated_data.pop('Volunteers', None)

        # Update Address instance if address data is provided
        if address_data:
            for attr, value in address_data.items():
                setattr(instance.address, attr, value)
            instance.address.save()

        # Update Contact instance if contact data is provided
        if contact_data:
            for attr, value in contact_data.items():
                setattr(instance.contact, attr, value)
            instance.contact.save()
            
        if police_station_data:
            for attr, value in police_station_data.items():
                setattr(instance.police_station_name_and_address, attr, value)
            instance.police_station_name_and_address.save()
        
        if Hospital_Data:
            for attr, value in Hospital_Data.items():
                setattr(instance.hospital, attr, value)
            instance.hospital.save()
            
        if Volunteers_Dataa:
            for attr, value in Volunteers_Dataa.items():
                setattr(instance.Volunteers, attr, value)
            instance.hospital.save()

        # Update other fields in PersonalDetails
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance 
    
class UnidentifiedBodySerializer(serializers.ModelSerializer):
    contact = ContactSerializer()
    address = AddressSerializer()
    police_station_name_and_address = ChowkiSerializer()
    hospital =HospitalSerializer()
    Volunteers =VolunteerSerializer()
    
    class Meta:
        model = UnidentifiedBody
        fields = '__all__'

    def create(self, validated_data):
        contact_data = validated_data.pop('contact')
        address_data = validated_data.pop('address')
        police_station_data = validated_data.pop('police_station_name_and_address', None)
        Hospital_Data = validated_data.pop('hospital', None)
        Volunteer_Data =validated_data.pop('Volunteers')

        # Create the nested Contact and Address instances
        contact = Contact.objects.create(**contact_data)
        address = Address.objects.create(**address_data)
        police_station = Chowki.objects.create(**police_station_data) if police_station_data else None
        Hospital_Datas = Hospital.objects.create(**Hospital_Data) if Hospital_Data else None
        Volunteerss = Volunteer.objects.create(**Volunteer_Data) if Volunteer_Data else None

        # Create the UnidentifiedBody instance with the newly created Contact and Address
        unidentified_body = UnidentifiedBody.objects.create(
            contact=contact,
            address=address,
            police_station_name_and_address=police_station,
            hospital = Hospital_Datas,
            Volunteers = Volunteerss,
            **validated_data
        )

        return unidentified_body

    def update(self, instance, validated_data):
        contact_data = validated_data.pop('contact', None)
        address_data = validated_data.pop('address', None)
        police_station_data = validated_data.pop('police_station_name_and_address', None)
        Hospital_Data = validated_data.pop('hospital', None)
        Volunteers_Dataa = validated_data.pop('Volunteers', None)

        # Update the nested Contact instance
        if contact_data:
            for attr, value in contact_data.items():
                setattr(instance.contact, attr, value)
            instance.contact.save()

        # Update the nested Address instance
        if address_data:
            for attr, value in address_data.items():
                setattr(instance.address, attr, value)
            instance.address.save()
            
        if police_station_data:
            for attr, value in police_station_data.items():
                setattr(instance.police_station_name_and_address, attr, value)
            instance.police_station_name_and_address.save()
        
        if Hospital_Data:
            for attr, value in Hospital_Data.items():
                setattr(instance.hospital, attr, value)
            instance.hospital.save()
            
        if Volunteers_Dataa:
            for attr, value in Volunteers_Dataa.items():
                setattr(instance.Volunteers, attr, value)
            instance.hospital.save()

        # Update the UnidentifiedBody instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        

        
        return instance
    
class VolunteerSerializer(serializers.ModelSerializer):
    # Nested serializers for contacts and addresses
    contact = ContactSerializer()
    address = AddressSerializer()

    class Meta:
        model = Volunteer
        fields = '__all__'

    def create(self, validated_data):
        # Extract nested data
        contact_data = validated_data.pop('contact')
        address_data = validated_data.pop('address')

        # Create the contact and address first
        contact = Contact.objects.create(**contact_data)
        address = Address.objects.create(**address_data)

        # Create the volunteer with the contact and address
        volunteer = Volunteer.objects.create(contact=contact, address=address, **validated_data)
        return volunteer

    def update(self, instance, validated_data):
        # Extract nested data
        contact_data = validated_data.pop('contact')
        address_data = validated_data.pop('address')

        # Update or create contact
        contact, created = Contact.objects.update_or_create(
            id=instance.contact.id, defaults=contact_data
        )

        # Update or create address
        address, created = Address.objects.update_or_create(
            id=instance.address.id, defaults=address_data
        )

        # Update volunteer fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
      
    

class MatchSerializer(serializers.ModelSerializer):
    unique_id = serializers.CharField(source='missing_person.unique_id')

    missing_person = MissingPersonSerializer()
    undefined_missing_person = UndefinedMissingpersonSerializer(required=False)
    unidentified_body = UnidentifiedBodySerializer(required=False)
    
    class Meta:
        model = Match
        fields = ['missing_person', 'undefined_missing_person', 'unidentified_body', 'match_percentage', 'match_type','unique_id']
   
    

 

# serializer for case report
class CaseReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseReport
        fields = '__all__'
        
# match rejection
class MatchRejectionSerializer(serializers.ModelSerializer):
    unique_id = serializers.CharField(source='missing_person.unique_id')

    missing_person = MissingPersonSerializer()
    rejection_percentage = serializers.FloatField()
    rejection_reason = serializers.CharField()

    class Meta:
        model = MatchRejection
        fields = ['missing_person', 'unidentified_body', 'undefined_missing_person', 'rejection_percentage', 'rejection_reason','unique_id']