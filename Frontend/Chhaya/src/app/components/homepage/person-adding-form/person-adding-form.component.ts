import { Component, OnInit ,AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';

declare var bootstrap: any;


import { Tab } from 'bootstrap';
import { PersonAddAPIService } from './person-add-api.service';
import { MissingPerson } from './exportData';
@Component({
  selector: 'app-person-adding-form',
  templateUrl: './person-adding-form.component.html',
  styleUrls: ['./person-adding-form.component.css']
})
export class PersonAddingFormComponent implements OnInit , AfterViewInit  {
  map: any;
  marker: any;
  markerLayer: any; 
 fileToUpload:any

  missingPersonForm!: FormGroup;

  constructor(private MPservice :PersonAddAPIService,private fb: FormBuilder){}

  ngAfterViewInit(): void {
    setTimeout(() => {
      // this.initMap();
    }, 100); 
  } 

  ngOnInit() {
    setTimeout(() => this.initMap(), 500); 
    this.missingPersonForm = this.fb.group({
      
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      gender: ['', Validators.required],
      blood_group: [''],
      date_of_birth: [''],
      age: [{ value: '', disabled: true }],
      time_of_birth: [''],
      place_of_birth: [''],
      height: [''],
      weight: [''],
      complexion: [''],
      hair_color: [''],
      hair_type: [''],
      eye_color: [''],
      birth_mark: [''],
      distinctive_mark: [''],
      photo_upload: [null, Validators.required],

      caste: [''],
      sub_caste: [''],
      marital_status: [''],
      religion: [''],
      mother_tongue: [''],
      known_languages: [''],
      educational_details: [''],
      occupation: [''],
      identification_details: [''],
      identification_card_no: [''],

      missing_time: [''],
      missing_date: [''],
      location_details: [''],
      last_seen_location: [''],
      missing_location: [''],
      case_status: [''],
      condition: [''],

      fir_number: [''],
      police_station_name_and_address: [''],
      investigating_officer_name: [''],
      investigating_officer_contact_number: [''],
      fir_photo: [null, Validators.required],

      reportingperson_name: [''],
      relationship_with_victim: [''],
      contact_numbers: [''],
      email_address: [''],
      willing_to_volunteer: [false],
      consent: [false, Validators.requiredTrue],

      address: this.fb.group({
        street: [''],
        apartment_number: [''],
        village: [''],
        city: [''],
        district: [''],
        state: [''],
        country: [''],
        postal_code: [''],
        type: [''],
        subtype: [''],
        landmark_details: [''],
        location: [''],
        address_type: [''],
        country_code: [''],
        is_active: [''],
      }),
      contact: this.fb.group({
        phone_number: [''],
        email: [''],
        type: [''],
        subtype: [''],
        subtype_detail: [''],
        location: [''],
        company_name: [''],
        job_title: [''],
        website: [''],
        social_media_handles: [''],
        is_primary: [''],
        notes: [''],
      })
    });
    
  }




 // to init map
  initMap(): void {
    this.map = L.map('map').setView([19.7515, 75.7139], 6);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  
    // Listen for map clicks to add points
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      const formattedLat = parseFloat(lat.toFixed(6));   // Limit latitude to 6 decimal places
      const formattedLng = parseFloat(lng.toFixed(6));   // Limit longitude to 6 decimal places
  
  
      // Plot the clicked point on the map
      this.addPointOnMap(formattedLat, formattedLng);
  
      // Update the form input with coordinates
      this.missingPersonForm.get('missing_location')?.setValue(`${formattedLat}, ${formattedLng}`);
    });
  }
  
  addPointOnMap(latitude: number, longitude: number): void {
    const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/marker-icon.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  
    // Remove any previous marker to avoid multiple points if needed
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
  
    // Add new marker to the map
    this.marker = L.marker([latitude, longitude], { icon: customIcon })
      .addTo(this.map)
      .bindPopup(`Point added at: <br>Lat: ${latitude}, Lng: ${longitude}`)
      .openPopup();
  
    // Delay zoom animation by 3 seconds
    setTimeout(() => {
      this.map.setView([latitude, longitude], 13, { animate: true });
    }, 2000);
  }
  
  getCurrentLocation(): void {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let { latitude, longitude } = position.coords;
  
        // Ensure the coordinates have exactly 6 decimal places
        latitude = parseFloat(latitude.toFixed(6));
        longitude = parseFloat(longitude.toFixed(6));
  
        console.log('Fetched Latitude:', latitude, 'Longitude:', longitude);
  
        if (isNaN(latitude) || isNaN(longitude)) {
          console.error('Invalid coordinates fetched.');
          alert('Could not retrieve valid coordinates.');
          return;
        }
  
        // Plot current location and smooth zoom to the point
        this.addPointOnMap(latitude, longitude);
  
        // Update the form input with coordinates
        this.missingPersonForm.get('missing_location')?.setValue(`${latitude}, ${longitude}`);
      },
      (error) => {
        console.error('Error fetching location:', error);
        alert('Unable to fetch location. Ensure location services are enabled.');
      }
    );
  }
  
  
  
  



  
  
  onFileChange(event: any): void {
    const file = event.target.files[0];  // Get the selected file
    if (file) {
      this.fileToUpload = file;  // Store the file in a variable
    }
  }

  // submit missing person form
  submitMPForm(): void {
    if (this.missingPersonForm.valid) {
      const formData = this.missingPersonForm.value;
  
      console.log('Submitting form data:', formData);
      this.MPservice.postMissingPerson(formData).subscribe({
        next: (response) => {
          console.log('Form submitted successfully:', response);
          alert('Form submitted successfully!');
          this.missingPersonForm.reset(); 
         },
        error: (error) => {
          console.error('Error submitting form:', error);
          alert('There was an error submitting the form. Please try again.');
        }
      });
    } else {
      console.warn('Form is invalid, please correct the errors.');
      alert('Please fill all required fields correctly.');
    }
  }


 //  calculate age as per dob
  calculateAge(): void {
    const dobControl = this.missingPersonForm.get('date_of_birth');

    if (dobControl?.value) {
      const dobDate = new Date(dobControl.value);
      const today = new Date();

      if (dobDate > today) {
        this.missingPersonForm.patchValue({ age: null });
        alert('Date of birth cannot be in the future.');
        return;
      }

      const age = Math.floor((today.getTime() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      this.missingPersonForm.patchValue({ age });
    }
  }


  // to move next page in form
  goToNextTab(tabId: string): void {
    const nextTab = document.getElementById(tabId + '-tab');
    if (nextTab) {
      new bootstrap.Tab(nextTab).show();
    }
  }

  // to to back page in form
  goToPreviousTab(tabId: string): void {
    const prevTab = document.getElementById(tabId + '-tab');
    if (prevTab) {
      new Tab(prevTab).show();
    }
  }

}
