
from rest_framework import serializers
from ..models import Person , Address, Contact ,FIR,AdditionalInfo ,AdminUser ,User ,Consent ,Document ,Hospital ,LastKnownDetails ,Match ,PersonUser ,PoliceStation


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class PoliceStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PoliceStation
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


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
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

class PersonSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True)
    contacts = ContactSerializer(many=True)
    class Meta:
        model = Person
        fields = '__all__'
        
    def create(self, validated_data):
        addresses_data = validated_data.pop('addresses', [])
        contacts_data = validated_data.pop('contacts', [])
        
        person = Person.objects.create(**validated_data)
        
        for address_data in addresses_data:
            Address.objects.create(person=person, **address_data)

        for contact_data in contacts_data:
            Contact.objects.create(person=person, **contact_data)
        
        return person
