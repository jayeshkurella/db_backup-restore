import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';


import { merge } from 'rxjs';
import { FormApiService } from './forms-api-up.service';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatIconModule } from '@angular/material/icon';
import { map, marker } from 'leaflet';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-unidentified-person-form',
  imports: [
      MaterialModule,
      TablerIconsModule,
      MatFormFieldModule,
      MatInputModule,
      MatRadioModule,
      MatCheckboxModule,
      MatDatepickerModule,
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      NgxMatTimepickerModule,
      MatIconModule
    ],
  templateUrl: './unidentified-person-form.component.html',
  styleUrl: './unidentified-person-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter(),DatePipe],

})

export class UnidentifiedPersonFormComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map!: L.Map;
  marker!: L.Marker | null;
  geocoder: any;
  latitude: number | null = null;
  longitude: number | null = null;
  markerLayer: any;
  showLoader = false;
  loading = false;
  progress = 0;
  selectedImage: string | ArrayBuffer | null | undefined;
  uploadedFiles: any;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFiles: { [key: string]: any[] } = {};
  hospitals: any[] = [];
  policeStations: any[] = [];
  states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];
  countries = [
    "India", "United States of America", "China", "Japan",
    "Germany", "United Kingdom", "France", "Brazil", "Australia", "Canada"
  ];
  unidentifiedPersonForm!: FormGroup;
  storedPersonId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private formApi: FormApiService,
    private datePipe: DatePipe,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getToken();
    this.initializeForm();
    this.loadPoliceStations();
    this.loadHospitals();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 0);
  }

  getToken() {
    this.storedPersonId = localStorage.getItem('user_id');
    console.log(this.storedPersonId, "id");
  }

  initializeForm() {
    this.unidentifiedPersonForm = this.fb.group({
      type: ['Unidentified Person'],
      full_name: [''],
      birth_date: [null],
      // age: [null],
      age_range: [''],
      birthtime: [null],
      gender: ['Unknown'],
      birthplace: [''],
      height: [''],
      height_range:[''],
      weight: [''],
      blood_group: [''],
      complexion: [''],
      hair_color: [''],
      hair_type: [''],
      eye_color: [''],
      condition: [''],
      Body_Condition: [''],
      up_condition: [[]],  
      birth_mark: [''],
      distinctive_mark: [''],
      hospital: [null],
      document_ids: [''],
      created_at: [null],
      updated_at: [null],
      created_by: [''],
      updated_by: [''],
      photo_photo:[''],
      _is_deleted: [false],
      addresses: this.fb.array([]),
      contacts: this.fb.array([]),
      additional_info: this.fb.array([]),
      last_known_details: this.fb.array([]),
      firs: this.fb.array([]),
      consent: this.fb.array([]),
      addressForm: this.createAddressFormGroup(),
      contactForm: this.createContactFormGroup()
    });

    this.addAdditionalInfo();
    this.addLastKnownDetails();
    this.addFIR();
    this.addConsent();
  }

  // Getters for FormArrays
  get addresses(): FormArray {
    return this.unidentifiedPersonForm.get('addresses') as FormArray;
  }

  get contacts(): FormArray {
    return this.unidentifiedPersonForm.get('contacts') as FormArray;
  }

  get additionalInfo(): FormArray {
    return this.unidentifiedPersonForm.get('additional_info') as FormArray;
  }

  get lastKnownDetails(): FormArray {
    return this.unidentifiedPersonForm.get('last_known_details') as FormArray;
  }

  get firs(): FormArray {
    return this.unidentifiedPersonForm.get('firs') as FormArray;
  }

  get consent(): FormArray {
    return this.unidentifiedPersonForm.get('consent') as FormArray;
  }
  createAddressFormGroup(): FormGroup {
    return this.fb.group({
      address_type: [''],
      street: [''],
      appartment_no: [''],
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
        longitude: [''],
      }),
      // user: [''],
      // created_by: [''],
      // updated_by: [''],
    });
  }
  
  // Correct method to create Contact FormGroup
  createContactFormGroup(): FormGroup {
    return this.fb.group({
      phone_no: [''],
      // country_cd: [''],
      email_id: [''],
      type: ['referral'],
      person_name: [''],
      // job_title: [''],
      // website_url: [''],
      // social_media_url: [''],
      // social_media_availability: [''],
      additional_details: [''],
      // is_primary: [false],
      // user: [''],
      hospital: [null],
      police_station: [null],
      person: [''],
      created_at: [null],
      updated_at: [null],
      // created_by: [''],
      // updated_by: [''],
    });
  }
  
  // Add address logic
  addAddress() {
    const addressForm = this.unidentifiedPersonForm.get('addressForm');
    if (addressForm?.valid) {
      this.addresses.push(this.fb.group(addressForm.value));
      console.log("Addresses:", this.addresses.value);
      this.unidentifiedPersonForm.markAsDirty();
      addressForm.reset();
      addressForm.get('address_type')?.setValue('');
      addressForm.get('state')?.setValue('');
      addressForm.get('country')?.setValue('');
    } else {
      alert("Please fill in all required fields before adding another address.");
    }
  }
  
  // Add contact logic
  addContact() {
    const contactForm = this.unidentifiedPersonForm.get('contactForm');
    if (contactForm?.valid) {
      this.contacts.push(this.fb.group(contactForm.value));
      console.log("Contacts:", this.contacts.value);
      this.unidentifiedPersonForm.markAsDirty();
      contactForm.reset();
      contactForm.get('type')?.setValue('');
      contactForm.get('social_media_availability')?.setValue('');
      contactForm.get('is_primary')?.setValue('');
    } else {
      alert("Please fill in all required fields before adding another contact.");
    }
  }
  
  // Add additional info
  addAdditionalInfo() {
    this.additionalInfo.push(this.fb.group({
      caste: [''],
      subcaste: [''],
      marital_status: [''],
      religion: [''],
      mother_tongue: [''],
      other_known_languages: [''],
      id_type: [''],
      id_no: [''],
      education_details: [''],
      occupation_details: [''],
      // user: [''],
      person: [''],
      created_at: [null],
      updated_at: [null],
      // created_by: [''],
      // updated_by: [''],
    }));
  }
  
  // Add last known details
  addLastKnownDetails() {
    this.lastKnownDetails.push(this.fb.group({
      person_photo: [null],
      reference_photo: [null],
      missing_time: [''],
      missing_date: [''],
      last_seen_location: [''],
      missing_location_details: [''],
      address: [null],
      person: [''],
      created_at: [null],
      updated_at: [null],
      // created_by: [''],
      // updated_by: [''],
    }));
  }
  
  // Add FIR
  addFIR() {
    this.firs.push(this.fb.group({
      fir_number: [''],
      case_status: [''],
      investigation_officer_name: [''],
      investigation_officer_contact: [null],
      investigation_officer_contacts:[''],
      police_station: [null],
      document: [null],
      person: [''],
      created_at: [null],
      updated_at: [null],
      // created_by: [''],
      // updated_by: [''],
    }));
  }

  loadPoliceStations() {
    this.formApi.getPoliceStationList().subscribe({
      next: (data) => {
        this.policeStations = data;
        console.log("Police Stations Loaded:", this.policeStations);
      },
      error: (err) => {
        console.error("Error loading police stations", err);
      }
    });
  }

  loadHospitals() {
    this.formApi.getHospitalList().subscribe({
      next: (data) => {
        this.hospitals = data;
        console.log("Hospitals Loaded:", this.hospitals);
      },
      error: (err) => {
        console.error("Error loading hospitals", err);
      }
    });
  }
  

  // Add Consent
  addConsent() {
    this.consent.push(this.fb.group({
      data: [''],
      document: [null],
      person: [''],
      is_consent: [false, Validators.required],
      created_at: [null],
      updated_at: [null],
      // created_by: [''],
      // updated_by: [''],
    }));
  }
  
  // Remove functions
  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }
  removeContact(index: number) {
    this.contacts.removeAt(index);
  }
  removeAdditionalInfo(index: number) {
    this.additionalInfo.removeAt(index);
  }
  removeLastKnownDetails(index: number) {
    this.lastKnownDetails.removeAt(index);
  }
  removeFIR(index: number) {
    this.firs.removeAt(index);
  }
  removeConsent(index: number) {
    this.consent.removeAt(index);
  }

  initMap(): void {
    this.map = L.map('mapHome').setView([22.9734, 78.6569], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.setMapLocation(event.latlng.lat, event.latlng.lng);
    });
  }

  setMapLocation(lat: number, lng: number): void {
    this.latitude = parseFloat(lat.toFixed(6));
    this.longitude = parseFloat(lng.toFixed(6));
  
    this.unidentifiedPersonForm.get('addressForm.location')?.patchValue({
      latitude: this.latitude,
      longitude: this.longitude,
    });
  
    const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      shadowSize: [41, 41],
    });
  
    // If map is initialized, remove the existing marker
    if (this.marker) {
      this.map!.removeLayer(this.marker); // Using `!` to assert map is not null
    }
  
    this.marker = L.marker([this.latitude, this.longitude], {
      draggable: true,
      icon: customIcon,
    }).addTo(this.map!); // Using `!` to assert map is not null
  
    this.marker.on('dragend', () => {
      const newLatLng = this.marker!.getLatLng(); // Using `!` to assert marker is not null
      this.setMapLocation(newLatLng.lat, newLatLng.lng);
    });
  
    this.map!.setView([this.latitude, this.longitude], 10); // Using `!` to assert map is not null
  }
  

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setMapLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Error fetching location:', error);
        alert('Unable to fetch location. Ensure location services are enabled.');
      }
    );
  }

  

  
  onFileSelect(event: any, section: string, index: number, field: string) {
    const file = event.target.files[0];
    if (file) {
        if (!this.selectedFiles[section]) {
            this.selectedFiles[section] = [];
        }
        if (!this.selectedFiles[section][index]) {
            this.selectedFiles[section][index] = {};
        }
        this.selectedFiles[section][index][field] = file;
        this.getFormArray(section).at(index).get(field)?.setValue(file.name);
    }
  }

  removeFile(section: string, index: number, field: string) {
    this.getFormArray(section).at(index).get(field)?.setValue(null);
  }

  private getFormArray(section: string): FormArray {
    return this.unidentifiedPersonForm.get(section) as FormArray;
  }

  selectedFile: string | null = null;

  onFileSelect_person_photo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    const formData = new FormData();
  
    const addressFormValue = this.unidentifiedPersonForm.get('addressForm')?.value;
    if (addressFormValue && Object.keys(addressFormValue).length > 0) {
      this.addresses.push(this.fb.group(addressFormValue));
    }
  
    const contactFormValue = this.unidentifiedPersonForm.get('contactForm')?.value;
    if (contactFormValue && Object.keys(contactFormValue).length > 0) {
      this.contacts.push(this.fb.group(contactFormValue));
    }
  
    const birthDate = this.unidentifiedPersonForm.get('birth_date')?.value;
    const formattedBirthDate = this.datePipe.transform(birthDate, 'yyyy-MM-dd');
    const birthTime = this.formatTime(this.unidentifiedPersonForm.get('birthtime')?.value);
  
    const lastKnownDetails = this.unidentifiedPersonForm.get('last_known_details')?.value;
    if (lastKnownDetails && lastKnownDetails.length > 0) {
      lastKnownDetails.forEach((detail: any) => {
        if (detail.missing_date) {
          detail.missing_date = this.datePipe.transform(detail.missing_date, 'yyyy-MM-dd');
        }
        if (detail.missing_time) {
          detail.missing_time = this.formatTime(detail.missing_time);
        }
      });
    }
  
    // Create a clean JSON object
    const payload = {
      ...this.unidentifiedPersonForm.value,
      birth_date: formattedBirthDate,
      birthtime: birthTime,
      addresses: this.addresses.value,
      contacts: this.contacts.value,
    };
  
    delete payload.addressForm;
    delete payload.contactForm;
  
    // Append JSON data as a Blob (important!)
    formData.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  
    // Append image file if available
    if (this.selectedFile) {
      formData.append('photo_photo', this.selectedFile); // field name must match Django field
    }
  
    this.formApi.postMissingPerson(formData).subscribe({
      next: (response) => {
        this.toastr.success('Unidentified Person Data addedd successfully', 'Success');
        this.unidentifiedPersonForm.reset();
        this.addresses.clear();
        this.contacts.clear();
        this.selectedFile = null;
      },
      error: (error) => {
        this.toastr.error('Oops!', 'Something went wrong.');

      }
    });
  }
  
  
  formatTime(time: string): string {
    return time ? time.replace(/[“”]/g, '"') : '';
  }
}