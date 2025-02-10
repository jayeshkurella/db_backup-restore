import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { environment } from 'src/envirnments/envirnment';
import { UnidentifiedPersonapiService } from './unidentified-personapi.service';
declare var bootstrap: any;
import * as L from 'leaflet'; 
import { PoliceStationaoiService } from 'src/app/services/police-stationaoi.service';

@Component({
  selector: 'app-unidentified-person',
  templateUrl: './unidentified-person.component.html',
  styleUrls: ['./unidentified-person.component.css']
})
export class UnidentifiedPersonComponent implements OnInit, AfterViewChecked {

  environment = environment;
  unidentifiedPersons: any = [];
  filteredPersons: any[] = [];  
  selectedPerson: any = null;

  map: L.Map | undefined;
  marker: L.Marker | undefined;
  filters = {
    gender: '',
    city: '',
    state: '',
    year: '',
    month: '',
    caste: '', 
    age: '',
    marital_status: '',
    blood_group: '',
    height: '',
    district: ''
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
  filtersApplied: any;
  progress: number = 0;
  progressColor: string = '';
  progressMessage: string = '';

  constructor(private unidentifiedpersonapi: UnidentifiedPersonapiService, private policestationapi: PoliceStationaoiService) { }

  ngAfterViewChecked(): void {
    if (this.selectedPerson && this.selectedPerson.geometry && !this.map) {
      setTimeout(() => {
        this.initMap(); 
      }, 100);
    }
  }
  
  pagination: any = {
    current_page: 1,
    total_pages: 1,
    has_previous: false,
    has_next: false
  };

  ngOnInit(): void {
    this.getallstates();
    this.getallcities();
    this.getalldistricts();
    this.getallmarital();
  }

  onPageChangeevent(page: number): void {
    this.loadUnidentifiedPersons(page);
  }

  loadUnidentifiedPersons(page: number): void {
    if (!this.filtersApplied) {
      this.unidentifiedPersons = [];  // Clear table initially
      return; // Don't fetch data until filters are applied
    }

    this.loading = true;
    this.progress = 1; // Start progress at 1%
    this.progressColor = 'bg-primary'; // Default progress bar color
    this.progressMessage = "Loading data...";

    // Simulate progress incrementing up to 90%
    let interval = setInterval(() => {
      if (this.progress < 90) {
        this.progress += 10;
      }
    }, 300);

    setTimeout(() => {
      this.unidentifiedpersonapi.getunidentifiedPersonsWithFilters(page, this.filters).subscribe(
        (data) => {
          clearInterval(interval);
          this.progress = 100; // Complete progress

          if (data && data.data.length > 0) {
            this.unidentifiedPersons = data.data;
            this.filteredPersons = data.data; // Update filteredPersons array
            this.pagination = data.pagination;
            this.progressColor = 'bg-success'; // Green if data found
            this.progressMessage = "✅ Data loaded successfully!";
          } else {
            this.unidentifiedPersons = [];
            this.filteredPersons = []; // Clear filteredPersons array
            this.progressColor = 'bg-danger'; // Red if no data found
            this.progressMessage = "❌ No data found! Try with another filter.";
          }

          // Hide loader after a delay
          setTimeout(() => {
            this.loading = false;
          }, 1000);
        },
        (error) => {
          clearInterval(interval);
          console.error('Error fetching data:', error);
          this.progressColor = 'bg-danger';
          this.progressMessage = "❌ Error fetching data!";
          setTimeout(() => { this.loading = false; }, 1000);
        }
      );
    }, 2000);
  }

  applyFilters(): void {
    this.filtersApplied = true;
    this.loadUnidentifiedPersons(1);
  }

  viewDetails(person: any): void {
    if (person && person.full_name) {
      this.selectedPerson = person;
      const modal = new bootstrap.Modal(document.getElementById('personModal') as HTMLElement);
      modal.show();

      setTimeout(() => {
        this.initMap();
      }, 300);
    } else {
      console.error('Selected person is not valid');
    }
  }

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
        <p><strong>Location Details:</strong> ${this.selectedPerson.last_location}</p>
        <p><strong>Found Date:</strong> ${this.selectedPerson.last_seen_date}</p>
      </div>
    `;
  
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

  getallstates(): void {
    this.policestationapi.getallstates().subscribe(data => {
      this.allstates = data;
    });
  }

  getallcities(): void {
    this.policestationapi.getallcities().subscribe(data => {
      this.allcities = data;
    });
  }

  getalldistricts(): void {
    this.policestationapi.getalldistricts().subscribe(data => {
      this.alldistricts = data;
    });
  }

  getallmarital(): void {
    this.policestationapi.getallmarital().subscribe(data => {
      this.allmarital = data;
    });
  }
}
