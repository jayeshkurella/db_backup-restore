# views.py
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction

from ..Serializers.hospital_Serializer import HospitalIdNameSerializer
from ..Serializers.serializers import AddressSerializer, HospitalSerializer, ContactSerializer
from ..models import Hospital, Contact
from Mainapp.all_paginations.pagination import CustomPagination
from django.core.cache import cache
from rest_framework import generics
import json
from django.contrib.gis.geos import Point
from rest_framework.permissions import AllowAny, IsAuthenticated  # ✅ Imports

class HospitalViewSet(viewsets.ModelViewSet):
    """
    API Endpoints for Hospital Management
    """
    serializer_class = HospitalSerializer
    pagination_class = CustomPagination
    queryset = Hospital.objects.all()

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]  # Public access for safe methods
        return [IsAuthenticated()]

    # 🔹 1. LIST Hospitals with Pagination

    def list(self, request):
        try:
            name = request.query_params.get('name', '').strip()
            city = request.query_params.get('city', '').strip()
            district = request.query_params.get('district', '').strip()
            state = request.query_params.get('state', '').strip()
            hospital_type = request.query_params.get('type', '').strip()
            status_filter = request.query_params.get('status', '').strip()

            filters = Q()
            if name:
                filters &= Q(name__icontains=name)
            if city:
                filters &= Q(address__city__icontains=city)
            if district:
                filters &= Q(address__district__icontains=district)
            if state:
                filters &= Q(address__state__icontains=state)
            if hospital_type:
                filters &= Q(type__iexact=hospital_type)
            if status_filter:
                filters &= Q(activ_Status__iexact=status_filter)

            queryset = Hospital.objects.select_related('address').prefetch_related('hospital_contact').filter(filters)

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
    def create(self, request, *args, **kwargs):
        try:
            print("\n🔹 Received API Request Data:", request.data)

            with transaction.atomic():
                if not request.data.get("name"):
                    return Response({"error": "Hospital name is required and cannot be blank."},
                                    status=status.HTTP_400_BAD_REQUEST)

                hospital_photo = request.FILES.get("hospital_photo")
                if not hospital_photo:
                    return Response(
                        {"error": "Invalid hospital photo. Ensure you're sending a valid file."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                address_data = request.data.get("address")
                if not address_data:
                    return Response({"error": "Address is required"}, status=status.HTTP_400_BAD_REQUEST)

                if isinstance(address_data, str):
                    address_data = json.loads(address_data)

                location_data = address_data.get("location")
                if isinstance(location_data, dict):
                    latitude = location_data.get("latitude")
                    longitude = location_data.get("longitude")
                    if latitude and longitude:
                        try:
                            address_data["location"] = Point(float(longitude), float(latitude))
                        except (ValueError, TypeError):
                            return Response(
                                {"error": "Invalid location format. Latitude and Longitude must be valid numbers."},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    else:
                        return Response(
                            {"error": "Latitude and Longitude cannot be empty."},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                address_serializer = AddressSerializer(data=address_data)
                if not address_serializer.is_valid():
                    return Response({"address": address_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

                address = address_serializer.save()

                hospital_data = request.data.copy()
                hospital_data["address"] = address.id
                hospital_data["hospital_photo"] = hospital_photo
                hospital_data["created_by"] = request.user.id  # ✅ NEW
                # hospital_data["updated_by"] = request.user.id  # ✅ NEW

                contacts_data = request.data.get("hospital_contact", "[]")
                if isinstance(contacts_data, str):
                    contacts_data = json.loads(contacts_data)

                hospital_serializer = self.get_serializer(data=hospital_data)
                if not hospital_serializer.is_valid():
                    return Response(hospital_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                hospital = hospital_serializer.save()

                contact_objects = []
                for contact in contacts_data:
                    contact["hospital"] = hospital
                    contact["person"] = None
                    contact_objects.append(Contact(**contact))

                Contact.objects.bulk_create(contact_objects)

                response_data = self.get_serializer(hospital).data
                response_data['hospital_contact'] = ContactSerializer(hospital.hospital_contact.all(), many=True).data

                print("\n🚀 Final Response Data:", response_data)
                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("\n❌ API Error:", str(e))
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
    serializer_class = HospitalIdNameSerializer