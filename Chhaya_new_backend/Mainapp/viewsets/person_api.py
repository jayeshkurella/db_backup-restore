from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from Mainapp.models.fir import FIR
from ..pagination import CustomPagination
from ..Serializers.serializers import PersonSerializer
from ..models import Person, Address, Contact, AdditionalInfo, LastKnownDetails, Consent, Document
from django.db import transaction
from drf_yasg import openapi
from django.contrib.gis.geos import Point
import json
from django.utils.timezone import now


class PersonViewSet(viewsets.ViewSet):
    parser_classes = (MultiPartParser, FormParser,JSONParser)

    """
    A ViewSet for managing Person entities and their related data.

    This ViewSet provides operations to list, retrieve, create, update (PUT and PATCH),
    and partially update Person objects while handling their related data, such as
    addresses, contacts, additional information, last known details, FIRs, and consents.

    Methods:
        - list: Retrieves a paginated list of all persons that are not marked as deleted.
        - retrieve: Retrieves a specific person by their ID, along with related data.
        - create: Creates a new person and their related data as specified.
        - update: Updates the details of an existing person and all related data.
        - partial_update: Partially updates an existing person and their related data, allowing for selective data changes.
    """
    pagination_class = PageNumberPagination


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
            ).order_by('-created_at')  # Changed to descending order

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
    # def create(self, request):
    #     print("Incoming Data Format:", request.content_type)  # Debugging: Print request content type
    #     try:
    #         with transaction.atomic():
    #             # Handle JSON data
    #             if request.content_type == 'application/json':
    #                 data = request.data  # JSON data is already parsed into request.data
    #                 print("Extracted JSON Data:", json.dumps(data, indent=4))  # Debugging: Print JSON data
    #
    #             # Handle form-data
    #             elif request.content_type.startswith('multipart/form-data'):
    #                 # Extract JSON payload from form-data
    #                 payload_str = request.POST.get('payload', '{}')  # Use 'payload' as the key for JSON data
    #                 data = json.loads(payload_str)
    #                 print("Extracted Form-Data JSON Payload:",
    #                       json.dumps(data, indent=4))  # Debugging: Print form-data JSON payload
    #
    #             else:
    #                 return Response({'error': 'Unsupported media type'}, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
    #
    #             # Extract related data
    #             addresses_data = [addr for addr in data.get('addresses', []) if any(addr.values())]
    #             contacts_data = [contact for contact in data.get('contacts', []) if any(contact.values())]
    #             additional_info_data = [info for info in data.get('additional_info', []) if any(info.values())]
    #             last_known_details_data = [details for details in data.get('last_known_details', []) if
    #                                        any(details.values())]
    #             firs_data = [fir for fir in data.get('firs', []) if any(fir.values())]
    #             consents_data = [consent for consent in data.get('consent', []) if any(consent.values())]
    #
    #             print("Filtered Addresses Data:",
    #                   json.dumps(addresses_data, indent=4))  # Debugging: Print addresses data
    #             print("Filtered Contacts Data:", json.dumps(contacts_data, indent=4))  # Debugging: Print contacts data
    #             print("Filtered Additional Info Data:",
    #                   json.dumps(additional_info_data, indent=4))  # Debugging: Print additional info data
    #             print("Filtered Last Known Details Data:",
    #                   json.dumps(last_known_details_data, indent=4))  # Debugging: Print last known details data
    #             print("Filtered FIRs Data:", json.dumps(firs_data, indent=4))  # Debugging: Print FIRs data
    #             print("Filtered Consents Data:", json.dumps(consents_data, indent=4))  # Debugging: Print consents data
    #
    #             # Create Person object with only non-empty data
    #             person_data = {k: v for k, v in data.items() if v not in [None, "", []] and k not in [
    #                 'addresses', 'contacts', 'additional_info', 'last_known_details', 'firs', 'consent'
    #             ]}
    #             person = Person.objects.create(**person_data)
    #             print("Person Created:", person.id)  # Debugging: Print person ID
    #
    #             # Create related addresses
    #             addresses = []
    #             for address in addresses_data:
    #                 lat = address.get('location', {}).get('latitude')
    #                 lon = address.get('location', {}).get('longitude')
    #                 print(f"Latitude: {lat}, Longitude: {lon}")
    #
    #                 point = None
    #                 if lat and lon:
    #                     try:
    #                         lat = float(lat)
    #                         lon = float(lon)
    #                         point = Point(lon, lat)
    #                     except ValueError as e:
    #                         print("Error converting lat/lon to float:", e)
    #                         return Response({'error': 'Latitude and Longitude must be valid numbers'},
    #                                         status=status.HTTP_400_BAD_REQUEST)
    #
    #                 address_obj = Address(
    #                     person=person,
    #                     location=point,
    #                     **{k: v for k, v in address.items() if k not in ['location', 'person']}
    #                 )
    #                 addresses.append(address_obj)
    #             Address.objects.bulk_create(addresses)
    #             print("Addresses Bulk Created")  # Debugging: Print confirmation
    #
    #             # Create related contacts
    #             contacts = [Contact(person=person, **{k: v for k, v in contact.items() if k != 'person'})
    #                         for contact in contacts_data]
    #             Contact.objects.bulk_create(contacts)
    #             print("Contacts Bulk Created")  # Debugging: Print confirmation
    #
    #             # Create additional info
    #             additional_info = [AdditionalInfo(person=person, **{k: v for k, v in info.items() if k != 'person'})
    #                                for info in additional_info_data]
    #             AdditionalInfo.objects.bulk_create(additional_info)
    #             print("Additional Info Bulk Created")  # Debugging: Print confirmation
    #
    #             # Create last known details
    #             last_known_details = []
    #             for details in last_known_details_data:
    #                 person_photo = details.pop('person_photo', None) or None
    #                 reference_photo = details.pop('reference_photo', None) or None
    #
    #                 last_known_details.append(
    #                     LastKnownDetails(
    #                         person=person,
    #                         person_photo=person_photo,
    #                         reference_photo=reference_photo,
    #                         **{k: v for k, v in details.items() if k != 'person'}
    #                     )
    #                 )
    #             LastKnownDetails.objects.bulk_create(last_known_details)
    #             print("Last Known Details Bulk Created")  # Debugging: Print confirmation
    #
    #             # Function to handle document creation
    #             def create_document(file_data, document_type):
    #                 if file_data:  # Check if file data is provided
    #                     return Document.objects.create(document=file_data, type=document_type)
    #                 return None  # Return None if no file data is provided
    #
    #             # Create FIRs
    #             firs = []
    #             for fir_data in firs_data:
    #                 # Handle the document field
    #                 document_data = fir_data.pop('document', None)  # Extract document data
    #                 document = create_document(document_data,
    #                                            Document.DocumentTypeChoices.FIR)  # Create a Document instance or None
    #
    #                 # Create the FIR instance
    #                 fir = FIR(
    #                     person=person,  # Assign the Person instance
    #                     document=document,  # Assign the Document instance or None
    #                     **{k: v for k, v in fir_data.items() if k != 'person'}
    #                 )
    #                 firs.append(fir)
    #
    #             # Bulk create FIRs
    #             FIR.objects.bulk_create(firs)
    #             print("FIRs Bulk Created")  # Debugging: Print confirmation
    #
    #             # Function to handle document creation
    #             def create_document(file_data):
    #                 if file_data:  # Check if file data is provided
    #                     return Document.objects.create(document=file_data)  # Use the correct field name
    #                 return None  # Return None if no file data is provided
    #
    #             # Create consents
    #             consents = []
    #             for consent_data in consents_data:
    #                 # Handle the document field
    #                 document_data = consent_data.pop('document', None)  # Extract document data
    #                 document = create_document(document_data)  # Create a Document instance or None
    #
    #                 # Create the Consent instance
    #                 consent = Consent(
    #                     person=person,  # Assign the Person instance
    #                     document=document,  # Assign the Document instance or None
    #                     **{k: v for k, v in consent_data.items() if k != 'person'}
    #                 )
    #                 consents.append(consent)
    #
    #             # Bulk create consents
    #             Consent.objects.bulk_create(consents)
    #             print("Consents Bulk Created")  # Debugging: Print confirmation
    #
    #             serializer = PersonSerializer(person)
    #             person_data = serializer.data
    #
    #             return Response(
    #                 {'message': 'Person created successfully', 'person_id': str(person.id), 'person_data': person_data},
    #                 status=status.HTTP_201_CREATED)
    #
    #     except Exception as e:
    #         print("Exception Occurred:", str(e))  # Debugging: Print exception
    #         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    #
    def create(self, request):
        print("Incoming Data Format:", request.content_type)  # Debugging: Print request content type
        try:
            with transaction.atomic():
                # Handle JSON data
                if request.content_type == 'application/json':
                    data = request.data  # JSON data is already parsed into request.data
                    print("Extracted JSON Data:", json.dumps(data, indent=4))  # Debugging: Print JSON data

                # Handle form-data
                elif request.content_type.startswith('multipart/form-data'):
                    # Extract JSON payload from form-data
                    payload_str = request.POST.get('payload', '{}')  # Use 'payload' as the key for JSON data
                    data = json.loads(payload_str)
                    print("Extracted Form-Data JSON Payload:", json.dumps(data, indent=4))

                else:
                    return Response({'error': 'Unsupported media type'}, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

                # Extract related data
                addresses_data = [addr for addr in data.get('addresses', []) if any(addr.values())]
                contacts_data = [contact for contact in data.get('contacts', []) if any(contact.values())]
                additional_info_data = [info for info in data.get('additional_info', []) if any(info.values())]
                last_known_details_data = [details for details in data.get('last_known_details', []) if
                                           any(details.values())]
                firs_data = [fir for fir in data.get('firs', []) if any(fir.values())]
                consents_data = [consent for consent in data.get('consent', []) if any(consent.values())]

                print("Filtered Addresses Data:", json.dumps(addresses_data, indent=4))

                # Create Person object with the first address data
                person_data = {k: v for k, v in data.items() if v not in [None, "", []] and k not in [
                    'addresses', 'contacts', 'additional_info', 'last_known_details', 'firs', 'consent'
                ]}

                # Extract the first address
                first_address = addresses_data.pop(0) if addresses_data else {}
                person_data.update({
                    'street': first_address.get('street', ''),
                    'appartment_no': first_address.get('appartment_no', ''),
                    'appartment_name': first_address.get('appartment_name', ''),
                    'village': first_address.get('village', ''),
                    'city': first_address.get('city', ''),
                    'district': first_address.get('district', ''),
                    'state': first_address.get('state', ''),
                    'pincode': first_address.get('pincode', ''),
                    'country': first_address.get('country', 'India'),
                    'landmark_details': first_address.get('landmark_details', ''),
                    'location': Point(
                        float(first_address['location']['longitude']),
                        float(first_address['location']['latitude'])
                    ) if first_address.get('location') else None,
                    'is_active': first_address.get('is_active', True),
                    'country_code': first_address.get('country_code', ''),
                })

                person = Person.objects.create(**person_data)
                print("Person Created:", person.id)

                # Create remaining addresses
                addresses = []
                for address in addresses_data:
                    lat = address.get('location', {}).get('latitude')
                    lon = address.get('location', {}).get('longitude')
                    print(f"Latitude: {lat}, Longitude: {lon}")

                    point = None
                    if lat and lon:
                        try:
                            lat = float(lat)
                            lon = float(lon)
                            point = Point(lon, lat)
                        except ValueError as e:
                            print("Error converting lat/lon to float:", e)
                            return Response({'error': 'Latitude and Longitude must be valid numbers'},
                                            status=status.HTTP_400_BAD_REQUEST)

                    address_obj = Address(
                        person=person,
                        location=point,
                        **{k: v for k, v in address.items() if k not in ['location', 'person']}
                    )
                    addresses.append(address_obj)
                Address.objects.bulk_create(addresses)
                print("Addresses Bulk Created")

                # Create related contacts
                contacts = [
                    Contact(person=person, **{k: v for k, v in contact.items() if k != 'person'})
                    for contact in contacts_data
                ]
                Contact.objects.bulk_create(contacts)

                # Create additional info
                additional_info = [AdditionalInfo(person=person, **info) for info in additional_info_data]
                AdditionalInfo.objects.bulk_create(additional_info)

                # Create last known details
                last_known_details = [LastKnownDetails(person=person, **details) for details in last_known_details_data]
                LastKnownDetails.objects.bulk_create(last_known_details)

                # Create FIRs
                firs = [FIR(person=person, **fir) for fir in firs_data]
                FIR.objects.bulk_create(firs)

                # Create consents safely
                consents = [
                    Consent(person=person, **{k: v for k, v in consent.items() if k != 'person'})
                    for consent in consents_data
                ]
                Consent.objects.bulk_create(consents)

                # Prepare the final response data
                serializer = PersonSerializer(person)
                person_data = serializer.data
                return Response(
                    {'message': 'Person created successfully', 'person_id': str(person.id), 'data': person_data},
                    status=status.HTTP_201_CREATED
                )

        except Exception as e:
            print("Exception Occurred:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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



