import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { merge } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatIconModule } from '@angular/material/icon';
import { map, marker } from 'leaflet';
import { FormApiService } from '../unidentified-person-form/forms-api-up.service';
import { ToastrService } from 'ngx-toastr';
import { UbconsentComponent } from './ubconsent/ubconsent.component';

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
  providers: [provideNativeDateAdapter(), DatePipe],
})
export class UnidentifiedBodyFormComponent implements OnInit, AfterViewInit {
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
  // createAddressFormGroup!:FormFroup;
  storedPersonId: string | null = null;

  selectedFileName: string = '';

  constructor(
    private fb: FormBuilder,
    private formApi: FormApiService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }


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

  allowOnlyLetters(event: KeyboardEvent, controlName: string, formGroup: 'contactForm' | 'unidentifiedBodyForm' | 'firsForm'): boolean {
    const key = event.key;
    const allowedPattern = /^[a-zA-Z.\s]$/;
    const navigationKeys = ['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    let form;
    switch (formGroup) {
      case 'contactForm':
        form = this.contactForm;
        break;
      case 'unidentifiedBodyForm':
        form = this.unidentifiedBodyForm;
        break;
      case 'firsForm':
        form = this.firsForm;
        break;
    }

    const control = form.get(controlName);

    if (!allowedPattern.test(key) && !navigationKeys.includes(key)) {
      control?.setErrors({ ...control?.errors, invalidChars: true });
      event.preventDefault();
      return false;
    } else {
      const currentErrors = control?.errors;
      if (currentErrors?.['invalidChars']) {
        delete currentErrors['invalidChars'];
        control?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
      }
      return true;
    }
  }


  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    if (allowedKeys.includes(event.key)) {
      return true;
    }

    const isNumber = /^[0-9]$/.test(event.key);
    const inputName = (event.target as HTMLInputElement).getAttribute('formControlName');

    const control =
      inputName === 'weight' ? this.unidentifiedBodyForm.get('weight') :
        inputName === 'pincode' ? this.addressForm.get('pincode') :
          inputName === 'phone_no' ? this.contactForm.get('phone_no') :
            inputName === 'investigation_officer_contacts' ? this.firsForm?.get('investigation_officer_contacts') : // Add this line
              null;

    if (!isNumber) {
      control?.setErrors({ ...control.errors, invalidChars: true });
      event.preventDefault();
      return false;
    } else {
      const currentErrors = control?.errors;
      if (currentErrors?.['invalidChars']) {
        delete currentErrors['invalidChars'];
        control?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
      }
      return true;
    }
  }

  // Restricts age to max 200 even while typing
  restrictMaxAge(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.valueAsNumber;

    if (value > 200) {
      input.value = '200'; // Force-set to max 200
      this.unidentifiedBodyForm.get('weight')?.setValue(200); // Update form control
      this.unidentifiedBodyForm.get('weight')?.setErrors({ max: true }); // Show error
    }
  }
  // Unified method for both village and city
  allowTextInput(event: KeyboardEvent, controlName: string): boolean {
    const charCode = event.key.charCodeAt(0);
    const allowedKeys = [8, 9, 13, 37, 38, 39, 40];
    const isValidChar =
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122) ||
      charCode === 32 ||
      charCode === 45 ||
      allowedKeys.includes(charCode);

    if (!isValidChar) {
      this.addressForm.get(controlName)?.setErrors({ invalidChars: true });
      event.preventDefault();
      return false;
    }
    return true;
  }
  preventSpecialCharacters(event: KeyboardEvent) {
    const allowedChars = /[a-zA-Z0-9 ]/;  // Allows letters, numbers, and spaces
    if (!allowedChars.test(event.key)) {
      event.preventDefault();
    }
  }
  textOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value?.trim();
      if (!value) return null; // empty is allowed

      // Allow letters, numbers, spaces, commas, and hyphens
      const valid = /^[A-Za-z0-9 ,\-]+$/.test(value);
      return valid ? null : { invalidCharacters: true };
    };
  }

  allowOnlyNumbersAndHyphen(event: KeyboardEvent): boolean {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '-'];
    if (allowedKeys.includes(event.key)) return true;

    const isValid = /^[0-9\-]$/.test(event.key);
    const inputName = (event.target as HTMLInputElement).getAttribute('formControlName');
    const control = inputName === 'phone_no' ? this.contactForm.get('phone_no') : null;

    if (!isValid) {
      control?.setErrors({ ...control.errors, invalidChars: true });
      event.preventDefault();
      return false;
    } else {
      const currentErrors = control?.errors;
      if (currentErrors?.['invalidChars']) {
        delete currentErrors['invalidChars'];
        control?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
      }
      return true;
    }
  }

  initializeForm() {
    this.unidentifiedBodyForm = this.fb.group({

      full_name: ['', [Validators.maxLength(30)]],
      birth_date: [null],
      age_range: [''],
      weight: ['', [Validators.min(1), Validators.max(200)]],

      gender: [''],

      height: ['', [Validators.pattern(/^[0-9]*$/), Validators.max(250)]],

      birth_mark: ['', [Validators.maxLength(250), Validators.pattern(/^[a-zA-Z\s]*$/)]],
      distinctive_mark: ['', [Validators.maxLength(250), Validators.pattern(/^[a-zA-Z\s]*$/)]],
      type: ['Unidentified Body'],
      birthtime: [null],
      birthplace: [''],
      height_range: [''],
      blood_group: [''],
      complexion: [''],
      hair_color: [''],
      hair_type: [''],
      eye_color: [''],
      condition: [''],
      Body_Condition: [''],
      death_type: [''],
      bodies_condition: [[]],
      hospital: [null],
      document_ids: [''],
      created_at: [null],
      updated_at: [null],
      created_by: [''],
      updated_by: [''],
      photo_photo: [''],
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
  get addressForm(): FormGroup {
    return this.unidentifiedBodyForm.get('addressForm') as FormGroup;
  }

  get contactForm(): FormGroup {
    return this.unidentifiedBodyForm.get('contactForm') as FormGroup;
  }

  get additionalInfo(): FormArray {
    return this.unidentifiedBodyForm.get('additional_info') as FormArray;
  }

  get lastKnownDetails(): FormArray {
    return this.unidentifiedBodyForm.get('last_known_details') as FormArray;
  }
  get firsForm(): FormGroup {
    return this.unidentifiedBodyForm.get('firs') as FormGroup;
  }

  get firs(): FormArray {
    return this.unidentifiedBodyForm.get('firs') as FormArray;
  }

  get consent(): FormArray {
    return this.unidentifiedBodyForm.get('consent') as FormArray;
  }
  createAddressFormGroup(): FormGroup {
    return this.fb.group({

      district: [''],
      state: [''],
      country: [''],

      pincode: ['', [Validators.pattern(/^[0-9]{1,15}$/)]],
      landmark_details: ['', [Validators.maxLength(150), this.landmarkValidator()]],
      street: ['', [Validators.maxLength(30), this.textOnlyValidator()]],
      village: ['', [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z\s-]*$/)]],

      city: ['', [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z\s]*$/)]],

      address_type: [''],
      // street: [''],
      appartment_no: [''],
      appartment_name: [''],
      // location: this.fb.group({
      //   latitude: [''],
      //   longitude: [''],
      // }),
      location: this.fb.group({
        latitude: ['', [Validators.required, this.coordinateValidator()]],
        longitude: ['', [Validators.required, this.coordinateValidator()]],
      }),
      // user: [''],
      // created_by: [''],
      // updated_by: [''],
    });
  }
  coordinateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      const pattern = /^-?\d{1,3}(\.\d+)?$/;
      return pattern.test(value) ? null : { invalidCoordinate: true };
    };
  }

  landmarkValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      // Allow letters, numbers, spaces, and , . - # :
      const pattern = /^[a-zA-Z0-9\s,.\-#:]+$/;
      return pattern.test(value) ? null : { invalidLandmark: true };
    };
  }


  // Correct method to create Contact FormGroup
  createContactFormGroup(): FormGroup {
    return this.fb.group({
      type: ['referral'],
      // person_name: ['', [Validators.pattern(/^[a-zA-Z\s]+$/)]],
      person_name: new FormControl('', [
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^([A-Z][a-z]+(\s)?|([A-Z]\.?\s)?)+$/)
      ]),
      // phone_no: ['', [Validators.pattern(/^[0-9]{1,10}$/)]],
      phone_no: [
        '',
        [
          Validators.pattern(/^(?:[789]\d{9}|0\d{2,4}-?\d{6,8})$/)
        ]
      ],
      // email_id: ['', Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
      email_id: [
        null,
        Validators.compose([
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ])
      ],
      additional_details: ['', Validators.maxLength(200)],
      hospital: [null],
      police_station: [null],
      person: [''],
      created_at: [null],
      updated_at: [null],
      // created_by: [''],
      // updated_by: [''],
    });
  }

  addAddress() {
    const addressForm = this.unidentifiedBodyForm.get('addressForm');

    if (addressForm) {
      // Mark all fields as touched to trigger validation errors
      addressForm.markAllAsTouched();

      if (addressForm.valid) {
        // Add the current address to the list
        this.addresses.push(this.fb.group(addressForm.value));

        // Optional: console log for debugging
        console.log('Addresses:', this.addresses.value);

        // Reset the form and optionally set default values
        addressForm.reset();
        addressForm.get('address_type')?.setValue('');
        addressForm.get('state')?.setValue('');
        addressForm.get('country')?.setValue('');

        // Mark the main form as dirty since a new address is added
        this.unidentifiedBodyForm.markAsDirty();
      } else {
        alert('Please fill in all required address fields before adding another address.');
      }
    }
  }
  addContact() {
    const contactForm = this.unidentifiedBodyForm.get('contactForm');

    if (contactForm) {

      contactForm.markAllAsTouched();

      if (contactForm.valid) {

        this.contacts.push(this.fb.group(contactForm.value));

        console.log('Contacts:', this.contacts.value);

        contactForm.reset();
        contactForm.get('type')?.setValue('');
        contactForm.get('social_media_availability')?.setValue('');
        contactForm.get('is_primary')?.setValue('');

        this.unidentifiedBodyForm.markAsDirty();
      } else {
        alert('Please fill in all required contact fields before adding another contact.');
      }
    }
  }


  // Add additional info
  addAdditionalInfo() {
    this.additionalInfo.push(this.fb.group({
      person: [''],
      created_at: [null],
      updated_at: [null],
      // created_by: [''],
      // updated_by: [''],
      caste: ['', [Validators.pattern(/^[a-zA-Z\s]{1,30}$/)]],
      subcaste: ['', [Validators.pattern(/^[a-zA-Z\s]{1,30}$/)]],
      marital_status: [''],
      religion: [''],
      mother_tongue: [''],
      other_known_languages: ['', this.languageValidator],
      id_type: [''],
      // id_no: ['', Validators.pattern(/^[a-zA-Z0-9]+$/)],
      id_no: ['', [Validators.pattern(/^[a-zA-Z0-9]+$/), Validators.maxLength(15)]],
      education_details: [''],
      occupation_details: ['', [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 ]*$/)]]
    }));
  }

  languageValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const languages = control.value.split(',').map((lang: string) => lang.trim());

    if (languages.length > 5) {
      return { tooManyLanguages: true };
    }

    const invalidChars = languages.some((lang: string) => !/^[a-zA-Z\s]+$/.test(lang));
    if (invalidChars) {
      return { invalidLanguageChars: true };
    }

    return null;
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
      fir_number: ['', [Validators.pattern(/^[a-zA-Z0-9/]{1,20}$/)]],
      case_status: [''],
      investigation_officer_contact: [null],
      // investigation_officer_name: ['', [Validators.pattern(/^[a-zA-Z\s]{1,30}$/)],[  Validators.maxLength(30) ]],
      // investigation_officer_name: ['',[Validators.maxLength(30)]],
      investigation_officer_name: new FormControl('', [
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^([A-Z][a-z]+(\s)?|([A-Z]\.?\s)?)+$/)
      ]),
      // investigation_officer_contacts: ['',[Validators.pattern(/^[0-9]{1,10}$/)]],
      investigation_officer_contacts: [
        '',
        [
          Validators.pattern(/^(?:[789]\d{9}|0\d{2,4}-?\d{6,8})$/)
        ]
      ],
      police_station: ['',],
      document: [null],
      fir_photo: [null],
      person: [''],
      created_at: [null],
      updated_at: [null],
      // created_by: [''],
      // updated_by: [''],
    }));
  }


  loadPoliceStations() {
    this.formApi.getPoliceStationList().subscribe({
      next: (data: any) => {
        this.policeStations = data;
        console.log("Police Stations Loaded:", this.policeStations);
      },
      error: (err: any) => {
        console.error("Error loading police stations", err);
      }
    });
  }

  loadHospitals() {
    this.formApi.getHospitalList().subscribe({
      next: (data: any) => {
        this.hospitals = data;
        console.log("Hospitals Loaded:", this.hospitals);
      },
      error: (err: any) => {
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

  selectedFile: string | null = null;

  onFileSelect_person_photo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }


  onSubmit() {
    const formData = new FormData();

    const addressFormValue = this.unidentifiedBodyForm.get('addressForm')?.value;
    if (addressFormValue && Object.keys(addressFormValue).length > 0) {
      this.addresses.push(this.fb.group(addressFormValue));
    }

    const contactFormValue = this.unidentifiedBodyForm.get('contactForm')?.value;
    if (contactFormValue && Object.keys(contactFormValue).length > 0) {
      this.contacts.push(this.fb.group(contactFormValue));
    }

    const birthDate = this.unidentifiedBodyForm.get('birth_date')?.value;
    const formattedBirthDate = this.datePipe.transform(birthDate, 'yyyy-MM-dd');
    const birthTime = this.formatTime(this.unidentifiedBodyForm.get('birthtime')?.value);

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

    // Create a clean JSON object
    const payload = {
      ...this.unidentifiedBodyForm.value,
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
        this.toastr.success('Unidentified Body data added successfully', 'Success');
        this.unidentifiedBodyForm.reset();
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


  openConsentDialog(): Promise<boolean> {
    const dialogRef = this.dialog.open(UbconsentComponent, {
      width: '80vw',
      maxWidth: '90vw',
      height: '80vh',
      maxHeight: '90vh',
      autoFocus: false
    });

    return dialogRef.afterClosed().toPromise().then(result => result === true);
  }
  onConsentChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;

    if (!checkbox.checked) {
      this.consent.controls[0].get('is_consent')?.setValue(false);
      this.cdr.detectChanges();
      return;
    }

    checkbox.checked = false;

    this.openConsentDialog().then((consentGiven: boolean) => {
      this.consent.controls[0].get('is_consent')?.setValue(consentGiven);
      checkbox.checked = consentGiven;
      this.cdr.detectChanges();
    });
  }
}



