from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from drf_yasg.utils import swagger_auto_schema

from ..Serializers.serializers import PersonSerializer

from ..models.person import Person


class PersonViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing person instances.
    """
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

    @swagger_auto_schema(
        operation_description="Retrieve a list of all persons",
        responses={200: PersonSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs) -> Response:
        """
        Retrieve a list of all persons.
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Create a new person",
        request_body=PersonSerializer,
        responses={201: PersonSerializer(), 400: "Bad Request"}
    )
    def create(self, request, *args, **kwargs) -> Response:
        """
        Create a new person.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @swagger_auto_schema(
        operation_description="Retrieve a specific person by ID",
        responses={200: PersonSerializer(), 404: "Not Found"}
    )
    def retrieve(self, request, *args, **kwargs) -> Response:
        """
        Retrieve a specific person by ID.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Update a person's details",
        request_body=PersonSerializer,
        responses={200: PersonSerializer(), 400: "Bad Request"}
    )
    def update(self, request, *args, **kwargs) -> Response:
        """
        Update a person's details.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Partially update a person's details",
        request_body=PersonSerializer,
        responses={200: PersonSerializer(), 400: "Bad Request"}
    )
    def partial_update(self, request, *args, **kwargs) -> Response:
        """
        Partially update a person's details.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Delete a person",
        responses={204: "No Content", 404: "Not Found"}
    )
    def destroy(self, request, *args, **kwargs) -> Response:
        """
        Delete a person.
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)