import { MaterialModule } from '../../../material.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Component, OnInit ,AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup ,FormArray } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AppCodeViewComponent } from '../../../components/code-view/code-view.component';
import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

import { merge } from 'rxjs';
import { FormApiService } from './form-api.service';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-form-layouts',
  imports: [
    MaterialModule,
    TablerIconsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    AppCodeViewComponent,
    Highlight,
    HighlightAuto,
    HighlightLineNumbers,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './form-layouts.component.html',
  styleUrls: ['./form-layouts.component.scss'], // ✅ Corrected filename
  providers: [provideNativeDateAdapter()],
})
export class AppFormLayoutsComponent implements OnInit , AfterViewInit{

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  storedPersonId: string | null = null;
  map!: L.Map;
  marker!: L.Marker | null;
  latitude: number | null = null;
  longitude: number | null = null;
  markerMissing: any; 
  showLoader = false;
  loading = false;
  progress = 0;
  geocoder: any;
  markerLayer: any; 
  fileToUpload:any
  age: number | any;
  addedAddresses: any[] = [];
  missingPersonForm!: FormGroup;
  latcoordinate: any
  lngcoordinate: any
  personForm!: FormGroup;
  selectedMapId = 'defaultMapId'; 
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
  selectedImage: string | ArrayBuffer | null | undefined;
  uploadedFiles: any;
  selectedFiles: { [key: string]: any[] } = {};



  constructor(private fb: FormBuilder,private formapi:FormApiService) {
    
  }
  ngOnInit(): void {
    // this.gettoken()
    this.getperson()
    this.initializeForm();
   
  }
  // ✅ Define gettoken() separately
  gettoken() {
    this.storedPersonId = localStorage.getItem('user_id');
    console.log(this.storedPersonId, "id");
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();  // Ensure the map initializes after the view is fully loaded
    }, 0);
  }

  getperson(){
    this.formapi.getallPerson().subscribe((data)=>{
      console.log(data)
    })
  }

  initializeForm() {
    this.personForm = this.fb.group({
      type: [''],
      full_name: [''],
      birth_date: [''],
      age: [''],
      birthtime: [null],
      gender: [''],
      birthplace: [''],
      height: [''],
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
      created_by: [null],  
      updated_by: [null],  
      _is_deleted: [false],

     // Addresses array
      addresses: this.fb.array([]),
      contacts: this.fb.array([]),

      addressForm: this.createAddressFormGroup(),
      contactForm: this.createAddresFormGroup(),

     
      additional_info: this.fb.array([]),
      last_known_details: this.fb.array([]),
      firs: this.fb.array([]),
      consent: this.fb.array([]),
    });
  
    // this.addContact();
    this.addAdditionalInfo();
    this.addLastKnownDetails();
    this.addFIR();
    this.addConsent();
  }
  

  
  
   
  
  
  
  
  get addresses(): FormArray {
    return this.personForm.get('addresses') as FormArray;
  }
  get contacts() {
    return this.personForm.get('contacts') as FormArray;
  }
  get additionalInfo() {
    return this.personForm.get('additional_info') as FormArray;
  }
  get lastKnownDetails() {
    return this.personForm.get('last_known_details') as FormArray;
 }
  get firs() {
    return this.personForm.get('firs') as FormArray;
  }
  get consent() {
    return this.personForm.get('consent') as FormArray;
  }

 

  addAddress() {
    if (this.personForm.get('addressForm')?.valid) {
      // Push addressForm into addresses FormArray
      this.addresses.push(this.fb.group(this.personForm.get('addressForm')?.value));
  
      // Log the addresses FormArray
      console.log("Addresses:", this.addresses.value);
  
      // Mark the form as dirty to trigger change detection
      this.personForm.markAsDirty();
  
      // Reset only addressForm (not entire form)
      this.personForm.get('addressForm')?.reset();
  
      // Explicitly reset select fields to their default options
      this.personForm.get('addressForm.address_type')?.setValue('');
      this.personForm.get('addressForm.state')?.setValue('');
      this.personForm.get('addressForm.country')?.setValue('');
    } else {
      alert("Please fill in all required fields before adding another address.");
    }
  }

  addcontact() {
    if (this.personForm.get('contactForm')?.valid) {
      // Push addressForm into addresses FormArray
      this.contacts.push(this.fb.group(this.personForm.get('contactForm')?.value));
  
      // Log the addresses FormArray
      console.log("contacts:", this.contacts.value);
  
      // Mark the form as dirty to trigger change detection
      this.personForm.markAsDirty();
  
      // Reset only addressForm (not entire form)
      this.personForm.get('contactForm')?.reset();
  
      // Explicitly reset select fields to their default options
      this.personForm.get('contactForm.type')?.setValue('');
      this.personForm.get('contactForm.social_media_availability')?.setValue('');
      this.personForm.get('contactForm.is_primary')?.setValue('');
    
    } else {
      alert("Please fill in all required fields before adding another contact.");
    }
  }
  
  
  
  

  // Remove an address
  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }
  removecontact(index: number) {
    this.contacts.removeAt(index);
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
      user: [this.storedPersonId],
      pincode: [''],
      country: [''],
      landmark_details: [''],
      location: this.fb.group({
        latitude: [''],
        longitude: [''],
      }),
      created_by: [this.storedPersonId],
      updated_by:[this.storedPersonId],
    });
  }
  

  createAddresFormGroup():FormGroup {
     return this.fb.group({
        phone_no: [''],
        country_cd: [''],
        email_id: [''],
        type: [''], // Should be a dropdown with ContactTypeChoices
        company_name: [''],
        job_title: [''],
        website_url: [''],
        social_media_url: [''],
        social_media_availability: [''], // Should be a dropdown with SocialMediaChoices
        additional_details: [''],
        is_primary: [false],
        user: [this.storedPersonId],
        hospital: [null],
        police_station: [null],
        person: [''],
        created_at: [null],
        updated_at: [null],
        created_by:  [this.storedPersonId],
        updated_by:  [this.storedPersonId],
      })
    
  }
  
  addAdditionalInfo() {
    this.additionalInfo.push(
      this.fb.group({
        caste: [''], // Dropdown - CasteChoices
        subcaste: [''],
        marital_status: [''], // Dropdown - MaritalStatusChoices
        religion: [''],
        mother_tongue: [''],
        other_known_languages: [''], // Comma-separated list
        id_type: [''], // Dropdown - IdTypeChoices
        id_no: [''], // Alphanumeric check
        education_details: [''],
        occupation_details: [''],
        
        user:  [this.storedPersonId],
        person: [''],
        created_at: [null],
        updated_at: [null],
        created_by:  [this.storedPersonId],
        updated_by:  [this.storedPersonId],
      })
    );
  }
  
  addLastKnownDetails() { 
    this.lastKnownDetails.push(
      this.fb.group({
        person_photo: [null], // URL or Base64 encoded image
        reference_photo: [null], // URL or Base64 encoded image
        missing_time: [''], // Date-Time Picker
        missing_date: [''], // Date Picker
        last_seen_location: [''],
        missing_location_details: [''],
        address: [null], // Should be linked with Address entity
        person: [''], // Should be linked with Person entity
  
        created_at: [null],
        updated_at: [null],
        created_by:  [this.storedPersonId],
        updated_by:  [this.storedPersonId],
      })
    );
  }
  
  addFIR() {
    this.firs.push(
      this.fb.group({
        fir_number: [''], // Unique FIR number
        case_status: [''], // Case status
        investigation_officer_name: [''], // Officer's name
        investigation_officer_contact: [null], // ForeignKey to Contact
        police_station: [null], // ForeignKey to PoliceStation
        document: [null], // ForeignKey to Document
        person: [''], // ForeignKey to Person
        created_at: [null],
        updated_at: [null],
        created_by:  [this.storedPersonId],
        updated_by:  [this.storedPersonId],
      })
    );
  }
  
  addConsent() {
    this.consent.push(
      this.fb.group({
        data: [''],
        document: [null], 
        person: [''],
        is_consent: [false,Validators.required],
        created_at: [null],
        updated_at: [null],
        created_by:  [this.storedPersonId],
        updated_by:  [this.storedPersonId],
      })
    );
  }
  

  // Remove dynamically added fields
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
    this.map = L.map('mapHome').setView([22.9734, 78.6569], 5); // Center on India with an appropriate zoom level

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Click to add marker
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.updateLocation(event.latlng.lat, event.latlng.lng);
    });
 }


  updateLocation(lat: number, lng: number): void {
    this.latitude = parseFloat(lat.toFixed(6));
    this.longitude = parseFloat(lng.toFixed(6));

    // Update the form controls
    this.personForm.get('addressForm.location')?.patchValue({
      latitude: this.latitude,
      longitude: this.longitude,
    });

    // Define custom icon
    const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      shadowSize: [41, 41],
    });

    // Remove existing marker
    if (this.marker) {
      this.map!.removeLayer(this.marker);
    }

    // Add new marker
    this.marker = L.marker([this.latitude, this.longitude], {
      draggable: true,
      icon: customIcon,
    }).addTo(this.map!);

    // Update location on marker drag
    this.marker.on('dragend', () => {
      const newLatLng = this.marker!.getLatLng();
      this.updateLocation(newLatLng.lat, newLatLng.lng);
    });

    // Center the map on the new marker
    this.map!.setView([this.latitude, this.longitude], 10);
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


  
  onFileSelect(event: any, section: string, index: number, field: string) {
    const file = event.target.files[0];
    if (file) {
        // Ensure the section exists in selectedFiles
        if (!this.selectedFiles[section]) {
            this.selectedFiles[section] = [];
        }
        // Ensure the index exists in the section
        if (!this.selectedFiles[section][index]) {
            this.selectedFiles[section][index] = {};
        }
        // Store the file in the selectedFiles object
        this.selectedFiles[section][index][field] = file;

        // Optionally, set the file name in the form control for display purposes
        this.getFormArray(section).at(index).get(field)?.setValue(file.name);
    }
  }
  
  
  removeFile(section: string, index: number, field: string) {
    this.getFormArray(section).at(index).get(field)?.setValue(null);
  }

  private getFormArray(section: string): FormArray {
    return this.personForm.get(section) as FormArray;
  }
  
  
  
  
  
  

  onSubmit() {
    // Check if addressForm has valid data and add it to the addresses array
    const addressFormValue = this.personForm.get('addressForm')?.value;
    if (addressFormValue && Object.keys(addressFormValue).length > 0) {
      this.addresses.push(this.fb.group(addressFormValue)); 
    }
  
    const contactFormValue = this.personForm.get('contactForm')?.value;
    if (contactFormValue && Object.keys(contactFormValue).length > 0) {
      this.contacts.push(this.fb.group(contactFormValue)); 
    }
  
    
   const payload = {
    ...this.personForm.value,
    addresses: this.addresses.value, 
      contacts: this.contacts.value,  
  };

  // Remove temporary forms from the payload
  delete payload.addressForm;
  delete payload.contactForm;

  // Log the payload for debugging
  console.log("Payload Sent to Backend:", payload);

  // Create a FormData object to handle file uploads
  const formData = new FormData();

  // Append the JSON payload as a string
  formData.append('payload', JSON.stringify(payload));

  // Append files from last_known_details
  if (this.selectedFiles['last_known_details']) {
      this.selectedFiles['last_known_details'].forEach((group, index) => {
          const personPhoto = group['person_photo'];
          const referencePhoto = group['reference_photo'];

          if (personPhoto) {
              formData.append(`last_known_details[${index}][person_photo]`, personPhoto, personPhoto.name);
          }
          if (referencePhoto) {
              formData.append(`last_known_details[${index}][reference_photo]`, referencePhoto, referencePhoto.name);
          }
      });
  }

  // Append files from firs
  if (this.selectedFiles['firs']) {
      this.selectedFiles['firs'].forEach((group, index) => {
          const firPhoto = group['fir_photo'];

          if (firPhoto) {
              formData.append(`firs[${index}][fir_photo]`, firPhoto, firPhoto.name);
          }
      });
  }

  // Append files from consent
  if (this.selectedFiles['consent']) {
      this.selectedFiles['consent'].forEach((group, index) => {
          const document = group['document'];

          if (document) {
              formData.append(`consent[${index}][document]`, document, document.name);
          }
      });
  }

  // Send FormData to the backend
  this.formapi.postMissingPerson(formData).subscribe({
      next: (response) => {
          console.log('Person added successfully!', response);
          alert("Person added successfully");
          this.personForm.reset();
          this.addresses.clear(); // Clear the addresses FormArray
          this.contacts.clear();  // Clear the contacts FormArray
          this.selectedFiles = {}; // Reset selectedFiles
      },
      error: (error) => {
          console.error('Error adding person:', error);
          alert('An error occurred while adding the person. Please try again.');
      },
  });
  }


 

}
