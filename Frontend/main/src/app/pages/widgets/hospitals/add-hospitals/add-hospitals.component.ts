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
        address_type: [''],
        street: [''],
        appartment_no: [''], // ✅ MUST exist
        appartment_name: [''],
        village: [''],
        city: [''],
        district: [''],
        state: [''],
        country: [''],
        pincode: [''],
        landmark_details: [''],
        location: this.fb.group({
          latitude: [''],
          longitude: ['']
        })
      }),
      hospital_contact: this.fb.array([this.createContactForm()]),
    });
  }

  get contacts(): FormArray {
    return this.hospitalForm.get('hospital_contact') as FormArray;
  }

  createContactForm(): FormGroup {
    return this.fb.group({
      phone_no: [''],
      country_cd: ['+91'],
      email_id: [''],
      type: [''],
      is_primary: [false],
      company_name: [''],        // ✅ Add this
      job_title: [''],           // ✅ Add this
      website_url: [''],         // ✅ Add this
      social_media_url: [''],    // ✅ Add this
    });
  }
  

  addContact(): void {
    this.contacts.push(this.createContactForm());
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.hospitalForm.patchValue({ hospital_photo: file });
    }
  }

  submitForm(): void {
    if (this.hospitalForm.invalid) {
      alert('Please fill all required fields.');
      return;
    }

    const formData = new FormData();
    const formValues = this.hospitalForm.value;

    if (formValues.hospital_photo) {
      formData.append('hospital_photo', formValues.hospital_photo);
    }

    Object.keys(formValues).forEach((key) => {
      if (key !== 'hospital_photo') {
        formData.append(key, JSON.stringify(formValues[key]));
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

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);
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
  removeContact(index: number) {
    this.contacts.removeAt(index);
  }
}
