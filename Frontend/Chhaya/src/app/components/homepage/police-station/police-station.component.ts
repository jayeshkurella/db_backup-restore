import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';

import { PoliceAPIService } from './police-api.service';
declare var bootstrap: any;
import * as L from 'leaflet'; 
import { LatLngExpression } from 'leaflet';
import { environment } from 'src/envirnments/envirnment';

@Component({
  selector: 'app-police-station',
  templateUrl: './police-station.component.html',
  styleUrls: ['./police-station.component.css']
})
export class PoliceStationComponent implements OnInit, AfterViewChecked {
  isLoading: boolean | undefined;
seeChowikis(_t17: any) {
throw new Error('Method not implemented.');
}
  environment = environment;
  selectedPoliceStation: any = null;
  total_policestation: any;
  selectedPerson: any = null;
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  searchQuery: string = '';  
  searchName: string = '';
  searchCity: string = '';
  searchstate: string = '';
  searchdistrict: string = '';

  pagination: any = {
    current_page: 1,
    total_pages: 1,
    has_previous: false,
    has_next: false
  };

  constructor(private policeapi: PoliceAPIService) {}

  ngOnInit(): void {
    this.getallPolicestation(this.pagination.current_page);
  }

  ngAfterViewChecked(): void {
    if (this.selectedPerson && this.selectedPerson.geometry && !this.map) {
      setTimeout(() => {
        this.initMap(); 
      }, 100);
    }
  }

  // Handle pagination when the page changes
  onPageChange(page: number): void {
    this.getallPolicestation(page);
  }

  
  getallPolicestation(page: number): void {
    this.policeapi.searchPoliceStations(page).subscribe(
      (res: any) => {
        if (res && res.data && Array.isArray(res.data)) {
          this.total_policestation = res.data;
          this.pagination = res.pagination;
        } else {
          console.log('No police stations found');
          this.total_policestation = [];
        }
      },
      error => {
        console.log("Error fetching police stations:", error);
        this.total_policestation = [];  
      }
    );
  }

  // Search police stations based on a query
  onSearch(): void {
    const queryParams: any = {
      name: this.searchName,
      city: this.searchCity,
      district: this.searchdistrict,
      state: this.searchstate
    };

    this.policeapi.searchPoliceStations(queryParams).subscribe(
      (res: any) => {
        if (res && res.data) {
          console.log("filter data",res.data)
          this.total_policestation = res.data;
          this.pagination = res.pagination;
        }
      },
      error => {
        console.log('Error during search', error);
        this.total_policestation = [];
      }
    );
  }




  // Show more details in modal for a specific police station
  seeMores(person: any): void {
    if (person && person.boundary) {
      this.selectedPoliceStation = person;
  
      // Parse boundary to extract coordinates
      const coordinates = this.extractPolygonCoordinates(person.boundary);
      if (!coordinates) {
        console.error('Failed to extract coordinates from the boundary string');
        return;
      }
  
      // Show modal
      const modal = new bootstrap.Modal(document.getElementById('personModal') as HTMLElement);
      modal.show();
  
      // Remove previous markers
      this.removePreviousMarker();
  
      // Initialize the map with the parsed coordinates
      setTimeout(() => {
        this.initMap(); 
      }, 300);
    } else {
      console.error('Selected person is not valid or missing boundary data');
    }
  }

  // Remove previous marker from the map
  removePreviousMarker(): void {
    if (this.marker) {
      this.map?.removeLayer(this.marker); 
      this.marker = undefined; 
    }
  }

  // Initialize the map with the selected police station's boundary
  initMap(): void {
    if (!this.selectedPoliceStation || !this.selectedPoliceStation.boundary) {
      console.error('Selected police station is missing or boundary data is unavailable');
      return;
    }

    // Extract coordinates from the boundary string
    const coordinates = this.extractPolygonCoordinates(this.selectedPoliceStation.boundary);

    if (!coordinates) {
      console.error('Failed to extract coordinates from boundary');
      return;
    }

    // Initialize map with the coordinates of the first point in the polygon
    this.setupMap(coordinates);
  }

  // Method to extract polygon coordinates from the boundary string
  extractPolygonCoordinates(boundary: string): L.LatLngTuple[] | null {
    const match = boundary.match(/POLYGON \(\((.*?)\)\)/);
    if (!match) {
      console.error('Invalid boundary format');
      return null;
    }

    const coordinateStrings = match[1].split(',').map(coord => coord.trim());
    const coordinates = coordinateStrings.map(coord => {
      const [longitude, latitude] = coord.split(' ').map(Number);
      return [latitude, longitude] as L.LatLngTuple; // Leaflet requires [lat, lon] format
    });

    return coordinates;
  }

  // Setup the map with the extracted coordinates
  setupMap(coordinates: L.LatLngTuple[]): void {
    const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      shadowSize: [41, 41]
    });

    const popupContent = `
      <div>
        <p><strong>Police Station:</strong> ${this.selectedPoliceStation.name}</p>
        <p><strong>Address:</strong> ${this.selectedPoliceStation.address}</p>
      </div>
    `;

    if (!this.map) {
      this.map = L.map('map', {
        center: [coordinates[0][0], coordinates[0][1]], // Center map on the first coordinate
        zoom: 13,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
    }

    if (!this.marker) {
      this.marker = L.marker([coordinates[0][0], coordinates[0][1]], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(popupContent);
    } else {
      this.marker.setLatLng([coordinates[0][0], coordinates[0][1]]);
      this.marker.bindPopup(popupContent);
    }

    L.polygon(coordinates).addTo(this.map);

    this.map.fitBounds(L.polygon(coordinates).getBounds());
    this.map.invalidateSize();
    this.marker.openPopup();
  }
}
