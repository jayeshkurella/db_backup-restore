def create(self, request):
    try:
        with transaction.atomic():
            data = request.data

            # Extract related data
            addresses_data = data.pop('addresses', [])
            contacts_data = data.pop('contacts', [])
            additional_info_data = data.pop('additional_info', [])
            last_known_details_data = data.pop('last_known_details', [])
            firs_data = data.pop('firs', [])
            consents_data = data.pop('consent', [])

            # Create Person object
            person = Person.objects.create(**data)

            # ✅ Ensure 'person' is not duplicated in related objects
            addresses = [Address(person=person, **{k: v for k, v in address.items() if k != 'person'}) for address in addresses_data]
            Address.objects.bulk_create(addresses)

            contacts = [Contact(person=person, **{k: v for k, v in contact.items() if k != 'person'}) for contact in contacts_data]
            Contact.objects.bulk_create(contacts)

            additional_info = [AdditionalInfo(person=person, **{k: v for k, v in info.items() if k != 'person'}) for info in additional_info_data]
            AdditionalInfo.objects.bulk_create(additional_info)

            last_known_details = [LastKnownDetails(person=person, **{k: v for k, v in details.items() if k != 'person'}) for details in last_known_details_data]
            LastKnownDetails.objects.bulk_create(last_known_details)

            firs = [FIR(person=person, **{k: v for k, v in fir.items() if k != 'person'}) for fir in firs_data]
            FIR.objects.bulk_create(firs)

            consents = [Consent(person=person, **{k: v for k, v in consent.items() if k != 'person'}) for consent in consents_data]
            Consent.objects.bulk_create(consents)

            return Response({'message': 'Person created successfully', 'person_id': str(person.id)}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
