from django.urls import path, re_path
from django.conf.urls.static import static
from django.conf import settings
from .views import CaseReportView, ChowkiAPIView, ConfirmMatchView, DivisionAPIView, HospitalAPIView, HospitalDivisionAPIView, HospitalZoneAPIView, MatchUnidentifiedBodyWithMissingPerson, MissingPersonAPIView, PoliceStationAPIView, RejectMatch, SearchAllMatches, SearchUndefinedMissingPersonMatches, SearchUnidentifiedBodyMatches, UnidentifiedBodyAPIView, UnidentifiedMissingperson, UnmatchConfirmedMatch, VolunteerAPIView, ZoneAPIView
from .allcounts import CityListView, DistrictListView, GenderApiView, MissingPersonGenderCount, PoliceStationListView, StateListView, DistrictListView, maritallistview, missingpersoncount, unidentifiedbodiescount, unidentifiedpersoncount, villageListView
from  . import allcounts

urlpatterns = [
    
    # url for missing person
    path('missing-person/', MissingPersonAPIView.as_view(), name='missing_person_list'),
    path('missing-person/<int:missing_person_id>/', MissingPersonAPIView.as_view(), name='missing_person_detail'),
    
    # url for the unidentified missing person
    path('undefined-missing-persons/', UnidentifiedMissingperson.as_view(), name='undefined_missing_persons'),
    path('undefined-missing-persons/<int:undefined_missing_person_id>/', UnidentifiedMissingperson.as_view(), name='undefined_missing_person_detail'),
    
    # url for the unidentified dead body
    path('unidentified-bodies/', UnidentifiedBodyAPIView.as_view(), name='unidentified-body-list'),
    path('unidentified-bodies/<int:unidentified_body_id>/', UnidentifiedBodyAPIView.as_view(), name='unidentified-body-detail'),
    
    # url for the volunteer
    path('volunteer/', VolunteerAPIView.as_view(), name='volunteer-list'),
    path('volunteer/<int:volunteer_id>/', VolunteerAPIView.as_view(), name='volunteer-detail'),
    
    # url for the match data between two persons
    path('search-all-matches/', SearchAllMatches.as_view(), name='search_all_matches'),
    path('search-with-bodies/', MatchUnidentifiedBodyWithMissingPerson.as_view(), name='search_withbodies'),

    
    # url to reject some of matched data
    
    path('rejecte/<str:unique_id>/<str:match_id>/', RejectMatch.as_view(), name='reject_match'),
    path('unreject/<str:unique_id>/<str:match_id>/', RejectMatch.as_view(), name='unreject_match'),
   
    # url for the confirm data after match the data
    path('confirm_match/', ConfirmMatchView.as_view(), name='confirm-match'),
    path('unconfirm_match/', UnmatchConfirmedMatch.as_view(), name='unconfirm_match'),
    
    # url to generate the report
    path('report/<str:missing_person_name>/', CaseReportView.as_view(), name='case_report'),    
    # this urls for the police stations 
    path('police-zones/', ZoneAPIView.as_view(), name='zone-list-create'),  
    path('police-zones/<int:pk>/', ZoneAPIView.as_view(), name='zone-detail'),  
    path('police-divisions/', DivisionAPIView.as_view(), name='division-list-create'),  
    path('police-divisions/<int:pk>/', DivisionAPIView.as_view(), name='division-detail'),  
    path('police-stations/', PoliceStationAPIView.as_view(), name='police-station-list-create'), 
    path('police-stations/<int:pk>/', PoliceStationAPIView.as_view(), name='police-station-detail'),   
    path('police-chowkis/', ChowkiAPIView.as_view(), name='chowki-list-create'),  
    path('police-chowkis/<int:pk>/', ChowkiAPIView.as_view(), name='chowki-detail'), 
    
    # this api for the hospitals 
    path('hospital-zones/', HospitalZoneAPIView.as_view(), name='hospital-zone-list'),  
    path('hospital-zones/<int:pk>/', HospitalZoneAPIView.as_view(), name='hospital-zone-detail'),  
    path('hospital-divisions/', HospitalDivisionAPIView.as_view(), name='hospital-division-list'),  
    path('hospital-divisions/<int:pk>/', HospitalDivisionAPIView.as_view(), name='hospital-division-detail'),
    path('hospitals/', HospitalAPIView.as_view(), name='hospital-list'), 
    path('hospitals/<int:pk>/', HospitalAPIView.as_view(), name='hospital-detail'), 
    
    
    
    # counts of data
    path('missingpersonscount/', missingpersoncount.as_view(), name='person-list'),
    path('unidentifiedpersoncount/', unidentifiedpersoncount.as_view(), name='person-list'),
    path('unidentifiedbodiescount/', unidentifiedbodiescount.as_view(), name='person-list'),
    path('countbygender/', MissingPersonGenderCount.as_view(), name='person-list'),
    path('StateList/', StateListView.as_view()),
    path('CitiesList/', CityListView.as_view()),
    path('districtList/', DistrictListView.as_view()),
    path('genderList/', GenderApiView.as_view()),
    path('maritallist/', maritallistview.as_view()),
    path('villages/', villageListView.as_view()),
    path('filtered-unidentified-bodies/', allcounts.get_filtered_unidentified_bodies),
    path('filtered-unidentified-person/', allcounts.get_filtered_unidentified_persons),
    path('filtered-missing-person/', allcounts.get_filtered_missing_persons),
    path('policeStationList/', PoliceStationListView.as_view(), name='police-station-list'),


    path('search/undefined_missing_person_matches/<int:id>/', SearchUndefinedMissingPersonMatches.as_view(), name='search_undefined_missing_person_matches'),
    path('search/unidentified_body_matches/<int:id>/', SearchUnidentifiedBodyMatches.as_view(), name='search_unidentified_body_matches'),



    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



