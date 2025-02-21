# views.py
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from ..Serializers.serializers import AddressSerializer, PoliceStationSerializer
from ..models import PoliceStation
from ..pagination import CustomPagination



class PoliceStationViewSet(viewsets.ModelViewSet):
    """
    API Endpoints for Police Station Management
    """
    serializer_class = PoliceStationSerializer  # Add this line
    pagination_class = PageNumberPagination
    queryset = PoliceStation.objects.all() 
    

    # 🔹 1. LIST Police Stations with Pagination
    @swagger_auto_schema(
        operation_description="Retrieve a paginated list of all police stations",
        responses={200: PoliceStationSerializer(many=True)}
    )
    def list(self, request):
        try:
            queryset = PoliceStation.objects.all().select_related('address').order_by('created_at') 
            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request)
            serializer = PoliceStationSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 2. RETRIEVE Police Station by ID
    @swagger_auto_schema(
        operation_description="Retrieve a specific police station",
        responses={200: PoliceStationSerializer(), 404: "Police station not found"}
    )
    def retrieve(self, request, pk=None):
        try:
            police_station = get_object_or_404(PoliceStation, pk=pk)
            serializer = self.get_serializer(police_station)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PoliceStation.DoesNotExist:
            return Response({'error': 'Police station not found'}, status=status.HTTP_404_NOT_FOUND)

    # 🔹 3. CREATE a new Police Station
   
    @swagger_auto_schema(
        operation_description="Create a new police station with an address",
        request_body=PoliceStationSerializer,
        responses={201: PoliceStationSerializer("Police station created successfully"), 400: "Bad Request"}
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

                # Validate and create Police Station
                police_station_data = request.data.copy()
                police_station_data["address"] = address.id  # Ensure address is a UUID

                police_station_serializer = self.get_serializer(data=police_station_data)
                if not police_station_serializer.is_valid():
                    return Response(police_station_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                police_station = police_station_serializer.save()

                # Return full response with address details
                return Response(self.get_serializer(police_station).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    # 🔹 4. UPDATE Police Station
    @swagger_auto_schema(
    operation_description="Update an existing police station",
    request_body=PoliceStationSerializer,
    responses={200: openapi.Response("Police station updated successfully")}
    )
    def update(self, request, pk=None):
        try:
            with transaction.atomic():
                police_station = get_object_or_404(PoliceStation, pk=pk)

                # Extract and update address if provided
                address_data = request.data.pop("address", None)
                if address_data:
                    address_serializer = AddressSerializer(police_station.address, data=address_data, partial=True)
                    if address_serializer.is_valid():
                        address_serializer.save()
                    else:
                        return Response(address_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                # Update police station
                serializer = self.get_serializer(police_station, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 5. DELETE Police Station
    @swagger_auto_schema(
        operation_description="Delete a police station",
        responses={204: openapi.Response("Police station deleted successfully")}
    )
    def destroy(self, request, pk=None):
        police_station = get_object_or_404(PoliceStation, pk=pk)
        station_name = police_station.name
        police_station.delete()
        return Response(
            {"message": f"Police station '{station_name}' is deleted successfully"},
            status=status.HTTP_200_OK  # Change to 200 OK
        )