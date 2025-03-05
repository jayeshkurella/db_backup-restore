from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from Mainapp.models import Person


class filter_Address_ViewSet(viewsets.ViewSet):
    # List all states
    @action(detail=False, methods=['GET'])
    def states(self, request):
        states = Person.objects.values_list('state', flat=True).distinct()
        return Response(states)

    # List districts for a selected state
    @action(detail=False, methods=['GET'])
    def districts(self, request):
        state = request.query_params.get('state')
        if not state:
            return Response({"error": "Please select a state to view districts."}, status=400)
        districts = Person.objects.filter(state=state).values_list('district', flat=True).distinct()
        return Response(districts)

    # List cities for a selected district
    @action(detail=False, methods=['GET'])
    def cities(self, request):
        district = request.query_params.get('district')
        if not district:
            return Response({"error": "Please select a district to view cities."}, status=400)
        cities = Person.objects.filter(district=district).values_list('city', flat=True).distinct()
        return Response(cities)

    # List villages for a selected city
    @action(detail=False, methods=['GET'])
    def villages(self, request):
        city = request.query_params.get('city')
        if not city:
            return Response({"error": "Please select a city to view villages."}, status=400)
        villages = Person.objects.filter(city=city).values_list('village', flat=True).distinct()
        return Response(villages)