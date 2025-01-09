from datetime import datetime
import logging
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from django.db.models import Q
from django.core.cache import cache
from django.contrib.gis.geos import Point
from .pagination import paginate
from django.utils import timezone
from django.db import transaction
from django.utils.timezone import now
from .serializers import CaseReportSerializer, ChowkiSerializer, DivisionNestedSerializer, HospitalDivisionSerializer, HospitalSerializer, HospitalZoneSerializer, MatchSerializer, MissingPersonSerializer, PoliceStationNestedSerializer, UndefinedMissingpersonSerializer, UnidentifiedBodySerializer, VolunteerSerializer, ZoneSerializer
from rest_framework import status
from .models import BodyMatch, CaseReport, Chowki, Division, Hospital, HospitalDivision, HospitalZone, MatchRejection, MissingPerson, PoliceStation, PreviouslyMatched, ResolvedCase, UnidentifiedBody, UnidentifiedMissingPerson, Volunteer,Match, Zone
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.paginator import Paginator
from rest_framework.exceptions import NotFound

# for redis cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
from django.views.decorators.cache import cache_page
from django.core.cache import cache

CACHE_TTL = getattr(settings , 'CACHE_TTL',DEFAULT_TIMEOUT)

# api for the all persons to do crud operation
class MissingPersonAPIView(APIView):
    
    # def get(self, request, missing_person_id=None):
    #     try:
    #         if missing_person_id is not None:
    #             try:
    #                 missing_person = MissingPerson.objects.get(pk=missing_person_id, is_deleted=False)
    #                 serializer = MissingPersonSerializer(missing_person)
    #                 data = serializer.data

    #                 missing_location = missing_person.missing_location
    #                 home_address_location = missing_person.address.location if missing_person.address else None

    #                 # Check if both locations are the same
    #                 if missing_location and home_address_location:
    #                     if missing_location.x == home_address_location.x and missing_location.y == home_address_location.y:
    #                         # If they are the same, combine them with metadata
    #                         data['location_geometry'] = {
    #                             'type': 'Point',
    #                             'coordinates': [missing_location.x, missing_location.y]
    #                         }
    #                         data['location_metadata'] = "Person missed from home"
    #                     else:
    #                         # If different, return separate locations
    #                         data['missing_location_geometry'] = {
    #                             'type': 'Point',
    #                             'coordinates': [missing_location.x, missing_location.y]
    #                         }
    #                         data['home_address_location_geometry'] = {
    #                             'type': 'Point',
    #                             'coordinates': [home_address_location.x, home_address_location.y]
    #                         }
    #                 else:
    #                     data['missing_location_geometry'] = None
    #                     data['home_address_location_geometry'] = None

    #                 return Response(data)
    #             except MissingPerson.DoesNotExist:
    #                 return Response({"error": "Missing person not found"}, status=status.HTTP_404_NOT_FOUND)

    #         # If no missing_person_id is provided, handle search and pagination
    #         search_query = request.GET.get('search', '')
    #         if search_query:
    #             missing_persons = MissingPerson.objects.filter(is_deleted=False).filter(
    #                 Q(full_name__icontains=search_query) | 
    #                 Q(description__icontains=search_query)
    #             ).order_by('-id')
    #         else:
    #             missing_persons = MissingPerson.objects.filter(is_deleted=False).order_by('-id')

    #         # Pagination
    #         page_size = int(request.GET.get('page_size', 5))  
    #         paginator = Paginator(missing_persons, page_size)
    #         page_number = request.GET.get('page', 1)
    #         page_obj = paginator.get_page(page_number)

    #         serializer = MissingPersonSerializer(page_obj, many=True)
    #         response_data = []
            
    #         for person, person_data in zip(page_obj, serializer.data):  
    #             missing_location = person.missing_location
    #             home_address_location = person.address.location if person.address else None

    #             # Check if both locations are the same
    #             if missing_location and home_address_location:
    #                 if missing_location.x == home_address_location.x and missing_location.y == home_address_location.y:
    #                     # If they are the same, combine them with metadata
    #                     person_data['location_geometry'] = {
    #                         'type': 'Point',
    #                         'coordinates': [missing_location.x, missing_location.y]
    #                     }
    #                     person_data['location_metadata'] = "Person missed from home"
    #                 else:
    #                     # If different, return separate locations
    #                     person_data['missing_location_geometry'] = {
    #                         'type': 'Point',
    #                         'coordinates': [missing_location.x, missing_location.y]
    #                     }
    #                     person_data['home_address_location_geometry'] = {
    #                         'type': 'Point',
    #                         'coordinates': [home_address_location.x, home_address_location.y]
    #                     }
    #             else:
    #                 person_data['missing_location_geometry'] = None
    #                 person_data['home_address_location_geometry'] = None

    #             response_data.append(person_data)

    #         return Response({
    #             'data': response_data,
    #             'pagination': {
    #                 'total_pages': paginator.num_pages,
    #                 'current_page': page_obj.number,
    #                 'has_next': page_obj.has_next(),
    #                 'has_previous': page_obj.has_previous(),
    #                 'total_entries': paginator.count,
    #                 'page_size': page_size
    #             }
    #         })

    #     except Exception as e:
    #         return Response({'msg': 'Something went wrong', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



    def get(self, request, missing_person_id=None):
        try:
            if missing_person_id is not None:
                cache_key = f"missing_person_{missing_person_id}"
                data = cache.get(cache_key)

                if not data:  
                    try:
                        missing_person = MissingPerson.objects.get(pk=missing_person_id, is_deleted=False)
                        serializer = MissingPersonSerializer(missing_person)
                        data = serializer.data

                        missing_location = missing_person.missing_location
                        home_address_location = missing_person.address.location if missing_person.address else None

                        if missing_location and home_address_location:
                            if missing_location.x == home_address_location.x and missing_location.y == home_address_location.y:
                                data['location_geometry'] = {
                                    'type': 'Point',
                                    'coordinates': [missing_location.x, missing_location.y]
                                }
                                data['location_metadata'] = "Person missed from home"
                            else:
                                data['missing_location_geometry'] = {
                                    'type': 'Point',
                                    'coordinates': [missing_location.x, missing_location.y]
                                }
                                data['home_address_location_geometry'] = {
                                    'type': 'Point',
                                    'coordinates': [home_address_location.x, home_address_location.y]
                                }
                        else:
                            data['missing_location_geometry'] = None
                            data['home_address_location_geometry'] = None

                    except MissingPerson.DoesNotExist:
                        return Response({"error": "Missing person not found"}, status=status.HTTP_404_NOT_FOUND)

                    cache.set(cache_key, data, timeout=settings.CACHE_TTL)

                return Response(data)

            # Get query parameters
            search_query = request.GET.get('search', '')
            full_name = request.GET.get('full_name', '')
            city = request.GET.get('city', '')
            state = request.GET.get('state', '')
            district = request.GET.get('district', '')
            year = request.GET.get('year', '')
            month = request.GET.get('month', '')
            caste = request.GET.get('caste', '')
            age = request.GET.get('age', '')
            marital_status = request.GET.get('marital_status', '')
            blood_group = request.GET.get('blood_group', '')
            height = request.GET.get('height', '')
            page_size = int(request.GET.get('page_size', 5))
            page_number = request.GET.get('page', 1)

            # Construct query filters based on provided parameters
            filters = Q(is_deleted=False)  

            if search_query:
                filters &= Q(full_name__icontains=search_query) | Q(description__icontains=search_query)
            if full_name:
                filters &= Q(full_name__icontains=full_name)
            if city:
                filters &= Q(address__city__icontains=city)
            if state:
                filters &= Q(address__state__icontains=state)
            if district:
                filters &= Q(address__district__icontains=district)
            if year:
                filters &= Q(missing_date__year=year)
            if month:
                filters &= Q(missing_date__month=datetime.strptime(month, '%B').month)
            if caste:
                filters &= Q(caste__icontains=caste)
            if age:
                filters &= Q(age=age)
            if marital_status:
                filters &= Q(marital_status__icontains=marital_status)
            if blood_group:
                filters &= Q(blood_group__icontains=blood_group)
            if height:
                filters &= Q(height=height)

            # Fetch missing persons based on filters
            missing_persons = MissingPerson.objects.filter(filters).order_by('-id')

            # Pagination
            paginator = Paginator(missing_persons, page_size)
            page_obj = paginator.get_page(page_number)

            # Serialize data
            serializer = MissingPersonSerializer(page_obj, many=True)
            response_data = []

            for person, person_data in zip(page_obj, serializer.data):  
                missing_location = person.missing_location
                home_address_location = person.address.location if person.address else None

                if missing_location and home_address_location:
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
                    person_data['missing_location_geometry'] = None
                    person_data['home_address_location_geometry'] = None

                response_data.append(person_data)

            data = {
                'data': response_data,
                'pagination': {
                    'total_pages': paginator.num_pages,
                    'current_page': page_obj.number,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous(),
                    'total_entries': paginator.count,
                    'page_size': page_size
                }
            }

            # Cache the result for 1 minute
            cache.set(f"missing_person_search_{search_query}_page_{page_number}", data, timeout=settings.CACHE_TTL)

            return Response(data)

        except Exception as e:
            return Response({'msg': 'Something went wrong', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request):
        try:
            serializer = MissingPersonSerializer(data=request.data)
            if serializer.is_valid():
                try:
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                except Exception as e:
                    return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, missing_person_id):
        try:
            missing_person = MissingPerson.objects.get(pk=missing_person_id, is_deleted=False)
            serializer = MissingPersonSerializer(missing_person, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except MissingPerson.DoesNotExist:
            return Response({"error": "Missing person not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, missing_person_id):
        try:
            missing_person = MissingPerson.objects.get(pk=missing_person_id, is_deleted=False)
            missing_person.is_deleted = True
            missing_person.save()
            cache.clear() 
            return Response(status=status.HTTP_204_NO_CONTENT)
        except MissingPerson.DoesNotExist:
            return Response({"error": "Missing person not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UnidentifiedMissingperson(APIView):
    # def get(self, request, undefined_missing_person_id=None):
    #     if undefined_missing_person_id is not None:
    #         try:
    #             undefined_missing_person = UnidentifiedMissingPerson.objects.get(pk=undefined_missing_person_id, is_deleted=False)
    #             serializer = UndefinedMissingpersonSerializer(undefined_missing_person)
    #             data = serializer.data

    #             if undefined_missing_person.address and undefined_missing_person.address.location:
    #                 data['location_geometry'] = {
    #                     'type': 'Point',
    #                     'coordinates': [undefined_missing_person.address.location.x, undefined_missing_person.address.location.y]
    #                 }
    #             else:
    #                 data['location_geometry'] = None

    #             return Response(data)

    #         except UnidentifiedMissingPerson.DoesNotExist:
    #             return Response({"error": "Undefined missing person not found"}, status=status.HTTP_404_NOT_FOUND)
    #         except Exception as e:
    #             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    #     try:
    #         undefined_missing_persons = UnidentifiedMissingPerson.objects.filter(is_deleted=False).order_by('-id')
    #         page_size = int(request.GET.get('page_size', 5))  
    #         page_number = request.GET.get('page', 1)  
    #         paginator = Paginator(undefined_missing_persons, page_size)
    #         page_obj = paginator.get_page(page_number)

    #         serializer = UndefinedMissingpersonSerializer(page_obj, many=True)
    #         response_data = []
    #         for person, person_data in zip(page_obj, serializer.data):  
    #             if person.address and person.address.location: 
    #                 person_data['geometry'] = {
    #                     'type': 'Point',
    #                     'coordinates': [person.address.location.x, person.address.location.y]  
    #                 }
    #             else:
    #                 person_data['geometry'] = None 
    #             response_data.append(person_data)

    #         return Response({
    #             'data': response_data,
    #             'pagination': {
    #                 'total_pages': paginator.num_pages,
    #                 'current_page': page_obj.number,
    #                 'has_next': page_obj.has_next(),
    #                 'has_previous': page_obj.has_previous(),
    #                 'total_entries': paginator.count,
    #                 'page_size': page_size
    #             }
    #         })

    #     except Exception as e:
    #         return Response({'msg': 'Something went wrong', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, undefined_missing_person_id=None):
            # If a specific person ID is provided, return the details of that person
            if undefined_missing_person_id is not None:
                try:
                    undefined_missing_person = UnidentifiedMissingPerson.objects.get(pk=undefined_missing_person_id, is_deleted=False)
                    serializer = UndefinedMissingpersonSerializer(undefined_missing_person)
                    data = serializer.data

                    # Add geometry if address location exists
                    if undefined_missing_person.address and undefined_missing_person.address.location:
                        data['location_geometry'] = {
                            'type': 'Point',
                            'coordinates': [undefined_missing_person.address.location.x, undefined_missing_person.address.location.y]
                        }
                    else:
                        data['location_geometry'] = None

                    return Response(data)

                except UnidentifiedMissingPerson.DoesNotExist:
                    return Response({"error": "Undefined missing person not found"}, status=status.HTTP_404_NOT_FOUND)
                except Exception as e:
                    return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            try:
                # Get filters from request parameters
                search_query = request.GET.get('search', '')
                gender = request.GET.get('gender', 'all')
                city = request.GET.get('city', 'all')
                state = request.GET.get('state', 'all')
                district = request.GET.get('district', 'all')
                year = request.GET.get('year', '')
                month = request.GET.get('month', '')
                caste = request.GET.get('caste', 'all')
                age = request.GET.get('age', '')
                marital_status = request.GET.get('marital_status', 'all')
                blood_group = request.GET.get('blood_group', 'all')
                height = request.GET.get('height', '')
                page_size = int(request.GET.get('page_size', 5))  # Default page size
                page_number = int(request.GET.get('page', 1))  # Default page number

                # Construct query filters based on provided parameters
                filters = Q(is_deleted=False)  # Ensure we're not getting deleted persons

                if search_query:
                    filters &= (Q(full_name__icontains=search_query) | Q(description__icontains=search_query))
                
                # Apply filters if specified, skipping 'all' values
                if gender and gender != 'all':
                    filters &= Q(gender=gender)
                if city and city != 'all':
                    filters &= Q(address__city__icontains=city)
                if state and state != 'all':
                    filters &= Q(address__state__icontains=state)
                if district and district != 'all':
                    filters &= Q(address__district__icontains=district)
                if year:
                    filters &= Q(last_seen_datee__year=year)
                if month:
                    # Convert month name to its numerical value
                    filters &= Q(last_seen_date__month=datetime.strptime(month, '%B').month)
                if caste and caste != 'all':
                    filters &= Q(caste__icontains=caste)
                if age:
                    filters &= Q(estimated_age=age)
                if marital_status and marital_status != 'all':
                    filters &= Q(marital_status__icontains=marital_status)
                if blood_group and blood_group != 'all':
                    filters &= Q(blood_group__icontains=blood_group)
                if height:
                    filters &= Q(height=height)

                # Fetch filtered missing persons
                unidentified_missing_persons = UnidentifiedMissingPerson.objects.filter(filters).order_by('-id')

                # Pagination
                paginator = Paginator(unidentified_missing_persons, page_size)
                page_obj = paginator.get_page(page_number)

                # Serialize data
                serializer = UndefinedMissingpersonSerializer(page_obj, many=True)
                response_data = []

                for person, person_data in zip(page_obj, serializer.data):  
                    # Add location geometry if available
                    if person.address and person.address.location: 
                        person_data['geometry'] = {
                            'type': 'Point',
                            'coordinates': [person.address.location.x, person.address.location.y]  
                        }
                    else:
                        person_data['geometry'] = None

                    response_data.append(person_data)

                # Prepare pagination data
                data = {
                    'data': response_data,
                    'pagination': {
                        'total_pages': paginator.num_pages,
                        'current_page': page_obj.number,
                        'has_next': page_obj.has_next(),
                        'has_previous': page_obj.has_previous(),
                        'total_entries': paginator.count,
                        'page_size': page_size
                    }
                }

                # Cache the result for 1 minute
                cache_key = f"unidentified_missing_persons_{page_number}_filters_{str(filters)}"
                cache.set(cache_key, data, timeout=settings.CACHE_TTL)

                return Response(data)

            except Exception as e:
                return Response({'msg': 'Something went wrong', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request):
        try:
            serializer = UndefinedMissingpersonSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, undefined_missing_person_id):
        try:
            undefined_missing_person = UnidentifiedMissingPerson.objects.get(pk=undefined_missing_person_id, is_deleted=False)
            serializer = UndefinedMissingpersonSerializer(undefined_missing_person, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UnidentifiedMissingPerson.DoesNotExist:
            return Response({"error": "Undefined missing person not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, undefined_missing_person_id):
        try:
            undefined_missing_person = UnidentifiedMissingPerson.objects.get(pk=undefined_missing_person_id, is_deleted=False)
            undefined_missing_person.is_deleted = True
            undefined_missing_person.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UnidentifiedMissingPerson.DoesNotExist:
            return Response({"error": "Undefined missing person not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UnidentifiedBodyAPIView(APIView):
    # def get(self, request, unidentified_body_id=None):
    #     if unidentified_body_id is not None:
    #         try:
    #             unidentified_body = UnidentifiedBody.objects.get(pk=unidentified_body_id, is_deleted=False)
    #             serializer = UnidentifiedBodySerializer(unidentified_body)
    #             data = serializer.data

    #             if unidentified_body.address and unidentified_body.address.location:
    #                 data['location_geometry'] = {
    #                     'type': 'Point',
    #                     'coordinates': [unidentified_body.address.location.x, unidentified_body.address.location.y]
    #                 }
    #             else:
    #                 data['location_geometry'] = None

    #             return Response(data)

    #         except UnidentifiedBody.DoesNotExist:
    #             return Response({"error": "Unidentified body not found"}, status=status.HTTP_404_NOT_FOUND)
    #         except Exception as e:
    #             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    #     try:
    #         unidentified_bodies = UnidentifiedBody.objects.filter(is_deleted=False).order_by('-id')
    #         page_size = int(request.GET.get('page_size', 5))  
    #         page_number = request.GET.get('page', 1)  
    #         paginator = Paginator(unidentified_bodies, page_size)
    #         page_obj = paginator.get_page(page_number)

    #         serializer = UnidentifiedBodySerializer(page_obj, many=True)
    #         response_data = []
    #         for body, body_data in zip(page_obj, serializer.data):  
    #             if body.address and body.address.location: 
    #                 body_data['geometry'] = {
    #                     'type': 'Point',
    #                     'coordinates': [body.address.location.x, body.address.location.y]  
    #                 }
    #             else:
    #                 body_data['geometry'] = None 

    #             response_data.append(body_data)

    #         return Response({
    #             'data': response_data,
    #             'pagination': {
    #                 'total_pages': paginator.num_pages,
    #                 'current_page': page_obj.number,
    #                 'has_next': page_obj.has_next(),
    #                 'has_previous': page_obj.has_previous(),
    #                 'total_entries': paginator.count,
    #                 'page_size': page_size
    #             }
    #         })

    #     except Exception as e:
    #         return Response({'msg': 'Something went wrong', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, unidentified_body_id=None):
    # If a specific body ID is provided, return the details of that body
        if unidentified_body_id is not None:
            try:
                unidentified_body = UnidentifiedBody.objects.get(pk=unidentified_body_id, is_deleted=False)
                serializer = UnidentifiedBodySerializer(unidentified_body)
                data = serializer.data

                # Add geometry if address location exists
                if unidentified_body.address and unidentified_body.address.location:
                    data['location_geometry'] = {
                        'type': 'Point',
                        'coordinates': [unidentified_body.address.location.x, unidentified_body.address.location.y]
                    }
                else:
                    data['location_geometry'] = None

                return Response(data)

            except UnidentifiedBody.DoesNotExist:
                return Response({"error": "Unidentified body not found"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Get filters from request parameters
            search_query = request.GET.get('search', '')
            full_name =request.GET.get('full_name','')
            gender = request.GET.get('gender', 'all')
            city = request.GET.get('city', 'all')
            state = request.GET.get('state', 'all')
            district = request.GET.get('district', 'all')
            year = request.GET.get('year', '')
            month = request.GET.get('month', '')
            caste = request.GET.get('caste', 'all')
            age = request.GET.get('age', '')
            marital_status = request.GET.get('marital_status', 'all')
            blood_group = request.GET.get('blood_group', 'all')
            height = request.GET.get('height', '')
            page_size = int(request.GET.get('page_size', 5))  # Default page size
            page_number = int(request.GET.get('page', 1))  # Default page number

            filters = Q(is_deleted=False)  

            if search_query:
                filters &= Q(full_name__icontains=search_query) | Q(description__icontains=search_query)
            if full_name:
                filters &= Q(full_name__icontains=full_name)
            if gender and gender != 'all':
                filters &= Q(gender=gender)
            if city and city != 'all':
                filters &= Q(address__city__icontains=city)
            if state and state != 'all':
                filters &= Q(address__state__icontains=state)
            if district and district != 'all':
                filters &= Q(address__district__icontains=district)
            if year:
                filters &= Q(date_found__year=year)
            if month:
                filters &= Q(date_found__month=datetime.strptime(month, '%B').month)
            if caste and caste != 'all':
                filters &= Q(caste__icontains=caste)
            if age:
                filters &= Q(estimated_age=age)
            if marital_status and marital_status != 'all':
                filters &= Q(marital_status__icontains=marital_status)
            if blood_group and blood_group != 'all':
                filters &= Q(blood_group__icontains=blood_group)
            if height:
                filters &= Q(height=height)

            # Fetch filtered unidentified bodies
            unidentified_bodies = UnidentifiedBody.objects.filter(filters).order_by('-id')

            # Pagination
            paginator = Paginator(unidentified_bodies, page_size)
            page_obj = paginator.get_page(page_number)

            # Serialize data
            serializer = UnidentifiedBodySerializer(page_obj, many=True)
            response_data = []

            for body, body_data in zip(page_obj, serializer.data):
                # Add location geometry if available
                if body.address and body.address.location:
                    body_data['geometry'] = {
                        'type': 'Point',
                        'coordinates': [body.address.location.x, body.address.location.y]
                    }
                else:
                    body_data['geometry'] = None

                response_data.append(body_data)

            # Prepare pagination data
            data = {
                'data': response_data,
                'pagination': {
                    'total_pages': paginator.num_pages,
                    'current_page': page_obj.number,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous(),
                    'total_entries': paginator.count,
                    'page_size': page_size
                }
            }

            return Response(data)

        except Exception as e:
            return Response({'msg': 'Something went wrong', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
    def post(self, request):
        try:
            serializer = UnidentifiedBodySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, unidentified_body_id):
        try:
            unidentified_body = UnidentifiedBody.objects.get(pk=unidentified_body_id, is_deleted=False)
            serializer = UnidentifiedBodySerializer(unidentified_body, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist:
            return Response({"error": "Unidentified body not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, unidentified_body_id):
        try:
            unidentified_body = UnidentifiedBody.objects.get(pk=unidentified_body_id, is_deleted=False)
            unidentified_body.is_deleted = True
            unidentified_body.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "Unidentified body not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VolunteerAPIView(APIView):

    def get(self, request, volunteer_id=None):
        if volunteer_id is not None:
            try:
                volunteer = Volunteer.objects.get(pk=volunteer_id, is_deleted=False)
                serializer = VolunteerSerializer(volunteer)

                # Add the geometry point if the volunteer has an address with a location
                if volunteer.address and volunteer.address.location:
                    data = serializer.data
                    data['geometry'] = {
                        'type': 'Point',
                        'coordinates': [volunteer.address.location.x, volunteer.address.location.y]
                    }
                    return Response(data)
                else:
                    # If no location, set the geometry to None
                    data = serializer.data
                    data['geometry'] = None
                    return Response(data)

            except Volunteer.DoesNotExist:
                return Response({"error": "Volunteer not found"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            volunteers = Volunteer.objects.filter(is_deleted=False).order_by('-id')
            page_size = int(request.GET.get('page_size', 5))
            page_number = request.GET.get('page', 1)
            paginator = Paginator(volunteers, page_size)
            page_obj = paginator.get_page(page_number)
            serializer = VolunteerSerializer(page_obj, many=True)

            response_data = []
            for volunteer, volunteer_data in zip(page_obj, serializer.data):
                # Add the geometry point if the volunteer has an address with a location
                if volunteer.address and volunteer.address.location:
                    volunteer_data['geometry'] = {
                        'type': 'Point',
                        'coordinates': [volunteer.address.location.x, volunteer.address.location.y]
                    }
                else:
                    volunteer_data['geometry'] = None

                response_data.append(volunteer_data)

            return Response({
                'data': response_data,
                'pagination': {
                    'total_pages': paginator.num_pages,
                    'current_page': page_obj.number,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous(),
                    'total_entries': paginator.count,
                    'page_size': page_size
                }
            })

        except Exception as e:
            return Response({'msg': 'Something went wrong', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = VolunteerSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, volunteer_id):
        try:
            volunteer = Volunteer.objects.get(pk=volunteer_id, is_deleted=False)
            serializer = VolunteerSerializer(volunteer, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist:
            return Response({"error": "Volunteer not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, volunteer_id):
        try:
            volunteer = Volunteer.objects.get(pk=volunteer_id, is_deleted=False)
            volunteer.is_deleted = True
            volunteer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "Volunteer not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# api to search the matching
class SearchAllMatches(APIView):
    
    def is_match_with_undefined_missing_person(self, missing_person, UndefinedMissingPerson):
        match_score = 0
        total_checks = 0

        # 1. Full Name - Exact/Partial Match
        if missing_person.full_name and UndefinedMissingPerson.full_name:
            total_checks += 1
            if missing_person.full_name.lower() == UndefinedMissingPerson.full_name.lower():
                match_score += 1  # Exact match
            elif missing_person.full_name.lower() in UndefinedMissingPerson.full_name.lower() or UndefinedMissingPerson.full_name.lower() in missing_person.full_name.lower():
                match_score += 0.5  # Partial match

        # 2. Age - Approximate Match
        if missing_person.age is not None and UndefinedMissingPerson.estimated_age is not None:
            total_checks += 1
            if abs(missing_person.age - UndefinedMissingPerson.estimated_age) <= 5:  # Allow age range ±5
                match_score += 1

        # 3. Gender - Exact Match
        if missing_person.gender and UndefinedMissingPerson.gender:
            total_checks += 1
            if missing_person.gender == UndefinedMissingPerson.gender:
                match_score += 1

        # 4. Height - Approximate Match
        if missing_person.height and UndefinedMissingPerson.height:
            total_checks += 1
            if abs(missing_person.height - UndefinedMissingPerson.height) <= 5:  # Allow height range ±5 cm
                match_score += 1

        # 5. Weight - Approximate Match
        if missing_person.weight and UndefinedMissingPerson.weight:
            total_checks += 1
            if abs(missing_person.weight - UndefinedMissingPerson.weight) <= 5:  # Allow weight range ±5 kg
                match_score += 1

        # 6. Complexion - Exact Match
        if missing_person.complexion and UndefinedMissingPerson.complexion:
            total_checks += 1
            if missing_person.complexion.lower() == UndefinedMissingPerson.complexion.lower():
                match_score += 1

        # 7. Hair Color - Exact Match
        if missing_person.hair_color and UndefinedMissingPerson.hair_color:
            total_checks += 1
            if missing_person.hair_color.lower() == UndefinedMissingPerson.hair_color.lower():
                match_score += 1

        # 8. Hair Type - Exact Match
        if missing_person.hair_type and UndefinedMissingPerson.hair_type:
            total_checks += 1
            if missing_person.hair_type.lower() == UndefinedMissingPerson.hair_type.lower():
                match_score += 1

        # 9. Eye Color - Exact Match
        if missing_person.eye_color and UndefinedMissingPerson.eye_color:
            total_checks += 1
            if missing_person.eye_color.lower() == UndefinedMissingPerson.eye_color.lower():
                match_score += 1

        # 10. Birth Mark - Exact Match
        if missing_person.birth_mark and UndefinedMissingPerson.birth_mark:
            total_checks += 1
            if missing_person.birth_mark.lower() == UndefinedMissingPerson.birth_mark.lower():
                match_score += 1

        # 11. Other Distinctive Marks - Exact Match
        if missing_person.distinctive_mark and UndefinedMissingPerson.other_distinctive_mark:
            total_checks += 1
            if missing_person.distinctive_mark.lower() == UndefinedMissingPerson.other_distinctive_mark.lower():
                match_score += 1

        # 12. Last Location of Missing Person vs Location Found - Geographic Proximity
        if missing_person.last_seen_location and UndefinedMissingPerson.last_seen_details:
            total_checks += 1
            if missing_person.last_seen_location.lower() == UndefinedMissingPerson.last_seen_details.lower():
                match_score += 1

        # 13. Caste - Exact Match
        if missing_person.caste and UndefinedMissingPerson.caste:
            total_checks += 1
            if missing_person.caste.lower() == UndefinedMissingPerson.caste.lower():
                match_score += 1

        # 14. photo - Exact Match
        # if missing_person.photo_upload and UndefinedMissingPerson.photo_upload:
        #     total_checks += 1
        #     image1_path = str(missing_person.photo_upload.path)
        #     image2_path = str(UndefinedMissingPerson.photo_upload.path)

        #     if os.path.exists(image1_path) and os.path.exists(image2_path):
        #         if is_face_match(image1_path, image2_path):
        #             match_score += 1

        # 15. Identification Details - Direct Verification (e.g., Aadhar, PAN)
        if missing_person.identification_card_no and UndefinedMissingPerson.identification_details:
            total_checks += 1
            if missing_person.identification_card_no == UndefinedMissingPerson.identification_details:
                match_score += 1
        
        # if missing_person.Condition and UndefinedMissingPerson.condition_at_discovery:
        #     total_checks += 1
        #     if missing_person.Condition == UndefinedMissingPerson.condition_at_discovery:
        #         match_score += 1

        # Match percentage
        match_percentage = (match_score / total_checks) * 100 if total_checks > 0 else 0
        match_percentage = round(match_percentage, 2)
        return match_percentage >= 50, match_percentage

    def is_match_with_unidentified_body(self, missing_person, UnidentifiedBody):
        match_score = 0
        total_checks = 0

        # 1. Full Name - Exact/Partial Match
        if missing_person.full_name and UnidentifiedBody.full_name:
            total_checks += 1
            if missing_person.full_name.lower() == UnidentifiedBody.full_name.lower():
                match_score += 1  # Exact match
            elif missing_person.full_name.lower() in UnidentifiedBody.full_name.lower() or UnidentifiedBody.full_name.lower() in missing_person.full_name.lower():
                match_score += 0.5  # Partial match

        # 2. Age - Approximate Match
        if missing_person.age is not None and UnidentifiedBody.estimated_age is not None:
            total_checks += 1
            if abs(missing_person.age - UnidentifiedBody.estimated_age) <= 5:  # Allow age range ±5
                match_score += 1

        # 3. Gender - Exact Match
        if missing_person.gender and UnidentifiedBody.gender:
            total_checks += 1
            if missing_person.gender == UnidentifiedBody.gender:
                match_score += 1

        # 4. Height - Approximate Match
        if missing_person.height and UnidentifiedBody.height:
            total_checks += 1
            if abs(missing_person.height - UnidentifiedBody.height) <= 5:  # Allow height range ±5 cm
                match_score += 1

        # 5. Weight - Approximate Match
        if missing_person.weight and UnidentifiedBody.weight:
            total_checks += 1
            if abs(missing_person.weight - UnidentifiedBody.weight) <= 5:  # Allow weight range ±5 kg
                match_score += 1

        # 6. Complexion - Exact Match
        if missing_person.complexion and UnidentifiedBody.complexion:
            total_checks += 1
            if missing_person.complexion.lower() == UnidentifiedBody.complexion.lower():
                match_score += 1

        # 7. Hair Color - Exact Match
        if missing_person.hair_color and UnidentifiedBody.hair_color:
            total_checks += 1
            if missing_person.hair_color.lower() == UnidentifiedBody.hair_color.lower():
                match_score += 1

        # 8. Hair Type - Exact Match
        if missing_person.hair_type and UnidentifiedBody.hair_type:
            total_checks += 1
            if missing_person.hair_type.lower() == UnidentifiedBody.hair_type.lower():
                match_score += 1

        # 9. Eye Color - Exact Match
        if missing_person.eye_color and UnidentifiedBody.eye_color:
            total_checks += 1
            if missing_person.eye_color.lower() == UnidentifiedBody.eye_color.lower():
                match_score += 1

        # 10. Birth Mark - Exact Match
        if missing_person.birth_mark and UnidentifiedBody.birth_mark:
            total_checks += 1
            if missing_person.birth_mark.lower() == UnidentifiedBody.birth_mark.lower():
                match_score += 1

        # 11. Other Distinctive Marks - Exact Match
        if missing_person.distinctive_mark and UnidentifiedBody.other_distinctive_mark:
            total_checks += 1
            if missing_person.distinctive_mark.lower() == UnidentifiedBody.other_distinctive_mark.lower():
                match_score += 1

        # 12. Last Location of Missing Person vs Location Found - Geographic Proximity
        if missing_person.last_seen_location and UnidentifiedBody.body_seen_details:
            total_checks += 1
            if missing_person.last_seen_location.lower() == UnidentifiedBody.body_seen_details.lower():
                match_score += 1


        # 14. Photo Upload - Visual Match (optional, requires external visual comparison)
        if missing_person.photo_upload and UnidentifiedBody.body_photo_upload:
            total_checks += 1
            if missing_person.photo_upload == UnidentifiedBody.body_photo_upload:
                match_score += 1    

        # Match percentage
        match_percentage = (match_score / total_checks) * 100 if total_checks > 0 else 0
        match_percentage = round(match_percentage, 2)
        return match_percentage >= 50, match_percentage
    
    # def get(self, request):
    #     name = request.query_params.get('full_name', None)
    #     if not name:
    #         return Response({'error': 'full_name parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    #     try:
    #         missing_person = MissingPerson.objects.get(full_name__iexact=name, is_deleted=False)
    #     except MissingPerson.DoesNotExist:
    #         return Response({'error': 'Missing person not found'}, status=status.HTTP_404_NOT_FOUND)

    #     # Increment the rematch attempt count
    #     missing_person.rematch_attempt = (missing_person.rematch_attempt or 0) + 1
    #     missing_person.save()

    #     # Initialize lists for matched data
    #     newly_matched = []
    #     previously_matched = []
    #     previously_rejected = []

    #     # Serialize the missing person data
    #     missing_person_data = MissingPersonSerializer(missing_person).data

    #     # Fetch existing matches for this missing person (previously matched)
    #     existing_matches = Match.objects.filter(missing_person=missing_person, is_rejected=False)
        
    #     for match in existing_matches:
    #         if match.undefined_missing_person:
    #             matched_person_data = UndefinedMissingpersonSerializer(match.undefined_missing_person).data
    #         else:
    #             matched_person_data = UnidentifiedBodySerializer(match.unidentified_body).data

    #         match_data = {
    #             "id": match.id,
    #             "match_id": match.match_id,
    #             "matched_entity": matched_person_data,  # Full matched person data
    #             "match_percentage": match.match_percentage
    #         }
    #         previously_matched.append(match_data)   

    #     # Fetch previously rejected matches for this missing person (previously rejected)
    #     rejected_matches_qs = MatchRejection.objects.filter(missing_person=missing_person)
    #     rejected_undefined_ids = rejected_matches_qs.values_list('undefined_missing_person_id', flat=True)
    #     rejected_body_ids = rejected_matches_qs.values_list('unidentified_body_id', flat=True)
    #     missing_person_serializer = MissingPersonSerializer(missing_person)

    #     for rejection in rejected_matches_qs:
    #         match_percentage = rejection.matched_percentage
    #         match_id = rejection.MATCH_id if rejection.MATCH_id else "No match ID"
            
    #         if rejection.undefined_missing_person:
    #             rejected_data = {
    #                 "Matched_With": "Unidentified Person",
    #                 "missing_person_details": missing_person_serializer.data,
    #                 "id": rejection.undefined_missing_person.id,
    #                 "match_id": match_id,
    #                 "name": rejection.undefined_missing_person.full_name,
    #                 "match_percentage": match_percentage,
    #                 "person_details": UndefinedMissingpersonSerializer(rejection.undefined_missing_person).data  # Full details of rejected person
    #             }
    #             previously_rejected.append(rejected_data)
                
              
    #         elif rejection.unidentified_body:
    #             rejected_data = {
    #                 "Matched_With": "Unidentified Body",
    #                 "missing_person_details": missing_person_serializer.data,
    #                 "id": rejection.unidentified_body.id,
    #                 "match_id": match_id,
    #                 "name": rejection.unidentified_body.full_name,
    #                 "match_percentage": match_percentage,
    #                 "person_details": UnidentifiedBodySerializer(rejection.unidentified_body).data  # Full details of rejected body
    #             }
                
    #             previously_rejected.append(rejected_data)

    #     # Check for potential new matches with UndefinedMissingPersons and UnidentifiedBodies
    #     undefined_missing_persons = UnidentifiedMissingPerson.objects.filter(is_deleted=False).exclude(id__in=rejected_undefined_ids)
    #     unidentified_bodies = UnidentifiedBody.objects.filter(is_deleted=False).exclude(id__in=rejected_body_ids)

    #     # Check for new matches with UndefinedMissingPersons
    #     for undefined_person in undefined_missing_persons:
    #         match_percentage = self.is_match_with_undefined_missing_person(missing_person, undefined_person)[1]
    #         if match_percentage > 50:
    #             match_id = f"{missing_person.full_name}-{match_percentage}"  # Modify match_id generation as needed
    #             if not Match.objects.filter(match_id=match_id).exists():
    #                 try:
    #                     # Create a new match
    #                     match = Match(
    #                         missing_person=missing_person,
    #                         undefined_missing_person=undefined_person,
    #                         match_percentage=match_percentage,
    #                         match_id=match_id
    #                     )
    #                     match.save()
    #                     newly_matched_data = {
    #                         "match_id": match.match_id,
    #                         "matched_entity": UndefinedMissingpersonSerializer(undefined_person).data,  # Full undefined missing person data
    #                         "match_percentage": match.match_percentage
    #                     }
    #                     newly_matched.append(newly_matched_data)
    #                 except IntegrityError:
    #                     # If duplicate match_id exists, handle the exception
    #                     continue  # You can log this exception or handle it differently

    #     # Check for new matches with UnidentifiedBodies
    #     for unidentified_body in unidentified_bodies:
    #         match_percentage = self.is_match_with_unidentified_body(missing_person, unidentified_body)[1]
    #         if match_percentage > 50:
    #             match_id = f"{missing_person.full_name}-{match_percentage}"  # Modify match_id generation as needed
    #             if not Match.objects.filter(match_id=match_id).exists():
    #                 try:
    #                     # Create a new match
    #                     match = Match(
    #                         missing_person=missing_person,
    #                         unidentified_body=unidentified_body,
    #                         match_percentage=match_percentage,
    #                         match_id=match_id
    #                     )
    #                     match.save()
    #                     newly_matched_data = {
    #                         "match_id": match.match_id,
    #                         "matched_entity": UnidentifiedBodySerializer(unidentified_body).data,  # Full unidentified body data
    #                         "match_percentage": match.match_percentage
    #                     }
    #                     newly_matched.append(newly_matched_data)
    #                 except IntegrityError:
    #                     # If duplicate match_id exists, handle the exception
    #                     continue  # You can log this exception or handle it differently

    #     # Prepare the response data
    #     response_data = {
    #         "missing_person": missing_person_data,  # Full data of the missing person
    #         "rematch_attempt": missing_person.rematch_attempt,  # Rematch count
    #         "newly_matched": newly_matched if newly_matched else "No newly matched persons found.",
    #         "previously_matched": previously_matched if previously_matched else "No previously matched persons found.",
    #         "previously_rejected": previously_rejected if previously_rejected else "No previously rejected persons found."
    #     }

    #     return Response(response_data, status=status.HTTP_200_OK)
    
    def get(self, request):
        name = request.query_params.get('full_name', None)
        if not name:
            return Response({'error': 'full_name parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            missing_person = MissingPerson.objects.get(full_name__iexact=name, is_deleted=False)
        except MissingPerson.DoesNotExist:
            return Response({'error': 'Missing person not found'}, status=status.HTTP_404_NOT_FOUND)

        # Increment the rematch attempt count
        missing_person.rematch_attempt = (missing_person.rematch_attempt or 0) + 1
        missing_person.save()

        # Initialize lists for matched data
        newly_matched = []
        previously_matched = []
        previously_rejected = []
        confirmed_matched = []

        # Serialize the missing person data
        missing_person_data = MissingPersonSerializer(missing_person).data

        # Fetch existing matches for this missing person
        existing_matches = Match.objects.filter(missing_person=missing_person, is_rejected=False)

        for match in existing_matches:
            if match.undefined_missing_person:
                matched_person_data = UndefinedMissingpersonSerializer(match.undefined_missing_person).data
            else:
                matched_person_data = UnidentifiedBodySerializer(match.unidentified_body).data

            match_data = {
                "id": match.id,
                "match_id": match.match_id,
                "matched_entity": matched_person_data,
                "match_percentage": match.match_percentage
            }

            # Check if this match has already been confirmed
            is_confirmed = ResolvedCase.objects.filter(missing_person=missing_person, match=match).exists()

            if is_confirmed:
                confirmed_matched.append(match_data)
            else:
                previously_matched.append(match_data)

        # Fetch previously rejected matches
        rejected_matches_qs = MatchRejection.objects.filter(missing_person=missing_person)
        rejected_undefined_ids = rejected_matches_qs.values_list('undefined_missing_person_id', flat=True)
        rejected_body_ids = rejected_matches_qs.values_list('unidentified_body_id', flat=True)

        for rejection in rejected_matches_qs:
            match_percentage = rejection.matched_percentage
            match_id = rejection.MATCH_id or "No match ID"

            if rejection.undefined_missing_person:
                rejected_data = {
                    "Matched_With": "Unidentified Person",
                    "id": rejection.undefined_missing_person.id,
                    "match_id": match_id,
                    "name": rejection.undefined_missing_person.full_name,
                    "match_percentage": match_percentage,
                    "person_details": UndefinedMissingpersonSerializer(rejection.undefined_missing_person).data
                }
                previously_rejected.append(rejected_data)

            elif rejection.unidentified_body:
                rejected_data = {
                    "Matched_With": "Unidentified Body",
                    "id": rejection.unidentified_body.id,
                    "match_id": match_id,
                    "name": rejection.unidentified_body.full_name,
                    "match_percentage": match_percentage,
                    "person_details": UnidentifiedBodySerializer(rejection.unidentified_body).data
                }
                previously_rejected.append(rejected_data)

        # Check for potential new matches
        undefined_missing_persons = UnidentifiedMissingPerson.objects.filter(is_deleted=False).exclude(id__in=rejected_undefined_ids)
        unidentified_bodies = UnidentifiedBody.objects.filter(is_deleted=False).exclude(id__in=rejected_body_ids)

        for undefined_person in undefined_missing_persons:
            match_percentage = self.is_match_with_undefined_missing_person(missing_person, undefined_person)[1]
            if match_percentage > 50:
                match_id = f"{missing_person.id}-{undefined_person.id}-{match_percentage}"
                if not Match.objects.filter(match_id=match_id).exists():
                    try:
                        match = Match(
                            missing_person=missing_person,
                            undefined_missing_person=undefined_person,
                            match_percentage=match_percentage,
                            match_id=match_id
                        )
                        match.save()
                        newly_matched_data = {
                            "match_id": match.match_id,
                            "matched_entity": UndefinedMissingpersonSerializer(undefined_person).data,
                            "match_percentage": match.match_percentage
                        }
                        newly_matched.append(newly_matched_data)
                    except IntegrityError:
                        continue

        for unidentified_body in unidentified_bodies:
            match_percentage = self.is_match_with_unidentified_body(missing_person, unidentified_body)[1]
            if match_percentage > 50:
                match_id = f"{missing_person.id}-{unidentified_body.id}-{match_percentage}"
                if not Match.objects.filter(match_id=match_id).exists():
                    try:
                        match = Match(
                            missing_person=missing_person,
                            unidentified_body=unidentified_body,
                            match_percentage=match_percentage,
                            match_id=match_id
                        )
                        match.save()
                        newly_matched_data = {
                            "match_id": match.match_id,
                            "matched_entity": UnidentifiedBodySerializer(unidentified_body).data,
                            "match_percentage": match.match_percentage
                        }
                        newly_matched.append(newly_matched_data)
                    except IntegrityError:
                        continue

        # Prepare the response data
        response_data = {
            "missing_person": missing_person_data,
            "rematch_attempt": missing_person.rematch_attempt,
            "newly_matched": newly_matched or "No newly matched persons found.",
            "previously_matched": previously_matched or "No previously matched persons found.",
            "previously_rejected": previously_rejected or "No previously rejected persons found.",
            "confirmed_matched": confirmed_matched or "No confirmed matches found."
        }

        return Response(response_data, status=status.HTTP_200_OK)

    # def get(self, request):
    #     name = request.query_params.get('full_name', None)
    #     if not name:
    #         return Response({'error': 'full_name parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    #     try:
    #         missing_person = MissingPerson.objects.get(full_name__iexact=name, is_deleted=False)
    #     except MissingPerson.DoesNotExist:
    #         return Response({'error': 'Missing person not found'}, status=status.HTTP_404_NOT_FOUND)

    #     # Increment the rematch attempt count
    #     missing_person.rematch_attempt = (missing_person.rematch_attempt or 0) + 1
    #     missing_person.save()

    #     newly_matched = []
    #     previously_matched = []
    #     previously_rejected = []
    #     matches_to_create = []

    #     matched_entity_ids = set()

    #     # Fetch existing matches for this missing person (first-time or rematches)
    #     existing_matches = Match.objects.filter(missing_person=missing_person, is_rejected=False)
    #     for match in existing_matches:
    #         matched_entity_ids.add(match.undefined_missing_person.id if match.undefined_missing_person else match.unidentified_body.id)
    #         match_data = {
    #             "id": match.id,
    #             "match_id": match.match_id,
    #             "matched_entity": match.undefined_missing_person.full_name if match.undefined_missing_person else match.unidentified_body.full_name,
    #             "matched_Gender": match.undefined_missing_person.gender if match.undefined_missing_person else match.unidentified_body.gender,
    #             "Match_percentage": match.match_percentage
    #         }
    #         previously_matched.append(match_data)

    #         # Store this match in `PreviouslyMatched`
    #         if match.undefined_missing_person:
    #             if not PreviouslyMatched.objects.filter(match_id=match.match_id).exists():
    #                 PreviouslyMatched.objects.create(
    #                     missing_person=missing_person,
    #                     undefined_missing_person=match.undefined_missing_person,
    #                     match_percentage=match.match_percentage,
    #                     match_id=match.match_id,
    #                     matched_gender=match.undefined_missing_person.gender
    #                 )
    #         elif match.unidentified_body:
    #             if not PreviouslyMatched.objects.filter(match_id=match.match_id).exists():
    #                 PreviouslyMatched.objects.create(
    #                     missing_person=missing_person,
    #                     unidentified_body=match.unidentified_body,
    #                     match_percentage=match.match_percentage,
    #                     match_id=match.match_id,
    #                     matched_gender=match.unidentified_body.gender
    #                 )

    #     # Fetch previously rejected matches for this missing person
    #     rejected_matches_qs = MatchRejection.objects.filter(missing_person=missing_person)
    #     rejected_undefined_ids = rejected_matches_qs.values_list('undefined_missing_person_id', flat=True)
    #     rejected_body_ids = rejected_matches_qs.values_list('unidentified_body_id', flat=True)

    #     # Populate the previously_rejected list
    #     for rejection in rejected_matches_qs:
    #         match_percentage = rejection.matched_percentage
    #         match_id = rejection.MATCH_id if rejection.MATCH_id else "No match ID"
    #         if rejection.undefined_missing_person:
    #             previously_rejected.append({
    #                 "Matched_With": "Unidentified Person",
    #                 "id": rejection.undefined_missing_person.id,
    #                 "match_id": match_id,
    #                 "name": rejection.undefined_missing_person.full_name,
    #                 "details": rejection.undefined_missing_person.gender,
    #                 "Match_percentage": match_percentage
    #             })
    #         elif rejection.unidentified_body:
    #             previously_rejected.append({
    #                 "Matched_With": "Unidentified Body",
    #                 "id": rejection.unidentified_body.id,
    #                 "match_id": match_id,
    #                 "name": rejection.unidentified_body.full_name,
    #                 "details": rejection.unidentified_body.gender,
    #                 "Match_percentage": match_percentage
    #             })

    #     # Check for potential new matches with UndefinedMissingPersons
    #     undefined_missing_persons = UnidentifiedMissingPerson.objects.filter(is_deleted=False).exclude(id__in=rejected_undefined_ids)
    #     for undefined_person in undefined_missing_persons:
    #         match_percentage = self.is_match_with_undefined_missing_person(missing_person, undefined_person)[1]
    #         if match_percentage > 50 and undefined_person.id not in matched_entity_ids:
                
    #             existing_match = Match.objects.filter(missing_person=missing_person, undefined_missing_person=undefined_person).first()
    #             if not existing_match:
    #                 try:
    #                     match = Match(
    #                         missing_person=missing_person,
    #                         undefined_missing_person=undefined_person,
    #                         match_percentage=match_percentage
    #                     )
    #                     match.save()  
    #                     newly_matched.append({
    #                         "Matched_With": "Unidentified Person",
    #                         "id": match.id,
    #                         "match_id": match.match_id,
    #                         "name": undefined_person.full_name,
    #                         "details": undefined_person.gender,
    #                         "Match_percentage": match_percentage
    #                     })
    #                     matched_entity_ids.add(undefined_person.id)
    #                 except IntegrityError:
    #                     continue  

    #     # Check for potential new matches with UnidentifiedBodies
    #     unidentified_bodies = UnidentifiedBody.objects.filter(is_deleted=False).exclude(id__in=rejected_body_ids)
    #     for unidentified_body in unidentified_bodies:
    #         match_percentage = self.is_match_with_unidentified_body(missing_person, unidentified_body)[1]
    #         if match_percentage > 50 and unidentified_body.id not in matched_entity_ids:
    #             # Check if match already exists
    #             existing_match = Match.objects.filter(missing_person=missing_person, unidentified_body=unidentified_body).first()
    #             if not existing_match:
    #                 try:
    #                     match = Match(
    #                         missing_person=missing_person,
    #                         unidentified_body=unidentified_body,
    #                         match_percentage=match_percentage
    #                     )
    #                     match.save()  
    #                     newly_matched.append({
    #                         "Matched_With": "Unidentified Body",
    #                         "id": match.id,
    #                         "match_id": match.match_id,
    #                         "name": unidentified_body.full_name,
    #                         "details": unidentified_body.gender,
    #                         "Match_percentage": match_percentage
    #                     })
    #                     matched_entity_ids.add(unidentified_body.id)
    #                 except IntegrityError:
    #                     continue  # Skip if match_id already exists

    #     # Bulk create new matches if any
    #     if matches_to_create:
    #         Match.objects.bulk_create(matches_to_create)

    #     # Prepare the response data
    #     response_data = {
    #         "newly_matched": newly_matched if newly_matched else "No newly matched persons found.",
    #         "previously_matched": previously_matched if previously_matched else "No previously matched persons found.",
    #         "previously_rejected": previously_rejected if previously_rejected else "No previously rejected persons found."
    #     }

    #     return Response(response_data, status=status.HTTP_200_OK)
 

class MatchUnidentifiedBodyWithMissingPerson(APIView):

    def is_match_with_missing_person(self, unidentified_body, missing_person):
        match_score = 0
        total_checks = 0

        # 1. Full Name - Exact/Partial Match
        if missing_person.full_name and unidentified_body.full_name:
            total_checks += 1
            if missing_person.full_name.lower() == unidentified_body.full_name.lower():
                match_score += 1  # Exact match
            elif missing_person.full_name.lower() in unidentified_body.full_name.lower() or unidentified_body.full_name.lower() in missing_person.full_name.lower():
                match_score += 0.5  # Partial match

        # 2. Age - Approximate Match
        if missing_person.age is not None and unidentified_body.estimated_age is not None:
            total_checks += 1
            if abs(missing_person.age - unidentified_body.estimated_age) <= 5:  # Allow age range ±5
                match_score += 1

        # 3. Gender - Exact Match
        if missing_person.gender and unidentified_body.gender:
            total_checks += 1
            if missing_person.gender == unidentified_body.gender:
                match_score += 1

        # 4. Height - Approximate Match
        if missing_person.height and unidentified_body.height:
            total_checks += 1
            if abs(missing_person.height - unidentified_body.height) <= 5:  # Allow height range ±5 cm
                match_score += 1

        # 5. Weight - Approximate Match
        if missing_person.weight and unidentified_body.weight:
            total_checks += 1
            if abs(missing_person.weight - unidentified_body.weight) <= 5:  # Allow weight range ±5 kg
                match_score += 1

        # 6. Complexion - Exact Match
        if missing_person.complexion and unidentified_body.complexion:
            total_checks += 1
            if missing_person.complexion.lower() == unidentified_body.complexion.lower():
                match_score += 1

        # 7. Hair Color - Exact Match
        if missing_person.hair_color and unidentified_body.hair_color:
            total_checks += 1
            if missing_person.hair_color.lower() == unidentified_body.hair_color.lower():
                match_score += 1

        # 8. Hair Type - Exact Match
        if missing_person.hair_type and unidentified_body.hair_type:
            total_checks += 1
            if missing_person.hair_type.lower() == unidentified_body.hair_type.lower():
                match_score += 1

        # 9. Eye Color - Exact Match
        if missing_person.eye_color and unidentified_body.eye_color:
            total_checks += 1
            if missing_person.eye_color.lower() == unidentified_body.eye_color.lower():
                match_score += 1

        # 10. Birth Mark - Exact Match
        if missing_person.birth_mark and unidentified_body.birth_mark:
            total_checks += 1
            if missing_person.birth_mark.lower() == unidentified_body.birth_mark.lower():
                match_score += 1

        # 11. Other Distinctive Marks - Exact Match
        if missing_person.distinctive_mark and unidentified_body.other_distinctive_mark:
            total_checks += 1
            if missing_person.distinctive_mark.lower() == unidentified_body.other_distinctive_mark.lower():
                match_score += 1

        # 12. Last Location of Missing Person vs Location Found - Geographic Proximity
        if missing_person.last_seen_location and unidentified_body.body_seen_details:
            total_checks += 1
            if missing_person.last_seen_location.lower() == unidentified_body.body_seen_details.lower():
                match_score += 1

        # Match percentage
        match_percentage = (match_score / total_checks) * 100 if total_checks > 0 else 0
        match_percentage = round(match_percentage, 2)
        return match_percentage >= 50, match_percentage
    
    def is_match_with_unidnetifited_person(self, unidentified_body, unidentified_person):
        match_score = 0
        total_checks = 0

        # 1. Full Name - Exact/Partial Match
        if unidentified_person.full_name and unidentified_body.full_name:
            total_checks += 1
            if unidentified_person.full_name.lower() == unidentified_body.full_name.lower():
                match_score += 1  # Exact match
            elif unidentified_person.full_name.lower() in unidentified_body.full_name.lower() or unidentified_body.full_name.lower() in unidentified_person.full_name.lower():
                match_score += 0.5  # Partial match

        # 2. Age - Approximate Match
        if unidentified_person.estimated_age is not None and unidentified_body.estimated_age is not None:
            total_checks += 1
            if abs(unidentified_person.estimated_age - unidentified_body.estimated_age) <= 5:  # Allow age range ±5
                match_score += 1

        # 3. Gender - Exact Match
        if unidentified_person.gender and unidentified_body.gender:
            total_checks += 1
            if unidentified_person.gender == unidentified_body.gender:
                match_score += 1

        # 4. Height - Approximate Match
        if unidentified_person.height and unidentified_body.height:
            total_checks += 1
            if abs(unidentified_person.height - unidentified_body.height) <= 5:  # Allow height range ±5 cm
                match_score += 1

        # 5. Weight - Approximate Match
        if unidentified_person.weight and unidentified_body.weight:
            total_checks += 1
            if abs(unidentified_person.weight - unidentified_body.weight) <= 5:  # Allow weight range ±5 kg
                match_score += 1

        # 6. Complexion - Exact Match
        if unidentified_person.complexion and unidentified_body.complexion:
            total_checks += 1
            if unidentified_person.complexion.lower() == unidentified_body.complexion.lower():
                match_score += 1

        # 7. Hair Color - Exact Match
        if unidentified_person.hair_color and unidentified_body.hair_color:
            total_checks += 1
            if unidentified_person.hair_color.lower() == unidentified_body.hair_color.lower():
                match_score += 1

        # 8. Hair Type - Exact Match
        if unidentified_person.hair_type and unidentified_body.hair_type:
            total_checks += 1
            if unidentified_person.hair_type.lower() == unidentified_body.hair_type.lower():
                match_score += 1

        # 9. Eye Color - Exact Match
        if unidentified_person.eye_color and unidentified_body.eye_color:
            total_checks += 1
            if unidentified_person.eye_color.lower() == unidentified_body.eye_color.lower():
                match_score += 1

        # 10. Birth Mark - Exact Match
        if unidentified_person.birth_mark and unidentified_body.birth_mark:
            total_checks += 1
            if unidentified_person.birth_mark.lower() == unidentified_body.birth_mark.lower():
                match_score += 1

        # 11. Other Distinctive Marks - Exact Match
        if unidentified_person.other_distinctive_mark and unidentified_body.other_distinctive_mark:
            total_checks += 1
            if unidentified_person.other_distinctive_mark.lower() == unidentified_body.other_distinctive_mark.lower():
                match_score += 1

        # 12. Last Location of Missing Person vs Location Found - Geographic Proximity
        if unidentified_person.last_seen_details and unidentified_body.body_seen_details:
            total_checks += 1
            if unidentified_person.last_seen_details.lower() == unidentified_body.body_seen_details.lower():
                match_score += 1

        # Match percentage
        match_percentage = (match_score / total_checks) * 100 if total_checks > 0 else 0
        match_percentage = round(match_percentage, 2)
        return match_percentage >= 50, match_percentage
    
    def get(self, request):
        # Fetch the query parameters: 'body_name' or 'unique_id'
        body_name = request.query_params.get('body_name', None)
        unique_id = request.query_params.get('unique_id', None)

        if not body_name and not unique_id:
            return Response({'error': 'Either body_name or unique_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if body_name:
                unidentified_body = UnidentifiedBody.objects.get(full_name__icontains=body_name, is_deleted=False)
            elif unique_id:
                unidentified_body = UnidentifiedBody.objects.get(unique_id=unique_id, is_deleted=False)
        except UnidentifiedBody.DoesNotExist:
            return Response({'error': 'Unidentified body not found'}, status=status.HTTP_404_NOT_FOUND)

        # Initialize lists for matched data
        newly_matched = []
        previously_matched = []
        previously_rejected = []

        # Serialize the unidentified body data
        unidentified_body_data = UnidentifiedBodySerializer(unidentified_body).data

        # Fetch existing matches for this unidentified body (previously matched)
        existing_matches = BodyMatch.objects.filter(unidentified_body=unidentified_body, is_rejected=False)

        for match in existing_matches:
            if match.missing_person:
                matched_person_data = MissingPersonSerializer(match.missing_person).data
            else:
                matched_person_data = UndefinedMissingpersonSerializer(match.undefined_missing_person).data

            match_data = {
                "unidentified_body": unidentified_body_data,  # Include unidentified body in matched data
                "id": match.id,
                "match_id": match.match_id,
                "matched_entity": matched_person_data,  
                "match_percentage": match.match_percentage
            }
            previously_matched.append(match_data)

        # Fetch previously rejected matches for this unidentified body (previously rejected)
        rejected_matches_qs = MatchRejection.objects.filter(unidentified_body=unidentified_body)
        rejected_person_ids = rejected_matches_qs.values_list('missing_person_id', flat=True)
        rejected_undefined_ids = rejected_matches_qs.values_list('undefined_missing_person_id', flat=True)

        for rejection in rejected_matches_qs:
            match_percentage = rejection.matched_percentage
            match_id = rejection.MATCH_id if rejection.MATCH_id else "No match ID"
            
            # Include the unidentified body along with the rejected match
            if rejection.missing_person:
                rejected_data = {
                    "unidentified_body": unidentified_body_data,  # Include unidentified body in rejected data
                    "Matched_With": "Missing Person",
                    "id": rejection.missing_person.id,
                    "match_id": match_id,
                    "name": rejection.missing_person.full_name,
                    "match_percentage": match_percentage,
                    "person_details": MissingPersonSerializer(rejection.missing_person).data
                }
                previously_rejected.append(rejected_data)
            elif rejection.undefined_missing_person:
                rejected_data = {
                    "unidentified_body": unidentified_body_data,  # Include unidentified body in rejected data
                    "Matched_With": "Unidentified Person",
                    "id": rejection.undefined_missing_person.id,
                    "match_id": match_id,
                    "name": rejection.undefined_missing_person.full_name,
                    "match_percentage": match_percentage,
                    "person_details": UndefinedMissingpersonSerializer(rejection.undefined_missing_person).data
                }
                previously_rejected.append(rejected_data)

        # Check for potential new matches: Missing Persons
        missing_people = MissingPerson.objects.filter(is_deleted=False).exclude(id__in=rejected_person_ids)

        for missing_person in missing_people:
            match_percentage = self.is_match_with_missing_person(unidentified_body, missing_person)[1]
            if match_percentage > 50:
                match_id = f"{unidentified_body.full_name}-{match_percentage}"  # Modify match_id generation as needed
                if not Match.objects.filter(match_id=match_id).exists():
                    try:
                        # Create a new match
                        match = BodyMatch(
                            unidentified_body=unidentified_body,
                            missing_person=missing_person,
                            match_percentage=match_percentage,
                            match_id=match_id
                        )
                        match.save()
                        newly_matched_data = {
                            "unidentified_body": unidentified_body_data,  # Include unidentified body in newly matched data
                            "match_id": match.match_id,
                            "matched_entity": MissingPersonSerializer(missing_person).data,  # Full missing person data
                            "match_percentage": match.match_percentage
                        }
                        newly_matched.append(newly_matched_data)
                    except IntegrityError:
                        continue  # Handle duplicates or other exceptions

        # Check for potential new matches: Undefined Missing Persons
        undefined_missing_persons = UnidentifiedMissingPerson.objects.filter(is_deleted=False).exclude(id__in=rejected_undefined_ids)

        for undefined_person in undefined_missing_persons:
            match_percentage = self.is_match_with_unidnetifited_person(unidentified_body, undefined_person)[1]
            if match_percentage > 50:
                match_id = f"{unidentified_body.full_name}-{match_percentage}"  # Modify match_id generation as needed
                if not Match.objects.filter(match_id=match_id).exists():
                    try:
                        # Create a new match
                        match = BodyMatch(
                            unidentified_body=unidentified_body,
                            undefined_missing_person=undefined_person,
                            match_percentage=match_percentage,
                            match_id=match_id
                        )
                        match.save()
                        newly_matched_data = {
                            "unidentified_body": unidentified_body_data,  # Include unidentified body in newly matched data
                            "match_id": match.match_id,
                            "matched_entity": UndefinedMissingpersonSerializer(undefined_person).data,  # Full undefined person data
                            "match_percentage": match.match_percentage
                        }
                        newly_matched.append(newly_matched_data)
                    except IntegrityError:
                        continue  # Handle duplicates or other exceptions

        # Prepare the response data
        response_data = {
            # "unidentified_body": unidentified_body_data,  
            "newly_matched": newly_matched if newly_matched else "No newly matched persons found.",
            "previously_matched": previously_matched if previously_matched else "No previously matched persons found.",
            "previously_rejected": previously_rejected if previously_rejected else "No previously rejected persons found."
        }

        return Response(response_data, status=status.HTTP_200_OK)

# class ConfirmMatchView(APIView):

#     def post(self, request):
#         # New input fields
#         missing_person_name = request.data.get('missing_person_name')
#         confirmed_by_name = request.data.get('confirmed_by_name') 
#         confirmed_by_contact = request.data.get('confirmed_by_contact')  
#         confirmed_by_relationship = request.data.get('confirmed_by_relationship')  
#         notes = request.data.get('notes')  
#         match_id = request.data.get('match_id')
#         is_confirmed = request.data.get('is_confirmed', False)

#         # Validate required fields
#         if not match_id:
#             return Response({"message": "match_id is required"}, status=status.HTTP_400_BAD_REQUEST)

#         if not missing_person_name:
#             return Response({"message": "missing_person_name is required"}, status=status.HTTP_400_BAD_REQUEST)

#         if not confirmed_by_name:
#             return Response({"message": "confirmed_by_name is required"}, status=status.HTTP_400_BAD_REQUEST)

#         if not confirmed_by_contact:
#             return Response({"message": "confirmed_by_contact is required"}, status=status.HTTP_400_BAD_REQUEST)

#         if not confirmed_by_relationship:
#             return Response({"message": "confirmed_by_relationship is required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             match = Match.objects.get(match_id=match_id)
#         except Match.DoesNotExist:
#             return Response({'message': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

#         if match.is_rejected:
#             return Response({'message': 'This match has been rejected and cannot be confirmed.'}, status=status.HTTP_400_BAD_REQUEST)

#         # Utility function to check if entities are deleted
#         def are_entities_deleted(match):
#             return (
#                 match.missing_person.is_deleted or
#                 (match.undefined_missing_person and match.undefined_missing_person.is_deleted) or
#                 (match.unidentified_body and match.unidentified_body.is_deleted)
#             )

#         if are_entities_deleted(match):
#             return Response({'message': 'One or more entities in the match are deleted.'}, status=status.HTTP_400_BAD_REQUEST)

#         # Confirm the match
#         if is_confirmed:
#             try:
#                 missing_person = MissingPerson.objects.get(full_name=missing_person_name, is_deleted=False)
#             except MissingPerson.DoesNotExist:
#                 return Response({'message': 'Missing person not found'}, status=status.HTTP_404_NOT_FOUND)

#             # Creating the resolved case and linking the confirmed_by person
#             resolved_case = ResolvedCase(
#                 missing_person=missing_person,
#                 confirmed_by_name=confirmed_by_name,  
#                 confirmed_by_contact=confirmed_by_contact,  
#                 confirmed_by_relationship=confirmed_by_relationship, 
#                 notes=notes,  # Add notes to the resolved case
#                 is_confirmed=True 
#             )

#             # Handle which match entity is being confirmed (Unidentified Body or Undefined Missing Person)
#             if match.undefined_missing_person:
#                 resolved_case.unidentified_missing_person = match.undefined_missing_person
#             elif match.unidentified_body:
#                 resolved_case.unidentified_body = match.unidentified_body
#             else:
#                 return Response({'message': 'Neither undefined_missing_person nor unidentified_body exists for this match.'}, status=status.HTTP_400_BAD_REQUEST)

#             resolved_case.save()

#             # Mark the entities as deleted
#             # missing_person.is_deleted = True
#             # missing_person.save()

#             # if match.undefined_missing_person:
#             #     match.undefined_missing_person.is_deleted = True
#             #     match.undefined_missing_person.save()
#             # elif match.unidentified_body:
#             #     match.unidentified_body.is_deleted = True
#             #     match.unidentified_body.save()

#             # Set the match as confirmed
#             match.is_confirmed = True
#             match.save()

#             # Add confirmation timestamp
#             confirmation_time = timezone.now()

#             # Serialize the data for missing person and match entities
#             missing_person_data = MissingPersonSerializer(missing_person).data

#             match_data = {
#                 'match': {
#                     'missing_person': missing_person_data,  # Serialize missing person data
#                     'confirmed_by': confirmed_by_name,  
#                     'confirmed_by_contact': confirmed_by_contact,  # Contact info of the reporting person
#                     'confirmed_by_relationship': confirmed_by_relationship,  # Relationship info
#                     'notes': notes,  # Add the notes to the response
#                     'match_type': match.match_type,
#                     'match_percentage': match.match_percentage,
#                     'match_id': match.match_id,  
#                     'confirmation_time': confirmation_time.isoformat()  
#                 }
#             }

#             # Include the matched entity (UndefinedMissingPerson or UnidentifiedBody) data
#             if match.undefined_missing_person:
#                 match_data['match']['unidentified_missing_person'] = UndefinedMissingpersonSerializer(match.undefined_missing_person).data
#             elif match.unidentified_body:
#                 match_data['match']['unidentified_body'] = UnidentifiedBodySerializer(match.unidentified_body).data

#             return Response(match_data, status=status.HTTP_200_OK)

#         else:
#             return Response({"message": "Please specify if the match is confirmed."}, status=status.HTTP_400_BAD_REQUEST)



         
# APi for the hospital entity
class ZoneAPIView(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                zone = Zone.objects.get(pk=pk)
                serializer = ZoneSerializer(zone)
                return Response(serializer.data)
            except Zone.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

        zones = Zone.objects.all()
        serializer = ZoneSerializer(zones, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ZoneSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            zone = Zone.objects.get(pk=pk)
        except Zone.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ZoneSerializer(zone, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            zone = Zone.objects.get(pk=pk)
            zone.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Zone.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class DivisionAPIView(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                division = Division.objects.get(pk=pk)
                serializer = PoliceStationNestedSerializer(division)
                return Response(serializer.data)
            except Division.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

        divisions = Division.objects.all()
        serializer = DivisionNestedSerializer(divisions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DivisionNestedSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            division = Division.objects.get(pk=pk)
        except Division.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = DivisionNestedSerializer(division, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            division = Division.objects.get(pk=pk)
            division.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Division.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class PoliceStationAPIView(APIView):
    # def get(self, request, pk=None):
    #     latitude = request.query_params.get('latitude', None)
    #     longitude = request.query_params.get('longitude', None)
    #     search_query = request.query_params.get('search', '').strip()  

    #     if pk:
    #         # Fetching a specific police station by ID
    #         try:
    #             police_station = PoliceStation.objects.get(pk=pk)
    #             serializer = PoliceStationNestedSerializer(police_station)
    #             return Response(serializer.data)
    #         except PoliceStation.DoesNotExist:
    #             raise NotFound("Police Station not found")

    #     if latitude and longitude:
    #         point = Point(float(longitude), float(latitude))
    #         police_stations = PoliceStation.objects.filter(location__distance_lte=(point, 10000))  # 10km radius
    #         serializer = PoliceStationNestedSerializer(police_stations, many=True)
            
    #         response_data = []
    #         for station in police_stations:
    #             data = {
    #                 'id': station.id,
    #                 'name': station.name,
    #                 'address': station.address,
    #                 'telephone_no': station.telephone_no,
    #                 'location': {
    #                     'latitude': station.location.y,
    #                     'longitude': station.location.x,
    #                     'point': f'POINT({station.location.x} {station.location.y})'
    #                 },
    #                 'boundary': station.boundary.wkt if station.boundary else None,
    #                 'chowkis': []  
    #             }
    #             response_data.append(data)

    #         return Response(response_data)

    #     # If search_query is provided, filter based on search terms
    #     if search_query:
    #         police_stations = PoliceStation.objects.filter(
    #             Q(name__icontains=search_query) |  
    #             Q(address__icontains=search_query) | 
    #             Q(city_icontains=search_query) | 
    #             Q(district_icontains=search_query) | 
    #             Q(state_icontains=search_query)  
    #         )

    #         # Check if there are any results after the filter
    #         if not police_stations.exists():
    #             return Response({"message": "No matching police stations found."}, status=404)

    #         # Serialize and return the filtered data
    #         serializer = PoliceStationNestedSerializer(police_stations, many=True)
    #         return Response({
    #             'data': serializer.data
    #         })

    #     # Pagination logic if no search query is provided
    #     police_stations = PoliceStation.objects.all()
    #     page_size = int(request.GET.get('page_size', 5)) 
    #     paginator = Paginator(police_stations, page_size)
    #     page_number = request.GET.get('page', 1)
    #     page_obj = paginator.get_page(page_number)

    #     # Serialize paginated data
    #     serializer = PoliceStationNestedSerializer(page_obj, many=True)
        
    #     data = {
    #         'data': serializer.data,
    #         'pagination': {
    #             'total_pages': paginator.num_pages,
    #             'current_page': page_obj.number,
    #             'has_next': page_obj.has_next(),
    #             'has_previous': page_obj.has_previous(),
    #             'total_entries': paginator.count,
    #             'page_size': page_size
    #         }
    #     }

    #     return Response(data)

    def get(self, request, pk=None):
        # Get the query parameters from the request
        name_query = request.query_params.get('name', '').strip()
        city_query = request.query_params.get('city', '').strip()
        district_query = request.query_params.get('district', '').strip()
        state_query = request.query_params.get('state', '').strip()

        # If pk is provided, fetch specific police station by ID
        if pk:
            try:
                police_station = PoliceStation.objects.get(pk=pk)
                serializer = PoliceStationNestedSerializer(police_station)
                return Response(serializer.data)
            except PoliceStation.DoesNotExist:
                raise NotFound("Police Station not found")

        # Build the Q object dynamically based on non-empty query parameters
        query_filters = Q()

        # Only add filters if the parameter is not empty
        if name_query:
            query_filters &= Q(name__icontains=name_query)
        if city_query:
            query_filters &= Q(city__icontains=city_query)
        if district_query:
            query_filters &= Q(district__icontains=district_query)
        if state_query:
            query_filters &= Q(state__icontains=state_query)

        # If there are filters, apply them
        police_stations = PoliceStation.objects.filter(query_filters)

        # Check if there are any results after the filter
        if not police_stations.exists():
            return Response({"message": "No matching police stations found."}, status=404)

        # If no filters are applied, return all police stations (with pagination)
        if not query_filters:
            police_stations = PoliceStation.objects.all()

        # Pagination logic
        page_size = int(request.GET.get('page_size', 5)) 
        page_number = int(request.GET.get('page', 1)) 

        paginator = Paginator(police_stations, page_size)
        page_obj = paginator.get_page(page_number)

        # Serialize the data
        serializer = PoliceStationNestedSerializer(page_obj, many=True)
        
        # Return paginated data along with pagination metadata
        data = {
            'data': serializer.data,
            'pagination': {
                'total_pages': paginator.num_pages,
                'current_page': page_obj.number,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'total_entries': paginator.count,
                'page_size': page_size
            }
        }

        return Response(data)
        
    def post(self, request):
        serializer = PoliceStationNestedSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            police_station = PoliceStation.objects.get(pk=pk)
        except PoliceStation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = PoliceStationNestedSerializer(police_station, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            police_station = PoliceStation.objects.get(pk=pk)
            police_station.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PoliceStation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class ChowkiAPIView(APIView):
    def get(self, request, pk=None):
        latitude = request.query_params.get('latitude', None)
        longitude = request.query_params.get('longitude', None)

        # If pk is provided, return a single chowki
        if pk:
            try:
                chowki = Chowki.objects.get(pk=pk)
                serializer = ChowkiSerializer(chowki)
                return Response(serializer.data)
            except Chowki.DoesNotExist:
                raise NotFound("Chowki not found")

        # If latitude and longitude are provided, return nearby chowkis and the point
        if latitude and longitude:
            point = Point(float(longitude), float(latitude)) 
            chowkis = Chowki.objects.filter(location__distance_lte=(point, 10000))  # 10km radius
            response_data = []
            for chowki in chowkis:
                data = {
                    'id': chowki.id,
                    'name': chowki.name,
                    'address': chowki.address,
                    'telephone_no': chowki.telephone_no,
                    'location': {
                        'latitude': chowki.location.y,
                        'longitude': chowki.location.x,
                        'point': f'POINT({chowki.location.x} {chowki.location.y})'
                    },
                    'boundary': chowki.boundary.wkt if chowki.boundary else None,
                    'police_station': chowki.police_station.id  # Assuming this is required to show which police station the chowki belongs to
                }
                response_data.append(data)

            return Response(response_data)

        # Pagination logic
        chowkis = Chowki.objects.all()
        page_size = int(request.GET.get('page_size', 5))  # Default page size is 5
        paginator = Paginator(chowkis, page_size)
        page_number = request.GET.get('page', 1)
        page_obj = paginator.get_page(page_number)

        # Serializing the paginated data
        serializer = ChowkiSerializer(page_obj, many=True)
        
        data = {
            'data': serializer.data,
            'pagination': {
                'total_pages': paginator.num_pages,
                'current_page': page_obj.number,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'total_entries': paginator.count,
                'page_size': page_size
            }
        }

        return Response(data)
    def post(self, request):
        # Handle POST request to create a new chowki
        serializer = ChowkiSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        # Handle PUT request to update a chowki
        try:
            chowki = Chowki.objects.get(pk=pk)
        except Chowki.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ChowkiSerializer(chowki, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        # Handle DELETE request to delete a chowki
        try:
            chowki = Chowki.objects.get(pk=pk)
            chowki.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Chowki.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

# api for hospital entity
class HospitalZoneAPIView(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                zone = HospitalZone.objects.get(pk=pk)
                serializer = HospitalZoneSerializer(zone)
                return Response(serializer.data)
            except HospitalZone.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

        zones = HospitalZone.objects.all()
        serializer = HospitalZoneSerializer(zones, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = HospitalZoneSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            zone = HospitalZone.objects.get(pk=pk)
        except HospitalZone.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = HospitalZoneSerializer(zone, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            zone = HospitalZone.objects.get(pk=pk)
            zone.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except HospitalZone.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class HospitalDivisionAPIView(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                division = HospitalDivision.objects.get(pk=pk)
                serializer = HospitalDivisionSerializer(division)
                return Response(serializer.data)
            except HospitalDivision.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

        divisions = HospitalDivision.objects.all()
        serializer = HospitalDivisionSerializer(divisions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = HospitalDivisionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            division = HospitalDivision.objects.get(pk=pk)
        except HospitalDivision.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = HospitalDivisionSerializer(division, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            division = HospitalDivision.objects.get(pk=pk)
            division.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except HospitalDivision.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class HospitalAPIView(APIView):
    def get(self, request, pk=None):
        # If pk is provided, return a single hospital
        if pk:
            try:
                hospital = Hospital.objects.get(pk=pk)
                serializer = HospitalSerializer(hospital)
                return Response(serializer.data)
            except Hospital.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

        # Pagination logic
        hospitals = Hospital.objects.all()
        page_size = int(request.GET.get('page_size', 5))  # Default page size is 5
        paginator = Paginator(hospitals, page_size)
        page_number = request.GET.get('page', 1)
        page_obj = paginator.get_page(page_number)

        # Serializing the paginated data
        serializer = HospitalSerializer(page_obj, many=True)
        
        data = {
            'data': serializer.data,
            'pagination': {
                'total_pages': paginator.num_pages,
                'current_page': page_obj.number,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'total_entries': paginator.count,
                'page_size': page_size
            }
        }

        return Response(data)
    def post(self, request):
        serializer = HospitalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            hospital = Hospital.objects.get(pk=pk)
        except Hospital.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = HospitalSerializer(hospital, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            hospital = Hospital.objects.get(pk=pk)
            hospital.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Hospital.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# api to serch between missing person to unidentified person
class SearchUndefinedMissingPersonMatches(APIView):
    
    def is_match_with_undefined_missing_person(self, missing_person, UndefinedMissingPerson):
        match_score = 0
        total_checks = 0

        # 1. Full Name - Exact/Partial Match
        if missing_person.full_name and UndefinedMissingPerson.full_name:
            total_checks += 1
            if missing_person.full_name.lower() == UndefinedMissingPerson.full_name.lower():
                match_score += 1  # Exact match
            elif missing_person.full_name.lower() in UndefinedMissingPerson.full_name.lower() or UndefinedMissingPerson.full_name.lower() in missing_person.full_name.lower():
                match_score += 0.5  # Partial match

        # 2. Age - Approximate Match
        if missing_person.age is not None and UndefinedMissingPerson.estimated_age is not None:
            total_checks += 1
            if abs(missing_person.age - UndefinedMissingPerson.estimated_age) <= 5:  # Allow age range ±5
                match_score += 1

        # 3. Gender - Exact Match
        if missing_person.gender and UndefinedMissingPerson.gender:
            total_checks += 1
            if missing_person.gender == UndefinedMissingPerson.gender:
                match_score += 1

        # 4. Height - Approximate Match
        if missing_person.height and UndefinedMissingPerson.height:
            total_checks += 1
            if abs(missing_person.height - UndefinedMissingPerson.height) <= 5:  # Allow height range ±5 cm
                match_score += 1

        # 5. Weight - Approximate Match
        if missing_person.weight and UndefinedMissingPerson.weight:
            total_checks += 1
            if abs(missing_person.weight - UndefinedMissingPerson.weight) <= 5:  # Allow weight range ±5 kg
                match_score += 1

        # 6. Complexion - Exact Match
        if missing_person.complexion and UndefinedMissingPerson.complexion:
            total_checks += 1
            if missing_person.complexion.lower() == UndefinedMissingPerson.complexion.lower():
                match_score += 1

        # 7. Hair Color - Exact Match
        if missing_person.hair_color and UndefinedMissingPerson.hair_color:
            total_checks += 1
            if missing_person.hair_color.lower() == UndefinedMissingPerson.hair_color.lower():
                match_score += 1

        # 8. Hair Type - Exact Match
        if missing_person.hair_type and UndefinedMissingPerson.hair_type:
            total_checks += 1
            if missing_person.hair_type.lower() == UndefinedMissingPerson.hair_type.lower():
                match_score += 1

        # 9. Eye Color - Exact Match
        if missing_person.eye_color and UndefinedMissingPerson.eye_color:
            total_checks += 1
            if missing_person.eye_color.lower() == UndefinedMissingPerson.eye_color.lower():
                match_score += 1

        # 10. Birth Mark - Exact Match
        if missing_person.birth_mark and UndefinedMissingPerson.birth_mark:
            total_checks += 1
            if missing_person.birth_mark.lower() == UndefinedMissingPerson.birth_mark.lower():
                match_score += 1

        # 11. Other Distinctive Marks - Exact Match
        if missing_person.distinctive_mark and UndefinedMissingPerson.other_distinctive_mark:
            total_checks += 1
            if missing_person.distinctive_mark.lower() == UndefinedMissingPerson.other_distinctive_mark.lower():
                match_score += 1

        # 12. Last Location of Missing Person vs Location Found - Geographic Proximity
        if missing_person.last_seen_location and UndefinedMissingPerson.last_seen_details:
            total_checks += 1
            if missing_person.last_seen_location.lower() == UndefinedMissingPerson.last_seen_details.lower():
                match_score += 1

        # 13. Caste - Exact Match
        if missing_person.caste and UndefinedMissingPerson.caste:
            total_checks += 1
            if missing_person.caste.lower() == UndefinedMissingPerson.caste.lower():
                match_score += 1

        # 14. photo - Exact Match
        # if missing_person.photo_upload and UndefinedMissingPerson.photo_upload:
        #     total_checks += 1
        #     image1_path = str(missing_person.photo_upload.path)
        #     image2_path = str(UndefinedMissingPerson.photo_upload.path)

        #     if os.path.exists(image1_path) and os.path.exists(image2_path):
        #         if is_face_match(image1_path, image2_path):
        #             match_score += 1

        # 15. Identification Details - Direct Verification (e.g., Aadhar, PAN)
        if missing_person.identification_card_no and UndefinedMissingPerson.identification_details:
            total_checks += 1
            if missing_person.identification_card_no == UndefinedMissingPerson.identification_details:
                match_score += 1
        
        # if missing_person.Condition and UndefinedMissingPerson.condition_at_discovery:
        #     total_checks += 1
        #     if missing_person.Condition == UndefinedMissingPerson.condition_at_discovery:
        #         match_score += 1

        # Match percentage
        match_percentage = (match_score / total_checks) * 100 if total_checks > 0 else 0
        match_percentage = round(match_percentage, 2)
        return match_percentage >= 50, match_percentage

    def get(self, request, *args, **kwargs):
        id = kwargs.get('id')  

        try:
            # Get missing person by ID
            missing_person = MissingPerson.objects.get(id=id, is_deleted=False)
        except MissingPerson.DoesNotExist:
            return Response({'error': 'Missing person not found'}, status=status.HTTP_404_NOT_FOUND)

        # Increment the rematch attempt count
        missing_person.rematch_attempt = (missing_person.rematch_attempt or 0) + 1
        missing_person.save()

        newly_matched = []
        previously_matched = []
        confirmed_matched = []
        previously_rejected = []

        # Fetch existing matches
        existing_matches = Match.objects.filter(missing_person=missing_person, is_rejected=False)

        for match in existing_matches:
            if match.undefined_missing_person:
                matched_person_data = UndefinedMissingpersonSerializer(match.undefined_missing_person).data
                match_data = {
                    "id": match.id,
                    "match_id": match.match_id,
                    "matched_entity": matched_person_data,
                    "match_percentage": match.match_percentage
                }

                # Check if this match has already been confirmed
                resolved_case = ResolvedCase.objects.filter(missing_person=missing_person, match=match).first()
                print(f"Checking Resolved Case for Match ID {match.id}: {resolved_case}")
                
                if resolved_case and resolved_case.is_confirmed:
                    print(f"Confirmed Match Found for Match ID {match.id}")
                    confirmed_matched.append({
                        "missing_person": MissingPersonSerializer(missing_person).data,
                        "match_data": match_data
                    })
                else:
                    print(f"Not Confirmed or No Resolved Case for Match ID {match.id}")
                    previously_matched.append({
                        "missing_person": MissingPersonSerializer(missing_person).data,
                        "match_data": match_data
                    })
                    
        # Fetch rejected matches
        rejected_matches_qs = MatchRejection.objects.filter(missing_person=missing_person)
        rejected_undefined_ids = rejected_matches_qs.values_list('undefined_missing_person_id', flat=True)

        for rejection in rejected_matches_qs:
            match_percentage = rejection.matched_percentage
            match_id = rejection.MATCH_id or "No match ID"

            if rejection.undefined_missing_person:
                match_data = {
                    "Matched_With": "Unidentified Person",
                    "id": rejection.undefined_missing_person.id,
                    "match_id": match_id,
                    "name": rejection.undefined_missing_person.full_name,
                    "match_percentage": match_percentage,
                    "matched_entity": UndefinedMissingpersonSerializer(rejection.undefined_missing_person).data
                }
                previously_rejected.append({
                    "missing_person": MissingPersonSerializer(missing_person).data,
                    "match_data": match_data
                })

        # Fetch potential new matches
        undefined_missing_persons = UnidentifiedMissingPerson.objects.filter(is_deleted=False)

        for undefined_person in undefined_missing_persons:
            match_percentage = self.is_match_with_undefined_missing_person(missing_person, undefined_person)[1]
            if match_percentage > 50:
                match_id = f"{missing_person.id}-{undefined_person.full_name}-{match_percentage}"
                if not Match.objects.filter(match_id=match_id).exists():
                    try:
                        match = Match(
                            missing_person=missing_person,
                            undefined_missing_person=undefined_person,
                            match_percentage=match_percentage,
                            match_id=match_id
                        )
                        match.save()
                        newly_matched_data = {
                            "match_id": match.match_id,
                            "matched_entity": UndefinedMissingpersonSerializer(undefined_person).data,
                            "match_percentage": match.match_percentage
                        }
                        newly_matched.append({
                            "missing_person": MissingPersonSerializer(missing_person).data,
                            "match_data": newly_matched_data
                        })
                    except IntegrityError:
                        continue

        # Prepare the response data with serialized missing person data in arrays
        response_data = {
            "newly_matched": newly_matched if newly_matched else ["No newly matched persons found."],
            "previously_matched": previously_matched if previously_matched else ["No previously matched persons found."],
            "previously_rejected": previously_rejected if previously_rejected else ["No previously rejected persons found."],
            "confirmed_matched": confirmed_matched if confirmed_matched else ["No confirmed matches found."]
        }

        return Response(response_data, status=status.HTTP_200_OK)

# api to serch between missing person to unidentified body   
class SearchUnidentifiedBodyMatches(APIView):
    
    def is_match_with_unidentified_body(self, missing_person, UnidentifiedBody):
        match_score = 0
        total_checks = 0

        # 1. Full Name - Exact/Partial Match
        if missing_person.full_name and UnidentifiedBody.full_name:
            total_checks += 1
            if missing_person.full_name.lower() == UnidentifiedBody.full_name.lower():
                match_score += 1  # Exact match
            elif missing_person.full_name.lower() in UnidentifiedBody.full_name.lower() or UnidentifiedBody.full_name.lower() in missing_person.full_name.lower():
                match_score += 0.5  # Partial match

        # 2. Age - Approximate Match
        if missing_person.age is not None and UnidentifiedBody.estimated_age is not None:
            total_checks += 1
            if abs(missing_person.age - UnidentifiedBody.estimated_age) <= 5:  # Allow age range ±5
                match_score += 1

        # 3. Gender - Exact Match
        if missing_person.gender and UnidentifiedBody.gender:
            total_checks += 1
            if missing_person.gender == UnidentifiedBody.gender:
                match_score += 1

        # 4. Height - Approximate Match
        if missing_person.height and UnidentifiedBody.height:
            total_checks += 1
            if abs(missing_person.height - UnidentifiedBody.height) <= 5:  # Allow height range ±5 cm
                match_score += 1

        # 5. Weight - Approximate Match
        if missing_person.weight and UnidentifiedBody.weight:
            total_checks += 1
            if abs(missing_person.weight - UnidentifiedBody.weight) <= 5:  # Allow weight range ±5 kg
                match_score += 1

        # 6. Complexion - Exact Match
        if missing_person.complexion and UnidentifiedBody.complexion:
            total_checks += 1
            if missing_person.complexion.lower() == UnidentifiedBody.complexion.lower():
                match_score += 1

        # 7. Hair Color - Exact Match
        if missing_person.hair_color and UnidentifiedBody.hair_color:
            total_checks += 1
            if missing_person.hair_color.lower() == UnidentifiedBody.hair_color.lower():
                match_score += 1

        # 8. Hair Type - Exact Match
        if missing_person.hair_type and UnidentifiedBody.hair_type:
            total_checks += 1
            if missing_person.hair_type.lower() == UnidentifiedBody.hair_type.lower():
                match_score += 1

        # 9. Eye Color - Exact Match
        if missing_person.eye_color and UnidentifiedBody.eye_color:
            total_checks += 1
            if missing_person.eye_color.lower() == UnidentifiedBody.eye_color.lower():
                match_score += 1

        # 10. Birth Mark - Exact Match
        if missing_person.birth_mark and UnidentifiedBody.birth_mark:
            total_checks += 1
            if missing_person.birth_mark.lower() == UnidentifiedBody.birth_mark.lower():
                match_score += 1

        # 11. Other Distinctive Marks - Exact Match
        if missing_person.distinctive_mark and UnidentifiedBody.other_distinctive_mark:
            total_checks += 1
            if missing_person.distinctive_mark.lower() == UnidentifiedBody.other_distinctive_mark.lower():
                match_score += 1

        # 12. Last Location of Missing Person vs Location Found - Geographic Proximity
        if missing_person.last_seen_location and UnidentifiedBody.body_seen_details:
            total_checks += 1
            if missing_person.last_seen_location.lower() == UnidentifiedBody.body_seen_details.lower():
                match_score += 1


        # 14. Photo Upload - Visual Match (optional, requires external visual comparison)
        if missing_person.photo_upload and UnidentifiedBody.body_photo_upload:
            total_checks += 1
            if missing_person.photo_upload == UnidentifiedBody.body_photo_upload:
                match_score += 1    

        # Match percentage
        match_percentage = (match_score / total_checks) * 100 if total_checks > 0 else 0
        match_percentage = round(match_percentage, 2)
        return match_percentage >= 50, match_percentage
    
    def get(self, request, *args, **kwargs):
        id = kwargs.get('id')  

        try:
            # Get missing person by ID
            missing_person = MissingPerson.objects.get(id=id, is_deleted=False)
        except MissingPerson.DoesNotExist:
            return Response({'error': 'Missing person not found'}, status=status.HTTP_404_NOT_FOUND)

        # Increment the rematch attempt count
        missing_person.rematch_attempt = (missing_person.rematch_attempt or 0) + 1
        missing_person.save()

        newly_matched = []
        previously_matched = []
        confirmed_matched = []
        previously_rejected = []

        missing_person_data = MissingPersonSerializer(missing_person).data

        # Fetch existing matches
        existing_matches = Match.objects.filter(missing_person=missing_person, is_rejected=False)

        for match in existing_matches:
            if match.unidentified_body:
                matched_person_data = UnidentifiedBodySerializer(match.unidentified_body).data
                match_data = {
                    "id": match.id,
                    "match_id": match.match_id,
                    "matched_entity": matched_person_data,
                    "match_percentage": match.match_percentage
                }

                # Check if this match has already been confirmed
                resolved_case = ResolvedCase.objects.filter(missing_person=missing_person, match=match).first()

                # Debugging: Check if resolved_case is None
                if resolved_case:
                    if resolved_case.is_confirmed:
                        confirmed_matched.append({
                            "missing_person": missing_person_data,
                            "match_data": match_data
                        })
                    else:
                        previously_matched.append({
                            "missing_person": missing_person_data,
                            "match_data": match_data
                        })
                else:
                    # If no resolved case exists, consider it as a previously matched but unconfirmed case
                    print(f"No resolved case for match_id {match.match_id}, considering as previously matched.")
                    previously_matched.append({
                        "missing_person": missing_person_data,
                        "match_data": match_data
                    })

        # Fetch rejected matches
        rejected_matches_qs = MatchRejection.objects.filter(missing_person=missing_person)
        rejected_body_ids = rejected_matches_qs.values_list('unidentified_body_id', flat=True)

        for rejection in rejected_matches_qs:
            match_percentage = rejection.matched_percentage
            match_id = rejection.MATCH_id or "No match ID"

            if rejection.unidentified_body:
                match_data = {
                    "Matched_With": "Unidentified Body",
                    "id": rejection.unidentified_body.id,
                    "match_id": match_id,
                    "name": rejection.unidentified_body.full_name,
                    "match_percentage": match_percentage,
                    "matched_entity": UnidentifiedBodySerializer(rejection.unidentified_body).data
                }
                previously_rejected.append({
                    "missing_person": missing_person_data,
                    "match_data": match_data
                })

        # Fetch potential new matches (unidentified bodies)
        unidentified_bodies = UnidentifiedBody.objects.filter(is_deleted=False)

        for unidentified_body in unidentified_bodies:
            match_percentage = self.is_match_with_unidentified_body(missing_person, unidentified_body)[1]
            if match_percentage > 50:
                match_id = f"{missing_person.id}-{unidentified_body.full_name}-{match_percentage}"
                if not Match.objects.filter(match_id=match_id).exists():
                    try:
                        match = Match(
                            missing_person=missing_person,
                            unidentified_body=unidentified_body,
                            match_percentage=match_percentage,
                            match_id=match_id
                        )
                        match.save()
                        newly_matched_data = {
                            "match_id": match.match_id,
                            "matched_entity": UnidentifiedBodySerializer(unidentified_body).data,
                            "match_percentage": match.match_percentage
                        }
                        newly_matched.append({
                            "missing_person": missing_person_data,
                            "match_data": newly_matched_data
                        })
                    except IntegrityError:
                        continue

        # Prepare the response data
        response_data = {
            "newly_matched": newly_matched if newly_matched else ["No newly matched persons found."],
            "previously_matched": previously_matched if previously_matched else ["No previously matched persons found."],
            "previously_rejected": previously_rejected if previously_rejected else ["No previously rejected persons found."],
            "confirmed_matched": confirmed_matched if confirmed_matched else ["No confirmed matches found."]
        }

        return Response(response_data, status=status.HTTP_200_OK)

 

# api to serch between unidentified person to missing person
class SearchUnidentifiedPersonToMissingPersonMatches(APIView):
    
    def is_match_with_missing_person(self, unidentified_person, missing_person):
        match_score = 0
        total_checks = 0

        # 1. Full Name - Exact/Partial Match
        if unidentified_person.full_name and missing_person.full_name:
            total_checks += 1
            if unidentified_person.full_name.lower() == missing_person.full_name.lower():
                match_score += 1  # Exact match
            elif unidentified_person.full_name.lower() in missing_person.full_name.lower() or missing_person.full_name.lower() in unidentified_person.full_name.lower():
                match_score += 0.5  # Partial match

        # 2. Age - Approximate Match
        if unidentified_person.estimated_age is not None and missing_person.age is not None:
            total_checks += 1
            if abs(unidentified_person.estimated_age - missing_person.age) <= 5:  # Allow age range ±5
                match_score += 1

        # 3. Gender - Exact Match
        if unidentified_person.gender and missing_person.gender:
            total_checks += 1
            if unidentified_person.gender.lower() == missing_person.gender.lower():
                match_score += 1

        # 4. Height - Approximate Match
        if unidentified_person.height and missing_person.height:
            total_checks += 1
            if abs(unidentified_person.height - missing_person.height) <= 5:  # Allow height range ±5 cm
                match_score += 1

        # 5. Weight - Approximate Match
        if unidentified_person.weight and missing_person.weight:
            total_checks += 1
            if abs(unidentified_person.weight - missing_person.weight) <= 5:  # Allow weight range ±5 kg
                match_score += 1

        # 6. Complexion - Exact Match
        if unidentified_person.complexion and missing_person.complexion:
            total_checks += 1
            if unidentified_person.complexion.lower() == missing_person.complexion.lower():
                match_score += 1

        # 7. Hair Color - Exact Match
        if unidentified_person.hair_color and missing_person.hair_color:
            total_checks += 1
            if unidentified_person.hair_color.lower() == missing_person.hair_color.lower():
                match_score += 1

        # 8. Hair Type - Exact Match
        if unidentified_person.hair_type and missing_person.hair_type:
            total_checks += 1
            if unidentified_person.hair_type.lower() == missing_person.hair_type.lower():
                match_score += 1

        # 9. Eye Color - Exact Match
        if unidentified_person.eye_color and missing_person.eye_color:
            total_checks += 1
            if unidentified_person.eye_color.lower() == missing_person.eye_color.lower():
                match_score += 1

        # 10. Birth Mark - Exact Match
        if unidentified_person.birth_mark and missing_person.birth_mark:
            total_checks += 1
            if unidentified_person.birth_mark.lower() == missing_person.birth_mark.lower():
                match_score += 1

        # 11. Distinctive Marks - Exact Match
        if unidentified_person.distinctive_mark and missing_person.distinctive_mark:
            total_checks += 1
            if unidentified_person.distinctive_mark.lower() == missing_person.distinctive_mark.lower():
                match_score += 1

        # 12. Last Seen Location vs Location Found - Geographic Proximity
        if unidentified_person.last_seen_location and missing_person.last_seen_location:
            total_checks += 1
            if unidentified_person.last_seen_location.lower() == missing_person.last_seen_location.lower():
                match_score += 1

        # Match percentage
        match_percentage = (match_score / total_checks) * 100 if total_checks > 0 else 0
        match_percentage = round(match_percentage, 2)
        
        # Return the match result: whether it's a match and the match percentage
        return match_percentage >= 50, match_percentage


    def get(self, request, *args, **kwargs):
        id = kwargs.get('id')  

        try:
            # Get unidentified person by ID
            unidentified_person = UnidentifiedMissingperson.objects.get(id=id, is_deleted=False)
        except UnidentifiedMissingperson.DoesNotExist:
            return Response({'error': 'Unidentified person not found'}, status=status.HTTP_404_NOT_FOUND)

        newly_matched = []
        previously_matched = []
        confirmed_matched = []
        previously_rejected = []

        # Fetch existing matches
        existing_matches = Match.objects.filter(unidentified_person=unidentified_person)

        for match in existing_matches:
            if match.missing_person:
                matched_person_data = MissingPersonSerializer(match.missing_person).data
                match_data = {
                    "id": match.id,
                    "match_id": match.match_id,
                    "matched_entity": matched_person_data,
                    "match_percentage": match.match_percentage
                }
                # Check if match is confirmed
                is_confirmed = ResolvedCase.objects.filter(unidentified_person=unidentified_person, match=match).exists()

                if is_confirmed:
                    confirmed_matched.append(match_data)
                elif match.is_rejected:
                    # If match is rejected, add to previously rejected list
                    previously_rejected.append(match_data)
                else:
                    previously_matched.append(match_data)

        # Fetch potential new matches
        missing_persons = MissingPerson.objects.filter(is_deleted=False)

        for missing_person in missing_persons:
            match_percentage = self.is_match_with_missing_person(unidentified_person, missing_person)[1]
            if match_percentage > 50:
                match_id = f"{unidentified_person.id}-{missing_person.id}-{match_percentage}"
                if not Match.objects.filter(match_id=match_id).exists():
                    try:
                        match = Match(
                            unidentified_person=unidentified_person,
                            missing_person=missing_person,
                            match_percentage=match_percentage,
                            match_id=match_id
                        )
                        match.save()
                        newly_matched_data = {
                            "match_id": match.match_id,
                            "matched_entity": MissingPersonSerializer(missing_person).data,
                            "match_percentage": match.match_percentage
                        }
                        newly_matched.append(newly_matched_data)
                    except IntegrityError:
                        continue

        # Prepare response data
        response_data = {
            "unidentified_person": UndefinedMissingpersonSerializer(unidentified_person).data,
            "newly_matched": newly_matched or "No newly matched persons found.",
            "previously_matched": previously_matched or "No previously matched persons found.",
            "confirmed_matched": confirmed_matched or "No confirmed matches found.",
            "previously_rejected": previously_rejected or "No previously rejected persons found."
        }

        return Response(response_data, status=status.HTTP_200_OK)

# api to serch between unidentified person to unidentified body
class SearchUnidentifiedPersonToUnidentifiedBodyMatches(APIView):
    
    def is_match_with_unidentified_body(self, unidentified_person, unidentified_body):
        match_score = 0
        total_checks = 0

        # 1. Full Name - Exact/Partial Match
        if unidentified_person.full_name and unidentified_body.full_name:
            total_checks += 1
            if unidentified_person.full_name.lower() == unidentified_body.full_name.lower():
                match_score += 1  # Exact match
            elif unidentified_person.full_name.lower() in unidentified_body.full_name.lower() or unidentified_body.full_name.lower() in unidentified_person.full_name.lower():
                match_score += 0.5  # Partial match

        # 2. Age - Approximate Match
        if unidentified_person.estimated_age is not None and unidentified_body.estimated_age is not None:
            total_checks += 1
            if abs(unidentified_person.estimated_age - unidentified_body.estimated_age) <= 5:  # Allow age range ±5
                match_score += 1

        # 3. Gender - Exact Match
        if unidentified_person.gender and unidentified_body.gender:
            total_checks += 1
            if unidentified_person.gender.lower() == unidentified_body.gender.lower():
                match_score += 1

        # 4. Height - Approximate Match
        if unidentified_person.height and unidentified_body.height:
            total_checks += 1
            if abs(unidentified_person.height - unidentified_body.height) <= 5:  # Allow height range ±5 cm
                match_score += 1

        # 5. Weight - Approximate Match
        if unidentified_person.weight and unidentified_body.weight:
            total_checks += 1
            if abs(unidentified_person.weight - unidentified_body.weight) <= 5:  # Allow weight range ±5 kg
                match_score += 1

        # 6. Complexion - Exact Match
        if unidentified_person.complexion and unidentified_body.complexion:
            total_checks += 1
            if unidentified_person.complexion.lower() == unidentified_body.complexion.lower():
                match_score += 1

        # 7. Hair Color - Exact Match
        if unidentified_person.hair_color and unidentified_body.hair_color:
            total_checks += 1
            if unidentified_person.hair_color.lower() == unidentified_body.hair_color.lower():
                match_score += 1

        # 8. Hair Type - Exact Match
        if unidentified_person.hair_type and unidentified_body.hair_type:
            total_checks += 1
            if unidentified_person.hair_type.lower() == unidentified_body.hair_type.lower():
                match_score += 1

        # 9. Eye Color - Exact Match
        if unidentified_person.eye_color and unidentified_body.eye_color:
            total_checks += 1
            if unidentified_person.eye_color.lower() == unidentified_body.eye_color.lower():
                match_score += 1

        # 10. Birth Mark - Exact Match
        if unidentified_person.birth_mark and unidentified_body.birth_mark:
            total_checks += 1
            if unidentified_person.birth_mark.lower() == unidentified_body.birth_mark.lower():
                match_score += 1

        # 11. Other Distinctive Marks - Exact Match
        if unidentified_person.distinctive_mark and unidentified_body.distinctive_mark:
            total_checks += 1
            if unidentified_person.distinctive_mark.lower() == unidentified_body.distinctive_mark.lower():
                match_score += 1

        # 12. Last Location of Unidentified Person vs Location Found - Geographic Proximity
        if unidentified_person.last_seen_location and unidentified_body.location_found:
            total_checks += 1
            if unidentified_person.last_seen_location.lower() == unidentified_body.location_found.lower():
                match_score += 1

        # Match percentage
        match_percentage = (match_score / total_checks) * 100 if total_checks > 0 else 0
        match_percentage = round(match_percentage, 2)
        
        # Return the match result: whether it's a match and the match percentage
        return match_percentage >= 50, match_percentage

    def get(self, request, *args, **kwargs):
        id = kwargs.get('id')  

        try:
            # Get unidentified person by ID
            unidentified_person = UnidentifiedMissingPerson.objects.get(id=id, is_deleted=False)
        except UnidentifiedMissingPerson.DoesNotExist:
            return Response({'error': 'Unidentified person not found'}, status=status.HTTP_404_NOT_FOUND)

        newly_matched = []
        previously_matched = []
        confirmed_matched = []
        previously_rejected = []

        # Fetch existing matches (including rejected)
        existing_matches = Match.objects.filter(unidentified_person=unidentified_person)

        for match in existing_matches:
            if match.unidentified_body:
                matched_body_data = UnidentifiedBodySerializer(match.unidentified_body).data
                match_data = {
                    "id": match.id,
                    "match_id": match.match_id,
                    "matched_entity": matched_body_data,
                    "match_percentage": match.match_percentage
                }
                # Check if match is confirmed
                is_confirmed = ResolvedCase.objects.filter(unidentified_person=unidentified_person, match=match).exists()

                if is_confirmed:
                    confirmed_matched.append(match_data)
                elif match.is_rejected:
                    # If match is rejected, add to previously rejected list
                    previously_rejected.append(match_data)
                else:
                    previously_matched.append(match_data)

        # Fetch potential new matches
        unidentified_bodies = UnidentifiedBody.objects.filter(is_deleted=False)

        for unidentified_body in unidentified_bodies:
            match_percentage = self.is_match_with_unidentified_body(unidentified_person, unidentified_body)[1]
            if match_percentage > 50:
                match_id = f"{unidentified_person.id}-{unidentified_body.id}-{match_percentage}"
                if not Match.objects.filter(match_id=match_id).exists():
                    try:
                        match = Match(
                            unidentified_person=unidentified_person,
                            unidentified_body=unidentified_body,
                            match_percentage=match_percentage,
                            match_id=match_id
                        )
                        match.save()
                        newly_matched_data = {
                            "match_id": match.match_id,
                            "matched_entity": UnidentifiedBodySerializer(unidentified_body).data,
                            "match_percentage": match.match_percentage
                        }
                        newly_matched.append(newly_matched_data)
                    except IntegrityError:
                        continue

        # Prepare response data
        response_data = {
            "unidentified_person": UndefinedMissingpersonSerializer(unidentified_person).data,
            "newly_matched": newly_matched or "No newly matched bodies found.",
            "previously_matched": previously_matched or "No previously matched bodies found.",
            "confirmed_matched": confirmed_matched or "No confirmed matches found.",
            "previously_rejected": previously_rejected or "No previously rejected bodies found."
        }

        return Response(response_data, status=status.HTTP_200_OK)

# api to search between unidnetified body to unidnetified person
class SearchUnidentifiedBodyToUnidentifiedPersonMatches(APIView):

    def is_match_with_unidentified_person(self, unidentified_body, unidentified_person):
        match_score = 0
        total_checks = 0

        # 1. Full Name - Exact/Partial Match
        if unidentified_body.full_name and unidentified_person.full_name:
            total_checks += 1
            if unidentified_body.full_name.lower() == unidentified_person.full_name.lower():
                match_score += 1  # Exact match
            elif unidentified_body.full_name.lower() in unidentified_person.full_name.lower() or unidentified_person.full_name.lower() in unidentified_body.full_name.lower():
                match_score += 0.5  # Partial match

        # 2. Age - Approximate Match
        if unidentified_body.estimated_age is not None and unidentified_person.estimated_age is not None:
            total_checks += 1
            if abs(unidentified_body.estimated_age - unidentified_person.estimated_age) <= 5:  # Allow age range ±5
                match_score += 1

        # 3. Gender - Exact Match
        if unidentified_body.gender and unidentified_person.gender:
            total_checks += 1
            if unidentified_body.gender == unidentified_person.gender:
                match_score += 1

        # 4. Height - Approximate Match
        if unidentified_body.height and unidentified_person.height:
            total_checks += 1
            if abs(unidentified_body.height - unidentified_person.height) <= 5:  # Allow height range ±5 cm
                match_score += 1

        # 5. Weight - Approximate Match
        if unidentified_body.weight and unidentified_person.weight:
            total_checks += 1
            if abs(unidentified_body.weight - unidentified_person.weight) <= 5:  # Allow weight range ±5 kg
                match_score += 1

        # 6. Complexion - Exact Match
        if unidentified_body.complexion and unidentified_person.complexion:
            total_checks += 1
            if unidentified_body.complexion.lower() == unidentified_person.complexion.lower():
                match_score += 1

        # 7. Hair Color - Exact Match
        if unidentified_body.hair_color and unidentified_person.hair_color:
            total_checks += 1
            if unidentified_body.hair_color.lower() == unidentified_person.hair_color.lower():
                match_score += 1

        # 8. Hair Type - Exact Match
        if unidentified_body.hair_type and unidentified_person.hair_type:
            total_checks += 1
            if unidentified_body.hair_type.lower() == unidentified_person.hair_type.lower():
                match_score += 1

        # 9. Eye Color - Exact Match
        if unidentified_body.eye_color and unidentified_person.eye_color:
            total_checks += 1
            if unidentified_body.eye_color.lower() == unidentified_person.eye_color.lower():
                match_score += 1

        # 10. Birth Mark - Exact Match
        if unidentified_body.birth_mark and unidentified_person.birth_mark:
            total_checks += 1
            if unidentified_body.birth_mark.lower() == unidentified_person.birth_mark.lower():
                match_score += 1

        # 11. Other Distinctive Marks - Exact Match
        if unidentified_body.distinctive_mark and unidentified_person.distinctive_mark:
            total_checks += 1
            if unidentified_body.distinctive_mark.lower() == unidentified_person.distinctive_mark.lower():
                match_score += 1

        # 12. Last Location of Missing Person vs Location Found - Geographic Proximity
        if unidentified_body.body_seen_details and unidentified_person.last_seen_location:
            total_checks += 1
            if unidentified_body.body_seen_details.lower() == unidentified_person.last_seen_location.lower():
                match_score += 1

        # Match percentage
        match_percentage = (match_score / total_checks) * 100 if total_checks > 0 else 0
        match_percentage = round(match_percentage, 2)
        return match_percentage >= 50, match_percentage

    def get(self, request, *args, **kwargs):
        id = kwargs.get('id')  

        try:
            # Get unidentified body by ID
            unidentified_body = UnidentifiedBody.objects.get(id=id, is_deleted=False)
        except UnidentifiedBody.DoesNotExist:
            return Response({'error': 'Unidentified body not found'}, status=status.HTTP_404_NOT_FOUND)

        newly_matched = []
        previously_matched = []
        confirmed_matched = []
        previously_rejected = []

        # Fetch existing matches
        existing_matches = Match.objects.filter(unidentified_body=unidentified_body, is_rejected=False)

        for match in existing_matches:
            if match.unidentified_person:
                matched_person_data = UndefinedMissingpersonSerializer(match.unidentified_person).data
                match_data = {
                    "id": match.id,
                    "match_id": match.match_id,
                    "matched_entity": matched_person_data,
                    "match_percentage": match.match_percentage
                }

                # Check if this match has already been confirmed
                is_confirmed = ResolvedCase.objects.filter(unidentified_body=unidentified_body, match=match).exists()

                if is_confirmed:
                    confirmed_matched.append(match_data)
                else:
                    previously_matched.append(match_data)

        # Fetch rejected matches
        rejected_matches_qs = MatchRejection.objects.filter(unidentified_body=unidentified_body)
        rejected_person_ids = rejected_matches_qs.values_list('unidentified_person_id', flat=True)

        for rejection in rejected_matches_qs:
            match_percentage = rejection.matched_percentage
            match_id = rejection.MATCH_id or "No match ID"

            if rejection.unidentified_person:
                rejected_data = {
                    "Matched_With": "Unidentified Person",
                    "id": rejection.unidentified_person.id,
                    "match_id": match_id,
                    "name": rejection.unidentified_person.full_name,
                    "match_percentage": match_percentage,
                    "person_details": UnidentifiedMissingPerson(rejection.unidentified_person).data
                }
                previously_rejected.append(rejected_data)

        # Fetch potential new matches
        unidentified_persons = UnidentifiedMissingPerson.objects.filter(is_deleted=False)

        for unidentified_person in unidentified_persons:
            match_percentage = self.is_match_with_unidentified_person(unidentified_body, unidentified_person)[1]
            if match_percentage > 50:
                match_id = f"{unidentified_body.id}-{unidentified_person.id}-{match_percentage}"
                if not Match.objects.filter(match_id=match_id).exists():
                    try:
                        match = Match(
                            unidentified_body=unidentified_body,
                            unidentified_person=unidentified_person,
                            match_percentage=match_percentage,
                            match_id=match_id
                        )
                        match.save()
                        newly_matched_data = {
                            "match_id": match.match_id,
                            "matched_entity": UnidentifiedMissingPerson(unidentified_person).data,
                            "match_percentage": match.match_percentage
                        }
                        newly_matched.append(newly_matched_data)
                    except IntegrityError:
                        continue

        # Prepare the response data
        response_data = {
            "unidentified_body": UnidentifiedBodySerializer(unidentified_body).data,
            "newly_matched": newly_matched or "No newly matched persons found.",
            "previously_matched": previously_matched or "No previously matched persons found.",
            "previously_rejected": previously_rejected or "No previously rejected persons found.",
            "confirmed_matched": confirmed_matched or "No confirmed matches found."
        }

        return Response(response_data, status=status.HTTP_200_OK)

# api to search between unidnetified body to missing person person
class SearchUnidentifiedBodyToMissingPersonMatches(APIView):

    def is_match_with_missing_person(self, unidentified_body, missing_person):
        match_score = 0
        total_checks = 0

        # 1. Full Name - Exact/Partial Match
        if unidentified_body.full_name and missing_person.full_name:
            total_checks += 1
            if unidentified_body.full_name.lower() == missing_person.full_name.lower():
                match_score += 1  # Exact match
            elif unidentified_body.full_name.lower() in missing_person.full_name.lower() or missing_person.full_name.lower() in unidentified_body.full_name.lower():
                match_score += 0.5  # Partial match

        # 2. Age - Approximate Match
        if unidentified_body.estimated_age is not None and missing_person.age is not None:
            total_checks += 1
            if abs(unidentified_body.estimated_age - missing_person.age) <= 5:  # Allow age range ±5
                match_score += 1

        # 3. Gender - Exact Match
        if unidentified_body.gender and missing_person.gender:
            total_checks += 1
            if unidentified_body.gender == missing_person.gender:
                match_score += 1

        # 4. Height - Approximate Match
        if unidentified_body.height and missing_person.height:
            total_checks += 1
            if abs(unidentified_body.height - missing_person.height) <= 5:  # Allow height range ±5 cm
                match_score += 1

        # 5. Weight - Approximate Match
        if unidentified_body.weight and missing_person.weight:
            total_checks += 1
            if abs(unidentified_body.weight - missing_person.weight) <= 5:  # Allow weight range ±5 kg
                match_score += 1

        # 6. Complexion - Exact Match
        if unidentified_body.complexion and missing_person.complexion:
            total_checks += 1
            if unidentified_body.complexion.lower() == missing_person.complexion.lower():
                match_score += 1

        # 7. Hair Color - Exact Match
        if unidentified_body.hair_color and missing_person.hair_color:
            total_checks += 1
            if unidentified_body.hair_color.lower() == missing_person.hair_color.lower():
                match_score += 1

        # 8. Hair Type - Exact Match
        if unidentified_body.hair_type and missing_person.hair_type:
            total_checks += 1
            if unidentified_body.hair_type.lower() == missing_person.hair_type.lower():
                match_score += 1

        # 9. Eye Color - Exact Match
        if unidentified_body.eye_color and missing_person.eye_color:
            total_checks += 1
            if unidentified_body.eye_color.lower() == missing_person.eye_color.lower():
                match_score += 1

        # 10. Birth Mark - Exact Match
        if unidentified_body.birth_mark and missing_person.birth_mark:
            total_checks += 1
            if unidentified_body.birth_mark.lower() == missing_person.birth_mark.lower():
                match_score += 1

        # 11. Other Distinctive Marks - Exact Match
        if unidentified_body.distinctive_mark and missing_person.distinctive_mark:
            total_checks += 1
            if unidentified_body.distinctive_mark.lower() == missing_person.distinctive_mark.lower():
                match_score += 1

        # 12. Last Location of Missing Person vs Location Found - Geographic Proximity
        if unidentified_body.location_found and missing_person.last_seen_location:
            total_checks += 1
            if unidentified_body.location_found.lower() == missing_person.last_seen_location.lower():
                match_score += 1

        # Match percentage
        match_percentage = (match_score / total_checks) * 100 if total_checks > 0 else 0
        match_percentage = round(match_percentage, 2)
        return match_percentage >= 50, match_percentage

    def get(self, request, *args, **kwargs):
        id = kwargs.get('id')  

        try:
            # Get unidentified body by ID
            unidentified_body = UnidentifiedBody.objects.get(id=id, is_deleted=False)
        except UnidentifiedBody.DoesNotExist:
            return Response({'error': 'Unidentified body not found'}, status=status.HTTP_404_NOT_FOUND)

        newly_matched = []
        previously_matched = []
        confirmed_matched = []
        previously_rejected = []

        # Fetch existing matches
        existing_matches = Match.objects.filter(unidentified_body=unidentified_body, is_rejected=False)

        for match in existing_matches:
            if match.missing_person:
                matched_person_data = MissingPersonSerializer(match.missing_person).data
                match_data = {
                    "id": match.id,
                    "match_id": match.match_id,
                    "matched_entity": matched_person_data,
                    "match_percentage": match.match_percentage
                }

                # Check if this match has already been confirmed
                is_confirmed = ResolvedCase.objects.filter(unidentified_body=unidentified_body, match=match).exists()

                if is_confirmed:
                    confirmed_matched.append(match_data)
                else:
                    previously_matched.append(match_data)

        # Fetch rejected matches
        rejected_matches_qs = MatchRejection.objects.filter(unidentified_body=unidentified_body)
        rejected_missing_ids = rejected_matches_qs.values_list('missing_person_id', flat=True)

        for rejection in rejected_matches_qs:
            match_percentage = rejection.matched_percentage
            match_id = rejection.MATCH_id or "No match ID"

            if rejection.missing_person:
                rejected_data = {
                    "Matched_With": "Missing Person",
                    "id": rejection.missing_person.id,
                    "match_id": match_id,
                    "name": rejection.missing_person.full_name,
                    "match_percentage": match_percentage,
                    "person_details": MissingPersonSerializer(rejection.missing_person).data
                }
                previously_rejected.append(rejected_data)

        # Fetch potential new matches
        missing_persons = MissingPerson.objects.filter(is_deleted=False)

        for missing_person in missing_persons:
            match_percentage = self.is_match_with_missing_person(unidentified_body, missing_person)[1]
            if match_percentage > 50:
                match_id = f"{unidentified_body.id}-{missing_person.id}-{match_percentage}"
                if not Match.objects.filter(match_id=match_id).exists():
                    try:
                        match = Match(
                            unidentified_body=unidentified_body,
                            missing_person=missing_person,
                            match_percentage=match_percentage,
                            match_id=match_id
                        )
                        match.save()
                        newly_matched_data = {
                            "match_id": match.match_id,
                            "matched_entity": MissingPersonSerializer(missing_person).data,
                            "match_percentage": match.match_percentage
                        }
                        newly_matched.append(newly_matched_data)
                    except IntegrityError:
                        continue

        # Prepare the response data
        response_data = {
            "unidentified_body": UnidentifiedBodySerializer(unidentified_body).data,
            "newly_matched": newly_matched or "No newly matched persons found.",
            "previously_matched": previously_matched or "No previously matched persons found.",
            "previously_rejected": previously_rejected or "No previously rejected persons found.",
            "confirmed_matched": confirmed_matched or "No confirmed matches found."
        }

        return Response(response_data, status=status.HTTP_200_OK)


# to reject and unreject 
class RejectMatch(APIView):
    logger = logging.getLogger(__name__)

    def post(self, request, unique_id, match_id):
        return self._reject_match(request, unique_id, match_id)
    
    def _reject_match(self, request, unique_id, match_id):
        missing_person = get_object_or_404(MissingPerson, unique_id=unique_id)

        # Extract the rejection_reason from the request data (match_id is passed as URL param)
        rejection_reason = request.data.get('rejection_reason')

        # If rejection reason is not provided, return a 400 error
        if not rejection_reason:
            return Response({'error': 'Rejection reason is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Retrieve the match associated with the missing person and match_id
            match = Match.objects.get(match_id=match_id, missing_person=missing_person)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

        # Identify the relevant entity for the match: either an unidentified body or undefined missing person
        if match.unidentified_body:
            unidentified_body = match.unidentified_body
            undefined_missing_person = None
            matched_entity = unidentified_body
            serializer = UnidentifiedBodySerializer(matched_entity)
        elif match.undefined_missing_person:
            undefined_missing_person = match.undefined_missing_person
            unidentified_body = None
            matched_entity = undefined_missing_person
            serializer = UndefinedMissingpersonSerializer(matched_entity)
        else:
            return Response({'error': 'Match does not have either an Unidentified Body or Undefined Missing Person.'},
                             status=status.HTTP_400_BAD_REQUEST)

        # Check if a rejection already exists for this match
        existing_rejection = MatchRejection.objects.filter(
            missing_person=missing_person,
            unidentified_body=unidentified_body,
            undefined_missing_person=undefined_missing_person
        ).exists()

        if existing_rejection:
            return Response({'error': 'This match has already been rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the match percentage for context in the rejection
        match_percentage = match.match_percentage

        # Create a new MatchRejection instance
        rejection = MatchRejection.objects.create(
            missing_person=missing_person,
            unidentified_body=unidentified_body,
            undefined_missing_person=undefined_missing_person,
            rejection_reason=rejection_reason,
            matched_percentage=match_percentage,
            MATCH_id=match.match_id
        )

        # Mark the match as rejected
        match.is_rejected = True
        match.save()
        missing_person_serializer = MissingPersonSerializer(missing_person)

        # Return a success response with the match_id from the rejection object and matched entity details
        return Response({
            'message': 'Match rejected successfully',
            'match_id': rejection.MATCH_id,
            'matched_entity_details': serializer.data,
            'missing_person_details': missing_person_serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request, unique_id, match_id):
        self.logger.debug(f"Received unique_id: {unique_id}, match_id: {match_id}")  # Debug log for tracing
        return self._unreject_match(request, unique_id, match_id)

    def _unreject_match(self, request, unique_id, match_id):
        # Fetch the MissingPerson object using unique_id or return 404 if not found
        missing_person = get_object_or_404(MissingPerson, unique_id=unique_id)

        # Extract the match_id from the request data (match_id is passed as URL param)
        try:
            match = Match.objects.get(match_id=match_id, missing_person=missing_person)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the match is already not rejected
        if not match.is_rejected:
            return Response({'error': 'This match has not been rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark the match as no longer rejected
        match.is_rejected = False
        match.save()

        # Delete the rejection record
        MatchRejection.objects.filter(MATCH_id=match.match_id).delete()

        # Return a success response indicating the match was unrejected
        return Response({
            'message': 'Match unrejected successfully',
            'match_id': match.match_id,
            'status': 'rejected status reset'
        }, status=status.HTTP_200_OK) 
      
# to confirm the matched data
class ConfirmMatchView(APIView):

    def post(self, request):
        missing_person_name = request.data.get('missing_person_name')
        confirmed_by_name = request.data.get('confirmed_by_name') 
        confirmed_by_contact = request.data.get('confirmed_by_contact')  
        confirmed_by_relationship = request.data.get('confirmed_by_relationship')  
        notes = request.data.get('notes')  
        match_id = request.data.get('match_id')
        is_confirmed = request.data.get('is_confirmed', False)

        # Validate required fields
        required_fields = {
            "match_id": match_id,
            "missing_person_name": missing_person_name,
            "confirmed_by_name": confirmed_by_name,
            "confirmed_by_contact": confirmed_by_contact,
            "confirmed_by_relationship": confirmed_by_relationship
        }

        for field, value in required_fields.items():
            if not value:
                return Response({f"message": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the match
        try:
            match = Match.objects.get(match_id=match_id)
        except Match.DoesNotExist:
            return Response({'message': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

        if match.is_rejected:
            return Response({'message': 'This match has been rejected and cannot be confirmed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for deleted entities in the match
        def are_entities_deleted(match):
            return (
                match.missing_person.is_deleted or
                (match.undefined_missing_person and match.undefined_missing_person.is_deleted) or
                (match.unidentified_body and match.unidentified_body.is_deleted)
            )

        if are_entities_deleted(match):
            return Response({'message': 'One or more entities in the match are deleted.'}, status=status.HTTP_400_BAD_REQUEST)

        # Confirm or unmatch the match
        if is_confirmed:
            try:
                with transaction.atomic():
                    # Fetch the missing person
                    try:
                        missing_person = MissingPerson.objects.get(full_name=missing_person_name, is_deleted=False)
                    except MissingPerson.DoesNotExist:
                        return Response({'message': 'Missing person not found'}, status=status.HTTP_404_NOT_FOUND)

                    # Create and save the resolved case
                    resolved_case = ResolvedCase(
                        match=match,
                        missing_person=missing_person,
                        confirmed_by_name=confirmed_by_name,
                        confirmed_by_contact=confirmed_by_contact,
                        confirmed_by_relationship=confirmed_by_relationship,
                        notes=notes,
                        is_confirmed=True
                    )

                    # Assign the matched entity and update missing_person's status
                    if match.undefined_missing_person:
                        resolved_case.unidentified_missing_person = match.undefined_missing_person
                        # Update status: Found alive
                        missing_person.case_status = 'Found alive'
                    elif match.unidentified_body:
                        resolved_case.unidentified_body = match.unidentified_body
                        # Update status: Deceased
                        missing_person.case_status = 'Deceased'
                    else:
                        return Response({'message': 'Neither undefined_missing_person nor unidentified_body exists for this match.'}, status=status.HTTP_400_BAD_REQUEST)

                    # Save changes
                    resolved_case.save()
                    missing_person.save()

                    # Set the match as confirmed
                    match.is_confirmed = True
                    match.save()

                    # Serialize data for response
                    confirmation_time = now()
                    missing_person_data = MissingPersonSerializer(missing_person).data

                    match_data = {
                        'match': {
                            'missing_person': missing_person_data,
                            'confirmed_by': confirmed_by_name,
                            'confirmed_by_contact': confirmed_by_contact,
                            'confirmed_by_relationship': confirmed_by_relationship,
                            'notes': notes,
                            'match_type': match.match_type,
                            'match_percentage': match.match_percentage,
                            'match_id': match.match_id,
                            'confirmation_time': confirmation_time.isoformat()
                        }
                    }

                    # Include matched entity data
                    if match.undefined_missing_person:
                        match_data['match']['unidentified_missing_person'] = UndefinedMissingpersonSerializer(match.undefined_missing_person).data
                    elif match.unidentified_body:
                        match_data['match']['unidentified_body'] = UnidentifiedBodySerializer(match.unidentified_body).data

                    return Response(match_data, status=status.HTTP_200_OK)

            except Exception as e:
                # Rollback in case of any error
                return Response({"message": "An error occurred during confirmation.", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            
        return Response({"message": "Please specify if the match is confirmed."}, status=status.HTTP_400_BAD_REQUEST)

# to unconfirmed the rejected data
class UnmatchConfirmedMatch(APIView):
    def post(self, request):
        match_id = request.data.get('match_id')

        if not match_id:
            return Response({"message": "Match ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            match = Match.objects.get(match_id=match_id)
            
            # Check if the match has a confirmed related resolved case
            resolved_case = ResolvedCase.objects.filter(match=match).first()

            # If no resolved case or it's not confirmed, return an error
            if not resolved_case or not resolved_case.is_confirmed:
                return Response({"message": "This match is not confirmed, so it cannot be unmatched."}, status=status.HTTP_400_BAD_REQUEST)

            # Proceed with unmatching logic within a transaction
            with transaction.atomic():
                # Check if resolved_case is valid and has an ID before attempting deletion
                if resolved_case.id is not None:
                    resolved_case.delete()  # Delete the resolved case

                # Set the match as unconfirmed
                match.is_confirmed = False
                match.save()

            return Response({"message": "Match has been unmatched successfully."}, status=status.HTTP_200_OK)

        except Match.DoesNotExist:
            return Response({"message": "Match not found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"message": "An error occurred while unmatching.", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# api to close the case
class CaseReportView(APIView):
    def get(self, request, missing_person_name):
        report_data = []
        existing_report_data = []

        # No need to check query parameters, just use the URL parameter
        resolved_cases = ResolvedCase.objects.select_related(
            'missing_person', 'unidentified_missing_person', 'unidentified_body',
            'unidentified_body__hospital', 'unidentified_body__police_station_name_and_address',
            'match'
        )

        resolved_cases = resolved_cases.filter(missing_person__full_name__iexact=missing_person_name)

        if not resolved_cases:
            return Response({
                "message": f"No cases found for missing person: {missing_person_name}"
            }, status=status.HTTP_404_NOT_FOUND)

        for case in resolved_cases:
            report_identifier = f"{case.report_number}-{case.missing_person.id if case.missing_person else 'N/A'}"

            # Check for existing report in database
            existing_report = CaseReport.objects.filter(
                report_number=case.report_number,
            ).first()

            if existing_report:
                existing_report_data.append(CaseReportSerializer(existing_report).data)
                continue

            case_entry = {
                "report_number": case.report_number,
                "status": "Resolved",
                "date_reported": case.missing_person.missing_date if case.missing_person else None,
                "reported_by": case.confirmed_by_name,
                "age": case.missing_person.age if case.missing_person else None,
                "gender": case.missing_person.gender if case.missing_person else "N/A",
                "last_known_location": case.missing_person.last_seen_location if case.missing_person else "N/A",
                "fir_number": case.missing_person.fir_number if case.missing_person else "N/A",
                "police_station": case.missing_person.police_station_name_and_address if case.missing_person else None,
                "police_officer_assigned": case.missing_person.investigating_officer_name if case.missing_person else "N/A",
                "case_duration": (datetime.now().date() - case.missing_person.missing_date).days if case.missing_person and case.missing_person.missing_date else None,
                "resolution_summary": "",
                "matching_fields": "Full Name, Physical Traits, DNA",
                "closure_process": "Family notified, case closed.",
                "match_type": "",
                "MATCH_id": case.match.match_id if case.match else None,  
            }

            if case.missing_person and case.unidentified_body:
                case_entry["resolution_summary"] = "Matched with UDB (Unidentified Body) found."
                case_entry["legal_and_police_involvement"] = (
                    "Police initiated investigation after body identification, forensic details provided. "
                    "Police coordinated with NGOs for identification of missing person."
                )
                case_entry["hospital_and_forensic_involvement"] = (
                    "(DNA confirmed match for UDB), and Missing Person identification using physical traits and DNA."
                )
                case_entry["match_type"] = "Unidentified Missing Person & Unidentified Dead Body"
                case_entry["missing_person_pk"] = case.missing_person.pk if case.missing_person else None
                case_entry["unidentified_body_pk"] = case.unidentified_body.pk if case.unidentified_body else None
                case_entry["Hospital_pk"] = case.unidentified_body.hospital.pk if case.unidentified_body.hospital else None

            elif case.unidentified_body:
                case_entry["resolution_summary"] = "Matched with UDB (Unidentified Body) found."
                case_entry["legal_and_police_involvement"] = "Police initiated investigation after body identification, forensic details provided."
                case_entry["hospital_and_forensic_involvement"] = (
                    f"{case.unidentified_body.hospital.pk if case.unidentified_body.hospital else None}, "
                    f"{case.unidentified_body.police_station_name_and_address.pk if case.unidentified_body.police_station_name_and_address else None}"
                )
                case_entry["match_type"] = "Unidentified Dead Body"
                case_entry["unidentified_body_pk"] = case.unidentified_body.pk if case.unidentified_body else None

            elif case.unidentified_missing_person:
                case_entry["resolution_summary"] = "Matched with UMP (Unidentified Missing Person) found."
                case_entry["legal_and_police_involvement"] = "Police coordinated with NGOs for identification of missing person."
                case_entry["hospital_and_forensic_involvement"] = "Not Involved"
                case_entry["match_type"] = "Unidentified Missing Person"
                case_entry["unidentified_missing_person_pk"] = case.unidentified_missing_person.pk if case.unidentified_missing_person else None
                case_entry["missing_person_pk"] = case.missing_person.pk if case.missing_person else None

            # Create the report
            case_report = CaseReport.objects.create(**case_entry)
            report_data.append(CaseReportSerializer(case_report).data)

        return Response({
            "report_data": report_data,
            "existing_reports": existing_report_data,
            "message": "Report generated successfully"
        }, status=status.HTTP_200_OK)


























