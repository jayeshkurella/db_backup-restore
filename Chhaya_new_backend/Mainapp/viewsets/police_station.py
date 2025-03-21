# views.py
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from ..Serializers.serializers import AddressSerializer, PoliceStationSerializer, ContactSerializer
from ..models import PoliceStation, Contact
from ..pagination import CustomPagination
from django.core.cache import cache




class PoliceStationViewSet(viewsets.ModelViewSet):
    """
    API Endpoints for Police Station Management
    """
    serializer_class = PoliceStationSerializer
    pagination_class = PageNumberPagination
    queryset = PoliceStation.objects.all()

    # 🔹 1. LIST Police Stations with Pagination
    def list(self, request):
        try:
            queryset = PoliceStation.objects.select_related('address').prefetch_related('police_contact')
            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request)
            serializer = PoliceStationSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 2. RETRIEVE Police Station by ID
    def retrieve(self, request, pk=None):
        try:
            police_station = cache.get(f'police_station_{pk}')

            if not police_station:
                police_station = PoliceStation.objects.select_related('address').prefetch_related('police_contact').get(pk=pk)
                cache.set(f'police_station_{pk}', police_station, timeout=300)

            serializer = self.get_serializer(police_station)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PoliceStation.DoesNotExist:
            return Response({'error': 'Police station not found'}, status=status.HTTP_404_NOT_FOUND)

    # 🔹 3. CREATE a new Police Station
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

                # Prepare police station data
                police_station_data = request.data.copy()
                police_station_data["address"] = address.id
                contacts_data = police_station_data.pop("police_contact", [])

                # Create police station
                police_station_serializer = self.get_serializer(data=police_station_data)
                if not police_station_serializer.is_valid():
                    return Response(police_station_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                police_station = police_station_serializer.save()

                # Create contacts
                contacts = [Contact(police_station=police_station, **contact) for contact in contacts_data]
                Contact.objects.bulk_create(contacts)

                # Return response with contacts
                response_data = self.get_serializer(police_station).data
                response_data['police_contact'] = ContactSerializer(police_station.police_contact.all(), many=True).data

                return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 4. FULL UPDATE (PUT)
    def update(self, request, pk=None):
        return self._update_police_station(request, pk, partial=False)

    # 🔹 5. PARTIAL UPDATE (PATCH)
    def partial_update(self, request, pk=None):
        return self._update_police_station(request, pk, partial=True)

    # 🔹 Common function for PUT & PATCH
    def _update_police_station(self, request, pk, partial):
        try:
            with transaction.atomic():
                police_station = get_object_or_404(PoliceStation, pk=pk)

                # Extract and update address if provided
                address_data = request.data.pop("address", None)
                if address_data:
                    address_serializer = AddressSerializer(police_station.address, data=address_data, partial=partial)
                    if address_serializer.is_valid():
                        address_serializer.save()
                    else:
                        return Response(address_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                # Extract contacts
                contacts_data = request.data.pop("contacts", [])

                # Update police station data
                serializer = self.get_serializer(police_station, data=request.data, partial=partial)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                # Update contacts
                existing_contacts = {contact.id: contact for contact in police_station.police_contact.all()}
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
                        new_contacts.append(Contact(police_station=police_station, **contact_data))

                if new_contacts:
                    Contact.objects.bulk_create(new_contacts)

                # Return response with updated contacts
                response_data = serializer.data
                response_data['police_contact'] = ContactSerializer(police_station.police_contact.all(), many=True).data

                return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 6. DELETE Police Station
    def destroy(self, request, pk=None):
        try:
            police_station = get_object_or_404(PoliceStation, pk=pk)
            station_name = police_station.name
            police_station.delete()
            return Response({"message": f"Police station '{station_name}' is deleted successfully"}, status=status.HTTP_200_OK)
        except PoliceStation.DoesNotExist:
            return Response({"error": "Police station not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        