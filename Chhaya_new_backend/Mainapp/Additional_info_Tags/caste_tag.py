from rest_framework import generics

from .caste import Caste
from .serializers import CasteSerializer
from ..access_permision import AllUserAccess, IsAdminUser


class CasteListCreateAPIView(generics.ListCreateAPIView):
    queryset = Caste.objects.all().order_by('name')
    serializer_class = CasteSerializer


class CasteDestroyAPIView(generics.DestroyAPIView):
    queryset = Caste.objects.all()
    serializer_class = CasteSerializer
    permission_classes = [IsAdminUser]