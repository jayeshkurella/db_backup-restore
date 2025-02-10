import { AfterViewChecked, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MissingpersonapiService } from './missingpersonapi.service';
declare var bootstrap: any;
import * as L from 'leaflet';
import { environment } from 'src/envirnments/envirnment';
import { PoliceStationaoiService } from 'src/app/services/police-stationaoi.service';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmMatchData } from './model';

@Component({
  selector: 'app-missingperson',
  templateUrl: './missingperson.component.html',
  styleUrls: ['./missingperson.component.css']
})
export class MissingpersonComponent implements OnInit, AfterViewChecked {
 
  environment = environment;
  missingPersons: any[] = [];
  filteredPersons: any[] = []; 
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  selectedPerson: any = null;
  selectedMatch: any = null;
  searchResults: any = {
    newly_matched: [], 
    previously_matched: [],
    previously_rejected: [],
    confirmed_matched: []
  };

  filters = {
    full_name :'',
    city: '',
    state: '',
    year: '',
    month: '',
    caste: '', 
    age: '',
    marital_status: '',
    blood_group: '',
    height: '',
    district:''

  };

  years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i); 
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  pagination: any = {
    current_page: 1,
    total_pages: 1,
    has_previous: false,
    has_next: false,
  };
  allstates: any;
  allcities: any;
  alldistricts: any;
  allmarital: any;
  loading: boolean = false; 
  selectedMatched: any;
  message: string = '';  
  errorMessage: string = '';
  uniqueId: string = ''; 
  matchId: number = 0;  
  rejectionReason: string = '';  
  selectedMatchForConfirmation: any;  
  showConfirmModal: boolean = false;
  confirmMatchData: ConfirmMatchData = {
    match_id: '', 
    missing_person_name: '', 
    confirmed_by_name: '', 
    confirmed_by_contact: '', 
    confirmed_by_relationship: '', 
    notes: '', 
    is_confirmed: false
  };
  confirmMatchForm: FormGroup;
  existing_reports: any[] = [];  // To store existing reports
  report_data: any[] = []; 
  selectedReport: any;  // Variable to hold the selected report for details
  isModalOpen: boolean = false; 
  isInitialLoad = true;
  filtersApplied: boolean = false;  // Initially false
  progress: number = 0;
  progressColor: string = 'bg-primary'; // Corrected type of progressColor
  progressMessage: string = '';
  

  constructor(private missingpersonapi: MissingpersonapiService, private fb: FormBuilder,private cdr: ChangeDetectorRef, private policestationapi :PoliceStationaoiService) {
    this.confirmMatchForm = this.fb.group({
      missing_person_name: ['', Validators.required],
      confirmed_by_name: ['', Validators.required],
      confirmed_by_contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // Adjust for your contact validation
      confirmed_by_relationship: ['', Validators.required],
      notes: ['']
    });
   }

  ngOnInit(): void {
    // this.loadMissingPersons(this.pagination.current_page);
    this.filteredPersons = [];
    this.getallstates()
    this.getalldistricts()
    this.getallcities()
    
    this.getallmarital()
   
  }

  ngAfterViewChecked(): void {
    if (this.selectedPerson && this.selectedPerson.geometry && !this.map) {
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }


  loadMissingPersons(page: number): void {
    if (!this.filtersApplied) {
      this.filteredPersons = [];  // Clear table initially
      return; // Don't fetch data until filters are applied
    }
  
    this.loading = true;
    this.progress = 1; // Start at 1%
    this.progressColor = 'bg-primary'; // Default progress bar color
  
    // Simulate progress incrementing
    let interval = setInterval(() => {
      if (this.progress < 90) {
        this.progress += 10;
      }
    }, 200);
  
    setTimeout(() => {
      this.missingpersonapi.getMissingPersonsWithFilters(page, this.filters).subscribe(
        (data) => {
          clearInterval(interval);
          this.progress = 100; // Complete progress
  
          if (data && data.data.length > 0) {
            this.filteredPersons = data.data;
            this.pagination = data.pagination;
            this.progressColor = 'bg-success'; // Green if data found
            this.progressMessage = "✅ Data loaded successfully!";
          } else {
            this.filteredPersons = [];
            this.progressColor = 'bg-danger'; // Red if no data found
            this.progressMessage = "❌ No data found! Try with another filter.";
          }
  
          setTimeout(() => {
            this.loading = false; // Hide loader after 1s
          }, 1000);
        },
        (error) => {
          clearInterval(interval);
          console.error('Error fetching data:', error);
          this.progressColor = 'bg-danger';
          this.progressMessage = "❌ Error fetching data!";
          setTimeout(() => { this.loading = false; }, 1000);
        }
      );
    }, 2000);
  }
  
  
  
  applyFilters(): void {
    this.filtersApplied = true; // Mark that filters are applied
    this.loadMissingPersons(1); // Load data with filters
  }
  

  viewDetails(person: any): void {
    if (person && person.full_name) {
      this.selectedPerson = person;
      const modal = new bootstrap.Modal(document.getElementById('personModal') as HTMLElement);
      modal.show();
      this.removePreviousMarker();

      setTimeout(() => {
        this.initMap();
      }, 300);
    } else {
      console.error('Selected person is not valid');
    }
  }

  removePreviousMarker(): void {
    if (this.marker) {
      this.map?.removeLayer(this.marker);
      this.marker = undefined;
    }
  }

  initMap(): void {
    if (!this.selectedPerson) {
      console.error('No selected person available');
      return;
    }

    const location = this.selectedPerson.location_geometry?.coordinates;
    const missingLocation = this.selectedPerson.missing_location_geometry?.coordinates;
    const homeLocation = this.selectedPerson.home_address_location_geometry?.coordinates;

    if (!location && !missingLocation && !homeLocation) {
      console.error('No valid coordinates found for the selected person');
      return;
    }

    if (!this.map) {
      this.map = L.map('map', {
        center: [0, 0],
        zoom: 13,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
    }

    const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      shadowSize: [41, 41],
    });

    if (location) {
      const coordinates = location;
      const popupContent = `
        <div>
          <p><strong>Location:</strong> Person missed from home</p>
          <p><strong>Coordinates:</strong> ${coordinates.join(', ')}</p>
        </div>
      `;

      L.marker([coordinates[1], coordinates[0]], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(popupContent)
        .openPopup();

      this.map.setView([coordinates[1], coordinates[0]], 13);
    }

    if (missingLocation && homeLocation) {
      const missingPopupContent = `
        <div>
          <p><strong>Missing Location:</strong> ${this.selectedPerson.location_details}</p>
          <p><strong>Coordinates:</strong> ${missingLocation.join(', ')}</p>
        </div>
      `;
      const homePopupContent = `
        <div>
          <p><strong>Home Location:</strong> ${this.selectedPerson.address.city}</p>
          <p><strong>Coordinates:</strong> ${homeLocation.join(', ')}</p>
        </div>
      `;

      L.marker([missingLocation[1], missingLocation[0]], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(missingPopupContent)
        .openPopup();

      L.marker([homeLocation[1], homeLocation[0]], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(homePopupContent)
        .openPopup();

      const bounds = L.latLngBounds(
        [missingLocation[1], missingLocation[0]],
        [homeLocation[1], homeLocation[0]]
      );
      this.map.fitBounds(bounds);
    }

    this.map.invalidateSize();
  }


  
  getallstates(){
    this.policestationapi.getallstates().subscribe(data => {
      this.allstates = data
    });
  }

  getallcities(){
    this.policestationapi.getallcities().subscribe(data => {
      this.allcities = data
    });
  }

  getalldistricts(){
    this.policestationapi.getalldistricts().subscribe(data => {
      this.alldistricts = data
    });
  }

  getallmarital(){
    this.policestationapi.getallmarital().subscribe(data => {
      this.allmarital = data
    });
  }


  matchWithUP(person: any) {
    this.missingpersonapi.matchWithUP(person.id).subscribe(
      (response) => {
        console.log('UP Match successful:', response);
        this.selectedMatch = response; 
        this.cdr.detectChanges(); 
        this.openModal(); 
      },
      (error) => {
        console.error('UP Match failed:', error);
      }
    );
  
  }

  
  
  matchWithUB(person: any) {
    this.missingpersonapi.matchWithUB(person.id).subscribe(
      (response) => {
        console.log('UB Match successful:', response);
        this.selectedMatch = response; // Store the response in selectedMatch
        this.cdr.detectChanges(); 
        this.openModal(); // Open the modal
      },
      (error) => {
        console.error('UB Match failed:', error);
      }
    );
  }


  viewDetailsmatch(match: any) {
    console.log('Selected match:', match); 
    this.selectedMatch = match;
  }

  openModal() {
    const modalElement = document.getElementById('viewDetailsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  openNestedModal(match: any) {
    console.log("Selected match data:", match);
    this.selectedMatched = match; 
    const nestedModal = new bootstrap.Modal(document.getElementById('nestedModal'));
  
    nestedModal.show();
  }



  unrejectMatch(uniqueId: string, matchId: string): void {
    if (uniqueId && matchId) {
      this.missingpersonapi.unrejectMatch(uniqueId, matchId).subscribe(
        (response) => {
          this.message = `Match unrejected successfully. Match ID: ${response.match_id}`;
          this.errorMessage = '';
          
          // Show success alert
          alert(`Match unrejected successfully. Match ID: ${response.match_id}`);
        },
        (error) => {
          this.message = '';
          this.errorMessage = `Error: ${error.error || error.message}`;
        }
      );
    } else {
      this.errorMessage = 'Please provide both Unique ID and Match ID.';
    }
  }
  

  submitRejection(): void {
    if (this.rejectionReason) {
      // Debug log to verify the values
      console.log('uniqueId:', this.uniqueId);
      console.log('matchId:', this.matchId);
  
      // Ensure that uniqueId and matchId are valid
      if (this.uniqueId && this.matchId) {
        this.missingpersonapi.rejectMatch(this.uniqueId, this.matchId, this.rejectionReason).subscribe(
          (response) => {
            this.message = `Match rejected successfully. Match ID: ${response.match_id}`;
            this.errorMessage = '';  
            this.closeModal();
          },
          (error) => {
            this.message = '';
            this.errorMessage = `Error: ${error.message}`;
          }
        );
      } else {
        this.errorMessage = 'Match ID and Unique ID are required.';
      }
    } else {
      this.errorMessage = 'Please provide a rejection reason.';
    }
  }
  

  openRejectModal(uniqueId: string, matchId: number): void {
    console.log('uniqueId:', uniqueId); // Debug log to verify value
    console.log('matchId:', matchId); // Debug log to verify value
  
    // Assign values to the component properties
    this.uniqueId = uniqueId;
    this.matchId = matchId;
  
    // Open the modal
    const rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
    rejectModal.show();
  }
  
  
  closeModal() {
    const rejectModal = document.getElementById('rejectModal');
    const mainModal = document.getElementById('nestedModal');
    if (rejectModal) {
      const modal = bootstrap.Modal.getInstance(rejectModal);
      modal.hide();
    }
    if (mainModal) {
      const modal = bootstrap.Modal.getInstance(mainModal);
      modal.hide();
    }
  }

  openConfirmMatchModal(match: any, matchId: string): void {
    const viewDetailsModal = document.getElementById('viewDetailsModal');
    if (viewDetailsModal) {
      const modalInstance = bootstrap.Modal.getInstance(viewDetailsModal);
      modalInstance?.hide();
    }
    this.selectedMatchForConfirmation = match;
    this.confirmMatchForm.patchValue({
      missing_person_name: match.missing_person_name,
      confirmed_by_name: '',
      confirmed_by_contact: '',
      confirmed_by_relationship: '',
      notes: ''
    });
    this.confirmMatchData.match_id = matchId; 
    this.showConfirmModal = true;
    console.log(this.confirmMatchData.match_id);
  }

  confirmMatch(): void {
    // If form is valid, proceed with confirmation
    if (this.confirmMatchForm.valid) {
      const matchId = this.confirmMatchData.match_id;

      // Combine form values with matchId
      const formData = {
        ...this.confirmMatchForm.value,
        match_id: matchId,
        is_confirmed: true
      };

      this.missingpersonapi.confirmMatch(formData).subscribe(
        (response) => {
          this.message = 'Match confirmed successfully.';
          this.errorMessage = '';
          this.showConfirmModal = false; // Close the modal
        },
        (error) => {
          this.message = '';
          this.errorMessage = `Error: ${error.error || error.message}`;
        }
      );
    } else {
      // Handle form validation errors if needed
      console.log('Form is invalid');
    }
  }

  unmatchConfirmedMatch(matchId: string): void {
    console.log('Unmatching match with ID:', matchId);
    
    if (!matchId) {
      alert('Match ID is invalid or missing.');
      return;
    }
  
    this.missingpersonapi.unmatchConfirmedMatch(matchId).subscribe(
      (response) => {
        console.log('Match unmatch response:', response);
        this.selectedMatch.confirmed_matched = this.selectedMatch.confirmed_matched.filter(
          (m: { match_id: any }) => m.match_id !== matchId
        );
        alert('Match has been unmatched successfully.');
      },
      (error) => {
        console.error('Error unmatching match:', error);
        alert('An error occurred while unmatching the match.');
      }
    );
  }
  
  getReport(person: string): void {
    if (person) {
      this.missingpersonapi.getReportByMatchName(person).subscribe(
        (reportData: any) => {
          console.log('Report data received:', reportData);
          this.showReport(reportData); 
        },
        (error: any) => {
          console.error('Error fetching report:', error);
        }
      );
    } else {
      console.error('Invalid person name');
    }
  }

  viewReportDetails(report: any): void {
    this.selectedReport = report;
    this.isModalOpen = true;  // Open the modal
  }

  closeModals(): void {
    this.isModalOpen = false;  // Close the modal
    this.selectedReport = null;  // Optionally clear the selected report
  }

  showReport(reportData: any): void {
    alert('Report generated: ' + JSON.stringify(reportData));
  }

 

  closeConfirmModal(): void {
    this.showConfirmModal = false;
  
    // Reopen the first modal
    const viewDetailsModal = document.getElementById('viewDetailsModal');
    if (viewDetailsModal) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(viewDetailsModal);
      modalInstance?.show();
    } 
  }
}