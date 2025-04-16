import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { PoliceStationApiService } from '../police-station-api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-add-police-station',
  imports: [MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,        
    CommonModule,MatSelectModule,MatIconModule ,MatCheckboxModule ,MaterialModule   ],
  templateUrl: './add-police-station.component.html',
  styleUrl: './add-police-station.component.scss'
})
export class AddPoliceStationComponent implements OnInit,AfterViewInit  {
  policeStationForm!: FormGroup;
  latitude: number | null = null;
  longitude: number | null = null;
  savedContacts: any[] = [];
  map!: L.Map;
  marker!: L.Marker;
  states: string[] = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  countries: string[] = [
    'India', 'United States', 'Canada', 'United Kingdom', 'Australia'
  ];

  constructor(private fb: FormBuilder, private policeapi:PoliceStationApiService,private router: Router) {}

  ngOnInit(): void {
    this.initializeForm();
    // this.initMap();
  }
  ngAfterViewInit(): void {
    this.initMap();
  }

  initializeForm(): void {
    this.policeStationForm = this.fb.group({
      name: [''],
      phone_no: [''],
      station_photo: [''],
      activ_Status: [''],
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
        updated_by: [null],
      }),
      police_contact: this.fb.array([this.createContactForm()])
    });
  }

  get contacts(): FormArray {
    return this.policeStationForm.get('police_contact') as FormArray;
  }

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
      created_by: [null],
      updated_by: [null],
    });
  }

  // addContact(): void {
  //   this.contacts.push(this.createContactForm());
  // }


  addContact(): void {
    const firstContact = this.contacts.at(0);

    if (firstContact.valid) {
      // Push a copy of the form value to the saved contacts array
      this.savedContacts.push({ ...firstContact.value });

      // Reset only the first form
      firstContact.reset({
        is_primary: false
      });
    } else {
      firstContact.markAllAsTouched();
    }
  }


  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }
  removeSavedContact(index: number): void {
    this.savedContacts.splice(index, 1);
  }
  
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.policeStationForm.patchValue({ station_photo: file });
    }
  }

  submitForm(): void {
    if (this.policeStationForm.invalid) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    const formData = new FormData();
    const formValues = this.policeStationForm.value;

    if (formValues.station_photo) {
      formData.append('station_photo', formValues.station_photo);
    }

    Object.keys(formValues).forEach(key => {
      if (key !== 'station_photo') {
        formData.append(key, JSON.stringify(formValues[key]));
      }
    });

    this.policeapi.addPoliceStation(formData).subscribe({
      next: () => {
        alert('Police station added successfully!');
        this.policeStationForm.reset();
        this.initializeForm();
        this.router.navigate(['/widgets/police-station']);

        
      },
      error: (err) => {
        console.error(err);
        alert('Error adding police station.');
      }
    });
  }

  initMap(): void {
    this.map = L.map('mapAddStation').setView([22.9734, 78.6569], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.latitude = e.latlng.lat;
      this.longitude = e.latlng.lng;

      this.policeStationForm.get('address.location')?.patchValue({
        latitude: this.latitude,
        longitude: this.longitude,
      });

      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      this.marker = L.marker([this.latitude, this.longitude]).addTo(this.map);
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
        this.map.removeLayer(this.marker);
    }

    // Add new marker
    this.marker = L.marker([this.latitude, this.longitude], {
        draggable: true,
        icon: customIcon,
    }).addTo(this.map);

    // Update location on marker drag
    this.marker.on('dragend', () => {
        const newLatLng = this.marker!.getLatLng();
        this.updateLocation(newLatLng.lat, newLatLng.lng);
    });

    // Center the map on the marker
    this.map.setView([this.latitude, this.longitude], 10);
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
