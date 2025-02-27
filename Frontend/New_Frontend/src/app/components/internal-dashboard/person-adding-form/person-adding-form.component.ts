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
  addedAddresses: { street: string, city: string }[] = [];

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

  constructor(private MPservice :PersonAddApiService,private fb: FormBuilder){}

  

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
      Body_Condition: [''],  //new
      birth_mark: [''],
      distinctive_mark: [''],
      photo_upload: [''],
      hospital: [null],
      document_ids: [''],
      created_at: [null],
      updated_at: [null],
      created_by: [null],
      updated_by: [null],
      _is_deleted: [false],
    
      addresses: this.fb.array([]),
      contacts: this.fb.array([]),
      additional_info: this.fb.array([]),
      last_known_details: this.fb.array([]),
      firs: this.fb.array([]),
      consent: this.fb.array([]),
    });
    this.addAddress();
    this.addContact();
    this.addAdditionalInfo();
    this.addLastKnownDetails();
    this.addFIR();
    this.addConsent();
    
  }

  
  
   
  
  
  
  
  get addresses() {
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

  createAddressGroup(): FormGroup {
    return this.fb.group({
      type: [''],
      street: [''],
      apartment_number: [''],
      village: [''],
      city: [''],
      district: [''],
      state: [''],
      country: [''],
      pincode: [''],
      landmark: [''],
      latitude: [''],
      longitude: ['']
    });
  }

  addNewAddress() {
    // Add a new empty address form
    this.addresses.push(this.createAddressGroup());
  }

  saveAddress(index: number) {
    // Store entered address in a variable (if needed for API)
    const savedAddress = this.addresses.at(index).value;

    // Push saved address to footer and reset the form field
    this.addresses.at(index).reset();
  }

  // Methods to add fields dynamically
  // addAddress() {
  //   this.addresses.push(
  //     this.fb.group({
  //       type: [''],
  //       street: [''],
  //       appartment_no: [''],
  //       appartment_name: [''],
  //       village: [''],
  //       city: [''],
  //       district: [''],
  //       state: [''],
  //       pincode: [''],
  //       country: [''],
  //       landmark_details: [''],
  //       location: this.fb.group({
  //         latitude: [''],
  //         longitude: [''],
  //       }),
  //       user: [null],
  //       person: [''],
  //       created_at: [null],
  //       updated_at: [null],
  //       created_by: [null],
  //       updated_by: [null],
  //     })
  //   );
  // }
  
  addAddress() {
    // Get the current address values from the form
    const addressData = {
      type: this.personForm.get('type')?.value,
      street: this.personForm.get('street')?.value,
      appartment_no: this.personForm.get('appartment_no')?.value,
      appartment_name: this.personForm.get('appartment_name')?.value,
      village: this.personForm.get('village')?.value,
      city: this.personForm.get('city')?.value,
      district: this.personForm.get('district')?.value,
      state: this.personForm.get('state')?.value,
      pincode: this.personForm.get('pincode')?.value,
      country: this.personForm.get('country')?.value,
      landmark_details: this.personForm.get('landmark_details')?.value,
      location: {
        latitude: this.personForm.get('location.latitude')?.value,
        longitude: this.personForm.get('location.longitude')?.value,
      },
      user: null,
      person: '',
      created_at: null,
      updated_at: null,
      created_by: null,
      updated_by: null,
    };
  
    // Add the address to the displayed list
    this.addedAddresses.push(addressData);
  
    // Add the address to the FormArray for submission
    this.addresses.push(
      this.fb.group({
        type: [addressData.type],
        street: [addressData.street],
        appartment_no: [addressData.appartment_no],
        appartment_name: [addressData.appartment_name],
        village: [addressData.village],
        city: [addressData.city],
        district: [addressData.district],
        state: [addressData.state],
        pincode: [addressData.pincode],
        country: [addressData.country],
        landmark_details: [addressData.landmark_details],
        location: this.fb.group({
          latitude: [addressData.location.latitude],
          longitude: [addressData.location.longitude],
        }),
        user: [addressData.user],
        person: [addressData.person],
        created_at: [addressData.created_at],
        updated_at: [addressData.updated_at],
        created_by: [addressData.created_by],
        updated_by: [addressData.updated_by],
      })
    );
  
    // Clear the input fields
    this.personForm.get('type')?.reset();
    this.personForm.get('street')?.reset();
    this.personForm.get('appartment_no')?.reset();
    this.personForm.get('appartment_name')?.reset();
    this.personForm.get('village')?.reset();
    this.personForm.get('city')?.reset();
    this.personForm.get('district')?.reset();
    this.personForm.get('state')?.reset();
    this.personForm.get('pincode')?.reset();
    this.personForm.get('country')?.reset();
    this.personForm.get('landmark_details')?.reset();
    this.personForm.get('location.latitude')?.reset();
    this.personForm.get('location.longitude')?.reset();
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
        person_photo: [''], // URL or Base64 encoded image
        reference_photo: [''], // URL or Base64 encoded image
        missing_time: [''], // Date-Time Picker
        missing_date: [''], // Date Picker
  
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
        is_consent: [false],
        created_at: [null],
        updated_at: [null],
        created_by: [null],
        updated_by: [null],
      })
    );
  }
  

  // Remove dynamically added fields
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
    this.map = L.map('mapHome').setView([22.9734, 78.6569], 5); // Center on India with an appropriate zoom level

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Click to add marker
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.updateLocation(event.latlng.lat, event.latlng.lng);
    });
 }


 updateLocation(lat: number, lng: number, index?: number): void {
  this.latitude = parseFloat(lat.toFixed(6));
  this.longitude = parseFloat(lng.toFixed(6));

  if (index !== undefined) {
    // Ensure the selected address is updated
    this.addresses.at(index).get('location.latitude')?.setValue(this.latitude);
    this.addresses.at(index).get('location.longitude')?.setValue(this.longitude);
  }

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
    this.updateLocation(newLatLng.lat, newLatLng.lng, index);
  });

  // Center the map on the new marker
  this.map.setView([this.latitude, this.longitude], 10);
 }

  

 getCurrentLocation(index: number): void {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      this.updateLocation(position.coords.latitude, position.coords.longitude, index);
    },
    (error) => {
      console.error('Error fetching location:', error);
      alert('Unable to fetch location. Ensure location services are enabled.');
    }
  );
}




  
  
  
  
  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.selectedImage = e.target?.result;
      reader.readAsDataURL(file);
    }
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
