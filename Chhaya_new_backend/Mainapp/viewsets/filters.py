from django.db.models import Q
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from ..models import Person, Address

from rest_framework.permissions import AllowAny

class filter_Address_ViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    # List all states
    @action(detail=False, methods=['GET'])
    def states(self, request):
        # States from Person model
        person_states = (
            Person.objects
            .filter(~Q(state=None), ~Q(state=''))
            .values_list('state', flat=True)
            .distinct()
        )
        address_states = (
            Address.objects
            .filter(~Q(state=None), ~Q(state=''))
            .values_list('state', flat=True)
            .distinct()
        )
        states = sorted(set(person_states).union(set(address_states)))

        return Response(states)

    # List districts for a selected state
    @action(detail=False, methods=['GET'])
    def districts(self, request):
        state = request.query_params.get('state')
        if not state:
            return Response({"error": "Please select a state to view districts."}, status=400)
        # Districts from Person model
        person_districts = (
            Person.objects
            .filter(state=state)
            .exclude(district__isnull=True)
            .exclude(district__exact='')
            .values_list('district', flat=True)
            .distinct()
        )
        # Districts from Address model
        address_districts = (
            Address.objects
            .filter(state=state)
            .exclude(district__isnull=True)
            .exclude(district__exact='')
            .values_list('district', flat=True)
            .distinct()
        )
        # Combine, deduplicate, and sort
        districts = sorted(set(person_districts).union(set(address_districts)))
        return Response(districts)

    # List cities for a selected district
    @action(detail=False, methods=['GET'])
    def cities(self, request):
        district = request.query_params.get('district')
        if not district:
            return Response({"error": "Please select a district to view cities."}, status=400)

        # Cities from Person
        person_cities = (
            Person.objects
            .filter(district=district)
            .exclude(city__isnull=True)
            .exclude(city__exact='')
            .values_list('city', flat=True)
            .distinct()
        )

        # Cities from Address
        address_cities = (
            Address.objects
            .filter(district=district)
            .exclude(city__isnull=True)
            .exclude(city__exact='')
            .values_list('city', flat=True)
            .distinct()
        )

        # Combine and deduplicate
        cities = sorted(set(person_cities).union(set(address_cities)))

        return Response(cities)

    # List villages for a selected city
    @action(detail=False, methods=['GET'])
    def villages(self, request):
        city = request.query_params.get('city')
        if not city:
            return Response({"error": "Please select a city to view villages."}, status=400)

        # Villages from Person model
        person_villages = (
            Person.objects
            .filter(city=city)
            .exclude(village__isnull=True)
            .exclude(village__exact='')
            .values_list('village', flat=True)
            .distinct()
        )

        # Villages from Address model
        address_villages = (
            Address.objects
            .filter(city=city)
            .exclude(village__isnull=True)
            .exclude(village__exact='')
            .values_list('village', flat=True)
            .distinct()
        )

        villages = sorted(set(person_villages).union(set(address_villages)))
        return Response(villages)