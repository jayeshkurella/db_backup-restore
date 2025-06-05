import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { environment } from 'src/envirnments/envirnment';
import { HospitalApiService } from './hospital-api.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import * as L from 'leaflet';

@Component({
  selector: 'app-hospitals',
  templateUrl: './hospitals.component.html',
  styleUrls: ['./hospitals.component.css']
})
export class HospitalsComponent implements OnInit ,AfterViewChecked{
  hospitalForm!: FormGroup;
  selectedPoliceStation: any = null;
  total_policestation: any;
  selectedPerson: any = null;
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  searchQuery: string = '';  
  searchName: string = '';
  searchCity: string = '';
  searchstate: string = '';
  searchdistrict: string = '';
  mapp!: L.Map;
  markerr!: L.Marker | null;
  latitude: number | null = null;
  longitude: number | null = null;

  environment =environment
  allhospitals:any = []
  constructor( private hospitalService: HospitalApiService,private fb: FormBuilder){}
  ngAfterViewChecked(): void {
    if (this.selectedPerson && this.selectedPerson.geometry && !this.map) {
      setTimeout(() => {
        // this.initMap(); 
      }, 10);
    }
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMapadd_policestation();  
    }, 0);
  }

  ngOnInit(): void {
    this.fetchHospitalData()
    this.initializeForm();
  
  }
  fetchHospitalData(): void {
    this.hospitalService.getallhospitals().subscribe(
      (data) => {
        if (data) {
          this.allhospitals = data.results; 
          console.log("data",this.allhospitals)
        } 
      },
    );
  }

  private initializeForm(): void {
    this.hospitalForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      hospital_photo: [''],
      
      // Address FormGroup
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
        landmark_details: [''], // 🔹 Ensure this matches formControlName
        location: this.fb.group({ // ✅ Ensuring 'location' exists
          latitude: [''],  // ✅ Added validation
          longitude: [''], // ✅ Added validation
        }),
        created_by: [null],
        updated_by: [null],
      }),
  
      // Hospital Contacts Array
      hospital_contact: this.fb.array([]), // 🔹 Ensure it's an array
    });
  
    this.addContact(); // 🔹 Ensure at least one contact field exists
  }
  
  


  // Get contacts array
  get contacts(): FormArray {
    return this.hospitalForm.get('hospital_contact') as FormArray;
  }
  


  
  // Method to create a contact FormGroup
  createContactForm(): FormGroup {
    return this.fb.group({
      phone_no: [''],  // ✅ Ensure this exists
      country_cd: ['+91'],
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
  

  // Add a new contact dynamically
  addContact() {
    this.contacts.push(this.createContactForm());
  }
  
  // Remove a contact dynamically
  removeContact(index: number) {
    this.contacts.removeAt(index);
  }


  // Open Modal & Reset Form
  openModal() {
    this.initializeForm();
  }



  submitForm(): void {
    if (this.hospitalForm.invalid) {
      alert('Please fill in all required fields correctly.');
      return;
    }
  
    const formData = new FormData();
  
    // Append `station_photo` correctly
    if (this.hospitalForm.get('hospital_photo')?.value) {
      formData.append('hospital_photo', this.hospitalForm.get('hospital_photo')?.value);
    }
  
    // Convert complex objects (`address`, `police_contact`) to JSON strings
    const formValues = this.hospitalForm.value;
    Object.keys(formValues).forEach(key => {
      if (key !== 'hospital_photo') {  // Avoid re-adding station_photo
        if (typeof formValues[key] === 'object') {
          formData.append(key, JSON.stringify(formValues[key]));  // Convert objects to JSON strings
        } else {
          formData.append(key, formValues[key]);
        }
      }
    });
  
    this.hospitalService.addHospital(formData).subscribe({
      next: (response) => {
        console.log('Success:', response);
        alert('Police station added successfully!');
        this.hospitalForm.reset();
        this.initializeForm();
        this.fetchHospitalData(); // Refresh data
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error adding police station.');
      }
    });
  }
  
  
  // File Change Event
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.hospitalForm.patchValue({ hospital_photo: file });
    }
  }

  initMapadd_policestation(): void {
    if (this.map) {
        this.map.invalidateSize();
        return; // Prevent re-initialization
    }

    this.map = L.map('mapHome').setView([22.9734, 78.6569], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Click event to place marker
    this.map.on('click', (event: L.LeafletMouseEvent) => {
        this.updateLocation(event.latlng.lat, event.latlng.lng);
    });
  }

  updateLocation(lat: number, lng: number): void {
    if (!this.map) {
        console.error('Map is undefined. Ensure it is initialized before calling updateLocation.');
        return;
    }

    this.latitude = parseFloat(lat.toFixed(6));
    this.longitude = parseFloat(lng.toFixed(6));

    this.hospitalForm.get('address.location')?.patchValue({
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
