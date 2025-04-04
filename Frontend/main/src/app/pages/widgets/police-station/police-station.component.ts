import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TablerIconsModule } from 'angular-tabler-icons';
import * as L from 'leaflet';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { environment } from 'src/envirnment/envirnment';
import { PoliceStationApiService } from './police-station-api.service';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-police-station',
  imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CommonModule,MatOptionModule],
  templateUrl: './police-station.component.html',
  styleUrl: './police-station.component.scss'
})
export class PoliceStationComponent implements OnInit ,AfterViewChecked{
  
  policeStationForm!: FormGroup;

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
  mapp!: L.Map;
  markerr!: L.Marker | null;
  latitude: number | null = null;
  longitude: number | null = null;
  markerMissing: any; 
  constructor(private policeapi:PoliceStationApiService,private fb: FormBuilder ) { }

 

  ngOnInit(): void {
    this.getallPolicestation(1);
    this.initializeForm();
  }
  ngAfterViewChecked(): void {
    if (this.selectedPerson && this.selectedPerson.geometry && !this.map) {
      setTimeout(() => {
        this.initMap(); 
      }, 10);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMapadd_policestation();  // Ensure the map initializes after the view is fully loaded
    }, 0);
  }


  initializeForm() {
    this.policeStationForm = this.fb.group({
      name: [''],
      phone_no: ['', ],
      station_photo: ['',],
      activ_Status: ['', ],
      
      // Address FormGroup
      address: this.fb.group({
      address_type: [''],
      street: [''],
      appartment_no: [''],
      appartment_name: [''],
      village: [''],
      city: [''],
      district: [''],
      state: [''],
      user: [null],
      pincode: [''],
      country: [''],
      landmark_details: [''],
      location: this.fb.group({
        latitude: [''],
        longitude: [''],
      }),
      created_by: [null],
      updated_by:[null],
      }),
      police_contact: this.fb.array([])
    });

    // Initialize with one contact
    this.addContact();
  }

   // Get contacts array
   get contacts(): FormArray {
    return this.policeStationForm.get('police_contact') as FormArray;
  }

  // Method to create a contact FormGroup
  createContactForm(): FormGroup {
    return this.fb.group({
      phone_no: [''],
      country_cd: [''],
      email_id: [''],
      type: [''], 
      company_name: [''],
      job_title: [''],
      website_url: [''],
      social_media_url: [''],
      social_media_availability: [''],
      additional_details: [''],
      is_primary: [false],
      user: [null],
      hospital: [null],
      police_station: [null],
      person: [''],
      created_at: [null],
      updated_at: [null],
      created_by:  [null],
      updated_by:  [null],
    })
  }

  // Add a new contact field
  addContact() {
    this.contacts.push(this.createContactForm());
  }

  // Remove a contact field
  removeContact(index: number) {
    this.contacts.removeAt(index);
  }

   // Open Modal & Reset Form
   openModal() {
    this.initializeForm();
  }

  submitForm(): void {
    if (this.policeStationForm.invalid) {
      alert('Please fill in all required fields correctly.');
      return;
    }
  
    const formData = new FormData();
  
    // Append `station_photo` correctly
    if (this.policeStationForm.get('station_photo')?.value) {
      formData.append('station_photo', this.policeStationForm.get('station_photo')?.value);
    }
  
    // Convert complex objects (`address`, `police_contact`) to JSON strings
    const formValues = this.policeStationForm.value;
    Object.keys(formValues).forEach(key => {
      if (key !== 'station_photo') {  // Avoid re-adding station_photo
        if (typeof formValues[key] === 'object') {
          formData.append(key, JSON.stringify(formValues[key]));  // Convert objects to JSON strings
        } else {
          formData.append(key, formValues[key]);
        }
      }
    });
  
    this.policeapi.addPoliceStation(formData).subscribe({
      next: (response) => {
        console.log('Success:', response);
        alert('Police station added successfully!');
        this.policeStationForm.reset();
        this.initializeForm();
        this.getallPolicestation(1); // Refresh data
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error adding police station.');
      }
    });
  }
  
  
  // File Change Event
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.policeStationForm.patchValue({ station_photo: file });
    }
  }
  
  

  getallPolicestation(page:any): void { 
    this.policeapi.searchPoliceStations(page).subscribe(
      (res: any) => {
        if (res && res.results && Array.isArray(res.results)) {
          this.total_policestation = res.results;  
          console.log('Police stations found:', this.total_policestation);
        } else {
          console.log('No police stations found');
          this.total_policestation = [];
        }
      },
      error => {
        console.error("Error fetching police stations:", error);
        this.total_policestation = [];  
      }
    );
  }
  
  onSearch(): void {
    const queryParams: any = {
      name: this.searchName || '',
      city: this.searchCity || '',
      district: this.searchdistrict || '',
      state: this.searchstate || ''
    };
  
    this.policeapi.searchPoliceStations(queryParams).subscribe(
      (res: any) => {
        if (res && res.results) {  // ✅ Fixed: Using res.results instead of res.data
          console.log("Filtered Police Stations:", res.results);
          this.total_policestation = res.results;
        } else {
          console.log("No police stations found.");
          this.total_policestation = [];
        }
      },
      error => {
        console.error('Error during search:', error);
        this.total_policestation = [];
      }
    );
  }
  

  seeMores(person: any): void {
    if (person && person.address_details && person.address_details.location) {
      this.selectedPoliceStation = person;
      console.log('Selected police station:', this.selectedPoliceStation);
  
      // ✅ Extract POINT coordinates instead of POLYGON
      const coordinates = this.extractPointCoordinates(person.address_details.location);
      if (!coordinates) {
        console.error('Failed to extract coordinates from the location string');
        return;
      }
  
      // Show modal
      // const modal = new bootstrap.Modal(document.getElementById('personModal') as HTMLElement);
      // modal.show();
  
      // Remove previous markers
      this.removePreviousMarker();
  
      // Initialize the map with the extracted coordinates
      setTimeout(() => {
        this.setupMap([coordinates]);  // Pass single point coordinates
      }, 300);
    } else {
      console.error('Selected person is not valid or missing location data');
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
    if (!this.selectedPoliceStation || !this.selectedPoliceStation.location) {
      console.error('Selected police station is missing or boundary data is unavailable');
      return;
    }

    // Extract coordinates from the boundary string
    const coordinates = this.extractPointCoordinates(this.selectedPoliceStation.location);

    if (!coordinates) {
      console.error('Failed to extract coordinates from boundary');
      return;
    }

    // Initialize map with the coordinates of the first point in the polygon
    this.setupMap([coordinates]);
  }

  // Method to extract polygon coordinates from the boundary string
  extractPointCoordinates(location: string): L.LatLngTuple | null {
    const match = location.match(/POINT \((.*?)\)/);
    if (!match) {
      console.error('Invalid location format');
      return null;
    }
  
    const [longitude, latitude] = match[1].split(' ').map(Number);
    return [latitude, longitude] as L.LatLngTuple; // Leaflet requires [lat, lon] format
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
        <p><strong>City:</strong> ${this.selectedPoliceStation.address_details.city}</p>
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


  initMapadd_policestation(): void {
    if (this.map) {
        this.map.invalidateSize();
        return; // Prevent re-initialization
    }

    this.map = L.map('mapHome').setView([22.9734, 78.6569], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Click event to place marker
    this.map.on('click', (event: L.LeafletMouseEvent) => {
        this.updateLocation(event.latlng.lat, event.latlng.lng);
    });
  }

  updateLocation(lat: number, lng: number): void {
      this.latitude = parseFloat(lat.toFixed(6));
      this.longitude = parseFloat(lng.toFixed(6));

      // ✅ Corrected path: No need for 'policeStationForm' prefix
      this.policeStationForm.get('address.location')?.patchValue({
          latitude: this.latitude,
          longitude: this.longitude,
      });

      // Custom marker icon
      const customIcon = L.icon({
          iconUrl: 'assets/leaflet/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'assets/leaflet/images/marker-shadow.png',
          shadowSize: [41, 41],
      });

      // Remove existing marker before adding a new one
      if (this.marker) {
          this.mapp.removeLayer(this.marker);
      }

      // Add new marker
      this.marker = L.marker([this.latitude, this.longitude], {
          draggable: true,
          icon: customIcon,
      }).addTo(this.mapp);

      // Update location on marker drag
      this.marker.on('dragend', () => {
          const newLatLng = this.markerr!.getLatLng();
          this.updateLocation(newLatLng.lat, newLatLng.lng);
      });

      // Center the map on the marker
      this.mapp.setView([this.latitude, this.longitude], 10);
  }

  getCurrentLocation(): void {
      if (!navigator.geolocation) {
          alert('Geolocation is not supported by this browser.');
          return;
      }

      navigator.geolocation.getCurrentPosition(
          (position) => {
              this.updateLocation(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
              console.error('Error fetching location:', error);
              alert('Unable to fetch location. Ensure location services are enabled.');
          }
      );
  }

}
