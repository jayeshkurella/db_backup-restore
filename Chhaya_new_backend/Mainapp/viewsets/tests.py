from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from Mainapp.models import PoliceStation, Address, User

class PoliceStationAPITestCase(TestCase):
    """ Test case for Police Station API """

    def setUp(self):
        """ Set up test dependencies """
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="admin@gmail.com", 
            password="admin",
            email_id="admin@gmail.com", 
            phone_no="1234567890"
        )

        self.address = Address.objects.create(
            type="PERMANENT",
            street="123 Street",
            city="Test City",
            district="Test District",
            state="Test State",
            pincode="123456",
            country="IN",
            created_by=self.user,
            updated_by=self.user
        )

        self.valid_data = {
            "name": "Test Police Station",
            "phone_no": "9876543210",
            "address": self.address.id  # Sending address ID
        }

    def test_create_police_station(self):
        """ Test creating a new police station """
        response = self.client.post(
            "/api/police-stations/",  # Change this URL if different
            self.valid_data,
            format="json"  # ✅ Ensure request is sent as JSON
        )
        print("Response Status Code:", response.status_code)
        print("Response Data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_police_stations(self):
        """ Test retrieving a list of police stations """
        PoliceStation.objects.create(name="Existing Police Station", phone_no="9999999999", address=self.address)
        response = self.client.get("/api/police-stations/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    # def test_delete_police_station(self):
    #     """ Test deleting a police station """
    #     police_station = PoliceStation.objects.create(name="Delete Test", phone_no="8888888888", address=self.address)
    #     response = self.client.delete(f"/api/police-stations/{police_station.id}/")
    #     self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
