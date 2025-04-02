from datetime import datetime
from itertools import count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Address, CaseReport, Chowki, Division, Hospital, HospitalDivision, HospitalZone, MatchRejection, MissingPerson, PoliceStation, PreviouslyMatched, ResolvedCase, UnidentifiedBody, UnidentifiedMissingPerson, Volunteer,Match, Zone
from .serializers import CaseReportSerializer, ChowkiSerializer, DivisionNestedSerializer, HospitalDivisionSerializer, HospitalSerializer, HospitalZoneSerializer, MatchSerializer, MissingPersonSerializer, PoliceStationNestedSerializer, UndefinedMissingpersonSerializer, UnidentifiedBodySerializer, VolunteerSerializer, ZoneSerializer
from django.db.models import Count
from django.db.models import Q
# for redis cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from rest_framework.decorators import api_view
CACHE_TTL = getattr(settings , 'CACHE_TTL',DEFAULT_TIMEOUT)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class missingpersoncount(APIView):
    def get(self, request):
        cached_count = cache.get("missing_person_count")
        if cached_count:
            return Response({
                "Missing_persons_count": cached_count,
            }, status=status.HTTP_200_OK)

        persons = MissingPerson.objects.all()
        count = persons.count()

        cache.set("missing_person_count", count, timeout=CACHE_TTL)

        return Response({
            "Missing_persons_count": count,
        }, status=status.HTTP_200_OK)

class unidentifiedpersoncount(APIView):
    def get(self, request):
        cached_count = cache.get("unidentified_person_count")
        if cached_count:
            return Response({
                "Unidentified_persons_count": cached_count,
            }, status=status.HTTP_200_OK)

        persons = UnidentifiedMissingPerson.objects.all()
        count = persons.count()

        cache.set("unidentified_person_count", count, timeout=CACHE_TTL)

        return Response({
            "Unidentified_persons_count": count,
        }, status=status.HTTP_200_OK)

class unidentifiedbodiescount(APIView):
    def get(self, request):
        cached_count = cache.get("unidentified_bodies_count")
        if cached_count:
            return Response({
                "Unidentified_bodies_count": cached_count,
            }, status=status.HTTP_200_OK)

        persons = UnidentifiedBody.objects.all()
        count = persons.count()
        cache.set("unidentified_bodies_count", count, timeout=CACHE_TTL)

        return Response({
            "Unidentified_bodies_count": count,
        }, status=status.HTTP_200_OK)
        
class MissingPersonGenderCount(APIView):
    def get(self, request):
        cached_count = cache.get("missing_person_gender_count")
        if cached_count:
            return Response({
                "gender_counts": cached_count,
            }, status=status.HTTP_200_OK)

        gender_counts = (
            MissingPerson.objects.values('gender')
            .annotate(count=Count('gender'))
            .order_by('gender')  
        )
        gender_count_dict = {gender['gender']: gender['count'] for gender in gender_counts}
        cache.set("missing_person_gender_count", gender_count_dict, timeout=CACHE_TTL)

        return Response({
            "gender_counts": gender_count_dict,
        }, status=status.HTTP_200_OK)
   
class StateListView(APIView):
    def get(self, request):
        states = Address.objects.values_list('state', flat=True).distinct()
        return Response(list(states), status=status.HTTP_200_OK) 

class CitiesListView(APIView):
    def get(self, request):
        cities = Address.objects.values_list('city', flat=True).distinct()
        return Response(list(cities), status=status.HTTP_200_OK) 

class maritallistview(APIView):
    def get(self, request):
        marital = MissingPerson.objects.values_list('marital_status', flat=True).distinct()
        return Response(list(marital), status=status.HTTP_200_OK) 


class districtListView(APIView):
    def get(self, request):
        district = Address.objects.values_list('district', flat=True).distinct()
        return Response(list(district), status=status.HTTP_200_OK) 
    
class GenderApiView(APIView):
    def get(self, request):
        districts = (
            MissingPerson.objects.values_list('gender', flat=True)
             .union(
                UnidentifiedMissingPerson.objects.values_list('gender', flat=True),
                UnidentifiedBody.objects.values_list('gender', flat=True)
            )
        )
        
        return Response(list(districts), status=status.HTTP_200_OK)
    
@api_view(['GET'])
def village_list(request):
    village_list = Address.objects.exclude(village__isnull=True).values_list('village', flat=True).distinct()
    
    filtered_villages = [
        village for village in village_list
        if village.strip().lower() not in ['na'] and len(village.strip()) >= 3
    ]
    if not filtered_villages:
        return Response({"detail": "No valid villages found."}, status=status.HTTP_400_BAD_REQUEST)
    return Response(filtered_villages, status=status.HTTP_200_OK)
   
   
   
   
   
   
   
   
   
   
        
# to filter api
@api_view(['GET'])
def get_filtered_missing_persons(request):
    filters = Q()

    # Helper function to handle 'null' as a string
    def handle_null(param):
        if param == 'null':
            return None
        return param

    # State filter (Address related)
    state = handle_null(request.query_params.get('state', None))
    if state:
        filters &= Q(address__state=state)

    # District filter (Address related)
    district = handle_null(request.query_params.get('district', None))
    if district:
        filters &= Q(address__district=district)

    # City filter (Address related)
    city = handle_null(request.query_params.get('city', None))
    if city:
        filters &= Q(address__city=city)

    # Village filter (Address related)
    village = handle_null(request.query_params.get('village', None))
    if village:
        filters &= Q(address__village=village)

    # Gender filter
    gender = handle_null(request.query_params.get('gender', None))
    if gender:
        filters &= Q(gender=gender)

    # Blood Group filter
    blood_group = handle_null(request.query_params.get('blood_group', None))
    if blood_group:
        filters &= Q(blood_group=blood_group)

    # Marital Status filter
    marital_status = handle_null(request.query_params.get('marital', None))
    if marital_status:
        filters &= Q(marital_status=marital_status)

    # Police Station ID filter
    police_station_id = handle_null(request.query_params.get('policeStationId', None))
    if police_station_id is not None:  # Ensure it's not None before applying the filter
        filters &= Q(police_station_name_and_address__id=police_station_id)

    # Height Range filter
    height_range = handle_null(request.query_params.get('heightRange', None))
    if height_range:
        if height_range == '133-150':
            filters &= Q(height__gte=133, height__lte=150)
        elif height_range == '151-180':
            filters &= Q(height__gte=151, height__lte=180)
        elif height_range == 'Above 180':
            filters &= Q(height__gt=180)

    # Age Range filter
    age_range = handle_null(request.query_params.get('AgeRange', None))
    if age_range:
        if age_range == '0-18':
            filters &= Q(age__gte=0, age__lte=18)
        elif age_range == '18-30':
            filters &= Q(age__gte=18, age__lte=30)
        elif age_range == '30-50':
            filters &= Q(age__gte=30, age__lte=50)
        elif age_range == '50-70':
            filters &= Q(age__gte=50, age__lte=70)
        elif age_range == 'Above 70':
            filters &= Q(age__gt=70)
    
     # Handle date range filter
    start_date = handle_null(request.query_params.get('startDate', None))
    end_date = handle_null(request.query_params.get('endDate', None))

    if start_date:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            filters &= Q(missing_date__gte=start_date)
        except ValueError:
            return Response({'error': 'Invalid start date format'}, status=400)
    
    if end_date:
        try:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            filters &= Q(missing_date__lte=end_date)
        except ValueError:
            return Response({'error': 'Invalid end date format'}, status=400)


    # Apply filters and fetch data
    missing_persons = MissingPerson.objects.filter(filters)

    # Serialize the filtered data
    serializer = MissingPersonSerializer(missing_persons, many=True)
    response_data = []

    for person, person_data in zip(missing_persons, serializer.data):  # Iterate over both person and serialized data
        missing_location = person.missing_location
        home_address_location = person.address.location if person.address else None

        # Check if both missing location and home address location are present
        if missing_location and home_address_location:
            # Validate that the coordinates are not null or invalid
            if missing_location.x is not None and missing_location.y is not None and home_address_location.x is not None and home_address_location.y is not None:
                if missing_location.x == home_address_location.x and missing_location.y == home_address_location.y:
                    person_data['location_geometry'] = {
                        'type': 'Point',
                        'coordinates': [missing_location.x, missing_location.y]
                    }
                    person_data['location_metadata'] = "Person missed from home"
                else:
                    person_data['missing_location_geometry'] = {
                        'type': 'Point',
                        'coordinates': [missing_location.x, missing_location.y]
                    }
                    person_data['home_address_location_geometry'] = {
                        'type': 'Point',
                        'coordinates': [home_address_location.x, home_address_location.y]
                    }
            else:
                # If coordinates are invalid, set the geometries to None
                person_data['missing_location_geometry'] = None
                person_data['home_address_location_geometry'] = None
        else:
            # If either location is missing, set the geometries to None
            person_data['missing_location_geometry'] = None
            person_data['home_address_location_geometry'] = None

        response_data.append(person_data)

    return Response(response_data)

@api_view(['GET'])
def get_filtered_unidentified_persons(request):
    filters = Q()

    # Helper function to handle 'null' as a string or empty value
    def handle_null(param):
        if param == 'null' or param == '':
            return None
        return param
    
    # State filter (Address related)
    state = handle_null(request.query_params.get('state', None))
    if state:
        filters &= Q(address__state=state)

    # District filter (Address related)
    district = handle_null(request.query_params.get('district', None))
    if district:
        filters &= Q(address__district=district)

    # City filter (Address related)
    city = handle_null(request.query_params.get('city', None))
    if city:
        filters &= Q(address__city=city)

    # Village filter (Address related)
    village = handle_null(request.query_params.get('village', None))
    if village:
        filters &= Q(address__village=village)

    # Gender filter
    gender = handle_null(request.query_params.get('gender', None))
    if gender:
        filters &= Q(gender=gender)

    # Blood Group filter
    blood_group = handle_null(request.query_params.get('blood_group', None))
    if blood_group:
        filters &= Q(blood_group=blood_group)

    # Marital Status filter
    marital_status = handle_null(request.query_params.get('marital', None))
    if marital_status:
        filters &= Q(marital_status=marital_status)

    # Height Range filter
    height_range = handle_null(request.query_params.get('heightRange', None))
    if height_range:
        if height_range == '133-150':
            filters &= Q(height__gte=133, height__lte=150)
        elif height_range == '151-180':
            filters &= Q(height__gte=151, height__lte=180)
        elif height_range == 'Above 180':
            filters &= Q(height__gt=180)

    # Age Range filter
    age_range = handle_null(request.query_params.get('AgeRange', None))
    if age_range:
        if age_range == '0-18':
            filters &= Q(estimated_age__gte=0, estimated_age__lte=18)
        elif age_range == '18-30':
            filters &= Q(estimated_age__gte=19, estimated_age__lte=30)
        elif age_range == '30-50':
            filters &= Q(estimated_age__gte=31, estimated_age__lte=50)
        elif age_range == '50-70':
            filters &= Q(estimated_age__gte=51, estimated_age__lte=70)
        elif age_range == 'Above 70':
            filters &= Q(estimated_age__gt=70)
    
    start_date = handle_null(request.query_params.get('startDate', None))
    end_date = handle_null(request.query_params.get('endDate', None))

    if start_date:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            filters &= Q(last_seen_date__gte=start_date)
        except ValueError:
            return Response({'error': 'Invalid start date format'}, status=400)
    
    if end_date:
        try:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            filters &= Q(last_seen_date__lte=end_date)
        except ValueError:
            return Response({'error': 'Invalid end date format'}, status=400)

    # Apply filters and fetch data
    unidentified_persons = UnidentifiedMissingPerson.objects.filter(filters)

    # Serialize the filtered data
    serializer = UndefinedMissingpersonSerializer(unidentified_persons, many=True)
    
    # Prepare the response data with geometry added
    response_data = []
    for person, person_data in zip(unidentified_persons, serializer.data):  
        if person.address and person.address.location: 
            # Add geometry data if location exists
            person_data['geometry'] = {
                'type': 'Point',
                'coordinates': [person.address.location.x, person.address.location.y]  
            }
        else:
            # If no location exists, set geometry to None
            person_data['geometry'] = None
        response_data.append(person_data)

    # Return the response with the updated data
    return Response(response_data)

@api_view(['GET'])
def get_filtered_unidentified_bodies(request):
    filters = Q()

    # Helper function to handle 'null' as a string or empty value
    def handle_null(param):
        if param == 'null' or param == '':
            return None
        return param
    
    # State filter (Address related)
    state = handle_null(request.query_params.get('state', None))
    if state:
        filters &= Q(address__state=state)

    # District filter (Address related)
    district = handle_null(request.query_params.get('district', None))
    if district:
        filters &= Q(address__district=district)

    # City filter (Address related)
    city = handle_null(request.query_params.get('city', None))
    if city:
        filters &= Q(address__city=city)

    # Village filter (Address related)
    village = handle_null(request.query_params.get('village', None))
    if village:
        filters &= Q(address__village=village)

    # Gender filter
    gender = handle_null(request.query_params.get('gender', None))
    if gender:
        filters &= Q(gender=gender)

    # Blood Group filter
    blood_group = handle_null(request.query_params.get('blood_group', None))
    if blood_group:
        filters &= Q(blood_group=blood_group)

    # Marital Status filter
    marital_status = handle_null(request.query_params.get('marital', None))
    print(f"Received marital_status filter: {marital_status}")
    if marital_status:
        filters &= Q(marital_status=marital_status)


     # Height Range filter
    height_range = handle_null(request.query_params.get('heightRange', None))
    if height_range:
        if height_range == '133-150':
            filters &= Q(height__gte=133, height__lte=150)
        elif height_range == '151-180':
            filters &= Q(height__gte=151, height__lte=180)
        elif height_range == 'Above 180':
            filters &= Q(height__gt=180)

    # Age Range filter
    age_range = handle_null(request.query_params.get('AgeRange', None))
    if age_range:
        if age_range == '0-18':
            filters &= Q(estimated_age__gte=0, estimated_age__lte=18)
        elif age_range == '18-30':
            filters &= Q(estimated_age__gte=19, estimated_age__lte=30)
        elif age_range == '30-50':
            filters &= Q(estimated_age__gte=31, estimated_age__lte=50)
        elif age_range == '50-70':
            filters &= Q(estimated_age__gte=51, estimated_age__lte=70)
        elif age_range == 'Above 70':
            filters &= Q(estimated_age__gt=70)

    start_date = handle_null(request.query_params.get('startDate', None))
    end_date = handle_null(request.query_params.get('endDate', None))

    if start_date:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            filters &= Q(date_found__gte=start_date)
        except ValueError:
            return Response({'error': 'Invalid start date format'}, status=400)
    
    if end_date:
        try:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            filters &= Q(date_found__lte=end_date)
        except ValueError:
            return Response({'error': 'Invalid end date format'}, status=400)

    # Apply filters and fetch data
    unidentified_bodies = UnidentifiedBody.objects.filter(filters)

    # Serialize the filtered data
    serializer = UnidentifiedBodySerializer(unidentified_bodies, many=True)

    # Prepare the response data with geometry added
    response_data = []
    for body, body_data in zip(unidentified_bodies, serializer.data):  
        if body.address and body.address.location: 
            # Add geometry data if location exists
            body_data['geometry'] = {
                'type': 'Point',
                'coordinates': [body.address.location.x, body.address.location.y]  
            }
        else:
            # If no location exists, set geometry to None
            body_data['geometry'] = None
        response_data.append(body_data)

    # Return the response with the updated data
    return Response(response_data)


@api_view(['GET'])
def get_filtered_entities(request):
    filters = Q()

    # Helper function to handle 'null' as a string or empty value
    def handle_null(param):
        if param == 'null' or param == '':
            return None
        return param

    # Get the entity type parameter to determine which entity to filter
    entity_type = request.query_params.get('entity_type', None)

    if entity_type not in ['missing_person', 'unidentified_person', 'unidentified_body']:
        return Response({"error": "Invalid entity type"}, status=status.HTTP_400_BAD_REQUEST)

    # Common filters (Address related)
    state = handle_null(request.query_params.get('state', None))
    if state:
        filters &= Q(address__state=state)

    district = handle_null(request.query_params.get('district', None))
    if district:
        filters &= Q(address__district=district)

    city = handle_null(request.query_params.get('city', None))
    if city:
        filters &= Q(address__city=city)

    village = handle_null(request.query_params.get('village', None))
    if village:
        filters &= Q(address__village=village)

    gender = handle_null(request.query_params.get('gender', None))
    if gender:
        filters &= Q(gender=gender)

    blood_group = handle_null(request.query_params.get('blood_group', None))
    if blood_group:
        filters &= Q(blood_group=blood_group)

    marital_status = handle_null(request.query_params.get('marital_status', None))
    if marital_status:
        filters &= Q(marital_status=marital_status)

    # Height Range filter
    height_range = handle_null(request.query_params.get('heightRange', None))
    if height_range:
        if height_range == '133-150':
            filters &= Q(height__gte=133, height__lte=150)
        elif height_range == '151-180':
            filters &= Q(height__gte=151, height__lte=180)
        elif height_range == 'Above 180':
            filters &= Q(height__gt=180)

    # Age Range filter
    age_range = handle_null(request.query_params.get('AgeRange', None))
    if age_range:
        if age_range == '0-18':
            filters &= Q(estimated_age__gte=0, estimated_age__lte=18)
        elif age_range == '18-30':
            filters &= Q(estimated_age__gte=19, estimated_age__lte=30)
        elif age_range == '30-50':
            filters &= Q(estimated_age__gte=31, estimated_age__lte=50)
        elif age_range == '50-70':
            filters &= Q(estimated_age__gte=51, estimated_age__lte=70)
        elif age_range == 'Above 70':
            filters &= Q(estimated_age__gt=70)
            
    

    # Apply filters based on entity type
    if entity_type == 'missing_person':
        missing_persons = MissingPerson.objects.filter(filters)
        serializer = MissingPersonSerializer(missing_persons, many=True)
    elif entity_type == 'unidentified_person':
        unidentified_persons = UnidentifiedMissingPerson.objects.filter(filters)
        serializer = UndefinedMissingpersonSerializer(unidentified_persons, many=True)
    elif entity_type == 'unidentified_body':
        unidentified_bodies = UnidentifiedBody.objects.filter(filters)
        serializer = UnidentifiedBodySerializer(unidentified_bodies, many=True)

    # Prepare the response data with geolocation (latitude, longitude)
    response_data = []
    for entity, entity_data in zip(serializer.instance, serializer.data):
        if entity_type == 'missing_person':
            # Missing person entity type
            missing_location = entity.missing_location
            home_address_location = entity.address.location if entity.address else None
            if missing_location and home_address_location:
                # If both missing and home location are present
                if missing_location.x is not None and missing_location.y is not None and home_address_location.x is not None and home_address_location.y is not None:
                    entity_data['missing_location_geometry'] = {
                        'type': 'Point',
                        'coordinates': [missing_location.x, missing_location.y]
                    }
                    entity_data['home_address_location_geometry'] = {
                        'type': 'Point',
                        'coordinates': [home_address_location.x, home_address_location.y]
                    }
            else:
                # If no valid locations, set geometry to None
                entity_data['missing_location_geometry'] = None
                entity_data['home_address_location_geometry'] = None
        elif entity_type == 'unidentified_person':
            # Unidentified person entity type
            if entity.address and entity.address.location:
                entity_data['geometry'] = {
                    'type': 'Point',
                    'coordinates': [entity.address.location.x, entity.address.location.y]
                }
            else:
                entity_data['geometry'] = None
        elif entity_type == 'unidentified_body':
            # Unidentified body entity type
            if entity.address and entity.address.location:
                entity_data['geometry'] = {
                    'type': 'Point',
                    'coordinates': [entity.address.location.x, entity.address.location.y]
                }
            else:
                entity_data['geometry'] = None

        response_data.append(entity_data)

    return Response(response_data)




























