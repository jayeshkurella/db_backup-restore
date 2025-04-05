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
import { Router, RouterModule } from '@angular/router';
import { PoliceStatioDialogComponent } from './police-statio-dialog/police-statio-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-police-station',
  imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CommonModule,MatOptionModule,RouterModule],
  templateUrl: './police-station.component.html',
  styleUrl: './police-station.component.scss'
})
export class PoliceStationComponent implements OnInit {
  
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
  constructor(private policeapi:PoliceStationApiService,private fb: FormBuilder ,private router: Router,private dialog: MatDialog) { }

 

  ngOnInit(): void {
    this.getallPolicestation(1);
  }
 



  navigateToAddStation(): void {
    this.router.navigate(['/widgets/add-police-station']);
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
  seeMores(police: any) {
    this.dialog.open(PoliceStatioDialogComponent, {
      width: '500px',
      data: police
    });

  // seeMores(person: any): void {
  //   if (person && person.address_details && person.address_details.location) {
  //     this.selectedPoliceStation = person;
  //     console.log('Selected police station:', this.selectedPoliceStation);
  
  //     // ✅ Extract POINT coordinates instead of POLYGON
  //     const coordinates = this.extractPointCoordinates(person.address_details.location);
  //     if (!coordinates) {
  //       console.error('Failed to extract coordinates from the location string');
  //       return;
  //     }
  
  //     // Show modal
  //     // const modal = new bootstrap.Modal(document.getElementById('personModal') as HTMLElement);
  //     // modal.show();
  
  //     // Remove previous markers
  //     this.removePreviousMarker();
  
  //     // Initialize the map with the extracted coordinates
  //     setTimeout(() => {
  //       this.setupMap([coordinates]);  // Pass single point coordinates
  //     }, 300);
  //   } else {
  //     console.error('Selected person is not valid or missing location data');
  //   }
  // }
  

   // Remove previous marker from the map
  
  //  removePreviousMarker(): void {
  //   if (this.marker) {
  //     this.map?.removeLayer(this.marker); 
  //     this.marker = undefined; 
  //   }
  // }

  // Initialize the map with the selected police station's boundary
  
  // initMap(): void {
  //   if (!this.selectedPoliceStation || !this.selectedPoliceStation.location) {
  //     console.error('Selected police station is missing or boundary data is unavailable');
  //     return;
  //   }

  //   // Extract coordinates from the boundary string
  //   const coordinates = this.extractPointCoordinates(this.selectedPoliceStation.location);

  //   if (!coordinates) {
  //     console.error('Failed to extract coordinates from boundary');
  //     return;
  //   }

  //   // Initialize map with the coordinates of the first point in the polygon
  //   this.setupMap([coordinates]);
  // }

  // // Method to extract polygon coordinates from the boundary string
  // extractPointCoordinates(location: string): L.LatLngTuple | null {
  //   const match = location.match(/POINT \((.*?)\)/);
  //   if (!match) {
  //     console.error('Invalid location format');
  //     return null;
  //   }
  
  //   const [longitude, latitude] = match[1].split(' ').map(Number);
  //   return [latitude, longitude] as L.LatLngTuple; // Leaflet requires [lat, lon] format
  // }
  

  // // Setup the map with the extracted coordinates
  // setupMap(coordinates: L.LatLngTuple[]): void {
  //   const customIcon = L.icon({
  //     iconUrl: 'assets/leaflet/images/marker-icon.png',
  //     iconSize: [25, 41],
  //     iconAnchor: [12, 41],
  //     popupAnchor: [1, -34],
  //     shadowUrl: 'assets/leaflet/images/marker-shadow.png',
  //     shadowSize: [41, 41]
  //   });

  //   const popupContent = `
  //     <div>
  //       <p><strong>Police Station:</strong> ${this.selectedPoliceStation.name}</p>
  //       <p><strong>City:</strong> ${this.selectedPoliceStation.address_details.city}</p>
  //     </div>
  //   `;

  //   if (!this.map) {
  //     this.map = L.map('map', {
  //       center: [coordinates[0][0], coordinates[0][1]], // Center map on the first coordinate
  //       zoom: 13,
  //       attributionControl: false
  //     });

  //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //     }).addTo(this.map);
  //   }

  //   if (!this.marker) {
  //     this.marker = L.marker([coordinates[0][0], coordinates[0][1]], { icon: customIcon })
  //       .addTo(this.map)
  //       .bindPopup(popupContent);
  //   } else {
  //     this.marker.setLatLng([coordinates[0][0], coordinates[0][1]]);
  //     this.marker.bindPopup(popupContent);
  //   }

  //   L.polygon(coordinates).addTo(this.map);

  //   this.map.fitBounds(L.polygon(coordinates).getBounds());
  //   this.map.invalidateSize();
  //   this.marker.openPopup();
  // }


  // initMapadd_policestation(): void {
  //   if (this.map) {
  //       this.map.invalidateSize();
  //       return; // Prevent re-initialization
  //   }

  //   this.map = L.map('mapHome').setView([22.9734, 78.6569], 5);

  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //       attribution: '&copy; OpenStreetMap contributors',
  //   }).addTo(this.map);

  //   // Click event to place marker
  //   this.map.on('click', (event: L.LeafletMouseEvent) => {
  //       this.updateLocation(event.latlng.lat, event.latlng.lng);
  //   });
  // }

  // updateLocation(lat: number, lng: number): void {
  //     this.latitude = parseFloat(lat.toFixed(6));
  //     this.longitude = parseFloat(lng.toFixed(6));

  //     // ✅ Corrected path: No need for 'policeStationForm' prefix
  //     this.policeStationForm.get('address.location')?.patchValue({
  //         latitude: this.latitude,
  //         longitude: this.longitude,
  //     });

  //     // Custom marker icon
  //     const customIcon = L.icon({
  //         iconUrl: 'assets/leaflet/images/marker-icon.png',
  //         iconSize: [25, 41],
  //         iconAnchor: [12, 41],
  //         popupAnchor: [1, -34],
  //         shadowUrl: 'assets/leaflet/images/marker-shadow.png',
  //         shadowSize: [41, 41],
  //     });

  //     // Remove existing marker before adding a new one
  //     if (this.marker) {
  //         this.mapp.removeLayer(this.marker);
  //     }

  //     // Add new marker
  //     this.marker = L.marker([this.latitude, this.longitude], {
  //         draggable: true,
  //         icon: customIcon,
  //     }).addTo(this.mapp);

  //     // Update location on marker drag
  //     this.marker.on('dragend', () => {
  //         const newLatLng = this.markerr!.getLatLng();
  //         this.updateLocation(newLatLng.lat, newLatLng.lng);
  //     });

  //     // Center the map on the marker
  //     this.mapp.setView([this.latitude, this.longitude], 10);
  // }

  // getCurrentLocation(): void {
  //     if (!navigator.geolocation) {
  //         alert('Geolocation is not supported by this browser.');
  //         return;
  //     }

  //     navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //             this.updateLocation(position.coords.latitude, position.coords.longitude);
  //         },
  //         (error) => {
  //             console.error('Error fetching location:', error);
  //             alert('Unable to fetch location. Ensure location services are enabled.');
  //         }
  //     );
  // }

  }
}