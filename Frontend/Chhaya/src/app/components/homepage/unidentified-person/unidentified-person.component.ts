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
export class UnidentifiedPersonComponent implements OnInit,AfterViewChecked{

  environment = environment;
  unidentifiedPersons :any= [];
  filteredPersons: any[] = [];  
  selectedPerson: any = null;

  map: L.Map | undefined;
  marker: L.Marker | undefined;
  filters = {
    gender : 'all',
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

  constructor(private unidentifiedpersonapi :UnidentifiedPersonapiService,private policestationapi :PoliceStationaoiService) { }

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
    this.loadUnidentifiedPersons(this.pagination.current_page);
    this.getallstates()
    this.getallcities()
    this.getalldistricts()
    this.getallmarital()
  }


  onPageChangeevent(page: number): void {
    this.loadUnidentifiedPersons(page);
    
  }


  loadUnidentifiedPersons(page: number): void {
    this.loading = true;
    setTimeout(() => {
      this.unidentifiedpersonapi.getunidentifiedPersonsWithFilters(page, this.filters).subscribe(
        (data) => {
          if (data && data.data) {
            this.unidentifiedPersons = data.data;  // Use unidentifiedPersons here
            this.pagination = data.pagination;
          } else {
            console.log("No data returned from API");
          }
          this.loading = false;
        },
        (error) => {
          console.log("Error fetching data", error);
          this.loading = false;
        }
      );
    }, 2000);
  }
  
  
  
  applyFilters(): void {
    this.loadUnidentifiedPersons(this.pagination.current_page); // Re-fetch data with applied filters
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
