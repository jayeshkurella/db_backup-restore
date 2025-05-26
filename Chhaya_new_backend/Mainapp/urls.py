from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

from .Additional_info_Tags.caste_tag import CasteListCreateAPIView, CasteDestroyAPIView
from .authentication.admin_user_management import AdminUserApprovalView
from .authentication.user_authentication import AuthAPIView
from .viewsets.casetype_apis import PendingPersonsView, ApprovedPersonsView, RejectedPersonsView, OnHoldPersonsView, \
    SuspendedPersonsView, StatusCountView
from .viewsets.filters import filter_Address_ViewSet
from .viewsets.hospital import HospitalViewSet, HospitalListView
from .viewsets.person_api import PersonViewSet
from .viewsets.police_station import PoliceStationViewSet, PoliceStationListView


from .matching_apis.missing_match_up import MissingPersonMatchWithUPsViewSet
from .viewsets.volunteer import VolunteerViewSet
from .viewsets.change_log import ChangeLogViewSet

router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')
router.register(r'police-stations', PoliceStationViewSet, basename='police-station')
router.register(r'hospitals', HospitalViewSet, basename='hospital')
router.register(r'filters_address', filter_Address_ViewSet, basename='filters')
router.register(r'volunteers',VolunteerViewSet,basename='volunteer')
router.register(r'changelogs', ChangeLogViewSet ,basename='chnagelog')
router.register(r'missing-person-with-ups', MissingPersonMatchWithUPsViewSet ,basename='missing-person-with-ups')


urlpatterns = [
    path('api/', include(router.urls)),
    path('api/users/', AuthAPIView.as_view(), name='user-auth'),
    path('reset-password/<str:reset_token>/', AuthAPIView.as_view(), name='reset-password-get'),
    path('reset-password/', AuthAPIView.as_view(), name='reset-password-post'),
    path("api/hospital-name-list/", HospitalListView.as_view(), name="hospital-list"),
    path("api/police-station-name-list/", PoliceStationListView.as_view(), name="police-station-list"),
    path("api/pending-users/", AdminUserApprovalView.as_view(), name="pending-users"),
    path("api/users/approve/<uuid:user_id>/", AdminUserApprovalView.as_view(), name="admin-approve-user"),
    path('api/persons_status/pending/', PendingPersonsView.as_view(), name='pending-persons'),
    path('api/persons_status/approved/', ApprovedPersonsView.as_view(), name='approved-persons'),
    path('api/persons_status/rejected/', RejectedPersonsView.as_view(), name='rejected-persons'),
    path('api/persons_status/on_hold/', OnHoldPersonsView.as_view(), name='on-hold-persons'),
    path('api/persons_status/suspended/', SuspendedPersonsView.as_view(), name='suspended-persons'),
    path('api/persons_status/status_counts/', StatusCountView.as_view(), name='status-counts'),
    path('api/castes_tags/', CasteListCreateAPIView.as_view(), name='caste-list-create'),
    path('api/caste_delete/<int:pk>/', CasteDestroyAPIView.as_view(), name='caste-delete'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
