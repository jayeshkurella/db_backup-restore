import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { UnidentifiedbodyformapiService } from './unidentifiedbodyformapi.service';

@Component({
  selector: 'app-unidentifiedbody-form',
  templateUrl: './unidentifiedbody-form.component.html',
  styleUrls: ['./unidentifiedbody-form.component.css']
})
export class UnidentifiedbodyFormComponent implements OnInit {

  
    mapMissing: any; 
    markerMissing: any;
    showLoader = false;
    loading = false;
    progress = 0;
    map: any;
    marker: any;
    geocoder: any;
    markerLayer: any; 
    fileToUpload:any
    age: number | any;
    UnidentifiedbodyForm!: FormGroup;
    constructor(private fb : FormBuilder , private Ubservice :UnidentifiedbodyformapiService){}
  
    ngOnInit(): void {
      this.initMap();
      this.UnidentifiedbodyForm = this.fb.group({
        full_name: [''],
        estimated_age: [''],
        estimated_time_of_death: [''],
        date_found: [''],
        gender: [''],
        height: [''],
        weight: [''],
        birth_mark: [''],
        blood_group: [''],
        complexion: [''],
        hair_color: [''],
        hair_type: [''],
        eye_color: [''],
        other_distinctive_mark: [''],
        clothing_description: [''],
        body_seen_details: [''],
  
        case_status: [''],   //
  
        body_photo_upload: [null],
        caste: [''],
        marital_status: [''],
        religion: [''],
        other_known_languages: [''],
        identification_details: [''],
        last_location: [''],
        last_seen_details: [''],
  
        condition: [''], //
  
        // Contact Information
        contact: this.fb.group({
          phone_number: ['', Validators.required],
          email: ['', Validators.required],
          type: ['Unidentified Person'],
          subtype: ['', Validators.required],
          company_name: [''],
          job_title: [''],
          website: [''],
          social_media_handles: [''],
          is_primary: [''],
          notes: [''],
        }),
  
        address: this.fb.group({
          street: ['', Validators.required],
          apartment_number: ['', Validators.required],
          village: ['', Validators.required],
          city: ['', Validators.required],
          district: ['', Validators.required],
          state: ['', Validators.required],
          country: ['', Validators.required],
          postal_code: ['', Validators.required],
          type: ['Unidentified Person'],
          subtype: ['', Validators.required],
          landmark_details: ['', Validators.required],
          location: this.fb.group({
            latitude: ['', Validators.required],
            longitude: ['', Validators.required]
          }),
          country_code: ['', Validators.required],
          is_active: ['', Validators.required],
        }),
  
        reporting_person_name: [''],
        reporting_person_contact_number: [''],
        reporting_person_email: [''],
        relationship_with_victim: [''],
  
        
        upload_evidence: [''],
        last_seen_date: [''],
        reported_date: [''],
        Volunteers: [''],
        fir_number: [''],
        fir_photo: [''],
        police_station_name_and_address: [''],
        investigating_officer_name: [''],
        investigating_officer_contact_number: [''],
        hospital: [''],
        fingerprints_collected: [''],
        dna_sample_collected: [''],
        post_mortem_report_upload: [''],
        consent: [''],
      });
     
    }
  
    private initMap(): void {
      const defaultLocation: L.LatLngTuple = [19.7515, 75.7139]; // Default location: India
  
      // Initialize the map
      this.mapMissing = L.map('mapMissing').setView(defaultLocation, 6);
  
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.mapMissing);
  
      // Initialize geocoding control
      this.geocoder = (L as any).Control.Geocoder.nominatim();
  
      // Listen for map clicks to add points
      this.mapMissing.on('click', (event: L.LeafletMouseEvent) => {
        const { lat, lng } = event.latlng;
        const formattedLat = parseFloat(lat.toFixed(6)); // Limit latitude to 6 decimal places
        const formattedLng = parseFloat(lng.toFixed(6)); // Limit longitude to 6 decimal places
  
        // Validate lat/lng
        if (isNaN(formattedLat) || isNaN(formattedLng)) {
          console.error("Invalid coordinates clicked:", formattedLat, formattedLng);
          return;
        }
  
        // Plot the clicked point on the map
        this.addPointOnMap(formattedLat, formattedLng);
  
        // Update the form input for latitude and longitude
        this.updateFormCoordinates(formattedLat, formattedLng);
      });
    }
  
    // Add marker on the map
    private addPointOnMap(latitude: number, longitude: number): void {
      const customIcon = L.icon({
        iconUrl: 'assets/leaflet/images/marker-icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
  
      // Remove any previous marker
      if (this.markerMissing) {
        this.mapMissing.removeLayer(this.markerMissing);
      }
  
      // Add new marker to the map
      this.markerMissing = L.marker([latitude, longitude], { icon: customIcon })
        .addTo(this.mapMissing)
        .bindPopup(`Missing Person Location:<br>Lat: ${latitude}, Lng: ${longitude}`)
        .openPopup();
  
      // Delay zoom animation by 2 seconds
      setTimeout(() => {
        this.mapMissing.setView([latitude, longitude], 13, { animate: true });
      }, 2000);
    }
  
    // Update the form controls with the coordinates
    private updateFormCoordinates(latitude: number, longitude: number): void {
      const control = this.UnidentifiedbodyForm.get("address.location");
      if (control) {
        control.patchValue({ latitude, longitude });
      } else {
        console.error(`Form control 'address' not found`);
      }
    }
  
    // Get current location and set it on the map
    getCurrentLocation(): void {
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
  
          // Ensure coordinates have exactly 6 decimal places
          latitude = parseFloat(latitude.toFixed(6));
          longitude = parseFloat(longitude.toFixed(6));
  
          console.log(`Fetched Coordinates: ${latitude}, ${longitude}`);
  
          // Plot the current location on the map
          this.addPointOnMap(latitude, longitude);
  
          // Update the form input with coordinates
          this.updateFormCoordinates(latitude, longitude);
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Unable to fetch location. Ensure location services are enabled.");
        }
      );
    }

    onFileChange(event: any, type: string): void {
      const file = event.target.files[0];
    
      if (file) {
        if (type === 'photo') {
          this.UnidentifiedbodyForm.patchValue({ photo_upload: file });
        } else if (type === 'file') {
          this.UnidentifiedbodyForm.patchValue({ fir_photo: file });
        }
      }
    }
      
    
    
    submitupForm() {
        const formValues = this.UnidentifiedbodyForm.value;
      
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
        this.Ubservice.postMissingPerson(payload).subscribe({
          next: (response) => {
            console.log('Form submitted successfully:', response);
          },
          error: (error) => {
            console.error('Error submitting form:', error);
          }
        });
    }
  
  
    

}
