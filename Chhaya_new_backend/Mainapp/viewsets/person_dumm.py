def create(self, request):
    logger.info(f"Incoming data: {request.data}")
    print("data comes", request.data)
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

            # Validate person data
            self._validate_person_data(data)

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
