import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { tap, catchError, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CasesApprovalService } from './cases-approval.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HoldReasonDialogComponent } from './hold-reason-dialog/hold-reason-dialog.component';
import { SuspendReasonDialogComponent } from './suspend-reason-dialog/suspend-reason-dialog.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MissingPersonApiService } from '../kichen-sink/missing-person-api.service';
import { MatOptionModule } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { FormApiService } from '../../forms/form-layouts/form-api.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
export interface Person {
  id: string;
  full_name: string;
  village?: string;
  city?: string;
  state?: string;
  gender?: string;
  age?: number;
  type?: string;
  person_approve_status: string;
  case_status?: string;
  selected?: boolean;
  status_reason?: string | null;
  reason?: string;   
  // count?:number;
}
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  results: T[];
}

interface CaseFilters {
  city: string;
  state: string;
  district: string;
  village: string;
  case_id: string;
  police_station: string;
}

enum PersonStatus {
  PENDING = 'pending',
  HOLD = 'on_hold',
  APPROVED = 'approved',
  SUSPENDED = 'suspended'
}

@Component({
  selector: 'app-access-provider',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    FormsModule,
    ScrollingModule,
    MatTooltipModule,
    MatOptionModule,
    MatFormField,
    MatSelect,
    MatPaginatorModule
  ],
  templateUrl: './access-provider.component.html',
  styleUrl: './access-provider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessProviderComponent implements OnInit { 
  displayedColumns: string[] = ['name', 'village', 'city', 'state', 'status'];
  displayedColumnsWithSelect = ['select', ...this.displayedColumns];
  displayedColumnsWithReason = [...this.displayedColumnsWithSelect, 'reason'];

  pendingPersons: Person[] = [];

  holdPersons: Person[] = [];
  suspendedPersons: Person[] = [];
  approvedPersons: Person[] = [];
  
  isLoading: boolean = true;
  isProcessing: boolean = false;
  isFilterLoading: boolean = false;
  pendingCount: number = 0;
  holdCount: number = 0;
  suspendedCount: number = 0;
  approvedCount: number = 0;
  
  selectedTabIndex = 0; 
  selectAllPending: boolean = false;
  selectAllHold: boolean = false;
  selectAllSuspended: boolean = false;
  selectAllApproved: boolean = false;
  allstates: any;
  filtersApplied: boolean = false; 
  allcities: any;
  alldistricts: any;
  allvillages: any;
  policeStationList: any[] = [];

  pagination = {
  pageIndex: 0,
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 100],
  length: 0,
  showFirstLastButtons: true // Add this for << and >> buttons
};
  filters: CaseFilters = {
    city: '',
    state: '',
    district: '',
    village: '',
    case_id: '',
    police_station: ''  
  };

  constructor(
    private pendingService: CasesApprovalService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private missingPersonService: MissingPersonApiService,
    private formapi: FormApiService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.getStates();
    this.fetchPoliceStationList();
    
  }

  getStates() {
    this.missingPersonService.getStates().subscribe(states => {
      this.allstates = states;
    });
  }

onStateChange() {
  this.filters.district = '';
  this.filters.city = '';
  this.filters.village = '';
  this.alldistricts = [];
  this.allcities = [];
  this.allvillages = [];

  if (this.filters.state) {
    this.missingPersonService.getDistricts(this.filters.state).subscribe(districts => {
      this.alldistricts = districts;
    });
  }
}

onDistrictChange() {
  this.filters.city = '';
  this.filters.village = '';
  this.allcities = [];
  this.allvillages = [];

  if (this.filters.district) {
    this.missingPersonService.getCities(this.filters.district).subscribe(cities => {
      this.allcities = cities;
    });
  }
}

onCityChange() {
  this.filters.village = '';
  this.allvillages = [];

  if (this.filters.city) {
    this.missingPersonService.getVillages(this.filters.city).subscribe(villages => {
      this.allvillages = villages;
    });
  }
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

  isSearchEnabled(): boolean {
  // If case ID has value (and is not just whitespace)
  if (this.filters.case_id && this.filters.case_id.trim() !== '') {
    return true;
  }
  
  // If police station is selected
  if (this.filters.police_station && this.filters.police_station !== '') {
    return true;
  }
  
  if (this.filters.state || this.filters.district || this.filters.city || this.filters.village) {

    if (this.filters.state) {
    
      if (this.filters.district) {
        if (this.filters.city) {

          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  }
  
  return false;
}

filterDataByFilters(): void {
  this.pagination.pageIndex = 0; // Reset to first page when filters change
  this.loadData();
}


// isFirstPage(): boolean {
//   return this.pagination.pageIndex === 0;
// }

// loadData(): void {
//   this.isLoading = true;
//   this.resetSelectAllStates();
//   this.cdr.markForCheck();

//   const cleanFilters = this.getCleanFilters();
//   const paginationParams = {
//     page: this.pagination.pageIndex + 1,  // API pages are 1-based
//     page_size: this.pagination.pageSize
//   };
  
//   forkJoin([
//     this.pendingService.getPendingPersons({...cleanFilters, ...paginationParams}),
//     this.pendingService.getHoldPersons({...cleanFilters, ...paginationParams}),
//     this.pendingService.getSuspendedPersons({...cleanFilters, ...paginationParams}),
//     this.pendingService.getApprovedPersons({...cleanFilters, ...paginationParams})
//   ]).pipe(
//     finalize(() => {
//       this.isLoading = false;
//       this.cdr.markForCheck();
//     })
//   ).subscribe({
//     next: ([pendingResponse, holdResponse, suspendedResponse, approvedResponse]) => {
//       this.processResponseData({
//         pending_data: pendingResponse,
//         on_hold_data: holdResponse,
//         suspended_data: suspendedResponse,
//         approved_data: approvedResponse
//       });
      
//       // Update pagination length based on current tab
//       this.updatePaginationLength();
//     },
//     error: (error) => {
//       console.error('Error fetching data:', error);
//       this.resetData();
//       this.snackBar.open('Failed to load data', 'Close', { duration: 1000 });
//     }
//   });
// }
loadData(): void {
  this.isLoading = true;
  this.resetSelectAllStates();
  this.cdr.markForCheck();

  const cleanFilters = this.getCleanFilters();
  const paginationParams = {
    page: this.pagination.pageIndex + 1,  // API pages are 1-based
    page_size: this.pagination.pageSize
  };
  
  forkJoin([
    this.pendingService.getPendingPersons({...cleanFilters, ...paginationParams}),
    this.pendingService.getHoldPersons({...cleanFilters, ...paginationParams}),
    this.pendingService.getSuspendedPersons({...cleanFilters, ...paginationParams}),
    this.pendingService.getApprovedPersons({...cleanFilters, ...paginationParams})
  ]).pipe(
    finalize(() => {
      this.isLoading = false;
      this.cdr.markForCheck();
    })
  ).subscribe({
    next: ([pendingResponse, holdResponse, suspendedResponse, approvedResponse]) => {
      this.processResponseData({
        pending_data: pendingResponse,
        on_hold_data: holdResponse,
        suspended_data: suspendedResponse,
        approved_data: approvedResponse
      });
      
      // Update pagination length based on current tab
      this.updatePaginationLength();
    },
    error: (error) => {
      console.error('Error fetching data:', error);
      this.resetData();
      this.snackBar.open('Failed to load data', 'Close', { duration: 1000 });
    }
  });
}

private updatePaginationLength(): void {
  switch(this.selectedTabIndex) {
    case 0:
      this.pagination.length = this.pendingCount;
      break;
    case 1:
      this.pagination.length = this.holdCount;
      break;
    case 2:
      this.pagination.length = this.suspendedCount;
      break;
    case 3:
      this.pagination.length = this.approvedCount;
      break;
  }
  this.cdr.markForCheck();
}

getDisplayedRange(): string {
  if (this.pagination.length === 0) {
    return '0 of 0';
  }
  
  const start = (this.pagination.pageIndex * this.pagination.pageSize) + 1;
  const end = Math.min((this.pagination.pageIndex + 1) * this.pagination.pageSize, this.pagination.length);
  return `${start}-${end} of ${this.pagination.length}`;
}

onTabChange(event: MatTabChangeEvent) {
  this.selectedTabIndex = event.index;
  this.pagination.pageIndex = 0; 
  
  this.updatePaginationLength();
  this.cdr.markForCheck();
}
firstPage(): void {
  if (!this.isFirstPage()) {
    this.pagination.pageIndex = 0;
    this.loadData();
  }
}

previousPage(): void {
  if (!this.isFirstPage()) {
    this.pagination.pageIndex--;
    this.loadData();
  }
}

nextPage(): void {
  if (!this.isLastPage()) {
    this.pagination.pageIndex++;
    this.loadData();
  }
}

lastPage(): void {
  if (!this.isLastPage()) {
    const totalPages = Math.ceil(this.pagination.length / this.pagination.pageSize);
    this.pagination.pageIndex = totalPages - 1;
    this.loadData();
  }
}

isFirstPage(): boolean {
  return this.pagination.pageIndex === 0;
}

isLastPage(): boolean {
  if (this.pagination.length === 0) return true;
  const totalPages = Math.ceil(this.pagination.length / this.pagination.pageSize);
  return this.pagination.pageIndex >= totalPages - 1;
}


applyFilters(): void {
  this.isLoading = true;
  this.isFilterLoading = true;
  this.cdr.markForCheck();
  this.filtersApplied = this.hasActiveFilters();

  const currentFilters = {...this.filters};
  const cleanFilters = this.getCleanFilters();
  const paginationParams = {
    page: this.pagination.pageIndex + 1,
    page_size: this.pagination.pageSize
  };

  forkJoin([
    this.pendingService.getPendingPersons({...cleanFilters, ...paginationParams}),
    this.pendingService.getHoldPersons({...cleanFilters, ...paginationParams}),
    this.pendingService.getSuspendedPersons({...cleanFilters, ...paginationParams}),
    this.pendingService.getApprovedPersons({...cleanFilters, ...paginationParams})
  ]).pipe(
    finalize(() => {
      this.isLoading = false;
      this.isFilterLoading = false;
      this.cdr.markForCheck();
    })
  ).subscribe({
    next: ([pendingData, holdData, suspendedData, approvedData]) => {
      if (this.areFiltersSame(currentFilters)) {
        this.processResponseData({
          pending_data: pendingData,
          on_hold_data: holdData,
          suspended_data: suspendedData,
          approved_data: approvedData
        });
        
        // Update pagination length based on current tab
        switch(this.selectedTabIndex) {
          case 0:
            this.pagination.length = pendingData.count || 0;
            break;
          case 1:
            this.pagination.length = holdData.count || 0;
            break;
          case 2:
            this.pagination.length = suspendedData.count || 0;
            break;
          case 3:
            this.pagination.length = approvedData.count || 0;
            break;
        }
      }
    },
    error: (error) => {
      console.error('Filter error:', error);
      this.snackBar.open('Error applying filters', 'Close', { duration: 2000 });
    }
  });
}


  private hasActiveFilters(): boolean {
    return Object.values(this.filters).some(value => value !== '');
  }

  private areFiltersSame(compareFilters: CaseFilters): boolean {
    return Object.keys(this.filters).every(key => 
      this.filters[key as keyof CaseFilters] === compareFilters[key as keyof CaseFilters]
    );
  }

  resetFilters(): void {
  this.filters = {
    city: '',
    state: '',
    district: '',
    village: '',
    case_id: '',
    police_station: '' 
  };
  this.pagination.pageIndex = 0;  // Reset to first page
  this.loadData();
  this.snackBar.open('Filters cleared', 'Close', { duration: 1000 });
}

private getCleanFilters(): any {
  const cleanFilters: any = {};
  
  if (this.filters.city) cleanFilters.city = this.filters.city;
  if (this.filters.state) cleanFilters.state = this.filters.state;
  if (this.filters.district) cleanFilters.district = this.filters.district;
  if (this.filters.village) cleanFilters.village = this.filters.village;
  if (this.filters.case_id) cleanFilters.case_id = this.filters.case_id;
  if (this.filters.police_station) cleanFilters.police_station = this.filters.police_station;

  return cleanFilters;
}

private processResponseData(response: {
  pending_data: PaginatedResponse<Person>,
  on_hold_data: PaginatedResponse<Person>,
  suspended_data: PaginatedResponse<Person>,
  approved_data: PaginatedResponse<Person>
}): void {
  this.pendingPersons = this.processPersonArray(response.pending_data.results || [], 'pending');
  this.pendingCount = response.pending_data.count || 0;
  
  this.holdPersons = this.processPersonArray(response.on_hold_data.results || [], 'on_hold');
  this.holdCount = response.on_hold_data.count || 0;
  
  this.suspendedPersons = this.processPersonArray(response.suspended_data.results || [], 'suspended');
  this.suspendedCount = response.suspended_data.count || 0;
  
  this.approvedPersons = this.processPersonArray(response.approved_data.results || [], 'approved');
  this.approvedCount = response.approved_data.count || 0;
  
  // Update pagination length based on current tab
  this.updatePaginationLength();
  
  this.cdr.markForCheck();
}
onPageChange(event: PageEvent): void {
  this.pagination.pageIndex = event.pageIndex;
  this.pagination.pageSize = event.pageSize;
  this.loadData();
}

  private processPersonArray(data: any, status: string): Person[] {
  if (!data) return [];
  
  // Handle both array and paginated response
  const items = Array.isArray(data) ? data : (data.results || []);
  
  return items.map((person: any) => ({
    id: person.id,
    full_name: person.full_name || '',
    village: person.village || '',
    city: person.city || '',
    state: person.state || '',
    gender: person.gender || '',
    age: person.age || 0,
    type: person.type || '',
    person_approve_status: person.person_approve_status || status,
    case_status: person.case_status || status,
    status_reason: person.status_reason || null,
    reason: person.reason || '',
    selected: false
  }));
}

  private resetData(): void {
    this.pendingPersons = [];
    this.holdPersons = [];
    this.suspendedPersons = [];
    this.approvedPersons = [];
    this.pendingCount = 0;
    this.holdCount = 0;
    this.suspendedCount = 0;
    this.approvedCount = 0;
    this.cdr.markForCheck();
  }

  private showStatusChangeMessage(person: Person, oldStatus: string, newStatus: string): void {
    this.snackBar.open(
      `${person.full_name}'s status changed from ${this.formatStatus(oldStatus)} to ${this.formatStatus(newStatus)}`,
      'Close', 
      { duration: 1000 }
    );
  }

  private formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  }
  
  approvePerson(person: Person): void {
    const oldStatus = person.person_approve_status;
    this.isProcessing = true;
    this.cdr.markForCheck();
    
    this.pendingService.updatePersonStatus(person.id, 'approved').pipe(
      finalize(() => {
        this.isProcessing = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.loadData();
        this.showStatusChangeMessage(person, oldStatus, 'approved');
      },
      error: (error) => {
        console.error('Error approving person:', error);
        this.snackBar.open('Failed to approve person', 'Close', { duration: 1000 });
      }
    });
  }

  suspendPerson(person: Person): void {
    const dialogRef = this.dialog.open(SuspendReasonDialogComponent, {
      width: '500px',
      data: { personName: person.full_name }
    });
  
    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        const oldStatus = person.person_approve_status;
        this.isProcessing = true;
        this.cdr.markForCheck();
        
        this.pendingService.updatePersonStatus(person.id, 'suspended', reason).pipe(
          finalize(() => {
            this.isProcessing = false;
            this.cdr.markForCheck();
          })
        ).subscribe({
          next: () => {
            this.loadData();
            this.showStatusChangeMessage(person, oldStatus, 'suspended');
          },
          error: (error) => {
            console.error('Error suspending person:', error);
            this.snackBar.open('Failed to suspend person', 'Close', { duration: 1000 });
          }
        });
      }
    });
  }

  setPersonPending(person: Person): void {
    const oldStatus = person.person_approve_status;
    this.isProcessing = true;
    this.cdr.markForCheck();
    
    this.pendingService.updatePersonStatus(person.id, 'pending').pipe(
      finalize(() => {
        this.isProcessing = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.loadData();
        this.showStatusChangeMessage(person, oldStatus, 'pending');
      },
      error: (error) => {
        console.error('Error setting person to pending:', error);
        this.snackBar.open('Failed to set person to pending', 'Close', { duration: 1000 });
      }
    });
  }

  holdPerson(person: Person): void {
    const dialogRef = this.dialog.open(HoldReasonDialogComponent, {
      width: '500px',
      data: { personName: person.full_name }
    });
  
    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        const oldStatus = person.person_approve_status;
        this.isProcessing = true;
        this.cdr.markForCheck();
        
        this.pendingService.updatePersonStatus(person.id, 'on_hold', reason).pipe(
          finalize(() => {
            this.isProcessing = false;
            this.cdr.markForCheck();
          })
        ).subscribe({
          next: () => {
            this.loadData();
            this.showStatusChangeMessage(person, oldStatus, 'on_hold');
          },
          error: (error) => {
            console.error('Error putting person on hold:', error);
            this.snackBar.open('Failed to put person on hold', 'Close', { duration: 1000 });
          }
        });
      }
    });
  }

  holdSelected(): void {
    let selectedPersons: Person[] = [];
    
    switch (this.selectedTabIndex) {
      case 0: 
        selectedPersons = this.pendingPersons.filter(p => p.selected);
        break;
      case 3: 
        selectedPersons = this.approvedPersons.filter(p => p.selected);
        break;
      default:
        return; 
    }
  
    if (selectedPersons.length === 0) {
      this.snackBar.open('No persons selected', 'Close', { duration: 1000 });
      return;
    }
  
    const dialogRef = this.dialog.open(HoldReasonDialogComponent, {
      width: '500px',
      data: { 
        multiple: true,
        count: selectedPersons.length 
      }
    });
  
    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        this.isProcessing = true;
        this.cdr.markForCheck();
        
        const holdRequests = selectedPersons.map(person => {
          const oldStatus = person.person_approve_status;
          return this.pendingService.updatePersonStatus(person.id, 'on_hold', reason).pipe(
            tap(() => this.showStatusChangeMessage(person, oldStatus, 'on_hold')),
            catchError(error => {
              console.error(`Error putting person ${person.id} on hold:`, error);
              return of(null);
            })
          );
        });
  
        forkJoin(holdRequests).pipe(
          finalize(() => {
            this.isProcessing = false;
            this.cdr.markForCheck();
          })
        ).subscribe({
          next: (responses) => {
            const successCount = responses.filter(r => r !== null).length;
            this.loadData();
            this.snackBar.open(
              `Successfully put ${successCount} of ${selectedPersons.length} person(s) on hold`,
              'Close', 
              { duration: 5000 }
            );
          },
          error: () => {
            this.snackBar.open('Some hold operations failed', 'Close', { duration: 1000 });
          }
        });
      }
    });
  }

  getCurrentDataSource() {
    switch(this.selectedTabIndex) {
      case 0: return this.pendingPersons;
      case 1: return this.holdPersons;
      case 2: return this.suspendedPersons;
      case 3: return this.approvedPersons;
      default: return this.pendingPersons;
    }
  }

  toggleSelectAllPending(checked: boolean): void {
    this.selectAllPending = checked;
    this.pendingPersons.forEach(person => person.selected = checked);
    this.cdr.markForCheck();
  }

  toggleSelectAllHold(checked: boolean): void {
    this.selectAllHold = checked;
    this.holdPersons.forEach(person => person.selected = checked);
    this.cdr.markForCheck();
  }

  toggleSelectAllSuspended(checked: boolean): void {
    this.selectAllSuspended = checked;
    this.suspendedPersons.forEach(person => person.selected = checked);
    this.cdr.markForCheck();
  }

  toggleSelectAllApproved(checked: boolean): void {
    this.selectAllApproved = checked;
    this.approvedPersons.forEach(person => person.selected = checked);
    this.cdr.markForCheck();
  }

  isIndeterminateHold(): boolean {
    const selectedCount = this.holdPersons.filter(p => p.selected).length;
    return selectedCount > 0 && selectedCount < this.holdPersons.length;
  }

  updateSelectAllState(): void {
    switch(this.selectedTabIndex) {
      case 0: 
        this.selectAllPending = this.pendingPersons.length > 0 && 
          this.pendingPersons.every(p => p.selected);
        break;
      case 1:
        this.selectAllHold = this.holdPersons.length > 0 && 
          this.holdPersons.every(p => p.selected);
        break;
      case 2:
        this.selectAllSuspended = this.suspendedPersons.length > 0 && 
          this.suspendedPersons.every(p => p.selected);
        break;
      case 3:
        this.selectAllApproved = this.approvedPersons.length > 0 && 
          this.approvedPersons.every(p => p.selected);
        break;
    }
    this.cdr.markForCheck();
  }

  isIndeterminatePending(): boolean {
    const selectedCount = this.pendingPersons.filter(p => p.selected).length;
    return selectedCount > 0 && selectedCount < this.pendingPersons.length;
  }

  isIndeterminateSuspended(): boolean {
    const selectedCount = this.suspendedPersons.filter(p => p.selected).length;
    return selectedCount > 0 && selectedCount < this.suspendedPersons.length;
  }

  isIndeterminateApproved(): boolean {
    const selectedCount = this.approvedPersons.filter(p => p.selected).length;
    return selectedCount > 0 && selectedCount < this.approvedPersons.length;
  }

  hasSelectedItems(): boolean {
    switch(this.selectedTabIndex) {
      case 0: return this.pendingPersons.some(p => p.selected);
      case 1: return this.holdPersons.some(p => p.selected);
      case 2: return this.suspendedPersons.some(p => p.selected);
      case 3: return this.approvedPersons.some(p => p.selected);
      default: return false;
    }
  }

  selectedCount(): number {
    switch(this.selectedTabIndex) {
      case 0: return this.pendingPersons.filter(p => p.selected).length;
      case 1: return this.holdPersons.filter(p => p.selected).length;
      case 2: return this.suspendedPersons.filter(p => p.selected).length;
      case 3: return this.approvedPersons.filter(p => p.selected).length;
      default: return 0;
    }
  }

  approveSelected(): void {
    let selectedPersons: Person[] = [];
  
    switch (this.selectedTabIndex) {
      case 0:
        selectedPersons = this.pendingPersons.filter(p => p.selected);
        break;
      case 1: 
        selectedPersons = this.holdPersons.filter(p => p.selected);
        break;
      case 2:
        selectedPersons = this.suspendedPersons.filter(p => p.selected);
        break;
      case 3:
        selectedPersons = this.approvedPersons.filter(p => p.selected);
        break;
      default:
        selectedPersons = [];
    }
  
    if (selectedPersons.length === 0) return;
  
    this.isProcessing = true;
    this.cdr.markForCheck();
    this.snackBar.open(`Processing ${selectedPersons.length} items...`, '', { duration: 1000 });
    
    const approveRequests = selectedPersons.map(person => {
      const oldStatus = person.person_approve_status;
      return this.pendingService.updatePersonStatus(person.id, 'approved').pipe(
        tap(() => this.showStatusChangeMessage(person, oldStatus, 'approved')),
        catchError(error => {
          console.error(`Error approving person ${person.id}:`, error);
          this.snackBar.open(`Failed to approve ${person.full_name}`, 'Close', { duration: 1000 });
          return of(null);
        })
      );
    });
  
    forkJoin(approveRequests).pipe(
      finalize(() => {
        this.isProcessing = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.loadData();
        this.resetSelectAllStates();
        this.snackBar.open(`Successfully processed ${selectedPersons.length} items`, 'Close', { duration: 1000 });
      },
      error: (error) => {
        console.error('Error in bulk approve operation:', error);
        this.snackBar.open('Some operations failed', 'Close', { duration: 1000 });
      }
    });
  }
  
  suspendSelected(): void {
    let selectedPersons: Person[] = [];
    
    switch(this.selectedTabIndex) {
      case 0: 
        selectedPersons = this.pendingPersons.filter(p => p.selected);
        break;
      case 1: 
        selectedPersons = this.holdPersons.filter(p => p.selected);
        break;
      case 3:
        selectedPersons = this.approvedPersons.filter(p => p.selected);
        break;
      default: return;
    }
  
    if (selectedPersons.length === 0) return;
  
    const dialogRef = this.dialog.open(SuspendReasonDialogComponent, {
      width: '500px',
      data: { 
        multiple: true,
        count: selectedPersons.length 
      }
    });
  
    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        this.isProcessing = true;
        this.cdr.markForCheck();
        
        const suspendRequests = selectedPersons.map(person => {
          const oldStatus = person.person_approve_status;
          return this.pendingService.updatePersonStatus(person.id, 'suspended', reason).pipe(
            tap(() => this.showStatusChangeMessage(person, oldStatus, 'suspended')),
            catchError(error => {
              console.error(`Error suspending person ${person.id}:`, error);
              this.snackBar.open(`Failed to suspend ${person.full_name}`, 'Close', { duration: 1000 });
              return of(null);
            })
          );
        });
      
        forkJoin(suspendRequests).pipe(
          finalize(() => {
            this.isProcessing = false;
            this.cdr.markForCheck();
          })
        ).subscribe({
          next: () => {
            this.loadData();
            this.resetSelectAllStates();
            this.snackBar.open(`Successfully suspended ${selectedPersons.length} items`, 'Close', { duration: 1000 });
          },
          error: (error) => {
            console.error('Error in bulk suspend operation:', error);
            this.snackBar.open('Some suspensions failed', 'Close', { duration: 1000 });
          }
        });
      }
    });
  }
  
  setPendingSelected(): void {
    if (this.selectedTabIndex !== 3) return;

    const selectedPersons = this.approvedPersons.filter(p => p.selected);
    if (selectedPersons.length === 0) return;

    this.isProcessing = true;
    this.cdr.markForCheck();
    
    const pendingRequests = selectedPersons.map(person => {
      const oldStatus = person.person_approve_status;
      return this.pendingService.updatePersonStatus(person.id, 'pending').pipe(
        tap(() => this.showStatusChangeMessage(person, oldStatus, 'pending')),
        catchError(error => {
          console.error(`Error setting person ${person.id} to pending:`, error);
          this.snackBar.open(`Failed to set ${person.full_name} to pending`, 'Close', { duration: 1000 });
          return of(null);
        })
      );
    });

    forkJoin(pendingRequests).pipe(
      finalize(() => {
        this.isProcessing = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.loadData();
        this.resetSelectAllStates();
        this.snackBar.open(`Successfully set ${selectedPersons.length} items to pending`, 'Close', { duration: 1000 });
      },
      error: (error) => {
        console.error('Error in bulk pending operation:', error);
        this.snackBar.open('Some operations failed', 'Close', { duration: 1000 });
      }
    });
  }

  private resetSelectAllStates(): void {
    this.selectAllPending = false;
    this.selectAllHold = false;
    this.selectAllSuspended = false;
    this.selectAllApproved = false;
    this.cdr.markForCheck();
  }
}