from rest_framework import serializers

from Mainapp.Additional_info_Tags.caste import Caste


class CasteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caste
        fields = ['id', 'name']

    def validate_name(self, value):
        # Capitalize first letter but keep rest as is
        name = value[0].upper() + value[1:] if value else value

        # Check for case-insensitive uniqueness
        if Caste.objects.filter(name__iexact=name).exists():
            raise serializers.ValidationError("This caste name already exists.")

        return name