import { AfterViewChecked, Component, OnInit } from '@angular/core';
declare var bootstrap: any;
import * as L from 'leaflet';
import { catchError } from 'rxjs/operators';
import { VolunteeapiService } from './volunteeapi.service';
import { environment } from 'src/envirnments/envirnment';

@Component({
  selector: 'app-volunteers',
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.css']
})
export class VolunteersComponent implements OnInit, AfterViewChecked {

  environment = environment;
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  selectedPerson: any = null;
  allvolunteersPersons: any[] = [];  // Initialize as an empty array

  pagination: any = {
    current_page: 1,
    total_pages: 1,
    has_previous: false,
    has_next: false
  };

  constructor(private volunteersapi: VolunteeapiService) { }

  ngOnInit(): void {
    this.loadvolunteerPersons(this.pagination.current_page);
  }

  ngAfterViewChecked(): void {
    if (this.selectedPerson && this.selectedPerson.geometry && !this.map) {
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }

  onPageChangeevent(page: number): void {
    this.loadvolunteerPersons(page);
  }

  loadvolunteerPersons(page: number): void {
    const cachedData = this.volunteersapi.getCachedData(page);
    if (cachedData) {
      this.allvolunteersPersons = cachedData.data;
      this.pagination = cachedData.pagination;
    } else {
      this.volunteersapi.getvolunteerPersonss(page).subscribe(
        (data) => {
          if (data && data.data) {
            this.volunteersapi.cacheDataWithExpiry(page, data);
            // Ensure that the data.data is an array
            this.allvolunteersPersons = Array.isArray(data.data) ? data.data : [];
            this.pagination = data.pagination;
          } else {
            console.error('Invalid data received from the API');
          }
        },
        (error) => {
          console.error('API call failed', error);  // Log error if API fails
        }
      );
    }
  }
  

  viewDetails(person: any): void {
    if (person && person.full_name) {
      this.selectedPerson = person;
      const modal = new bootstrap.Modal(document.getElementById('personModal') as HTMLElement);
      modal.show();
      this.removePreviousMarker();

      setTimeout(() => {
        this.initMap();
      }, 300);
    } else {
      console.error('Selected person is not valid');
    }
  }

  removePreviousMarker(): void {
    if (this.marker) {
      this.map?.removeLayer(this.marker);
      this.marker = undefined;
    }
  }

  initMap(): void {
    if (!this.selectedPerson) {
      console.error('No selected person available');
      return;
    }

    const location = this.selectedPerson.geometry?.coordinates;

    // Handle case when no location data is available
    if (!location) {
      console.error('No valid coordinates found for the selected person');
      return;
    }

    if (!this.map) {
      this.map = L.map('map', {
        center: [0, 0],
        zoom: 8,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
    }

    const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      shadowSize: [41, 41],
    });

    // Handle the person's location
    const coordinates = location;
    const popupContent = `
      <div>
        <p><strong>Type:</strong> Volunteer Home Location</p>
        <p><strong>Volunteer Name:</strong> ${this.selectedPerson.full_name}</p>
        <p><strong>Volunteer Contact:</strong> ${this.selectedPerson.address.phone_number}</p>
        <p><strong>Volunteer Group:</strong> ${this.selectedPerson.volunteer_group}</p>
        <p><strong>Assigned Region:</strong> ${this.selectedPerson.assigned_region}</p>
      </div>
    `;

    // Add a marker for the location
    L.marker([coordinates[1], coordinates[0]], { icon: customIcon })
      .addTo(this.map)
      .bindPopup(popupContent)
      .openPopup();

    // Center the map on the selected location
    this.map.setView([coordinates[1], coordinates[0]], 13);

    this.map.invalidateSize();
  }
}
