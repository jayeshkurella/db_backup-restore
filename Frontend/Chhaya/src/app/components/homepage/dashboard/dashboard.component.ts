import { Component, OnInit } from '@angular/core';
import { SearchpersonAPIService } from './searchperson-api.service';
import { environment } from 'src/envirnments/envirnment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var bootstrap: any;
interface Address {
  type: string;
  city?: string;
  full_address?: string;
}

interface Person {
  full_name: string;
  estimated_age: number;
  age: number;
  address: Address;
  photo_upload?: string;
}


interface Match {
  match_id: string;
  missing_entity: Person;  
  matched_entity: Person;  
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  environment =environment
  progress: number = 0; 
  isCollapsed: boolean = false;
  fullName: string = '';
  searchResults: any = {
    newly_matched: [],
    previously_matched: [],
    previously_rejected: [],
  }; 
  previousMatches: any[] | undefined;
  loading: boolean = false;
  errorMessage: string = '';
  selectedMatch: any = null;

  uniqueId: string = ''; 
  matchId: number = 0;  
  rejectionReason: string = '';  
  message: string = '';  
  confirmMatchForm: FormGroup | any;


  constructor(private searchService: SearchpersonAPIService,private fb: FormBuilder, ) {}

  ngOnInit(): void {
    // Initialize the form
    this.confirmMatchForm = this.fb.group({
      confirmed_by_name: ['', [Validators.required]],
      confirmed_by_relationship: ['', [Validators.required]],
      confirmed_by_contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // Assuming contact is a 10-digit number
      notes: ['', [Validators.maxLength(500)]]  // Notes can be optional with a maximum length
    });
  }

  // Toggle the sidebar
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Check if the value is an array
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  // Search for matches based on full name
  search() {
    if (!this.fullName.trim()) {
      this.errorMessage = 'Please enter a full name.';
      return;
    }
  
    this.loading = true;
    this.errorMessage = '';
  
    this.searchService.searchMatches(this.fullName).subscribe(
      (data) => {
        this.searchResults = data;
        console.log("data after search:", this.searchResults);
        this.loading = false;
      },
      (error) => {
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;  
        } else {
          this.errorMessage = 'An error occurred while searching.'; 
        }
        this.loading = false;
      }
    );
  }
  
  

  // Fetch previously matched data
  fetchPreviousMatches() {
    this.searchService.getMatches().subscribe(
      (data) => {
        this.previousMatches = data;
        console.log("Previous matches data:", this.previousMatches);
      },
      (error) => {
        this.errorMessage = 'An error occurred while fetching previous matches.';
      }
    );
  }

  viewDetails(match: any) {
  
    const missingPersonData = this.searchResults?.missing_person;
    this.selectedMatch = {
      ...match,
      missing_person: missingPersonData,
    };

    console.log('Selected Match set:', this.selectedMatch); // Verify missing_person is included
  }

  rejectMatch(): void {
    if (this.uniqueId && this.matchId && this.rejectionReason) {
      this.searchService.rejectMatch(this.uniqueId, this.matchId, this.rejectionReason).subscribe(
        (response) => {
          this.message = `Match rejected successfully. Match ID: ${response.match_id}`;
          this.errorMessage = '';  
        },
        (error) => {
          this.message = '';
          this.errorMessage = `Error: ${error}`;
        }
      );
    } else {
      this.errorMessage = 'Please provide all fields: Unique ID, Match ID, and Rejection Reason.';
    }
  }

  unrejectMatch(uniqueId: string, matchId: string): void {
    console.log("uniqueId:", uniqueId);  // Debugging the uniqueId value
    console.log("matchId:", matchId);    // Debugging the matchId value
  
    if (uniqueId && matchId) {
      this.searchService.unrejectMatch(uniqueId, matchId).subscribe(
        (response) => {
          this.message = `Match unrejected successfully. Match ID: ${response.match_id}`;
          this.errorMessage = '';  // Clear any previous error message
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
  
  
  

  openRejectModal(): void {
    if (this.selectedMatch) {
      this.uniqueId = this.selectedMatch?.missing_person?.unique_id; // Set uniqueId from selected match
      this.matchId = this.selectedMatch?.match_id; // Set matchId from selected match
      // Open the rejection modal
      const rejectModal = new bootstrap.Modal(document.getElementById('rejectMatchModal'));
      rejectModal.show();
    }
  }

  // Handle the rejection submission
  submitRejection(): void {
    if (this.rejectionReason) {
      this.searchService.rejectMatch(this.uniqueId, this.matchId, this.rejectionReason).subscribe(
        (response) => {
          this.message = `Match rejected successfully. Match ID: ${response.match_id}`;
          this.errorMessage = '';  // Clear any previous error message
          this.closeRejectModal();
        },
        (error) => {
          this.message = '';
          this.errorMessage = `Error: ${error.message}`;
        }
      );
    } else {
      this.errorMessage = 'Please provide a rejection reason.';
    }
  }

  // Close the rejection modal
  closeRejectModal(): void {
    const rejectModal = new bootstrap.Modal(document.getElementById('rejectMatchModal'));
    rejectModal.hide();
  }

  confirmMatch(): void {
    if (this.confirmMatchForm.invalid) {
      return;
    }

    // Show loading spinner while confirming the match
    this.loading = true;
    this.errorMessage = '';

    const confirmationData = {
      match_id: this.selectedMatch.match_id,
      missing_person_name: this.selectedMatch.missing_person.full_name,
      confirmed_by_name: this.confirmMatchForm.value.confirmed_by_name,
      confirmed_by_contact: this.confirmMatchForm.value.confirmed_by_contact,
      confirmed_by_relationship: this.confirmMatchForm.value.confirmed_by_relationship,
      notes: this.confirmMatchForm.value.notes,
      is_confirmed: true,
    };

    // Call the API service to confirm the match
    this.searchService.confirmMatch(confirmationData).subscribe(
      (response) => {
        // Handle success
        this.loading = false;
        alert('Match confirmed successfully!');
        // Close the modal after confirmation
        const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal')!);
        confirmationModal.hide();
      },
      (error) => {
        // Handle error
        this.loading = false;
        this.errorMessage = 'An error occurred while confirming the match.';
      }
    );
  }

  openConfirmationModal(match: any): void {
    this.selectedMatch = match;
    // Reset form when opening the modal
    this.confirmMatchForm.reset();
    // Show the confirmation modal
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal')!);
    confirmationModal.show();
  }
  
}

