from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from .authentication.admin_user_management import AdminUserApprovalView
from .authentication.user_authentication import AuthAPIView
from .viewsets.filters import filter_Address_ViewSet
from .viewsets.hospital import HospitalViewSet, HospitalListView
from .viewsets.person_api import PersonViewSet
from .viewsets.police_station import PoliceStationViewSet

from .match.missing_person_with_UP import MatchMPWithUPAPIView
from .match.missing_person_with_UB import MatchMPWithUBAPIView
router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')
router.register(r'police-stations', PoliceStationViewSet, basename='police-station')
router.register(r'hospitals', HospitalViewSet, basename='hospital')
router.register(r'filters_address', filter_Address_ViewSet, basename='filters')


urlpatterns = [
    path('api/', include(router.urls)),
    path('api/users/', AuthAPIView.as_view(), name='user-auth'),
    path("api/hospital-name-list/", HospitalListView.as_view(), name="hospital-list"),
    path('api/match/mp-to-ups/<uuid:mp_id>/', MatchMPWithUPAPIView.as_view(), name='match-mp-to-ups'),
    path('api/match/mp-to-ubs/<uuid:mp_id>/', MatchMPWithUBAPIView.as_view(), name='match-mp-to-ubs'),
    path("api/pending-users/", AdminUserApprovalView.as_view(), name="pending-users"),
    path("api/users/approve/<uuid:user_id>/", AdminUserApprovalView.as_view(), name="admin-approve-user"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
