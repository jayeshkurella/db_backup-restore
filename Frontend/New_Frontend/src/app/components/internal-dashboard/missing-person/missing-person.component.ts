import { Component, OnInit } from '@angular/core';
import { MissingPersonApiService } from './missing-person-api.service';
import { FormGroup } from '@angular/forms';
import { environment } from 'src/envirnments/envirnment';
import * as bootstrap from 'bootstrap';
import * as L from 'leaflet';

@Component({
  selector: 'app-missing-person',
  templateUrl: './missing-person.component.html',
  styleUrls: ['./missing-person.component.css']
})
export class MissingPersonComponent implements OnInit {
  environment = environment;
  missingPersons: any[] = [];
  filteredPersons: any[] = []; 
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  selectedPerson: any = null;
  selectedMatch: any = null;
  
  years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i); 
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  pagination: any = {
    current_page: 1,
    total_pages: 1,
    has_previous: false,
    has_next: false,
  };
  allstates: any;
  allcities: any;
  alldistricts: any;
  allmarital: any;
  loading: boolean = false; 
  selectedMatched: any;
  message: string = '';  
  errorMessage: string = '';
  uniqueId: string = ''; 
  matchId: number = 0;  
  rejectionReason: string = '';  
  selectedMatchForConfirmation: any;  
  showConfirmModal: boolean = false;
  existing_reports: any[] = [];  // To store existing reports
  report_data: any[] = []; 
  selectedReport: any;  // Variable to hold the selected report for details
  isModalOpen: boolean = false; 
  isInitialLoad = true;
  filtersApplied: boolean = false;  // Initially false
  progress: number = 0;
  progressColor: string = 'bg-primary'; // Corrected type of progressColor
  progressMessage: string = '';
  

  constructor(private missingPersonService: MissingPersonApiService) {}


  filters = {
    full_name :'',
    city: '',
    state: '',
    year: '',
    month: '',
    caste: '', 
    age: '',
    marital_status: '',
    blood_group: '',
    height: '',
    district:'',
    gender:''

  };
  pendingPersons: any[] = [];
  resolvedPersons: any[] = [];
// Pagination variables
  pendingPage: number = 1;
  resolvedPage: number = 1;
  itemsPerPage: number = 5; // Adjust as needed
  ngOnInit() {
    this.getStates();
  }

  getStates() {
    this.missingPersonService.getStates().subscribe(states => {
      this.allstates = states;
    });
  }
  onStateChange() {
    this.filters.district = '';
    this.filters.city = '';
    this.alldistricts = [];
    this.allcities = [];

    if (this.filters.state) {
      this.missingPersonService.getDistricts(this.filters.state).subscribe(districts => {
        this.alldistricts = districts;
      });
    }
  }

  /** Fetch cities when district is selected */
  onDistrictChange() {
    this.filters.city = '';
    this.allcities = [];

    if (this.filters.district) {
      this.missingPersonService.getCities(this.filters.district).subscribe(cities => {
        this.allcities = cities;
      });
    }
  }

  


applyFilters(): void {
  this.loading = true;
  this.filtersApplied = true;
  this.progress = 1; // Start progress
  this.progressColor = 'bg-primary';
  this.progressMessage = "🔄 Applying filters...";

  let interval = setInterval(() => {
    if (this.progress < 90) this.progress += 10;
  }, 200);

  setTimeout(() => {
    this.missingPersonService.getPersonsByFilters(this.filters).subscribe(
      (response) => {
        clearInterval(interval);
        this.progress = 100; 

        if (response && Array.isArray(response)) {
          this.pendingPersons = response.filter(person => person.case_status === 'Pending');
          this.resolvedPersons = response.filter(person => person.case_status === 'Resolved');

          // Reset pagination on new filter
          this.pendingPage = 1;
          this.resolvedPage = 1;

          this.progressColor = 'bg-success';
          this.progressMessage = "✅ Filters applied successfully!";
        } else {
          console.error('Unexpected API response:', response);
          this.pendingPersons = [];
          this.resolvedPersons = [];

          this.progressColor = 'bg-danger';
          this.progressMessage = "❌ No data found!";
        }

        setTimeout(() => {
          this.loading = false;
        }, 1000);
      },
      (error) => {
        clearInterval(interval);
        console.error('Error fetching data:', error);
        this.progressColor = 'bg-danger';
        this.progressMessage = "❌ Error applying filters!";
        setTimeout(() => { this.loading = false; }, 1000);
      }
    );
  }, 1000);
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
  
    // Extract location from WKT format
    const location = this.parseWKT(this.selectedPerson.location);
  
    if (!location) {
      console.error('No valid coordinates found for the selected person');
      return;
    }
  
    // Initialize the map if not already created
    if (!this.map) {
      this.map = L.map('map', {
        center: [location.lat, location.lng],
        zoom: 13,
        attributionControl: false,
      });
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
    } else {
      // If the map already exists, remove the previous marker
      this.removePreviousMarker();
    }
  
    const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      shadowSize: [41, 41],
    });
  
    // Add new marker and update reference
    this.marker = L.marker([location.lat, location.lng], { icon: customIcon })
      .addTo(this.map)
      .bindPopup(`<p><strong>Location</strong></p><p>Coordinates: ${location.lat}, ${location.lng}</p>`)
      .openPopup();
  
    this.map.setView([location.lat, location.lng], 13);
    this.map.invalidateSize();
  }
  
  parseWKT(wkt: string | null): { lat: number; lng: number } | null {
    if (!wkt) return null;
  
    const match = wkt.match(/POINT\s?\(([-\d.]+)\s+([-\d.]+)\)/);
    if (match) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
    return null;
  }
  
  
   // Get total pages for pending persons
   get totalPendingPages() {
    return Math.ceil(this.pendingPersons.length / this.itemsPerPage) || 1;
  }

  get paginatedPendingPersons() {
    const start = (this.pendingPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.pendingPersons.slice(start, end);
  }

  prevPendingPage() {
    if (this.pendingPage > 1) this.pendingPage--;
  }

  nextPendingPage() {
    if (this.pendingPage < this.totalPendingPages) this.pendingPage++;
  }

  // Get total pages for resolved persons
  get totalResolvedPages() {
    return Math.ceil(this.resolvedPersons.length / this.itemsPerPage) || 1;
  }

  get paginatedResolvedPersons() {
    const start = (this.resolvedPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.resolvedPersons.slice(start, end);
  }

  prevResolvedPage() {
    if (this.resolvedPage > 1) this.resolvedPage--;
  }

  nextResolvedPage() {
    if (this.resolvedPage < this.totalResolvedPages) this.resolvedPage++;
  }



  


}
