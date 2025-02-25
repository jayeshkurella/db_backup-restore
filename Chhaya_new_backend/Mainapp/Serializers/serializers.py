
from rest_framework import serializers
from ..models import Person , Address, Contact ,FIR,AdditionalInfo ,AdminUser ,User ,Consent ,Document ,Hospital ,LastKnownDetails ,Match ,PersonUser ,PoliceStation




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
    class Meta:
        model = LastKnownDetails
        fields = '__all__'



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



class PoliceStationSerializer(serializers.ModelSerializer):
    address = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all(),write_only=True)
    address_details = AddressSerializer(source='address', read_only=True)
    police_contact = ContactSerializer(many=True, read_only=True)

    class Meta:
        model = PoliceStation
        fields = '__all__'

class PersonSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    contacts = ContactSerializer(many=True, read_only=True)
    additional_info = AdditionalInfoSerializer(many=True, read_only=True)
    last_known_details = LastKnownDetailsSerializer(many=True, read_only=True)
    firs = FIRSerializer(many=True, read_only=True)
    consent = ConsentSerializer(many=True, read_only=True)
    hospital = HospitalSerializer(read_only=True)
    
    class Meta:
        model = Person
        fields = '__all__'
        
    
