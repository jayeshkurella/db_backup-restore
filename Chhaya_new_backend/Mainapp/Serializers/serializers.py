from datetime import datetime, date

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from ..models import Person, Address, Contact, FIR, AdditionalInfo, AdminUser, User, Consent, Document, Hospital, \
    LastKnownDetails, Match, PersonUser, PoliceStation, Volunteer


class FlexibleDateField(serializers.DateField):
    def to_internal_value(self, data):
        if data in [None, ""]:
            return None

        if isinstance(data, datetime.datetime):
            return data.date()

        try:
            return super().to_internal_value(data)
        except ValidationError:
            # Try parsing as datetime if date fails
            try:
                if isinstance(data, str) and "T" in data:
                    return datetime.datetime.strptime(data, "%Y-%m-%dT%H:%M:%S").date()
            except (ValueError, TypeError):
                pass
            raise  # Re-raise original error
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    
class PersonUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonUser
        fields = '__all__'


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

class LastKnownDetailsSerializer(serializers.ModelSerializer):
    missing_date = FlexibleDateField(required=False, allow_null=True)

    class Meta:
        model = LastKnownDetails
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)

        missing_date = getattr(instance, 'missing_date', None)
        if isinstance(missing_date, datetime):
            data['missing_date'] = missing_date.date().isoformat()
        elif isinstance(missing_date, date):
            data['missing_date'] = missing_date.isoformat()

        return data

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'


class ConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consent
        fields = '__all__'

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = '__all__'

class AdditionalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdditionalInfo
        fields = '__all__'

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'

class FIRSerializer(serializers.ModelSerializer):
    class Meta:
        model = FIR
        fields = '__all__'
        
class HospitalSerializer(serializers.ModelSerializer):
    address = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all(),write_only=True)
    address_details = AddressSerializer(source='address', read_only=True)
    hospital_contact = ContactSerializer(many=True, read_only=True)
    class Meta:
        model = Hospital
        fields = '__all__'


class PoliceStationIdNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = PoliceStation
        fields = ['id', 'name']



class PoliceStationSerializer(serializers.ModelSerializer):
    station_photo = serializers.ImageField(required=False)  # ✅ Ensure it's an image field
    address = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all(),write_only=True)
    address_details = AddressSerializer(source='address', read_only=True)
    police_contact = ContactSerializer(many=True, read_only=True)

    class Meta:
        model = PoliceStation
        fields = '__all__'

class PersonSerializer(serializers.ModelSerializer):
    birth_date = FlexibleDateField(required=False, allow_null=True)

    addresses = AddressSerializer(many=True)
    contacts = ContactSerializer(many=True)
    additional_info = AdditionalInfoSerializer(many=True)
    last_known_details = LastKnownDetailsSerializer(many=True)
    firs = FIRSerializer(many=True)
    consent = ConsentSerializer(many=True)
    hospital = HospitalSerializer()
    
    class Meta:
        model = Person
        fields = '__all__'


    
class VolunteerSerializer(serializers.ModelSerializer):
    volunteer_Address = AddressSerializer(many=True)
    volunteer_contact = ContactSerializer(many=True)
    class Meta:
        model = Volunteer
        fields = '__all__'