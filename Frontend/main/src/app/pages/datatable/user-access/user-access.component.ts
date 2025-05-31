import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { UserAccessServiceService } from './user-access-service.service';
import { MissingPersonApiService } from '../kichen-sink/missing-person-api.service';
import { MatOptionModule } from '@angular/material/core';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { SafeTitlecasePipe } from 'src/app/components/dashboard1/revenue-updates/person-details/safe-titlecase.pipe';
import { PageEvent } from '@angular/material/paginator';

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email_id: string;
  phone_no: string;
  country_code: string;
  user_type: string;
  sub_user_type: string;
  status: string;
  status_updated_by?: string;
  selected?: boolean;
}

interface CaseFilters {
  // full_name: string;
  first_name: string;
  last_name: string;
  email_id: string;
  phone_no: string;
  user_type: string;
}

@Component({
  selector: 'app-user-access',
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
    MatSnackBarModule,
    FormsModule,
    DatePipe,
    MatOptionModule,
    MatSelectModule,
    SafeTitlecasePipe,
  ],
  templateUrl: './user-access.component.html',
  styleUrl: './user-access.component.scss',
})
export class UserAccessComponent implements OnInit {
  displayedColumns: string[] = [
    'full_name',
    'email_id',
    'phone',
    'user_type',
    'sub_user_type',
    'status',
    'status_updated_by',
    'actions',
  ];
  displayedColumnsWithSelect = ['select', ...this.displayedColumns];
  pendingPersons: Person[] = [];
  rejectedPersons: Person[] = [];
  approvedPersons: Person[] = [];
  isLoading: boolean = false;
  pendingCount: number = 0;
  rejectedCount: number = 0;
  approvedCount: number = 0;
  statusCounts: any;
  selectedTabIndex = 0;
  selectAllPending: boolean = false;
  selectAllRejected: boolean = false;
  selectAllApproved: boolean = false;
  isFilterLoading: boolean = false;
  filtersApplied: boolean = false;

  pendingPagination = {
    next: null as string | null,
    previous: null as string | null,
    count: 0,
  };
  approvedPagination = {
    next: null as string | null,
    previous: null as string | null,
    count: 0,
  };
  rejectedPagination = {
    next: null as string | null,
    previous: null as string | null,
    count: 0,
  };
  userTypes: { label: string; value: string }[] = [];

  filters: CaseFilters = {
    first_name: '',
    last_name: '',
    email_id: '',
    phone_no: '',
    user_type: '',
  };

  constructor(
    private userAccessService: UserAccessServiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.resetSelectAllStates();
    const cleanFilters = this.getCleanFilters();

    forkJoin({
      pending: this.userAccessService.getPendingData(cleanFilters),
      approved: this.userAccessService.getApprovedData(cleanFilters),
      rejected: this.userAccessService.getRejectedData(cleanFilters),
    }).subscribe({
      next: ({ pending, approved, rejected }) => {
        const allUsers = [
          ...pending.results,
          ...approved.results,
          ...rejected.results,
        ];

        // Extract unique user types
        this.userTypes = Array.from(
          new Set(allUsers.map((user) => user.user_type).filter(Boolean))
        );

        console.log('user types:', this.userTypes);
        this.pendingPersons = pending.results.map((person: any) => ({
          ...person,
          selected: false,
          status: person.status || 'hold',
        }));
        this.pendingPagination = {
          next: pending.next,
          previous: pending.previous,
          count: pending.count,
        };

        this.approvedPersons = approved.results.map((person: any) => ({
          ...person,
          selected: false,
          status: person.status || 'approved',
        }));
        this.approvedPagination = {
          next: approved.next,
          previous: approved.previous,
          count: approved.count,
        };

        this.rejectedPersons = rejected.results.map((person: any) => ({
          ...person,
          selected: false,
          status: person.status || 'rejected',
        }));
        this.rejectedPagination = {
          next: rejected.next,
          previous: rejected.previous,
          count: rejected.count,
        };

        this.isLoading = false;
        this.filtersApplied = this.hasActiveFilters();
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
      },
    });
  }

  loadNextPage(): void {
    let nextUrl: string | null = null;
    const currentPagination = this.getCurrentPagination();
    nextUrl = currentPagination.next;

    if (!nextUrl) return;

    this.isLoading = true;
    this.userAccessService.getPaginatedData(nextUrl).subscribe({
      next: (response) => {
        const newPersons = response.results.map((person: any) => ({
          ...person,
          selected: false,
          status: person.status || this.getStatusForTab(),
        }));

        this.updateCurrentData(newPersons, response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading next page:', error);
        this.isLoading = false;
        // Consider showing a user-friendly error message
      },
    });
  }

  // Helper method to get status based on current tab
  private getStatusForTab(): string {
    switch (this.selectedTabIndex) {
      case 0:
        return 'hold';
      case 1:
        return 'rejected';
      case 2:
        return 'approved';
      default:
        return 'hold';
    }
  }

  // Helper method to update current data
  private updateCurrentData(persons: any[], paginationData: any): void {
    switch (this.selectedTabIndex) {
      case 0:
        this.pendingPersons = persons;
        this.pendingPagination = {
          next: paginationData.next,
          previous: paginationData.previous,
          count: paginationData.count,
        };
        break;
      case 1:
        this.rejectedPersons = persons;
        this.rejectedPagination = {
          next: paginationData.next,
          previous: paginationData.previous,
          count: paginationData.count,
        };
        break;
      case 2:
        this.approvedPersons = persons;
        this.approvedPagination = {
          next: paginationData.next,
          previous: paginationData.previous,
          count: paginationData.count,
        };
        break;
    }
  }
  loadPreviousPage(): void {
    let previousUrl: string | null = null;

    switch (this.selectedTabIndex) {
      case 0:
        previousUrl = this.pendingPagination.previous;
        break;
      case 1:
        previousUrl = this.rejectedPagination.previous;
        break;
      case 2:
        previousUrl = this.approvedPagination.previous;
        break;
    }

    if (!previousUrl) return;

    this.isLoading = true;
    this.userAccessService.getPaginatedData(previousUrl).subscribe({
      next: (response) => {
        const newPersons = response.results.map((person: any) => ({
          ...person,
          selected: false,
          status:
            person.status ||
            (this.selectedTabIndex === 0
              ? 'hold'
              : this.selectedTabIndex === 1
              ? 'rejected'
              : 'approved'),
        }));

        switch (this.selectedTabIndex) {
          case 0:
            this.pendingPersons = newPersons;
            this.pendingPagination = {
              next: response.next,
              previous: response.previous,
              count: response.count,
            };
            break;
          case 1:
            this.rejectedPersons = newPersons;
            this.rejectedPagination = {
              next: response.next,
              previous: response.previous,
              count: response.count,
            };
            break;
          case 2:
            this.approvedPersons = newPersons;
            this.approvedPagination = {
              next: response.next,
              previous: response.previous,
              count: response.count,
            };
            break;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading previous page:', error);
        this.isLoading = false;
      },
    });
  }

  getCurrentPageNumber(): number {
    let currentUrl: string | null = null;

    switch (this.selectedTabIndex) {
      case 0:
        currentUrl =
          this.pendingPagination.next || this.pendingPagination.previous;
        break;
      case 1:
        currentUrl =
          this.rejectedPagination.next || this.rejectedPagination.previous;
        break;
      case 2:
        currentUrl =
          this.approvedPagination.next || this.approvedPagination.previous;
        break;
    }

    if (!currentUrl) return 1; // First page

    // Extract page number from URL
    const pageMatch = currentUrl.match(/page=(\d+)/);
    if (pageMatch) {
      const pageNumber = parseInt(pageMatch[1], 10);
      // If we have a next URL, we're on the previous page
      if (currentUrl === this.getCurrentPagination().next) {
        return pageNumber - 1;
      }
      return pageNumber;
    }
    return 1;
  }

  private getCurrentPagination(): any {
    switch (this.selectedTabIndex) {
      case 0:
        return this.pendingPagination;
      case 1:
        return this.rejectedPagination;
      case 2:
        return this.approvedPagination;
      default:
        return { next: null, previous: null, count: 0 };
    }
  }
  hasNextPage(): boolean {
    switch (this.selectedTabIndex) {
      case 0:
        return !!this.pendingPagination.next;
      case 1:
        return !!this.rejectedPagination.next;
      case 2:
        return !!this.approvedPagination.next;
      default:
        return false;
    }
  }

  hasPreviousPage(): boolean {
    switch (this.selectedTabIndex) {
      case 0:
        return !!this.pendingPagination.previous;
      case 1:
        return !!this.rejectedPagination.previous;
      case 2:
        return !!this.approvedPagination.previous;
      default:
        return false;
    }
  }

  getTotalCount(): number {
    switch (this.selectedTabIndex) {
      case 0:
        return this.pendingPagination.count;
      case 1:
        return this.rejectedPagination.count;
      case 2:
        return this.approvedPagination.count;
      default:
        return 0;
    }
  }

  getFullName(person: Person): string {
    return `${person.first_name} ${person.last_name}`.trim();
  }

  getPhoneNumber(person: Person): string {
    return ` ${person.phone_no}`;
  }

  approvePerson(person: Person): void {
    const oldStatus = person.status;
    this.userAccessService.updatePersonStatus(person.id, 'approved').subscribe({
      next: () => {
        this.loadData();
        this.showStatusChangeMessage(person, oldStatus, 'approved');
      },
      error: (error) => console.error('Error approving person:', error),
    });
  }

  rejectPerson(person: Person): void {
    const oldStatus = person.status;
    this.userAccessService.updatePersonStatus(person.id, 'rejected').subscribe({
      next: () => {
        this.loadData();
        this.showStatusChangeMessage(person, oldStatus, 'rejected');
      },
      error: (error) => console.error('Error rejecting person:', error),
    });
  }

  setPersonPending(person: Person): void {
    const oldStatus = person.status;
    this.userAccessService.updatePersonStatus(person.id, 'hold').subscribe({
      next: () => {
        this.loadData();
        this.showStatusChangeMessage(person, oldStatus, 'hold');
      },
      error: (error) =>
        console.error('Error setting person to pending:', error),
    });
  }

  toggleSelectAllPending(checked: boolean): void {
    this.selectAllPending = checked;
    this.pendingPersons.forEach((person) => {
      person.selected = checked;
    });
  }

  toggleSelectAllRejected(checked: boolean): void {
    this.selectAllRejected = checked;
    this.rejectedPersons.forEach((person) => {
      person.selected = checked;
    });
  }

  toggleSelectAllApproved(checked: boolean): void {
    this.selectAllApproved = checked;
    this.approvedPersons.forEach((person) => {
      person.selected = checked;
    });
  }

  updateSelectAllState(): void {
    if (this.selectedTabIndex === 0) {
      const pendingSelectedCount = this.pendingPersons.filter(
        (p) => p.selected
      ).length;
      this.selectAllPending =
        pendingSelectedCount === this.pendingPersons.length &&
        this.pendingPersons.length > 0;
    } else if (this.selectedTabIndex === 1) {
      const rejectedSelectedCount = this.rejectedPersons.filter(
        (p) => p.selected
      ).length;
      this.selectAllRejected =
        rejectedSelectedCount === this.rejectedPersons.length &&
        this.rejectedPersons.length > 0;
    } else if (this.selectedTabIndex === 2) {
      const approvedSelectedCount = this.approvedPersons.filter(
        (p) => p.selected
      ).length;
      this.selectAllApproved =
        approvedSelectedCount === this.approvedPersons.length &&
        this.approvedPersons.length > 0;
    }
  }

  isIndeterminatePending(): boolean {
    const selectedCount = this.pendingPersons.filter((p) => p.selected).length;
    return selectedCount > 0 && selectedCount < this.pendingPersons.length;
  }

  isIndeterminateRejected(): boolean {
    const selectedCount = this.rejectedPersons.filter((p) => p.selected).length;
    return selectedCount > 0 && selectedCount < this.rejectedPersons.length;
  }

  isIndeterminateApproved(): boolean {
    const selectedCount = this.approvedPersons.filter((p) => p.selected).length;
    return selectedCount > 0 && selectedCount < this.approvedPersons.length;
  }

  hasSelectedItems(): boolean {
    switch (this.selectedTabIndex) {
      case 0:
        return this.pendingPersons.some((person) => person.selected);
      case 1:
        return this.rejectedPersons.some((person) => person.selected);
      case 2:
        return this.approvedPersons.some((person) => person.selected);
      default:
        return false;
    }
  }

  selectedCount(): number {
    switch (this.selectedTabIndex) {
      case 0:
        return this.pendingPersons.filter((person) => person.selected).length;
      case 1:
        return this.rejectedPersons.filter((person) => person.selected).length;
      case 2:
        return this.approvedPersons.filter((person) => person.selected).length;
      default:
        return 0;
    }
  }

  approveSelected(): void {
    let selectedPersons: Person[] = [];

    switch (this.selectedTabIndex) {
      case 0:
        selectedPersons = this.pendingPersons.filter((p) => p.selected);
        break;
      case 1:
        selectedPersons = this.rejectedPersons.filter((p) => p.selected);
        break;
      default:
        return;
    }

    if (selectedPersons.length === 0) return;

    const approveRequests = selectedPersons.map((person) => {
      const oldStatus = person.status;
      return this.userAccessService
        .updatePersonStatus(person.id, 'approved')
        .pipe(
          tap(() => this.showStatusChangeMessage(person, oldStatus, 'approved'))
        );
    });

    forkJoin(approveRequests).subscribe({
      next: () => {
        this.loadData();
        this.resetSelectAllStates();
      },
      error: (error) =>
        console.error('Error approving selected persons:', error),
    });
  }

  rejectSelected(): void {
    let selectedPersons: Person[] = [];

    switch (this.selectedTabIndex) {
      case 0:
        selectedPersons = this.pendingPersons.filter((p) => p.selected);
        break;
      case 2:
        selectedPersons = this.approvedPersons.filter((p) => p.selected);
        break;
      default:
        return;
    }

    if (selectedPersons.length === 0) return;

    const rejectRequests = selectedPersons.map((person) => {
      const oldStatus = person.status;
      return this.userAccessService
        .updatePersonStatus(person.id, 'rejected')
        .pipe(
          tap(() => this.showStatusChangeMessage(person, oldStatus, 'rejected'))
        );
    });

    forkJoin(rejectRequests).subscribe({
      next: () => {
        this.loadData();
        this.resetSelectAllStates();
      },
      error: (error) =>
        console.error('Error rejecting selected persons:', error),
    });
  }

  setPendingSelected(): void {
    if (this.selectedTabIndex !== 2) return;

    const selectedPersons = this.approvedPersons.filter((p) => p.selected);
    if (selectedPersons.length === 0) return;

    const pendingRequests = selectedPersons.map((person) => {
      const oldStatus = person.status;
      return this.userAccessService
        .updatePersonStatus(person.id, 'hold')
        .pipe(
          tap(() => this.showStatusChangeMessage(person, oldStatus, 'hold'))
        );
    });

    forkJoin(pendingRequests).subscribe({
      next: () => {
        this.loadData();
        this.resetSelectAllStates();
      },
      error: (error) =>
        console.error('Error setting selected persons to pending:', error),
    });
  }

  private showStatusChangeMessage(
    person: Person,
    oldStatus: string,
    newStatus: string
  ): void {
    const name = this.getFullName(person);
    const formattedOldStatus = this.formatStatus(oldStatus);
    const formattedNewStatus = this.formatStatus(newStatus);

    this.snackBar.open(
      `${name}'s status changed from ${formattedOldStatus} to ${formattedNewStatus}`,
      'Close',
      { duration: 3000 }
    );
  }

  private formatStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'hold':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }

  private resetSelectAllStates(): void {
    this.selectAllPending = false;
    this.selectAllRejected = false;
    this.selectAllApproved = false;
  }

  hasActiveFilters(): boolean {
    return Object.values(this.filters).some((value) => !!value);
  }

  resetFilters(): void {
    this.filters = {
      first_name: '',
      last_name: '',
      email_id: '',
      phone_no: '',
      user_type: '',
    };
    this.filtersApplied = false; // Add this line
    this.loadData();
    this.snackBar.open('Filters cleared', 'Close', { duration: 1000 });
  }

  filterDataByFilters(): void {
    this.loadData();
  }

  isSearchEnabled(): boolean {
    return this.hasActiveFilters();
  }

  private getCleanFilters(): any {
    const cleanFilters: any = {};
    Object.keys(this.filters).forEach((key) => {
      if (this.filters[key as keyof CaseFilters]) {
        cleanFilters[key] = this.filters[key as keyof CaseFilters];
      }
    });
    return cleanFilters;
  }

  getCurrentDataSource(): any[] {
    switch (this.selectedTabIndex) {
      case 0:
        return this.pendingPersons;
      case 1:
        return this.rejectedPersons;
      case 2:
        return this.approvedPersons;
      default:
        return [];
    }
  }
}