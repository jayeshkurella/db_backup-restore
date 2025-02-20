from django.urls import path, include
from rest_framework.routers import DefaultRouter

from Mainapp.viewsets.person_api import PersonViewSet

router = DefaultRouter()
router.register(r'persons', PersonViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
