from rest_framework import viewsets, status
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
            queryset = Person.objects.filter(_is_deleted=False).prefetch_related(
                'addresses', 'contacts', 'additional_info', 'last_known_details', 'firs','consent'
            ).order_by('created_at')  # Ensure ordered queryset to avoid pagination warnings

            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request)

            if paginated_queryset is None:
                return Response({'message': 'No persons found'}, status=status.HTTP_200_OK)

            serializer = PersonSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
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
    #     print("Incoming Data:", json.dumps(request.data, indent=4))
    #     try:
    #         with transaction.atomic():
    #             data = request.data
    #             print("Extracted Data:", json.dumps(data, indent=4))
    #
    #             # Extract related data
    #             addresses_data = data.pop('addresses', [])
    #             contacts_data = data.pop('contacts', [])
    #             additional_info_data = data.pop('additional_info', [])
    #             last_known_details_data = data.pop('last_known_details', [])
    #             firs_data = data.pop('firs', [])
    #             consents_data = data.pop('consent', [])
    #
    #             print("Addresses Data:", json.dumps(addresses_data, indent=4))
    #             print("Contacts Data:", json.dumps(contacts_data, indent=4))
    #             print("Additional Info Data:", json.dumps(additional_info_data, indent=4))
    #             print("Last Known Details Data:", json.dumps(last_known_details_data, indent=4))
    #             print("FIRs Data:", json.dumps(firs_data, indent=4))
    #             print("Consents Data:", json.dumps(consents_data, indent=4))
    #
    #             # Create Person object
    #             person = Person.objects.create(**data)
    #             print("Person Created:", person.id)
    #
    #             # ✅ Create related addresses with correct person reference
    #             addresses = []
    #             for address in addresses_data:
    #                 print("Processing Address:", json.dumps(address, indent=4))
    #                 lat = address.get('location', {}).get('latitude')
    #                 lon = address.get('location', {}).get('longitude')
    #
    #                 if lat and lon:  # Ensure values exist and are not empty
    #                     try:
    #                         lat = float(lat)
    #                         lon = float(lon)
    #                         point = Point(lon, lat)  # Create a Point object
    #                         print("Created Point:", point)
    #                     except ValueError as e:
    #                         print("Error converting lat/lon to float:", e)
    #                         return Response({'error': 'Latitude and Longitude must be valid numbers'},
    #                                         status=status.HTTP_400_BAD_REQUEST)
    #                 else:
    #                     point = None  # If lat/lon are missing, keep location empty
    #                     print("No valid lat/lon provided, setting location to None")
    #
    #                 # ✅ Ensure person is correctly assigned
    #                 address_obj = Address(
    #                     person=person,  # ✅ Assign the valid Person instance
    #                     location=point,  # ✅ Store as Point or None
    #                     **{k: v for k, v in address.items() if k not in ['location', 'person']}
    #                     # Avoid duplicate person key
    #                 )
    #                 print("Address Object Created:", address_obj)
    #                 addresses.append(address_obj)
    #
    #             # ✅ Bulk create after validating all addresses
    #             Address.objects.bulk_create(addresses)
    #             print("Addresses Bulk Created")
    #
    #             contacts = [Contact(person=person, **{k: v for k, v in contact.items() if k != 'person'}) for contact in
    #                         contacts_data]
    #             print("Contacts List Created:", contacts)
    #             Contact.objects.bulk_create(contacts)
    #             print("Contacts Bulk Created")
    #
    #             additional_info = [AdditionalInfo(person=person, **{k: v for k, v in info.items() if k != 'person'}) for
    #                                info in additional_info_data]
    #             print("Additional Info List Created:", additional_info)
    #             AdditionalInfo.objects.bulk_create(additional_info)
    #             print("Additional Info Bulk Created")
    #
    #             # ✅ Fix LastKnownDetails creation
    #             last_known_details = []
    #             for details in last_known_details_data:
    #                 print("Processing Last Known Details:", json.dumps(details, indent=4))
    #                 # Handle person_photo and reference_photo
    #                 person_photo = details.pop('person_photo', None)
    #                 reference_photo = details.pop('reference_photo', None)
    #
    #                 # If person_photo is an empty dict, set it to None
    #                 if isinstance(person_photo, dict) and not person_photo:
    #                     person_photo = None
    #
    #                 # If reference_photo is an empty dict, set it to None
    #                 if isinstance(reference_photo, dict) and not reference_photo:
    #                     reference_photo = None
    #
    #                 last_known_details.append(
    #                     LastKnownDetails(
    #                         person=person,  # ✅ Assign the valid Person instance
    #                         person_photo=person_photo,  # ✅ Handle person_photo
    #                         reference_photo=reference_photo,  # ✅ Handle reference_photo
    #                         **{k: v for k, v in details.items() if k != 'person'}
    #                     )
    #                 )
    #             print("Last Known Details List Created:", last_known_details)
    #             LastKnownDetails.objects.bulk_create(last_known_details)
    #             print("Last Known Details Bulk Created")
    #
    #             firs = [FIR(person=person, **{k: v for k, v in fir.items() if k != 'person'}) for fir in firs_data]
    #             print("FIRs List Created:", firs)
    #             FIR.objects.bulk_create(firs)
    #             print("FIRs Bulk Created")
    #
    #             consents = [Consent(person=person, **{k: v for k, v in consent.items() if k != 'person'}) for consent in
    #                         consents_data]
    #             print("Consents List Created:", consents)
    #             Consent.objects.bulk_create(consents)
    #             print("Consents Bulk Created")
    #
    #             return Response({'message': 'Person created successfully', 'person_id': str(person.id)},
    #                             status=status.HTTP_201_CREATED)
    #
    #     except Exception as e:
    #         print("Exception Occurred:", str(e))
    #         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 🔹 4. UPDATE an existing person (PUT)
    def create(self, request):
        print("Incoming Data:", json.dumps(request.POST, indent=4))
        try:
            with transaction.atomic():
                # Extract the JSON payload from request.POST
                payload_str = request.POST.get('payload', '{}')
                data = json.loads(payload_str)
                print("Extracted Data:", json.dumps(data, indent=4))

                # Extract related data
                addresses_data = [addr for addr in data.get('addresses', []) if any(addr.values())]
                contacts_data = [contact for contact in data.get('contacts', []) if any(contact.values())]
                additional_info_data = [info for info in data.get('additional_info', []) if any(info.values())]
                last_known_details_data = [details for details in data.get('last_known_details', []) if
                                           any(details.values())]
                firs_data = [fir for fir in data.get('firs', []) if any(fir.values())]
                consents_data = [consent for consent in data.get('consent', []) if any(consent.values())]

                print("Filtered Addresses Data:", json.dumps(addresses_data, indent=4))
                print("Filtered Contacts Data:", json.dumps(contacts_data, indent=4))
                print("Filtered Additional Info Data:", json.dumps(additional_info_data, indent=4))
                print("Filtered Last Known Details Data:", json.dumps(last_known_details_data, indent=4))
                print("Filtered FIRs Data:", json.dumps(firs_data, indent=4))
                print("Filtered Consents Data:", json.dumps(consents_data, indent=4))

                # Create Person object with only non-empty data
                person_data = {k: v for k, v in data.items() if v not in [None, "", []] and k not in [
                    'addresses', 'contacts', 'additional_info', 'last_known_details', 'firs', 'consent']}

                person = Person.objects.create(**person_data)
                print("Person Created:", person.id)

                # Create related addresses
                addresses = []
                for address in addresses_data:
                    lat = address.get('location', {}).get('latitude')
                    lon = address.get('location', {}).get('longitude')

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
                contacts = [Contact(person=person, **{k: v for k, v in contact.items() if k != 'person'})
                            for contact in contacts_data]
                Contact.objects.bulk_create(contacts)
                print("Contacts Bulk Created")

                # Create additional info
                additional_info = [AdditionalInfo(person=person, **{k: v for k, v in info.items() if k != 'person'})
                                   for info in additional_info_data]
                AdditionalInfo.objects.bulk_create(additional_info)
                print("Additional Info Bulk Created")

                # Create last known details
                last_known_details = []
                for details in last_known_details_data:
                    person_photo = details.pop('person_photo', None) or None
                    reference_photo = details.pop('reference_photo', None) or None

                    last_known_details.append(
                        LastKnownDetails(
                            person=person,
                            person_photo=person_photo,
                            reference_photo=reference_photo,
                            **{k: v for k, v in details.items() if k != 'person'}
                        )
                    )
                LastKnownDetails.objects.bulk_create(last_known_details)
                print("Last Known Details Bulk Created")

                # Create FIRs
                firs = [FIR(person=person, **{k: v for k, v in fir.items() if k != 'person'}) for fir in firs_data]
                FIR.objects.bulk_create(firs)
                print("FIRs Bulk Created")

                # Function to handle document creation
                def create_document(file_data):
                    if file_data:  # Check if file data is provided
                        return Document.objects.create(file=file_data)
                    return None  # Return None if no file data is provided

                # Create consents
                consents = []
                for consent_data in consents_data:
                    # Handle the document field
                    document_data = consent_data.pop('document', None)  # Extract document data
                    document = create_document(document_data)  # Create a Document instance or None

                    # Create the Consent instance
                    consent = Consent(
                        person=person,  # Assign the Person instance
                        document=document,  # Assign the Document instance or None
                        **{k: v for k, v in consent_data.items() if k != 'person'}
                    )
                    consents.append(consent)

                # Bulk create consents
                Consent.objects.bulk_create(consents)
                print("Consents Bulk Created")

                return Response({'message': 'Person created successfully', 'person_id': str(person.id)},
                                status=status.HTTP_201_CREATED)

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
                    if key not in ['addresses', 'contacts', 'additional_info', 'last_known_details', 'firs']:
                        setattr(person, key, value)
                person.save()

                # Partially update related addresses
                if 'addresses' in data:
                    addresses_data = data.pop('addresses')
                    for address_data in addresses_data:
                        address_id = address_data.get('id')
                        if address_id:
                            # Update existing address
                            address = Address.objects.get(id=address_id, person=person)
                            for key, value in address_data.items():
                                setattr(address, key, value)
                            address.save()
                        else:
                            # Create new address
                            Address.objects.create(person=person, **address_data)

                # Partially update related contacts
                if 'contacts' in data:
                    contacts_data = data.pop('contacts')
                    for contact_data in contacts_data:
                        contact_id = contact_data.get('id')
                        if contact_id:
                            # Update existing contact
                            contact = Contact.objects.get(id=contact_id, person=person)
                            for key, value in contact_data.items():
                                setattr(contact, key, value)
                            contact.save()
                        else:
                            # Create new contact
                            Contact.objects.create(person=person, **contact_data)

                # Partially update related additional_info
                if 'additional_info' in data:
                    additional_info_data = data.pop('additional_info')
                    for info_data in additional_info_data:
                        info_id = info_data.get('id')
                        if info_id:
                            # Update existing additional_info
                            info = AdditionalInfo.objects.get(id=info_id, person=person)
                            for key, value in info_data.items():
                                setattr(info, key, value)
                            info.save()
                        else:
                            # Create new additional_info
                            AdditionalInfo.objects.create(person=person, **info_data)

                # Partially update related last_known_details
                if 'last_known_details' in data:
                    last_known_details_data = data.pop('last_known_details')
                    for details_data in last_known_details_data:
                        details_id = details_data.get('id')
                        if details_id:
                            # Update existing last_known_details
                            details = LastKnownDetails.objects.get(id=details_id, person=person)
                            for key, value in details_data.items():
                                setattr(details, key, value)
                            details.save()
                        else:
                            # Create new last_known_details
                            LastKnownDetails.objects.create(person=person, **details_data)

                # Partially update related FIRs
                if 'firs' in data:
                    firs_data = data.pop('firs')
                    for fir_data in firs_data:
                        fir_id = fir_data.get('id')
                        if fir_id:
                            # Update existing FIR
                            fir = FIR.objects.get(id=fir_id, person=person)
                            for key, value in fir_data.items():
                                setattr(fir, key, value)
                            fir.save()
                        else:
                            # Create new FIR
                            FIR.objects.create(person=person, **fir_data)

                return Response({'message': 'Person and related data partially updated successfully'}, status=status.HTTP_200_OK)

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



