import { Component, OnInit ,AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,FormArray } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { mockPersonData } from './mockPersonData';

declare var bootstrap: any;
import { Tab } from 'bootstrap';
import { PersonAddApiService } from './person-add-api.service';
@Component({
  selector: 'app-person-adding-form',
  templateUrl: './person-adding-form.component.html',
  styleUrls: ['./person-adding-form.component.css']
})
export class PersonAddingFormComponent implements OnInit , AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
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

  constructor(private MPservice :PersonAddApiService,private fb: FormBuilder){
    // this.initializeForm();
  }

  

  ngOnInit(): void {
    this.getperson()
    this.initializeForm();
    // this.initMap(this.selectedMapId);
    
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();  // Ensure the map initializes after the view is fully loaded
    }, 0);
  }

  getperson(){
    this.MPservice.getallPerson().subscribe((data)=>{
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
  
      // Single address form (resets after adding)
      addresses: this.fb.group({
        type: [''],
        street: [''],
        appartment_no: [''],
        appartment_name: [''],
        village: [''],
        city: [''],
        district: [''],
        state: [''],
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
  
      contacts: this.fb.array([]),
      additional_info: this.fb.array([]),
      last_known_details: this.fb.array([]),
      firs: this.fb.array([]),
      consent: this.fb.array([]),
    });
  
    this.addContact();
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
    if (this.personForm.get('addresses')?.valid) {
      // Save current address
      this.addedAddresses.push(this.personForm.get('addresses')?.value);
  
      // Reset only the address form (not the entire person form)
      this.personForm.get('addresses')?.reset();
    } else {
      alert("Please fill in all required fields before adding another address.");
    }
  }
  

  

  removeAddress(index: number) {
    // Remove the address from the addedAddresses array
    this.addedAddresses.splice(index, 1);
  }

  

  addContact() {
    this.contacts.push(
      this.fb.group({
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
  
        user: [null],
        hospital: [null],
        police_station: [null],
        person: [''],
        created_at: [null],
        updated_at: [null],
        created_by: [null],
        updated_by: [null],
      })
    );
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
        
        user: [null],
        person: [''],
        created_at: [null],
        updated_at: [null],
        created_by: [null],
        updated_by: [null],
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
        created_by: [null],
        updated_by: [null],
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
        created_by: [null],
        updated_by: [null],
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
        created_by: [null],
        updated_by: [null],
      })
    );
  }
  

  // Remove dynamically added fields
  
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
    this.personForm.get('location.latitude')?.setValue(this.latitude);
    this.personForm.get('location.longitude')?.setValue(this.longitude);

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

    // Center the map on the new marker
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


  
  onFileSelect(event: any, section: string, index: number, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.getFormArray(section).at(index).get(field)?.setValue(file);
    }
  }
  
  
  removeFile(section: string, index: number, field: string) {
    this.getFormArray(section).at(index).get(field)?.setValue(null);
  }

  private getFormArray(section: string): FormArray {
    return this.personForm.get(section) as FormArray;
  }
  
  
  
  
  

  

 
  
  
  onSubmit() {
    this.MPservice.postMissingPerson(this.personForm.value).subscribe({
      next: (response) => console.log('Person added successfully!', response),
      error: (error) => console.error('Error adding person:', error),
    });
  }
  
  


  

  


 
 calculateAge() {
  const dob = this.missingPersonForm.get('date_of_birth')?.value;
  if (dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // ✅ Ensure age updates in the form
    this.missingPersonForm.get('age')?.setValue(age);
  }
 }




  

}
