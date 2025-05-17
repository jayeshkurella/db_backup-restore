from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Q
from uuid import UUID
from rest_framework.filters import OrderingFilter

from Mainapp.Serializers.serializers import ApprovePersonSerializer
from Mainapp.models import Person
from Mainapp.viewsets.pending_person_pagination import StatusPagination


class BasePersonListView(generics.ListAPIView):
    serializer_class = ApprovePersonSerializer
    pagination_class = StatusPagination


    def get_queryset(self):
        queryset = Person.objects.all()

        # Get filter parameters
        state = self.request.query_params.get('state')
        district = self.request.query_params.get('district')
        city = self.request.query_params.get('city')
        village = self.request.query_params.get('village')
        police_station = self.request.query_params.get('police_station')
        case_id = self.request.query_params.get('case_id')

        # Build filters
        filters = Q()
        if state:
            filters &= Q(state__iexact=state)
        if district:
            filters &= Q(district__iexact=district)
        if city:
            filters &= Q(city__iexact=city)
        if village:
            filters &= Q(village__iexact=village)
        if case_id:
            filters &= Q(case_id__iexact=case_id)
        if police_station:
            try:
                filters &= Q(firs__police_station__id=UUID(police_station))
            except ValueError:
                pass

        return queryset.filter(filters)


class StatusPersonView(BasePersonListView):
    """Base view for status-specific endpoints with count"""
    status = None  # To be overridden by subclasses

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(person_approve_status=self.status)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'count': queryset.count(),
                'results': serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })


class PendingPersonsView(StatusPersonView):
    status = 'pending'


class ApprovedPersonsView(StatusPersonView):
    status = 'approved'


class RejectedPersonsView(StatusPersonView):
    status = 'rejected'


class OnHoldPersonsView(StatusPersonView):
    status = 'on_hold'


class SuspendedPersonsView(StatusPersonView):
    status = 'suspended'


class StatusCountView(generics.GenericAPIView):
    def get(self, request):
        base_qs = BasePersonListView().get_queryset()
        return Response({
            'pending': base_qs.filter(person_approve_status='pending').count(),
            'approved': base_qs.filter(person_approve_status='approved').count(),
            'rejected': base_qs.filter(person_approve_status='rejected').count(),
            'on_hold': base_qs.filter(person_approve_status='on_hold').count(),
            'suspended': base_qs.filter(person_approve_status='suspended').count(),
        })