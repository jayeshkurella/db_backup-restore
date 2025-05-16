import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import * as L from 'leaflet';
import { environment } from 'src/envirnment/envirnment';
import { HospitalApiService } from '../hospital-api.service';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-add-hospitals',
 imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,
     MatInputModule,
     MatButtonModule,
     MatIconModule,
     FormsModule,
     CommonModule,MatOptionModule,RouterModule,ReactiveFormsModule,MatSelectModule,MatCheckboxModule  ],
  templateUrl: './add-hospitals.component.html',
  styleUrl: './add-hospitals.component.scss'
})
export class AddHospitalsComponent implements OnInit ,AfterViewInit {
  hospitalForm!: FormGroup;
  map!: L.Map;
  marker!: L.Marker;
  latitude: number | null = null;
  longitude: number | null = null;
  environment = environment;
  savedContacts: any[] = []; // Array to store saved contacts

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
selectedFileName: any;
  constructor(
    private fb: FormBuilder,
    private hospitalService: HospitalApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    // this.initMap();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initializeForm(): void {
    this.hospitalForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      hospital_photo: [''],
      address: this.fb.group({
        address_type: ['', Validators.required],
        street: ['',],
        appartment_no: ['', ],
        appartment_name: [''],
        village: ['',],
        city: ['', Validators.required],
        district: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
        landmark_details: ['',Validators.required],
        location: this.fb.group({
          latitude: ['', Validators.required],
          longitude: ['', Validators.required]
        })
      }),
      hospital_contact: this.fb.array([this.createContactForm()], Validators.required),
    });
  }

  get contacts(): FormArray {
    return this.hospitalForm.get('hospital_contact') as FormArray;
  }

  createContactForm(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      phone_no: ['', [Validators.required, Validators.pattern(/^[0-9\s\-\(\)]{10,15}$/)]],
      country_cd: ['', Validators.required],
      email_id: ['', Validators.email],
      company_name: ['' ],
      job_title: [''],
      website_url: ['',Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/)],
      social_media_url: [
        '',
        Validators.pattern(/^(https?:\/\/)?(www\.)?(facebook|instagram|twitter|linkedin|youtube|tiktok|pinterest)\.com\/[\w\-._~:/?#[\]@!$&'()*+,;=]*$/)
      ],
            is_primary: [false]
    });
  }
  
  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  removeSavedContact(index: number): void {
    this.savedContacts.splice(index, 1);
  }
 addContact(): void {
    const firstContact = this.contacts.at(0);

    if (firstContact.valid) {
      // Push a copy of the form value to the saved contacts array
      this.savedContacts.push({ ...firstContact.value });

      // Reset only the first form
      firstContact.reset({
        country_cd: '+91',
        is_primary: false,
      });
    } else {
      firstContact.markAllAsTouched();
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.hospitalForm.patchValue({ hospital_photo: file });
      this.hospitalForm.get('hospital_photo')?.markAsDirty();
      this.hospitalForm.get('hospital_photo')?.updateValueAndValidity();
    }
  }
  

  submitForm(): void {
    if (this.hospitalForm.invalid) {
      alert('Please fill all required fields.');
      return;
    }
  
    const formData = new FormData();
    const formValues = this.hospitalForm.value;
  
    // Combine saved contacts and form-filled contacts
    const allContacts = [...this.savedContacts, ...formValues.hospital_contact];
  
    // Overwrite hospital_contact with both saved and filled contacts
    formValues.hospital_contact = allContacts;
  
    if (formValues.hospital_photo) {
      formData.append('hospital_photo', formValues.hospital_photo);
    }
  
    Object.keys(formValues).forEach((key) => {
      if (key !== 'hospital_photo') {
        const value = formValues[key];
        if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });
  
    this.hospitalService.addHospital(formData).subscribe({
      next: () => {
        alert('Hospital added successfully.');
        this.router.navigate(['/widgets/hospitals']);
      },
      error: () => {
        alert('Error adding hospital.');
      },
    });
  }
  
  

  initMap(): void {
    this.map = L.map('mapAddHospital').setView([22.9734, 78.6569], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.updateLocation(e.latlng.lat, e.latlng.lng);
    });
  }

  updateLocation(lat: number, lng: number): void {
    this.latitude = lat;
    this.longitude = lng;
  
    this.hospitalForm.get('address.location')?.patchValue({
      latitude: lat,
      longitude: lng,
    });
  
    // Custom hospital icon
    const customIcon = L.icon({
      iconUrl: '/assets/leaflet/images/marker-icon-2x.png',
      iconSize: [30, 40],
      iconAnchor: [15, 40],
    });
  
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
  
    this.marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
    this.map.setView([lat, lng], 12);
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
 goBack(): void {
      this.router.navigate(['/widgets/hospitals']); // Navigate to the main component or home route
    }
}
