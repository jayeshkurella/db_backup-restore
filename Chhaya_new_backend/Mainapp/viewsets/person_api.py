import logging
from datetime import datetime
from dateutil import parser
from rest_framework import viewsets, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated ,AllowAny
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from ..models.fir import FIR
from ..access_permision import IsAdminUser , IsVolunteerUser ,AllUserAccess
from ..pagination import CustomPagination
from ..Serializers.serializers import PersonSerializer
from ..models import Person, Address, Contact, AdditionalInfo, LastKnownDetails, Consent, Document
from django.db import transaction
from drf_yasg import openapi
from django.contrib.gis.geos import Point
import json
from django.utils.timezone import now
import traceback

logger = logging.getLogger(__name__)


class PersonViewSet(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]  # Require token authentication
    permission_classes = [IsAuthenticated,IsAdminUser]

    parser_classes = (MultiPartParser, FormParser,JSONParser)
    pagination_class = PageNumberPagination

    def get_permissions(self):
        """
        Override this method to allow unrestricted access to `retrieve`
        while enforcing restrictions on other actions.
        """
        if self.action == "retrieve":
            return [AllowAny()]  # No restriction for retrieving a single person

        return [permission() for permission in self.permission_classes]


        # 🔹 1. LIST all persons
    @swagger_auto_schema(
        operation_description="Retrieve a list of all persons",
        responses={200: PersonSerializer(many=True)}
    )
    def list(self, request):
        try:
            # Get and order the queryset
            queryset = Person.objects.filter(_is_deleted=False).prefetch_related(
                'addresses', 'contacts', 'additional_info',
                'last_known_details', 'firs', 'consent'
            ).order_by('-created_at')

            # Pagination
            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request)

            if not paginated_queryset:
                return Response({'message': 'No persons found'}, status=status.HTTP_200_OK)

            # Serialize and respond
            serializer = PersonSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            # Better error handling and logging
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 2. RETRIEVE a person by ID
    @swagger_auto_schema(
        operation_description="Retrieve a person by ID",
        responses={200: PersonSerializer(), 404: "Person not found"}
    )
    def retrieve(self, request, pk=None):
        try:
            person = Person.objects.filter(_is_deleted=False).prefetch_related(
                'addresses', 'contacts', 'additional_info', 'last_known_details', 'firs','consent').get(pk=pk)
            serializer = PersonSerializer(person)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)

    # 🔹 3. CREATE a new person
    @swagger_auto_schema(
        operation_description="Create a new person with related information",
        request_body=PersonSerializer,
        responses={201: openapi.Response("Person created successfully")}
    )
    def create(self, request):
        logger.info(f"Incoming data: {request.data}")
        print("data comes",request.data)
        logger.debug("Incoming Data Format: %s", request.content_type)
        try:
            with transaction.atomic():
                # Extract data based on content type
                if request.content_type == 'application/json':
                    data = request.data
                elif request.content_type.startswith('multipart/form-data'):
                    payload_str = request.POST.get('payload', '{}')
                    data = json.loads(payload_str)
                else:
                    return Response({'error': 'Unsupported media type'}, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

                logger.debug("Extracted JSON Data: %s", json.dumps(data, indent=4))



                # Extract related data
                addresses_data = [addr for addr in data.get('addresses', []) if any(addr.values())]
                contacts_data = [contact for contact in data.get('contacts', []) if any(contact.values())]
                additional_info_data = [info for info in data.get('additional_info', []) if any(info.values())]
                last_known_details_data = [details for details in data.get('last_known_details', []) if
                                           any(details.values())]
                firs_data = [fir for fir in data.get('firs', []) if any(fir.values())]
                consents_data = [consent for consent in data.get('consent', []) if any(consent.values())]

                logger.debug("Filtered Addresses Data: %s", json.dumps(addresses_data, indent=4))

                # Create Person object
                person_data = {k: v for k, v in data.items() if v not in [None, "", []] and k not in [
                    'addresses', 'contacts', 'additional_info', 'last_known_details', 'firs', 'consent'
                ]}
                person = Person.objects.create(**person_data)
                logger.debug("Person Created: %s", person.id)

                # Extract zero index address and store it directly in the person model
                if addresses_data:
                    first_address = addresses_data[0]
                    # Store address fields directly in the Person model
                    person.appartment_name = first_address.get('appartment_name', '')
                    person.appartment_no = first_address.get('appartment_no', '')
                    person.street = first_address.get('street', '')
                    person.village = first_address.get('village', '')
                    person.landmark_details = first_address.get('landmark_details', '')
                    person.pincode = first_address.get('pincode', '')
                    person.city = first_address.get('city', '')
                    person.district = first_address.get('district', '')
                    person.state = first_address.get('state', '')
                    person.country = first_address.get('country', '')
                    person.location = Point(first_address.get('location', {}).get('longitude'),
                                            first_address.get('location', {}).get('latitude'))
                    person.save()

                # Create related objects (for remaining addresses, contacts, etc.)
                self._create_addresses(person, addresses_data[1:])  # Skip the first address as it is already saved
                self._create_contacts(person, contacts_data)
                self._create_additional_info(person, additional_info_data)
                self._create_last_known_details(person, last_known_details_data)
                self._create_firs(person, firs_data)
                self._create_consents(person, consents_data)

                # Prepare the final response
                serializer = PersonSerializer(person)
                return Response(
                    {'message': 'Person created successfully', 'person_id': str(person.id), 'data': serializer.data},
                    status=status.HTTP_201_CREATED
                )

        except ValueError as e:
            logger.error("Validation error: %s", str(e))
            return Response({'error': f'Validation error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error("Exception Occurred: %s", str(e))
            logger.error("Traceback: %s", traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def _create_addresses(self, person, addresses_data):
        addresses = []
        for address in addresses_data:
            lat = address.get('location', {}).get('latitude')
            lon = address.get('location', {}).get('longitude')
            point = None
            if lat and lon:
                try:
                    lat = float(lat)
                    lon = float(lon)
                    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                        raise ValueError("Latitude must be between -90 and 90, and longitude between -180 and 180.")
                    point = Point(lon, lat)
                except ValueError as e:
                    raise ValueError(f"Invalid location data: {e}")

            address_obj = Address(
                person=person,
                location=point,
                **{k: v for k, v in address.items() if k not in ['location', 'person']}
            )
            addresses.append(address_obj)
        Address.objects.bulk_create(addresses)

    def _create_contacts(self, person, contacts_data):
        contacts = [
            Contact(person=person, **{k: v for k, v in contact.items() if k != 'person'})
            for contact in contacts_data
        ]
        Contact.objects.bulk_create(contacts)

    def _create_additional_info(self, person, additional_info_data):
        additional_info = [
            AdditionalInfo(person=person, **{k: v for k, v in info.items() if k != 'person'})
            for info in additional_info_data if isinstance(info, dict)
        ]
        AdditionalInfo.objects.bulk_create(additional_info)

    def _create_last_known_details(self, person, last_known_details_data):
        last_known_details = [
            LastKnownDetails(person=person, **{k: v for k, v in details.items() if k != 'person'})
            for details in last_known_details_data if isinstance(details, dict)
        ]
        LastKnownDetails.objects.bulk_create(last_known_details)

    def _create_firs(self, person, firs_data):
        for fir in firs_data:
            logger.debug("FIR Record: %s", fir)
            if 'fir_date' in fir:
                logger.debug("Type of fir_date: %s", type(fir['fir_date']))
        firs = [
            FIR(person=person, **{k: v for k, v in fir.items() if k != 'person'})
            for fir in firs_data if isinstance(fir, dict)
        ]
        FIR.objects.bulk_create(firs)

    def _create_consents(self, person, consents_data):
        consents = [
            Consent(person=person, **{k: v for k, v in consent.items() if k != 'person'})
            for consent in consents_data
        ]
        Consent.objects.bulk_create(consents)

    @swagger_auto_schema(
        operation_description="Update an existing person's details",
        request_body=PersonSerializer,
        responses={200: openapi.Response("Person updated successfully")}
    )
    def update(self, request, pk=None):
        try:
            with transaction.atomic():
                person = Person.objects.get(pk=pk)
                data = request.data

                # Update Person fields
                for key, value in data.items():
                    if key not in ['addresses', 'contacts', 'additional_info', 'last_known_details', 'firs','consent']:
                        setattr(person, key, value)
                person.save()

                # Update related addresses
                if 'addresses' in data:
                    addresses_data = data.pop('addresses')
                    person.addresses.all().delete()  # Delete existing addresses
                    Address.objects.bulk_create([
                        Address(person=person, **address) for address in addresses_data
                    ])

                # Update related contacts
                if 'contacts' in data:
                    contacts_data = data.pop('contacts')
                    person.contacts.all().delete()  # Delete existing contacts
                    Contact.objects.bulk_create([
                        Contact(person=person, **contact) for contact in contacts_data
                    ])

                # Update related additional_info
                if 'additional_info' in data:
                    additional_info_data = data.pop('additional_info')
                    person.additional_info.all().delete()  # Delete existing additional_info
                    AdditionalInfo.objects.bulk_create([
                        AdditionalInfo(person=person, **info) for info in additional_info_data
                    ])

                # Update related last_known_details
                if 'last_known_details' in data:
                    last_known_details_data = data.pop('last_known_details')
                    person.last_known_details.all().delete()  # Delete existing last_known_details
                    LastKnownDetails.objects.bulk_create([
                        LastKnownDetails(person=person, **details) for details in last_known_details_data
                    ])

                # Update related FIRs
                if 'firs' in data:
                    firs_data = data.pop('firs')
                    person.firs.all().delete()  # Delete existing FIRs
                    FIR.objects.bulk_create([
                        FIR(person=person, **fir) for fir in firs_data
                    ])

                return Response({'message': 'Person and related data updated successfully'}, status=status.HTTP_200_OK)

        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 5. PARTIAL UPDATE (PATCH)
    @swagger_auto_schema(
        operation_description="Partially update a person’s details",
        request_body=PersonSerializer,
        responses={200: openapi.Response("Person partially updated successfully")}
    )
    def partial_update(self, request, pk=None):
        try:
            with transaction.atomic():
                person = Person.objects.get(pk=pk)
                data = request.data

                # Update Person fields
                for key, value in data.items():
                    if key not in ['addresses', 'contacts', 'additional_info', 'last_known_details', 'firs', 'consent']:
                        setattr(person, key, value)
                person.save()

                # Partially update related addresses
                if 'addresses' in data:
                    addresses_data = data.pop('addresses')
                    for address_data in addresses_data:
                        address_id = address_data.get('id')
                        if address_id:
                            address = Address.objects.get(id=address_id, person=person)
                            for key, value in address_data.items():
                                if key != 'person':  # Ensure we don't overwrite the person field
                                    setattr(address, key, value)
                            address.save()
                        else:
                            # Remove the 'person' key from address_data if it exists
                            address_data.pop('person', None)
                            # Create a new Address object with the correct person instance
                            Address.objects.create(person=person, **address_data)

                # Partially update related contacts
                if 'contacts' in data:
                    contacts_data = data.pop('contacts')
                    for contact_data in contacts_data:
                        contact_id = contact_data.get('id')
                        if contact_id:
                            contact = Contact.objects.get(id=contact_id, person=person)
                            for key, value in contact_data.items():
                                if key != 'person':  # Ensure we don't overwrite the person field
                                    setattr(contact, key, value)
                            contact.save()
                        else:
                            # Remove the 'person' key from contact_data if it exists
                            contact_data.pop('person', None)
                            # Create a new Contact object with the correct person instance
                            Contact.objects.create(person=person, **contact_data)

                # Partially update related additional_info
                if 'additional_info' in data:
                    additional_info_data = data.pop('additional_info')
                    for info_data in additional_info_data:
                        info_id = info_data.get('id')
                        if info_id:
                            info = AdditionalInfo.objects.get(id=info_id, person=person)
                            for key, value in info_data.items():
                                if key != 'person':  # Ensure we don't overwrite the person field
                                    setattr(info, key, value)
                            info.save()
                        else:
                            # Remove the 'person' key from info_data if it exists
                            info_data.pop('person', None)
                            # Create a new AdditionalInfo object with the correct person instance
                            AdditionalInfo.objects.create(person=person, **info_data)

                # Partially update related last_known_details
                if 'last_known_details' in data:
                    last_known_details_data = data.pop('last_known_details')
                    for details_data in last_known_details_data:
                        details_id = details_data.get('id')
                        if details_id:
                            details = LastKnownDetails.objects.get(id=details_id, person=person)
                            for key, value in details_data.items():
                                if key != 'person':  # Ensure we don't overwrite the person field
                                    setattr(details, key, value)
                            details.save()
                        else:
                            # Remove the 'person' key from details_data if it exists
                            details_data.pop('person', None)
                            # Create a new LastKnownDetails object with the correct person instance
                            LastKnownDetails.objects.create(person=person, **details_data)

                # Partially update related FIRs
                if 'firs' in data:
                    firs_data = data.pop('firs')
                    for fir_data in firs_data:
                        fir_id = fir_data.get('id')
                        if fir_id:
                            fir = FIR.objects.get(id=fir_id, person=person)
                            for key, value in fir_data.items():
                                if key != 'person':  # Ensure we don't overwrite the person field
                                    setattr(fir, key, value)
                            fir.save()
                        else:
                            # Remove the 'person' key from fir_data if it exists
                            fir_data.pop('person', None)
                            # Create a new FIR object with the correct person instance
                            FIR.objects.create(person=person, **fir_data)

                # Update the consent field (Many-to-Many relationship)
                if 'consent' in data:
                    consent_data = data.pop('consent')
                    if isinstance(consent_data, list):
                        # Ensure consent_data contains only hashable values (e.g., primary keys)
                        consent_data = [item if isinstance(item, (str, int)) else item.get('id') for item in
                                        consent_data]
                        person.consent.set(consent_data)

                return Response(
                    {'message': 'Person and related data partially updated successfully'},
                    status=status.HTTP_200_OK
                )

        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    # 🔹 6. DELETE a person
    @swagger_auto_schema(
        operation_description="Delete a person by ID",
        responses={204: openapi.Response("Person deleted successfully")}
    )
    def destroy(self, request, pk=None):
        try:
            person = Person.objects.get(pk=pk)
            person._is_deleted = True
            person.save()
            return Response({'message': 'Person deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 7. SOFT DELETE all persons
    @swagger_auto_schema(
        operation_description="Delete all persons",
        responses={200: openapi.Response("All persons deleted successfully")}
    )
    def destroy_All(self, request):
        try:
            Person.objects.update(_is_deleted=True)
            return Response({'message': 'All persons deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='missing-persons')
    def missing_persons(self, request):
        return self.get_persons_by_type(request, 'Missing Person')

    @action(detail=False, methods=['get'], url_path='unidentified-persons')
    def unidentified_persons(self, request):
        return self.get_persons_by_type(request, 'Unidentified Person')

    @action(detail=False, methods=['get'], url_path='unidentified-bodies')
    def unidentified_bodies(self, request):
        return self.get_persons_by_type(request, 'Unidentified Body')

    def get_persons_by_type(self, request, person_type):
        """Return filtered persons based on request parameters"""
        try:
            # Initialize filters with query params (excluding empty values)
            filters = {
                key: value
                for key, value in request.query_params.items()
                if value and key not in ['startDate', 'endDate']  # Exclude date params
            }

            # Handle date filtering separately
            start_date = request.query_params.get('startDate')
            end_date = request.query_params.get('endDate')

            if start_date:
                try:
                    start_date = parser.parse(start_date).date()
                    filters['date_reported__gte'] = start_date  # ✅ Correct field name
                except (ValueError, TypeError):
                    pass  # Skip if invalid

            if end_date:
                try:
                    end_date = parser.parse(end_date).date()
                    filters['date_reported__lte'] = end_date  # ✅ Correct field name
                except (ValueError, TypeError):
                    pass  # Skip if invalid

            # Apply filters to the Person model
            persons = Person.objects.filter(
                type=person_type,
                _is_deleted=False,
                **filters
            ).prefetch_related(
                'addresses', 'contacts', 'additional_info',
                'last_known_details', 'firs', 'consent'
            ).order_by('-created_at')

            if not persons.exists():
                return Response({'message': f'No {person_type.lower()} found'}, status=status.HTTP_200_OK)

            serializer = PersonSerializer(persons, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)