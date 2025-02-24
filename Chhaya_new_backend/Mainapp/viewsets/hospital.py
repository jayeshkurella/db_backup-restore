# views.py
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from ..Serializers.serializers import AddressSerializer, PoliceStationSerializer ,HospitalSerializer
from ..models import PoliceStation ,Hospital
from ..pagination import CustomPagination
from django.core.cache import cache



class HospitalViewSet(viewsets.ModelViewSet):
    """
    API Endpoints for Hospital Management
    """
    serializer_class = HospitalSerializer  # Add this line
    pagination_class = PageNumberPagination
    queryset = Hospital.objects.all() 
    

    # 🔹 1. LIST Police Stations with Pagination
    @swagger_auto_schema(
        operation_description="Retrieve a paginated list of all Hospitals",
        responses={200: HospitalSerializer(many=True)}
    )
    def list(self, request):
        try:
            queryset = Hospital.objects.select_related('address')\
                .prefetch_related('hospital_contact').all() # Fetch only necessary fields

            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request)
            serializer = HospitalSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 2. RETRIEVE Police Station by ID
    @swagger_auto_schema(
        operation_description="Retrieve a specific Hospital",
        responses={200: HospitalSerializer(), 404: "Hospital not found"}
    )
    def retrieve(self, request, pk=None):
        try:
            # Check if police station data is already cached
            hospitals = cache.get(f'Hospital_{pk}')
            
            if not hospitals:
                # Fetch from DB only if not in cache
                hospitals = Hospital.objects.select_related('address').prefetch_related('hospital_contact').get(pk=pk)
                
                # Store in cache for 5 minutes
                cache.set(f'Hospital_{pk}', hospitals, timeout=300)

            serializer = self.get_serializer(hospitals)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital not found'}, status=status.HTTP_404_NOT_FOUND)

    # 🔹 3. CREATE a new Police Station
   
    @swagger_auto_schema(
        operation_description="Create a new hospital with an address and multiple contacts.",
        request_body=HospitalSerializer,
        responses={201: HospitalSerializer("Hospital created successfully"), 400: "Bad Request"}
    )
    def create(self, request):
        try:
            with transaction.atomic():
                # Extract address data
                address_data = request.data.get("address")
                if not address_data:
                    return Response({"error": "Address is required"}, status=status.HTTP_400_BAD_REQUEST)

                # Validate and create Address
                address_serializer = AddressSerializer(data=address_data)
                if not address_serializer.is_valid():
                    return Response({"address": address_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

                address = address_serializer.save()

                # Prepare Police Station data
                hospital_data = request.data.copy()
                hospital_data["address"] = address.id  # Store as Integer ID

                # Extract contacts data
                contacts_data = hospital_data.pop("contacts", [])

                # Validate and create Police Station
                hospital_serializer = self.get_serializer(data=hospital_data)
                if not hospital_serializer.is_valid():
                    return Response(hospital_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                hospitals = hospital_serializer.save()

                # **Optimized Contact Insertion (Bulk Insert)**
                contacts = [Contact(hospitals=hospitals, **contact_data) for contact_data in contacts_data]
                Contact.objects.bulk_create(contacts)  # Bulk insert in one DB hit

                return Response(self.get_serializer(hospitals).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 4. UPDATE Police Station
    @swagger_auto_schema(
    operation_description="Update an existing Hospital",
    request_body=HospitalSerializer,
    responses={200: openapi.Response("Hospital updated successfully")}
    )
    def update(self, request, pk=None):
        try:
            with transaction.atomic():
                hospitals = get_object_or_404(Hospital, pk=pk)

                # Extract and update address if provided
                address_data = request.data.pop("address", None)
                if address_data:
                    address_serializer = AddressSerializer(hospitals.address, data=address_data, partial=True)
                    if address_serializer.is_valid():
                        address_serializer.save()
                    else:
                        return Response(address_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                # Update hospitals information
                serializer = self.get_serializer(hospitals, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 5. DELETE Police Station
    @swagger_auto_schema(
        operation_description="Delete Hospital by ID",
        responses={204: openapi.Response("hospital deleted successfully")}
    )
    def destroy(self, request, pk=None):
        try:
            # Attempt to fetch the police station
            hospital_data = Hospital.objects.get(pk=pk)
            hospital_name = Hospital.name
            hospital_data.delete()
            return Response({"message": f"Hospital '{hospital_name}' is deleted successfully"},status=status.HTTP_200_OK)
        except Hospital.DoesNotExist:
            return Response({"error": "Hospital not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST )

        
        
        