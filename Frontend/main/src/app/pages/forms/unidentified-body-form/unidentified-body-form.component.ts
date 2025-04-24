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
import { CommonModule, DatePipe } from '@angular/common';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatIconModule } from '@angular/material/icon';
import { map, marker } from 'leaflet';
import { FormApiService } from '../unidentified-person-form/forms-api-up.service';

@Component({
  selector: 'app-unidentified-body-form',
  // imports: [MatIcon],
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
  templateUrl: './unidentified-body-form.component.html',
  styleUrl: './unidentified-body-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter(),DatePipe],
})
export class UnidentifiedBodyFormComponent implements OnInit, AfterViewInit{ 
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
    unidentifiedBodyForm!: FormGroup;
    storedPersonId: string | null = null;
  
    constructor(
      private fb: FormBuilder,
      private formApi: FormApiService,
      private datePipe: DatePipe
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
      this.unidentifiedBodyForm = this.fb.group({
        type: ['Unidentified Body'],
        full_name: [''],
        birth_date: [null],
        // age: [null],
        age_range: [''],
        birthtime: [null],
        gender: [''],
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
      return this.unidentifiedBodyForm.get('addresses') as FormArray;
    }
  
    get contacts(): FormArray {
      return this.unidentifiedBodyForm.get('contacts') as FormArray;
    }
  
    get additionalInfo(): FormArray {
      return this.unidentifiedBodyForm.get('additional_info') as FormArray;
    }
  
    get lastKnownDetails(): FormArray {
      return this.unidentifiedBodyForm.get('last_known_details') as FormArray;
    }
  
    get firs(): FormArray {
      return this.unidentifiedBodyForm.get('firs') as FormArray;
    }
  
    get consent(): FormArray {
      return this.unidentifiedBodyForm.get('consent') as FormArray;
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
        company_name: [''],
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
      const addressForm = this.unidentifiedBodyForm.get('addressForm');
      if (addressForm?.valid) {
        this.addresses.push(this.fb.group(addressForm.value));
        console.log("Addresses:", this.addresses.value);
        this.unidentifiedBodyForm.markAsDirty();
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
      const contactForm = this.unidentifiedBodyForm.get('contactForm');
      if (contactForm?.valid) {
        this.contacts.push(this.fb.group(contactForm.value));
        console.log("Contacts:", this.contacts.value);
        this.unidentifiedBodyForm.markAsDirty();
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
        next: (data:any) => {
          this.policeStations = data;
          console.log("Police Stations Loaded:", this.policeStations);
        },
        error: (err:any) => {
          console.error("Error loading police stations", err);
        }
      });
    }
  
    loadHospitals() {
      this.formApi.getHospitalList().subscribe({
        next: (data:any) => {
          this.hospitals = data;
          console.log("Hospitals Loaded:", this.hospitals);
        },
        error: (err:any ) => {
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
    
      this.unidentifiedBodyForm.get('addressForm.location')?.patchValue({
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
  
    // selectedPhotoFile: File | null = null;
  
    // onPersonPhotoSelect(event: any) {
    //   const file = event.target.files[0];
    //   if (file) {
    //     this.selectedPhotoFile = file; // Store file outside the form
  
    //     const reader = new FileReader();
    //     reader.onload = () => {
    //       this.imagePreview = reader.result;
    //     };
    //     reader.readAsDataURL(file);
    //   }
    // }
  
    // selectedPhotoFile: File | null = null;
  
    // onPhotoSelected(event: Event): void {
    //   const fileInput = event.target as HTMLInputElement;
    //   if (fileInput.files && fileInput.files.length > 0) {
    //     this.selectedPhotoFile = fileInput.files[0];
    //   }
    // }
  
    
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
      return this.unidentifiedBodyForm.get(section) as FormArray;
    }
  
    // convertFileToBase64(file: File): Promise<string> {
    //   return new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);
    //     reader.onload = () => resolve(reader.result as string);
    //     reader.onerror = error => reject(error);
    //   });
    // }
    
  
    async onSubmit() {
      const addressFormValue = this.unidentifiedBodyForm.get('addressForm')?.value;
      if (addressFormValue && Object.keys(addressFormValue).length > 0) {
        this.addresses.push(this.fb.group(addressFormValue));
      }
  
      const contactFormValue = this.unidentifiedBodyForm.get('contactForm')?.value;
      if (contactFormValue && Object.keys(contactFormValue).length > 0) {
        this.contacts.push(this.fb.group(contactFormValue));
      }
  
      const birthDate = this.unidentifiedBodyForm.get('birth_date')?.value;
      let finalBirthDate = birthDate instanceof Date
        ? this.datePipe.transform(birthDate, 'yyyy-MM-dd')
        : birthDate;
  
      const birthTime = this.unidentifiedBodyForm.get('birthtime')?.value;
      const formattedBirthTime = this.formatTime(birthTime);
  
      const lastKnownDetails = this.unidentifiedBodyForm.get('last_known_details')?.value;
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
  
      // let base64Photo = null;
      // if (this.selectedPhotoFile) {
      //   base64Photo = await this.convertFileToBase64(this.selectedPhotoFile);
      // } else {
      //   alert("Please upload a person photo.");
      //   return; // If no photo is selected, do not proceed
      // }
  
      const payload = {
        ...this.unidentifiedBodyForm.value,
        birth_date: finalBirthDate,
        birthtime: formattedBirthTime,
        addresses: this.addresses.value,
        contacts: this.contacts.value,
        // photo_base64: base64Photo, 
      };
  
      delete payload.addressForm;
      delete payload.contactForm;
  
      const formData = new FormData(); // Create a new FormData instance
  
      {      // Append form fields to FormData
        Object.entries(payload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value)); // For arrays, stringify
          } else if (value instanceof Blob || typeof value === 'string') {
            formData.append(key, value as string | Blob); // Cast to string or Blob
          }
        });
  
        // Check if photo is selected before appending it to the FormData
        // if (this.selectedPhotoFile) {
        //   formData.append('photo_photo', this.selectedPhotoFile, this.selectedPhotoFile.name);
        // } else {
        //   alert("Please upload a person photo.");
        //   return; // If no photo is selected, do not proceed
        // }
      }
  
      this.formApi.postMissingPerson(payload).subscribe({
        next: (response:any) => {
          console.log('Person added successfully!', response);
          alert("Person added successfully");
          this.unidentifiedBodyForm.reset();
          this.addresses.clear();
          this.contacts.clear();
          this.selectedFiles = {};
        },
        error: (error: any) => {
          console.error('Error adding person:', error);
          alert('An error occurred while adding the person. Please try again.');
        },
      });
      
    }
    
    
    formatTime(time: string): string {
      return time ? time.replace(/[“”]/g, '"') : '';
    }
}


