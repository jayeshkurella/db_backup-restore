# views.py
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from ..Serializers.serializers import AddressSerializer, PoliceStationSerializer, HospitalSerializer, ContactSerializer
from ..models import PoliceStation, Hospital, Contact
from ..pagination import CustomPagination
from django.core.cache import cache
from rest_framework import generics


class HospitalViewSet(viewsets.ModelViewSet):
    """
    API Endpoints for Hospital Management
    """
    serializer_class = HospitalSerializer
    pagination_class = CustomPagination
    queryset = Hospital.objects.all()

    # 🔹 1. LIST Hospitals with Pagination
    def list(self, request):
        try:
            queryset = Hospital.objects.select_related('address').prefetch_related('hospital_contact')
            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request)
            serializer = HospitalSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 2. RETRIEVE Hospital by ID
    def retrieve(self, request, pk=None):
        try:
            hospital = cache.get(f'hospital_{pk}')
            if not hospital:
                hospital = Hospital.objects.select_related('address').prefetch_related('hospital_contact').get(pk=pk)
                cache.set(f'hospital_{pk}', hospital, timeout=300)

            serializer = self.get_serializer(hospital)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital not found'}, status=status.HTTP_404_NOT_FOUND)

    # 🔹 3. CREATE a new Hospital
    def create(self, request):
        try:
            with transaction.atomic():
                # Extract address data
                address_data = request.data.get("address")
                if not address_data:
                    return Response({"error": "Address is required"}, status=status.HTTP_400_BAD_REQUEST)

                # Validate and create address
                address_serializer = AddressSerializer(data=address_data)
                if not address_serializer.is_valid():
                    return Response({"address": address_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

                address = address_serializer.save()

                # Prepare hospital data
                hospital_data = request.data.copy()
                hospital_data["address"] = address.id
                contacts_data = hospital_data.pop("hospital_contact", [])

                # Create hospital
                hospital_serializer = self.get_serializer(data=hospital_data)
                if not hospital_serializer.is_valid():
                    return Response(hospital_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                hospital = hospital_serializer.save()

                # Create contacts
                contacts = [Contact(hospital=hospital, **contact) for contact in contacts_data]
                Contact.objects.bulk_create(contacts)

                # Return response with contacts
                response_data = self.get_serializer(hospital).data
                response_data['hospital_contact'] = ContactSerializer(hospital.hospital_contact.all(), many=True).data

                return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 4. FULL UPDATE (PUT)
    def update(self, request, pk=None):
        return self._update_hospital(request, pk, partial=False)

    # 🔹 5. PARTIAL UPDATE (PATCH)
    def partial_update(self, request, pk=None):
        return self._update_hospital(request, pk, partial=True)

    # 🔹 Common function for PUT & PATCH
    def _update_hospital(self, request, pk, partial):
        try:
            with transaction.atomic():
                hospital = get_object_or_404(Hospital, pk=pk)

                # Extract and update address if provided
                address_data = request.data.pop("address", None)
                if address_data:
                    address_serializer = AddressSerializer(hospital.address, data=address_data, partial=partial)
                    if address_serializer.is_valid():
                        address_serializer.save()
                    else:
                        return Response(address_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                # Extract contacts
                contacts_data = request.data.pop("hospital_contact", [])

                # Update hospital data
                serializer = self.get_serializer(hospital, data=request.data, partial=partial)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                # Update contacts
                existing_contacts = {contact.id: contact for contact in hospital.hospital_contact.all()}
                new_contacts = []

                for contact_data in contacts_data:
                    contact_id = contact_data.get("id")
                    if contact_id and contact_id in existing_contacts:
                        # Update existing contact
                        contact = existing_contacts[contact_id]
                        for key, value in contact_data.items():
                            setattr(contact, key, value)
                        contact.save()
                    else:
                        # Create new contact
                        new_contacts.append(Contact(hospital=hospital, **contact_data))

                if new_contacts:
                    Contact.objects.bulk_create(new_contacts)

                # Return response with updated contacts
                response_data = serializer.data
                response_data['hospital_contact'] = ContactSerializer(hospital.hospital_contact.all(), many=True).data

                return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 6. DELETE Hospital
    def destroy(self, request, pk=None):
        try:
            hospital = get_object_or_404(Hospital, pk=pk)
            hospital_name = hospital.name
            hospital.delete()
            return Response({"message": f"Hospital '{hospital_name}' is deleted successfully"}, status=status.HTTP_200_OK)
        except Hospital.DoesNotExist:
            return Response({"error": "Hospital not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class HospitalListView(generics.ListAPIView):
    queryset = Hospital.objects.all().order_by("id")
    serializer_class = HospitalSerializer