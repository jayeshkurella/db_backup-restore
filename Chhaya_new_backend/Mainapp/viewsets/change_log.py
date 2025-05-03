from rest_framework import viewsets
from rest_framework.response import Response

from Mainapp.Serializers.change_log import ChangeLogSerializer
from ..models import ChangeLog

class ChangeLogViewSet(viewsets.ModelViewSet):
    queryset = ChangeLog.objects.all().order_by('-date', '-id')  # Latest first
    serializer_class = ChangeLogSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Log deleted successfully"}, status=204)
