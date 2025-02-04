import { Component, OnInit ,AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';

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
  mapHome: any; // Map for home location
  mapMissing: any; // Map for missing person location
  markerHome: any; // Marker for home location
  markerMissing: any; // Marker for missing person location
  showLoader = false;
  loading = false;
  progress = 0;
  map: any;
  marker: any;
  geocoder: any;
  markerLayer: any; 
  fileToUpload:any
  age: number | any;

  missingPersonForm!: FormGroup;
  latcoordinate: any
  lngcoordinate: any

  constructor(private MPservice :PersonAddAPIService,private fb: FormBuilder){}

  ngAfterViewInit(): void {
    setTimeout(() => {
      // this.initMap();
    }, 100); 
  } 

  ngOnInit() {
    // setTimeout(() => 
    //   this.initMap('home');;
    //   this.initMap('missing'); 
    this.initMap('home'); // Initialize home location map
    this.initMap('missing');  
    this.missingPersonForm = this.fb.group({
      
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      gender: ['', Validators.required],
      blood_group: [''],
      date_of_birth: ['', Validators.required], 
      age: [{ value: ''}],
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
      photo_upload: [null],

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
      missing_location: this.fb.group({
        latitude: ['', Validators.required],
        longitude: ['', Validators.required]
      }),
      case_status: [''],
      condition: [''],

      fir_number: [''],
      police_station_name_and_address: [''],
      investigating_officer_name: [''],
      investigating_officer_contact_number: [''],
      fir_photo: [null],

      reportingperson_name: [''],
      relationship_with_victim: [''],
      contact_numbers: [''],
      email_address: [''],
      willing_to_volunteer: [false],
      consent: [false, Validators.requiredTrue],
      address: this.fb.group({
        street: ['', Validators.required],
        apartment_number: ['', Validators.required],
        village: ['', Validators.required],
        city: ['', Validators.required],
        district: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        postal_code: ['', Validators.required],
        type: ['Missing Person'],
        subtype: ['', Validators.required],
        landmark_details: ['', Validators.required],
        location: this.fb.group({
          latitude: ['', Validators.required],
          longitude: ['', Validators.required]
        }),
        country_code: ['', Validators.required],
        is_active: ['', Validators.required],
      }),
      contact: this.fb.group({
        phone_number: ['', Validators.required],
        email: ['', Validators.required],
        type: ['Missing Person'],
        subtype: ['', Validators.required],
        company_name: [''],
        job_title: [''],
        website: [''],
        social_media_handles: [''],
        is_primary: [''],
        notes: [''],
      })
      
    });
    this.missingPersonForm.get('date_of_birth')?.valueChanges.subscribe(() => {
      this.calculateAge();
    });
    
  }



    initMap(mapType: string): void {
      const mapId = mapType === 'home' ? 'mapHome' : 'mapMissing';
      const defaultLocation: L.LatLngTuple = [19.7515, 75.7139]; // Default location: India

      // Initialize the map
      const map = L.map(mapId).setView(defaultLocation, 6);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Initialize geocoding control
      this.geocoder = (L as any).Control.Geocoder.nominatim();

      // Listen for map clicks to add points
      map.on('click', (event: L.LeafletMouseEvent) => {
        const { lat, lng } = event.latlng;
        const formattedLat = parseFloat(lat.toFixed(6)); // Limit latitude to 6 decimal places
        const formattedLng = parseFloat(lng.toFixed(6)); // Limit longitude to 6 decimal places

        // Validate that lat/lng are valid numbers
        if (isNaN(formattedLat) || isNaN(formattedLng)) {
          console.error("Invalid coordinates clicked:", formattedLat, formattedLng);
          return;
        }

        // Plot the clicked point on the map
        this.addPointOnMap(mapType, formattedLat, formattedLng);

        // Update the form input for latitude and longitude
        this.updateFormCoordinates(mapType, formattedLat, formattedLng);
      });

      // Store the map instance based on the type
      if (mapType === 'home') {
        this.mapHome = map;
      } else {
        this.mapMissing = map;
      }
  }

  addPointOnMap(mapType: string, latitude: number, longitude: number): void {
      const customIcon = L.icon({
        iconUrl: 'assets/leaflet/images/marker-icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Remove any previous marker to avoid multiple points
      if (mapType === 'home' && this.markerHome) {
        this.mapHome.removeLayer(this.markerHome);
      } else if (mapType === 'missing' && this.markerMissing) {
        this.mapMissing.removeLayer(this.markerMissing);
      }

      // Add new marker to the map
      const marker = L.marker([latitude, longitude], { icon: customIcon })
        .addTo(mapType === 'home' ? this.mapHome : this.mapMissing)
        .bindPopup(`Point added at: <br>Lat: ${latitude}, Lng: ${longitude}`)
        .openPopup();

      // Store the marker instance based on the type
      if (mapType === 'home') {
        this.markerHome = marker;
      } else {
        this.markerMissing = marker;
      }

      // Delay zoom animation by 2 seconds
      setTimeout(() => {
        (mapType === 'home' ? this.mapHome : this.mapMissing).setView([latitude, longitude], 13, {
          animate: true,
        });
      }, 2000);
  }

// Update the form controls with the coordinates
  updateFormCoordinates(mapType: string, latitude: number, longitude: number): void {
      if (mapType === "home") {
          const control = this.missingPersonForm.get("address.location");
          if (control) {
              control.patchValue({ latitude, longitude }); // Update home location form control
          } else {
              console.error(`Form control 'address.location' not found`);
          }
      } else if (mapType === "missing") {
          const control = this.missingPersonForm.get("missing_location");
          if (control) {
              control.patchValue({ latitude, longitude }); // Update missing location form control
          } else {
              console.error(`Form control 'missing_location' not found`);
          }
      }
  }

// Get current location based on the type (home or missing)
  getCurrentLocation(mapType: string): void {
      if (!navigator.geolocation) {
          alert("Geolocation is not supported by this browser.");
          return;
      }

      navigator.geolocation.getCurrentPosition(
          (position) => {
              let { latitude, longitude } = position.coords;

              if (latitude === undefined || longitude === undefined) {
                  console.error("Latitude or Longitude is undefined!");
                  return;
              }

              // Ensure the coordinates have exactly 6 decimal places
              latitude = parseFloat(latitude.toFixed(6));
              longitude = parseFloat(longitude.toFixed(6));

              console.log(`Fetched Coordinates: ${latitude}, ${longitude}`);

              // Plot the current location on the map
              this.addPointOnMap(mapType, latitude, longitude);

              // Determine which map instance to update
              const map = mapType === "home" ? this.mapHome : this.mapMissing;
              if (map) {
                  map.setView([latitude, longitude], 13); // Adjust zoom level as needed
              }

              // Update the form input with coordinates correctly
              this.updateFormCoordinates(mapType, latitude, longitude);
          },
          (error) => {
              console.error("Error fetching location:", error);
              alert("Unable to fetch location. Ensure location services are enabled.");
          }
      );
  }


  // Reverse geocode based on the type (home or missing)
  // reverseGeocode(mapType: string, latitude: number, longitude: number): void {
  //   if (isNaN(latitude) || isNaN(longitude)) {
  //     console.error("Invalid coordinates:", latitude, longitude);
  //     alert("Unable to reverse geocode due to invalid coordinates.");
  //     return;
  //   }
  
  //   console.log('Performing Reverse Geocoding for:', latitude, longitude);
  
  //   const geocoder = (L as any).Control.Geocoder.nominatim();
  
  //   geocoder.reverse({ lat: latitude, lng: longitude }, 18, (results: any[], error: any) => {
  //     if (error) {
  //       console.error("Error during reverse geocoding:", error);
  //       alert("Failed to retrieve address. Please try again later.");
  //       return;
  //     }
  
  //     const result = results[0]; // Assume the first result is the best match
  //     if (result) {
  //       const address = result.address || {};
  
  //       // Log the address to verify it's correct
  //       console.log("Address found:", address);
  
  //       // Update form fields based on the map type
  //       if (mapType === 'home') {
  //         this.missingPersonForm.get('address.street')?.setValue(address.road || '');
  //         this.missingPersonForm.get('address.village')?.setValue(address.village || address.town || '');
  //         this.missingPersonForm.get('address.district')?.setValue(address.county || '');
  //         this.missingPersonForm.get('address.state')?.setValue(address.state || '');
  //         this.missingPersonForm.get('address.country')?.setValue(address.country || '');
  //         this.missingPersonForm.get('address.postal_code')?.setValue(address.postcode || '');
  //       } else if (mapType === 'missing') {
  //         // Handle missing person location address fields if needed
  //         // Example: Update missing location address fields
  //         this.missingPersonForm.get('missing_street')?.setValue(address.road || '');
  //         this.missingPersonForm.get('missing_village')?.setValue(address.village || address.town || '');
  //         this.missingPersonForm.get('missing_district')?.setValue(address.county || '');
  //         this.missingPersonForm.get('missing_state')?.setValue(address.state || '');
  //         this.missingPersonForm.get('missing_country')?.setValue(address.country || '');
  //         this.missingPersonForm.get('missing_postal_code')?.setValue(address.postcode || '');
  //       }
  
  //       // Optional: Log the updated form for debugging
  //       console.log("Updated form values:", this.missingPersonForm.value);
  
  //       // Handle case where the result is too general (e.g., only country available)
  //       if (!address.road && !address.city && !address.state && !address.postcode) {
  //         console.warn("No detailed address found, only country information available.");
  //         alert("No detailed address found, only country information available.");
  //       }
  //     } else {
  //       console.error("No address found for the given coordinates");
  //       alert("No address found for the provided coordinates.");
  //     }
  //   });
  // }
  
  
  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      this.missingPersonForm.get(controlName)?.setValue(file);
    }
  }
  
  
  

  // submitMPForm(): void {
  //   console.log("✅ Form Validity:", this.missingPersonForm.valid);
  //   console.log("❌ Form Errors:", this.missingPersonForm.errors);
  //   console.log("📌 Data before FormData conversion:", this.missingPersonForm.value);

  //   if (this.missingPersonForm.valid) {
  //       const formData = this.prepareFormData();

  //       console.log('📦 FormData before sending:');
  //       for (const pair of (formData as any).entries()) {
  //           console.log(`${pair[0]}:`, pair[1]);
  //       }

  //       this.MPservice.postMissingPerson(formData).subscribe({
  //           next: (response) => {
  //               console.log('✅ Form submitted successfully:', response);
  //               alert('Form submitted successfully!');
  //               this.missingPersonForm.reset();
  //           },
  //           error: (error) => {
  //               console.error('❌ Error submitting form:', error);
  //               alert('There was an error submitting the form. Please try again.');
  //           }
  //       });
  //   } else {
  //       console.warn('⚠️ Form is invalid, please correct the errors.');
  //       alert('Please fill all required fields correctly.');
  //   }
  // }

  submitMPForm() {
    const formValues = this.missingPersonForm.value;
  
    // Construct the payload to match the format
    const payload = {
      full_name: formValues.full_name,
      gender: formValues.gender,
      blood_group: formValues.blood_group,
      date_of_birth: formValues.date_of_birth,
      age: formValues.age,
      time_of_birth: formValues.time_of_birth,
      place_of_birth: formValues.place_of_birth,
      height: formValues.height,
      weight: formValues.weight,
      complexion: formValues.complexion,
      hair_color: formValues.hair_color,
      hair_type: formValues.hair_type,
      eye_color: formValues.eye_color,
      birth_mark: formValues.birth_mark,
      distinctive_mark: formValues.distinctive_mark,
      caste: formValues.caste,
      sub_caste: formValues.sub_caste,
      marital_status: formValues.marital_status,
      religion: formValues.religion,
      mother_tongue: formValues.mother_tongue,
      known_languages: formValues.known_languages,
      educational_details: formValues.educational_details,
      occupation: formValues.occupation,
      identification_details: formValues.identification_details,
      identification_card_no: formValues.identification_card_no,
      missing_time: formValues.missing_time,
      fir_photo: formValues.fir_photo,
      photo_upload: formValues.photo_upload,
      missing_date: formValues.missing_date,
      location_details: formValues.location_details,
      last_seen_location: formValues.last_seen_location,
      missing_location: {
        latitude: formValues.missing_location.latitude,
        longitude: formValues.missing_location.longitude
      },
      case_status: formValues.case_status,
      condition: formValues.condition,
      fir_number: formValues.fir_number,
      police_station_name_and_address: formValues.police_station_name_and_address,
      investigating_officer_name: formValues.investigating_officer_name,
      investigating_officer_contact_number: formValues.investigating_officer_contact_number,
      reportingperson_name: formValues.reportingperson_name,
      relationship_with_victim: formValues.relationship_with_victim,
      contact_numbers: formValues.contact_numbers,
      email_address: formValues.email_address,
      consent: formValues.consent,
      contact: {
        phone_number: formValues.contact.phone_number,
        type: formValues.contact.type,
        subtype: formValues.contact.subtype,
        email: formValues.contact.email,
        company_name: formValues.contact.company_name,
        job_title: formValues.contact.job_title,
        website: formValues.contact.website,
        is_primary: formValues.contact.is_primary,
        notes: formValues.contact.notes,
        social_media_handles: formValues.contact.social_media_handles
      },
      address: {
        street: formValues.address.street,
        apartment_number: formValues.address.apartment_number,
        village: formValues.address.village,
        city: formValues.address.city,
        district: formValues.address.district,
        state: formValues.address.state,
        postal_code: formValues.address.postal_code,
        type: formValues.address.type,
        subtype: formValues.address.subtype,
        country_code: formValues.address.country_code,
        landmark_details: formValues.address.landmark_details,
        country: formValues.address.country,
        is_active: formValues.address.is_active,
        location: {
          longitude: formValues.address.location.longitude,
          latitude: formValues.address.location.latitude
        }
      },
      willing_to_volunteer: formValues.willing_to_volunteer,
      
    };
  
    // Call the service to post the data
    this.MPservice.postMissingPerson(payload).subscribe({
      next: (response) => {
        console.log('Form submitted successfully:', response);
      },
      error: (error) => {
        console.error('Error submitting form:', error);
      }
    });
  }
  
  
  
  
 //  calculate age as per dob
 
 
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
