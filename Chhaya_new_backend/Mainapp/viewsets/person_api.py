import logging
from datetime import datetime
from uuid import UUID

from dateutil import parser
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated ,AllowAny
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework import status

from .pending_person_pagination import PendingPersonPagination
from ..models.fir import FIR
from ..access_permision import IsAdminUser , IsVolunteerUser ,AllUserAccess
from ..pagination import CustomPagination
from ..Serializers.serializers import PersonSerializer, ApprovePersonSerializer
from ..models import Person, Address, Contact, AdditionalInfo, LastKnownDetails, Consent, Document, PoliceStation, \
    Hospital
from django.db import transaction
from drf_yasg import openapi
from django.contrib.gis.geos import Point
import json
from django.utils.timezone import now
import traceback

logger = logging.getLogger(__name__)


class PersonViewSet(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]  # Require token authentication
    permission_classes = [IsAuthenticated]

    parser_classes = (MultiPartParser, FormParser,JSONParser)
    pagination_class = PageNumberPagination

    def get_permissions(self):
        """
        Override this method to allow unrestricted access to `retrieve`
        while enforcing restrictions on other actions.
        """
        if self.action == "retrieve":
            return [AllowAny()]

        return [permission() for permission in self.permission_classes]


        # 🔹 1. LIST all persons
    @swagger_auto_schema(
        operation_description="Retrieve a list of all persons",
        responses={200: PersonSerializer(many=True)}
    )
    def list(self, request):
        try:
            # Get and order the queryset
            queryset = Person.objects.filter(_is_deleted=False,person_approve_status='approved').prefetch_related(
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
            person = Person.objects.filter(_is_deleted=False,person_approve_status='approved').prefetch_related(
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
        print("data comes", request.data)
        try:
            with transaction.atomic():
                # Extract data based on content type
                if request.content_type == 'application/json':
                    data = request.data
                elif request.content_type.startswith('multipart/form-data'):
                    if 'payload' in request.FILES:
                        payload_file = request.FILES['payload']
                        try:
                            # Read the file content and decode as JSON
                            payload_str = payload_file.read().decode('utf-8')
                            data = json.loads(payload_str)
                            print("Incoming data:", data)  # Debug log
                        except json.JSONDecodeError as e:
                            return Response({'error': 'Invalid JSON in payload'},
                                            status=status.HTTP_400_BAD_REQUEST)
                    else:
                        return Response({'error': 'Missing payload in request'},
                                        status=status.HTTP_400_BAD_REQUEST)

                else:
                    return Response({'error': 'Unsupported media type'}, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

                logger.debug("Extracted JSON Data: %s", json.dumps(data, indent=4))
                data['photo_photo'] = request.FILES.get('photo_photo')  # Assign uploaded file

                # Set status to pending for non-admin users
                if not request.user.is_staff:
                    data['person_approve_status'] = 'pending'

                # Extract related data
                addresses_data = [addr for addr in data.get('addresses', []) if any(addr.values())]
                contacts_data = [contact for contact in data.get('contacts', []) if any(contact.values())]
                additional_info_data = [info for info in data.get('additional_info', []) if any(info.values())]
                last_known_details_data = [details for details in data.get('last_known_details', []) if
                                           any(details.values())]
                firs_data = [fir for fir in data.get('firs', []) if any(fir.values())]
                consents_data = [consent for consent in data.get('consent', []) if any(consent.values())]

                logger.debug("Filtered Addresses Data: %s", json.dumps(addresses_data, indent=4))

                # Extract hospital instance (if any)
                hospital_id = data.get('hospital')
                hospital = None
                if hospital_id:
                    try:
                        hospital = Hospital.objects.get(id=hospital_id)
                    except Hospital.DoesNotExist:
                        raise ValueError(f"Hospital with ID {hospital_id} does not exist")

                # Create Person object
                person_data = {
                    k: v for k, v in data.items()
                    if v not in [None, "", []] and k not in [
                        'addresses', 'contacts', 'additional_info', 'last_known_details', 'firs', 'consent', 'hospital'
                    ]
                }
                # person = Person.objects.create(**person_data, hospital=hospital)
                person = Person(**person_data, hospital=hospital)
                logger.debug("Person Created: %s", person.id)

                # Extract zero index address and store it directly in the person model
                if addresses_data:
                    first_address = addresses_data[0]
                    person.address_type = first_address.get('address_type', '')
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
                    # Safe location parsing and validation
                    location_data = first_address.get('location', {})
                    raw_lat = location_data.get('latitude')
                    raw_lon = location_data.get('longitude')

                    try:
                        lat = float(str(raw_lat).strip())
                        lon = float(str(raw_lon).strip())

                        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                            raise ValueError("Latitude must be between -90 and 90, and longitude between -180 and 180.")

                        person.location = Point(lon, lat)  # GeoDjango expects (lon, lat)
                    except (ValueError, TypeError) as e:
                        raise ValueError(f"Invalid coordinates provided: {e}")
                    person.save()

                # Create related objects
                self._create_addresses(person, addresses_data[1:])  # Skip first address
                self._create_contacts(person, contacts_data)
                self._create_additional_info(person, additional_info_data)
                self._create_last_known_details(person, last_known_details_data)
                self._create_firs(person, firs_data)
                self._create_consents(person, consents_data)

                # Prepare response
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
        fir_objects = []
        for fir in firs_data:
            if not isinstance(fir, dict):
                continue

            police_station_id = fir.get('police_station')
            police_station = None
            if police_station_id:
                try:
                    police_station = PoliceStation.objects.get(id=police_station_id)
                except PoliceStation.DoesNotExist:
                    raise ValueError(f"PoliceStation with ID {police_station_id} does not exist")

            # Remove 'police_station' and 'person' from data dict for unpacking
            fir_data = {k: v for k, v in fir.items() if k not in ['police_station', 'person']}
            fir_obj = FIR(person=person, police_station=police_station, **fir_data)
            fir_objects.append(fir_obj)

        FIR.objects.bulk_create(fir_objects)

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

    @action(detail=False, methods=['get'], url_path='search/(?P<case_id>[^/.]+)')
    def retrieve_by_case_id(self, request, case_id=None):
        try:
            person = Person.objects.get(case_id=case_id, _is_deleted=False, person_approve_status='approved')
            serializer = PersonSerializer(person)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Person.DoesNotExist:
            return Response({'error': f'Person with Case ID {case_id} not found or is not approved'},
                            status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            filters = {}
            additional_info_filters = {}

            age_range = request.query_params.get('age_range')
            age = request.query_params.get('age')

            for key, value in request.query_params.items():
                if not value or key in ['startDate', 'endDate', 'age_range', 'age']:
                    continue

                # Fields from related model 'additional_info'
                if key == 'caste':
                    additional_info_filters['additional_info__caste'] = value
                elif key == 'marital_status':
                    additional_info_filters['additional_info__marital_status'] = value
                elif key == 'height_range':
                    filters['height_range'] = value
                else:
                    filters[key] = value

            # Handle date filtering
            start_date = request.query_params.get('startDate')
            end_date = request.query_params.get('endDate')

            if start_date and start_date != "null":
                try:
                    filters['reported_date__gte'] = parser.parse(start_date).date()
                except (ValueError, TypeError):
                    pass

            if end_date and end_date != "null":
                try:
                    filters['reported_date__lte'] = parser.parse(end_date).date()
                except (ValueError, TypeError):
                    pass

            # Handle age filtering logic safely
            if age_range and age_range.lower() != "null":
                try:
                    lower, upper = map(int, age_range.split('-'))
                    if 'missing' in person_type.lower():
                        filters['age__gte'] = lower
                        filters['age__lte'] = upper
                    else:
                        filters['age_range'] = age_range

                    print("Age range filter:", lower, upper)
                except ValueError:
                    print("Invalid age_range format:", age_range)
            else:
                print("Age range filter: not provided or null")

            if age and person_type == 'missing-persons':
                filters['age'] = age

            print("Final filters:", filters)
            print("Additional info filters:", additional_info_filters)

            persons = Person.objects.filter(
                type=person_type,
                person_approve_status='approved',
                _is_deleted=False,
                **filters,
                **additional_info_filters
            ).prefetch_related(
                'addresses', 'contacts', 'additional_info',
                'last_known_details', 'firs', 'consent'
            ).order_by('-created_at').distinct()

            if not persons.exists():
                return Response({'message': f'No {person_type.lower()} found'}, status=status.HTTP_200_OK)

            serializer = PersonSerializer(persons, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    # def pending_or_rejected(self, request):
    #     try:
    #         # Extract filter parameters from query string
    #         state = request.query_params.get('state')
    #         district = request.query_params.get('district')
    #         city = request.query_params.get('city')
    #         village = request.query_params.get('village')
    #         police_station = request.query_params.get('police_station')
    #
    #         # Build dynamic filters using Q
    #         filters = Q()
    #         if state:
    #             filters &= Q(state__iexact=state)
    #         if district:
    #             filters &= Q(district__iexact=district)
    #         if city:
    #             filters &= Q(city__iexact=city)
    #         if village:
    #             filters &= Q(village__iexact=village)
    #         if police_station:
    #             filters &= Q(firs__police_station__id=UUID(police_station))
    #
    #         # Apply filters to the queryset
    #         persons = Person.objects.filter(filters)
    #
    #         # Group data by status fields
    #         summary = {
    #             'pending': [],
    #             'approved': [],
    #             'rejected': [],
    #             'on_hold': [],
    #             'suspended': []
    #         }
    #
    #         for person in persons:
    #             approve_status = person.person_approve_status
    #             # status_field = person.status
    #             serialized = ApprovePersonSerializer(person).data
    #
    #             if approve_status == 'pending':
    #                 summary['pending'].append(serialized)
    #             elif approve_status == 'approved':
    #                 summary['approved'].append(serialized)
    #             elif approve_status == 'rejected':
    #                 summary['rejected'].append(serialized)
    #             elif approve_status == 'on_hold':
    #                 summary['on_hold'].append(serialized)
    #             elif approve_status == 'suspended':
    #                 summary['suspended'].append(serialized)
    #
    #         # Combine all for pagination (you can choose to paginate one category at a time if needed)
    #         combined_data = (
    #                 summary['pending'] +
    #                 summary['approved'] +
    #                 summary['rejected'] +
    #                 summary['on_hold'] +
    #                 summary['suspended']
    #         )
    #
    #         # Paginate combined data
    #         paginator = PendingPersonPagination()
    #         page = paginator.paginate_queryset(combined_data, request)
    #         return paginator.get_paginated_response({
    #             'pending_count': len(summary['pending']),
    #             'approved_count': len(summary['approved']),
    #             'rejected_count': len(summary['rejected']),
    #             'on_hold_count': len(summary['on_hold']),
    #             'suspended_count': len(summary['suspended']),
    #             'results': page
    #         })
    #
    #     except Exception as e:
    #         return Response(
    #             {'error': 'Something went wrong while fetching person data.', 'details': str(e)},
    #             status=status.HTTP_500_INTERNAL_SERVER_ERROR
    #         )

    def pending_or_rejected(self, request):
        try:
            # Extract filter parameters from query string
            state = request.query_params.get('state')
            district = request.query_params.get('district')
            city = request.query_params.get('city')
            village = request.query_params.get('village')
            police_station = request.query_params.get('police_station')

            # Build dynamic filters using Q
            filters = Q()
            if state:
                filters &= Q(state__iexact=state)
            if district:
                filters &= Q(district__iexact=district)
            if city:
                filters &= Q(city__iexact=city)
            if village:
                filters &= Q(village__iexact=village)
            if police_station:
                filters &= Q(firs__police_station__id=UUID(police_station))

            # Apply filters to the queryset
            persons = Person.objects.filter(filters)
            serialized_data = PersonSerializer(persons, many=True).data

            # Group data by status fields
            summary = {
                'pending': [],
                'approved': [],
                'rejected': [],
                'on_hold': [],
                'suspended': []
            }

            for person in serialized_data:
                approve_status = person.get('person_approve_status')
                status_field = person.get('status')

                if approve_status == 'pending':
                    summary['pending'].append(person)
                elif approve_status == 'approved':
                    summary['approved'].append(person)
                elif approve_status == 'rejected':
                    summary['rejected'].append(person)
                elif approve_status == 'on_hold':
                    summary['on_hold'].append(person)
                elif approve_status == 'suspended':
                    summary['suspended'].append(person)

            return Response({
                'pending_count': len(summary['pending']),
                'approved_count': len(summary['approved']),
                'rejected_count': len(summary['rejected']),
                'on_hold_count': len(summary['on_hold']),
                'suspended_count': len(summary['suspended']),
                'pending_data': summary['pending'],
                'approved_data': summary['approved'],
                'rejected_data': summary['rejected'],
                'on_hold_data': summary['on_hold'],
                'suspended_data': summary['suspended'],
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Something went wrong while fetching person data.', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve_person(self, request, pk=None):
        try:
            person = Person.objects.get(pk=pk)
            if person.person_approve_status != 'pending':
                return Response(
                    {'error': 'Only pending records can be approved'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            person.person_approve_status = 'approved'
            person.approved_by = request.user
            person.save()
            serializer = PersonSerializer(person)
            return Response(
                {'message': 'Person approved successfully', 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject_person(self, request, pk=None):
        try:
            person = Person.objects.get(pk=pk)
            if person.person_approve_status != 'pending':
                return Response(
                    {'error': 'Only pending records can be rejected'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            person.person_approve_status = 'rejected'
            person.approved_by = request.user
            person.save()
            serializer = PersonSerializer(person)
            return Response(
                {'message': 'Person rejected successfully', 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reapprove_person(self, request, pk=None):
        try:
            person = Person.objects.get(pk=pk)

            if person.person_approve_status != 'rejected':
                return Response(
                    {'error': 'Only rejected records can be re-approved'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            person.person_approve_status = 'approved'
            person.approved_by = request.user
            person.save()

            serializer = PersonSerializer(person)
            return Response(
                {'message': 'Rejected person approved successfully', 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def change_from_approved(self, request, pk=None):
        try:
            person = Person.objects.get(pk=pk)
            new_status = request.data.get('status')

            # Validate allowed transitions
            if person.person_approve_status != 'approved':
                return Response(
                    {'error': 'Only approved records can be changed using this action'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if new_status not in ['pending', 'rejected']:
                return Response(
                    {'error': 'Invalid target status. Allowed: pending, rejected'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            person.person_approve_status = new_status
            person.approved_by = request.user
            person.save()

            serializer = PersonSerializer(person)
            return Response(
                {'message': f'Person status changed to {new_status}', 'data': serializer.data},
                status=status.HTTP_200_OK
            )

        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def suspend_person(self, request, pk=None):
        try:
            person = Person.objects.get(pk=pk)
            reason = request.data.get('reason')

            if not reason:
                return Response(
                    {'error': 'Reason is required to suspend a person'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            person.person_approve_status = 'suspended'
            person.status_reason = reason
            person.approved_by = request.user
            person.save()

            serializer = PersonSerializer(person)
            return Response(
                {'message': 'Person suspended successfully', 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def hold_person(self, request, pk=None):
        try:
            person = Person.objects.get(pk=pk)
            reason = request.data.get('reason')

            if not reason:
                return Response(
                    {'error': 'Reason is required to put a person on hold'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            person.person_approve_status = 'on_hold'
            person.status_reason = reason
            person.approved_by = request.user
            person.save()

            serializer = PersonSerializer(person)
            return Response(
                {'message': 'Person put on hold successfully', 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)

