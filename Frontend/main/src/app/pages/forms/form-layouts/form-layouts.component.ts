import { MaterialModule } from '../../../material.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
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

import { merge } from 'rxjs';
import { FormApiService } from './form-api.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { MpconsentComponent } from './mpconsent/mpconsent.component';

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
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    NgxMatTimepickerModule,
  ],
  templateUrl: './form-layouts.component.html',
  styleUrls: ['./form-layouts.component.scss'],
  providers: [provideNativeDateAdapter(), DatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class AppFormLayoutsComponent implements OnInit, AfterViewInit {
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
  fileToUpload: any;
  age: number | any;
  addedAddresses: any[] = [];
  missingPersonForm!: FormGroup;
  latcoordinate: any;
  lngcoordinate: any;
  personForm!: FormGroup;
  selectedMapId = 'defaultMapId';
  states = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
  ];
  countries = [
    'India',
    'United States of America',
    'China',
    'Japan',
    'Germany',
    'United Kingdom',
    'France',
    'Brazil',
    'Australia',
    'Canada',
  ];
  selectedImage: string | ArrayBuffer | null | undefined;
  uploadedFiles: any;
  selectedFiles: { [key: string]: any[] } = {};
  hospitalList: any[] = [];
  policeStationList: any[] = [];
  today: string;

  constructor(
    private fb: FormBuilder,
    private formapi: FormApiService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    this.today = new Date().toISOString().split('T')[0];
  }

  openConsentDialog() {
    const dialogRef = this.dialog.open(MpconsentComponent, {
      width: '80vw',
      maxWidth: '90vw',
      height: '80vh',
      maxHeight: '90vh',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.consent.controls[0].get('is_consent')?.setValue(true);
      }
    });
  }

  onConsentChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.openConsentDialog();
    }
  }

  ngOnInit(): void {
    // this.gettoken()
    this.getperson();
    this.initializeForm();
    this.fetchHospitalList();
    this.fetchPoliceStationList();
  }

  fetchHospitalList() {
    this.formapi.getHospitalNames().subscribe({
      next: (data) => {
        this.hospitalList = data;
        console.log('Hospitals:', this.hospitalList);
      },
      error: (err) => console.error('Error fetching hospitals:', err),
    });
  }

  fetchPoliceStationList() {
    this.formapi.getPoliceStationNames().subscribe({
      next: (data) => {
        this.policeStationList = data;
        console.log('Police Stations:', this.policeStationList);
      },
      error: (err) => console.error('Error fetching police stations:', err),
    });
  }
  // ✅ Define gettoken() separately
  gettoken() {
    this.storedPersonId = localStorage.getItem('user_id');
    console.log(this.storedPersonId, 'id');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 0);
  }

  getperson() {
    this.formapi.getallPerson().subscribe((data) => {
      console.log(data);
    });
  }

  formatDateToISO(date: any): string {
    if (typeof date === 'string') return date; // already formatted
    return date instanceof Date ? date.toISOString().split('T')[0] : '';
  }

  formatTimeToHHMM(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  alphabeticValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) return null;

      const value = control.value.trim();

      // Check if it's just spaces after trimming
      if (value === '') {
        return { onlySpaces: true };
      }

      // Check for leading space in original value (before trimming)
      if (/^\s/.test(control.value)) {
        return { leadingSpace: true };
      }

      // Allow only letters and spaces between words (e.g., "John Doe")
      if (!/^[A-Za-z ]+$/.test(value)) {
        return { invalidCharacters: true };
      }

      return null; // Valid input
    };
  }
  pastDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = control.value;
      if (!selectedDate) return null;

      const today = new Date();
      // Remove time portion for comparison
      today.setHours(0, 0, 0, 0);

      if (new Date(selectedDate) > today) {
        return { futureDate: true };
      }

      return null;
    };
  }

  weightValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === '') return null;

      const numberValue = parseFloat(value);
      if (isNaN(numberValue) || numberValue < 0 || numberValue > 200) {
        return { invalidWeight: true };
      }
      return null;
    };
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

  numericOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      const pattern = /^\d+$/; // only digits
      return pattern.test(value) ? null : { invalidPincode: true };
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

  coordinateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      const pattern = /^-?\d{1,3}(\.\d+)?$/;
      return pattern.test(value) ? null : { invalidCoordinate: true };
    };
  }
  phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      // Only digits, length between 10 and 15
      const pattern = /^\d{10,10}$/;

      return pattern.test(value) ? null : { invalidPhone: true };
    };
  }
  preventSpecialCharacters(event: KeyboardEvent) {
    const allowedChars = /[a-zA-Z0-9 ]/;  // Allows letters, numbers, and spaces
    if (!allowedChars.test(event.key)) {
      event.preventDefault();
    }
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
  allowOnlyLetters(event: KeyboardEvent, controlName: string, formGroup: 'contactForm' | 'personForm' | 'firsForm'): boolean {
    const key = event.key;
    const allowedPattern = /^[a-zA-Z.\s]$/;
    const navigationKeys = ['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    let form;
    switch (formGroup) {
      case 'contactForm':
        form = this.contactForm;
        break;
      case 'personForm':
        form = this.personForm;
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

  initializeForm() {
    this.personForm = this.fb.group({
      type: ['Missing Person'],
      full_name: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          this.alphabeticValidator(),
        ]),
      ],
      birth_date: [null, this.pastDateValidator()],
      age: [null],
      // age: [{ value: null, disabled: true }],
      birthtime: [null],
      gender: [''],
      birthplace: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          this.alphabeticValidator(),
        ]),
      ],
      height: [''],
      height_range: [''],
      weight: [
        '',
        Validators.compose([
          Validators.min(0),
          Validators.max(200),
          this.weightValidator(),
        ]),
      ],
      blood_group: [''],
      complexion: [''],
      hair_color: [''],
      hair_type: [''],
      eye_color: [''],
      condition: [''],
      Body_Condition: [''],
      birth_mark: ['', [Validators.maxLength(250), this.textOnlyValidator()]],
      distinctive_mark: [
        '',
        [Validators.maxLength(250), this.textOnlyValidator()],
      ],
      photo_photo: [null],
      hospital: [null],
      document_ids: [null],
      created_by: [null],
      updated_by: [null],
      _is_deleted: [false],

      addresses: this.fb.array([]),
      contacts: this.fb.array([]),
      additional_info: this.fb.array([]),
      last_known_details: this.fb.array([]),
      firs: this.fb.array([]),
      consent: this.fb.array([]),
      addressForm: this.createAddressFormGroup(),
      contactForm: this.createcontactFormGroup(),
    });
    this.personForm.get('birth_date')?.valueChanges.subscribe((date) => {
      if (date) {
        // Format the date to ISO
        const formatted = this.formatDateToISO(date);
        this.personForm.patchValue(
          { birth_date: formatted },
          { emitEvent: false }
        );

        // Calculate age
        const age = this.calculateAge(new Date(date));
        this.personForm.get('age')?.setValue(age, { emitEvent: false });
      } else {
        this.personForm.get('age')?.setValue(null, { emitEvent: false });
      }
    });
    // this.addContact();
    this.addAdditionalInfo();
    this.addLastKnownDetails();
    this.addFIR();
    this.addConsent();
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get addressForm(): FormGroup {
    return this.personForm.get('addressForm') as FormGroup;
  }

  get contactForm(): FormGroup {
    return this.personForm.get('contactForm') as FormGroup;
  }
  get firsForm(): FormGroup {
    return this.personForm.get('firs') as FormGroup;
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
      this.addresses.push(
        this.fb.group(this.personForm.get('addressForm')?.value)
      );
      console.log('Addresses:', this.addresses.value);
      this.personForm.markAsDirty();
      this.personForm.get('addressForm')?.reset();
      this.personForm.get('addressForm.address_type')?.setValue('');
      this.personForm.get('addressForm.state')?.setValue('');
      this.personForm.get('addressForm.country')?.setValue('');
    } else {
      alert(
        'Please fill in all required fields before adding another address.'
      );
    }
  }

  addcontact() {
    if (this.personForm.get('contactForm')?.valid) {
      this.contacts.push(
        this.fb.group(this.personForm.get('contactForm')?.value)
      );
      console.log('contacts:', this.contacts.value);
      this.personForm.markAsDirty();
      this.personForm.get('contactForm')?.reset();
      this.personForm.get('contactForm.type')?.setValue('');
      this.personForm
        .get('contactForm.social_media_availability')
        ?.setValue('');
      this.personForm.get('contactForm.is_primary')?.setValue('');
    } else {
      alert(
        'Please fill in all required fields before adding another contact.'
      );
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
      street: ['', [Validators.maxLength(30), this.textOnlyValidator()]],
      appartment_no: [''],
      appartment_name: [
        '',
        [Validators.maxLength(30), this.textOnlyValidator()],
      ],
      village: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          this.alphabeticValidator(),
        ]),
      ],
      city: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          this.alphabeticValidator(),
        ]),
      ],
      district: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          this.alphabeticValidator(),
        ]),
      ],
      state: [''],
      user: [this.storedPersonId],
      pincode: [
        '',
        [
          Validators.minLength(6),
          Validators.maxLength(15),
          this.numericOnlyValidator(),
        ],
      ],
      country: [''],
      landmark_details: [
        '',
        [Validators.maxLength(150), this.landmarkValidator()],
      ],
      location: this.fb.group({
        latitude: ['', [Validators.required, this.coordinateValidator()]],
        longitude: ['', [Validators.required, this.coordinateValidator()]],
      }),
      created_by: [this.storedPersonId],
      updated_by: [this.storedPersonId],
    });
  }

  createcontactFormGroup(): FormGroup {
    return this.fb.group({
      // phone_no: ['', [this.phoneNumberValidator()]],
      phone_no: [
        '',
        [
          Validators.pattern(/^(?:[789]\d{9}|0\d{2,4}-?\d{6,8})$/)
        ]
      ],
      country_cd: [''],
      email_id: [
        '',
        Validators.compose([
          Validators.maxLength(50),
          Validators.pattern(
            /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ]),
      ],
      type: [''],
      company_name: [
        '',
        Validators.compose([
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ]),
      ],
      job_title: [
        '',
        Validators.compose([
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ]),
      ],
      website_url: [
        '',
        Validators.pattern(/^(https?:\/\/)?([\w\-]+\.)+[\w]{2,}(\/\S*)?$/),
      ],
      social_media_url: [
        '',
        Validators.compose([
          Validators.maxLength(100),
          Validators.pattern(
            /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|(\d{1,3}(\.\d{1,3}){3}))(:\d+)?(\/[^\s]*)?$/
          ),
        ]),
      ],
      social_media_availability: [''],
      additional_details: ['', Validators.maxLength(200)],
      is_primary: [false],
      user: [this.storedPersonId],
      hospital: [null],
      police_station: [null],
      person: [''],
      created_by: [this.storedPersonId],
      updated_by: [this.storedPersonId],
    });
  }

  addAdditionalInfo() {
    this.additionalInfo.push(
      this.fb.group({
        caste: [''],
        subcaste: [''],
        marital_status: [''],
        religion: [''],
        mother_tongue: [''],
        other_known_languages: [''],
        id_type: [''],
        // id_no: [''],
        id_no: ['', [Validators.pattern(/^[a-zA-Z0-9]+$/), Validators.maxLength(15)]],

        education_details: [''],
        // occupation_details: [''],
        occupation_details: ['', [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 ]*$/)]],


        user: [this.storedPersonId],
        person: [''],
        created_by: [this.storedPersonId],
        updated_by: [this.storedPersonId],
      })
    );
  }

  addLastKnownDetails() {
    this.lastKnownDetails.push(
      this.fb.group({
        person_photo: [null],
        reference_photo: [null],
        missing_time: [null],
        missing_date: [''],
        missing_location_details: ['', Validators.maxLength(200)],
        last_seen_location: ['', Validators.maxLength(200)],
        address: [null],
        person: [''],
        created_by: [this.storedPersonId],
        updated_by: [this.storedPersonId],
      })
    );
  }

  addFIR() {
    this.firs.push(
      this.fb.group({
        // fir_number: [''],
        fir_number: ['', [Validators.pattern(/^[a-zA-Z0-9/]{1,20}$/)]],

        case_status: [''],
        // investigation_officer_name: [''],
        investigation_officer_name: new FormControl('', [
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^([A-Z][a-z]+(\s)?|([A-Z]\.?\s)?)+$/)
        ]),
        investigation_officer_contact: [null],
        // investigation_officer_contacts: ['',[Validators.pattern(/^[0-9]{1,12}$/)]],

        investigation_officer_contacts: [
          '',
          [
            Validators.pattern(/^(?:[789]\d{9}|0\d{2,4}-?\d{6,8})$/)
          ]
        ],
        police_station: [null],
        document: [null],
        person: [''],

        created_by: [this.storedPersonId],
        updated_by: [this.storedPersonId],
      })
    );
  }

  addConsent() {
    this.consent.push(
      this.fb.group({
        data: [''],
        person: [''],
        is_consent: [false],
        created_by: [this.storedPersonId],
        updated_by: [this.storedPersonId],
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
        this.updateLocation(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        console.error('Error fetching location:', error);
        alert(
          'Unable to fetch location. Ensure location services are enabled.'
        );
      }
    );
  }

  selectedFile: string | null = null;

  onFileSelect_person_photo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
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
    return this.personForm.get(section) as FormArray;
  }

  onSubmit() {
    const formData = new FormData();
    // Validate the personForm before proceeding
    if (this.personForm.invalid) {
      this.toastr.error('Please fill out all required fields', 'Error');
      return;
    }

    this.addresses.clear();
    this.contacts.clear();

    const addressFormValue = this.personForm.get('addressForm')?.value;
    if (addressFormValue && Object.keys(addressFormValue).length > 0) {
      this.addresses.push(this.fb.group(addressFormValue));
    }

    const contactFormValue = this.personForm.get('contactForm')?.value;
    if (contactFormValue && Object.keys(contactFormValue).length > 0) {
      this.contacts.push(this.fb.group(contactFormValue));
    }

    const birthDate = this.personForm.get('birth_date')?.value;
    const formattedBirthDate = this.datePipe.transform(birthDate, 'yyyy-MM-dd');
    const birthTime = this.formatTime(this.personForm.get('birthtime')?.value);

    const lastKnownDetails = this.personForm.get('last_known_details')?.value;
    if (lastKnownDetails && lastKnownDetails.length > 0) {
      lastKnownDetails.forEach((detail: any) => {
        // ✅ Safely handle missing_date
        if (detail.missing_date) {
          detail.missing_date = this.datePipe.transform(
            detail.missing_date,
            'yyyy-MM-dd'
          );
        } else {
          detail.missing_date = null; // ✅ Important fix
        }

        // ✅ Format missing_time if present
        if (detail.missing_time) {
          detail.missing_time = this.formatTime(detail.missing_time);
        }
      });
    }

    // Create a clean JSON object
    const payload = {
      ...this.personForm.value,
      birth_date: formattedBirthDate,
      birthtime: birthTime,
      addresses: this.addresses.value,
      contacts: this.contacts.value,
    };

    delete payload.addressForm;
    delete payload.contactForm;

    // Append JSON data as a Blob (important!)
    formData.append(
      'payload',
      new Blob([JSON.stringify(payload)], { type: 'application/json' })
    );

    // Append image file if available
    if (this.selectedFile) {
      formData.append('photo_photo', this.selectedFile);
    }

    this.formapi.postMissingPerson(formData).subscribe({
      next: (response) => {
        this.toastr.success('Missing Person Added Successfully', 'Success');
        this.personForm.reset();
        this.addresses.clear();
        this.contacts.clear();
        this.selectedFile = null;
      },
      error: (error) => {
        this.toastr.error('Oops!', 'Something went wrong.');
      },
    });
  }

  formatTime(time: string): string | null {
    if (!time) return null;

    const [timePart, modifier] = time.trim().split(' ');

    if (!timePart || !modifier) return null;

    let [hours, minutes] = timePart.split(':');
    let hrs = parseInt(hours, 10);

    if (modifier.toUpperCase() === 'PM' && hrs !== 12) {
      hrs += 12;
    }
    if (modifier.toUpperCase() === 'AM' && hrs === 12) {
      hrs = 0;
    }

    return `${hrs.toString().padStart(2, '0')}:${minutes}`;
  }
}