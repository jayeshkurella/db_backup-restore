from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

from .authentication.user_authentication import AuthAPIView
from .viewsets.hospital import HospitalViewSet, HospitalListView
from .viewsets.person_api import PersonViewSet
from .viewsets.police_station import PoliceStationViewSet

router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')
router.register(r'police-stations', PoliceStationViewSet, basename='police-station')
router.register(r'hospitals', HospitalViewSet, basename='hospital')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/users/', AuthAPIView.as_view(), name='user-auth'),
    path("api/hospital-name-list/", HospitalListView.as_view(), name="hospital-list"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
