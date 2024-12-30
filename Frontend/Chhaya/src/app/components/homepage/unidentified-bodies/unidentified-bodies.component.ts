import { Component, OnInit, AfterViewChecked } from '@angular/core';
import * as L from 'leaflet'; 
declare var bootstrap: any;
import { UnidentifiedbodiesapiService } from './unidentifiedbodiesapi.service';
import { environment } from 'src/envirnments/envirnment';
import { PoliceStationaoiService } from 'src/app/services/police-stationaoi.service';

@Component({
  selector: 'app-unidentified-bodies',
  templateUrl: './unidentified-bodies.component.html',
  styleUrls: ['./unidentified-bodies.component.css']
})
export class UnidentifiedBodiesComponent implements OnInit, AfterViewChecked {
  environment = environment;
  unidentifiedbodies: any = [];
  filteredPersons: any[] = []; 
  selectedPerson: any = null;
  map: L.Map | undefined;
  marker: L.Marker | undefined;

  filters = {
    full_name :'',
    gender :'all',
    city: 'all',
    state: 'all',
    year: '',
    month: '',
    caste: 'all', 
    age: '',
    marital_status: 'all',
    blood_group: 'all',
    height: '',
    district:'all'

  };

  allstates: any;
  allcities: any;
  alldistricts: any;
  allmarital: any;
  loading: boolean = false; 

  years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i); 
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  pagination: any = {
    current_page: 1,
    total_pages: 1,
    has_previous: false,
    has_next: false
  };

  constructor(private unidentifiedbodiesapi: UnidentifiedbodiesapiService,private policestationapi :PoliceStationaoiService) {}

  ngOnInit(): void {
    this.loadUnidentifiedBodies(this.pagination.current_page);
    this.getallstates()
    this.getallcities()
    this.getalldistricts()
    this.getallmarital()
  }

  ngAfterViewChecked(): void {
    if (this.selectedPerson && this.selectedPerson.geometry && !this.map) {
      setTimeout(() => {
        this.initMap(); 
      }, 100);
    }
  }

  onPageChangeevent(page: number): void {
    this.loadUnidentifiedBodies(page);
  }

  // to get the all data from unidentified bodies service
  loadUnidentifiedBodies(page: number): void {
    this.loading = true;  
  
    
    setTimeout(() => {
      this.unidentifiedbodiesapi.getunidentifiedbodiesWithFilters(page, this.filters).subscribe(
        (data) => {
          if (data && data.data) {
            this.filteredPersons = data.data;
            this.pagination = data.pagination;
          } else {
            console.error('No data returned from API');
          }
          this.loading = false; 
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;  
        }
      );
    }, 2000);  
  }

  applyFilters(): void {
    this.loadUnidentifiedBodies(this.pagination.current_page); // Re-fetch data with applied filters
  }
  

  // to see data of individual person 
  viewDetails(person: any): void {
    if (person && person.geometry && person.geometry.coordinates) {
      this.selectedPerson = person;
      const modal = new bootstrap.Modal(document.getElementById('personModal') as HTMLElement);
      modal.show();
      
      
      this.removePreviousMarker();

      setTimeout(() => {
        this.initMap(); 
      }, 300);
    } else {
      console.error('Selected person is not valid or missing coordinates');
    }
  }

  // Method to remove previous marker if any
  removePreviousMarker(): void {
    if (this.marker) {
      this.map?.removeLayer(this.marker); 
      this.marker = undefined; 
    }
  }

  // Initialize the map with the given coordinates
  initMap(): void {
    if (!this.selectedPerson?.geometry?.coordinates) {
      console.error('Coordinates not found for the selected person');
      return;
    }

    const coordinates = this.selectedPerson.geometry.coordinates;
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
        <p><strong>Gender:</strong> ${this.selectedPerson.gender}</p>
        <p><strong>Location Details:</strong> ${this.selectedPerson.address.landmark}</p>
        <p><strong>Body Found Date:</strong> ${this.selectedPerson.date_found }</p>
      </div>
    `;

    // Check if the map exists or needs to be initialized
    if (this.map) {
      if (this.marker) {
        this.marker.setLatLng([coordinates[1], coordinates[0]]);
        this.marker.bindPopup(popupContent);
      } else {
        this.marker = L.marker([coordinates[1], coordinates[0]], { icon: customIcon })
          .addTo(this.map)
          .bindPopup(popupContent);
      }

      this.map.setView([coordinates[1], coordinates[0]], 13);
      this.map.invalidateSize();
      this.marker.openPopup();
    } else {
      // Initialize the map
      this.map = L.map('map', {
        center: [coordinates[1], coordinates[0]],
        zoom: 13,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      this.marker = L.marker([coordinates[1], coordinates[0]], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(popupContent);

      this.map.invalidateSize();
    }
  }

  getallstates(){
    this.policestationapi.getallstates().subscribe(data => {
      this.allstates = data
    });
  }

  getallcities(){
    this.policestationapi.getallcities().subscribe(data => {
      this.allcities = data
    });
  }

  getalldistricts(){
    this.policestationapi.getalldistricts().subscribe(data => {
      this.alldistricts = data
    });
  }

  getallmarital(){
    this.policestationapi.getallmarital().subscribe(data => {
      this.allmarital = data
    });
  }
}
