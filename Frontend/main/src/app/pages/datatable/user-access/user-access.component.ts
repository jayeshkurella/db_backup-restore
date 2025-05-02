import { Component, OnInit } from '@angular/core';
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
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserAccessServiceService } from './user-access-service.service';
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
//   registered_at?: string;
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
    DatePipe
  ],
  templateUrl: './user-access.component.html',
  styleUrl: './user-access.component.scss'
})
export class UserAccessComponent implements OnInit {
  displayedColumns: string[] = ['full_name', 'email_id', 'phone', 'user_type', 'sub_user_type', 'status', 'status_updated_by', 'actions'];
  displayedColumnsWithSelect = ['select', ...this.displayedColumns];
  pendingPersons: Person[] = [];
  rejectedPersons: Person[] = [];
  approvedPersons: Person[] = [];
  isLoading: boolean = true;
  pendingCount: number = 0;
  rejectedCount: number = 0;
  approvedCount: number = 0;
  selectedTabIndex = 0;
  selectAllPending: boolean = false;
  selectAllRejected: boolean = false;
  selectAllApproved: boolean = false;

  constructor(
    private pendingService: UserAccessServiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.pendingPersons = [];
    this.rejectedPersons = [];
    this.approvedPersons = [];
    this.resetSelectAllStates();
  
    this.pendingService.getPendingData().subscribe({
      next: (response: any) => {
        if (response) {
          this.pendingPersons = response.pending_data.map((person: any) => ({
            ...person,
            selected: false,
            status: person.status || 'hold'
          }));
          
          this.rejectedPersons = response.rejected_data.map((person: any) => ({
            ...person,
            selected: false,
            status: person.status || 'rejected'
          }));
  
          this.approvedPersons = response.approved_data.map((person: any) => ({
            ...person,
            selected: false,
            status: person.status || 'approved'
          }));
  
          this.pendingCount = response.counts?.hold || 0;
          this.approvedCount = response.counts?.approved || 0;
          this.rejectedCount = response.counts?.rejected || 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.pendingPersons = [];
        this.rejectedPersons = [];
        this.approvedPersons = [];
        this.pendingCount = 0;
        this.rejectedCount = 0;
        this.approvedCount = 0;
        this.isLoading = false;
      }
    });
  }

  getFullName(person: Person): string {
    return `${person.first_name} ${person.last_name}`.trim();
  }

  getPhoneNumber(person: Person): string {
    return ` ${person.phone_no}`;
  }
  //   getPhoneNumber(person: Person): string {
//     return `${person.country_code} ${person.phone_no}`;
//   }

  approvePerson(person: Person): void {
    const oldStatus = person.status;
    this.pendingService.updatePersonStatus(person.id, 'approved').subscribe({
      next: () => {
        this.loadData();
        this.showStatusChangeMessage(person, oldStatus, 'approved');
      },
      error: (error) => console.error('Error approving person:', error)
    });
  }

  rejectPerson(person: Person): void {
    const oldStatus = person.status;
    this.pendingService.updatePersonStatus(person.id, 'rejected').subscribe({
      next: () => {
        this.loadData();
        this.showStatusChangeMessage(person, oldStatus, 'rejected');
      },
      error: (error) => console.error('Error rejecting person:', error)
    });
  }

  setPersonPending(person: Person): void {
    const oldStatus = person.status;
    this.pendingService.updatePersonStatus(person.id, 'hold').subscribe({
      next: () => {
        this.loadData();
        this.showStatusChangeMessage(person, oldStatus, 'hold');
      },
      error: (error) => console.error('Error setting person to pending:', error)
    });
  }

  getCurrentDataSource() {
    switch(this.selectedTabIndex) {
      case 0: return this.pendingPersons;
      case 1: return this.rejectedPersons;
      case 2: return this.approvedPersons;
      default: return this.pendingPersons;
    }
  }

  toggleSelectAllPending(checked: boolean): void {
    this.selectAllPending = checked;
    this.pendingPersons.forEach(person => {
      person.selected = checked;
    });
  }

  toggleSelectAllRejected(checked: boolean): void {
    this.selectAllRejected = checked;
    this.rejectedPersons.forEach(person => {
      person.selected = checked;
    });
  }

  toggleSelectAllApproved(checked: boolean): void {
    this.selectAllApproved = checked;
    this.approvedPersons.forEach(person => {
      person.selected = checked;
    });
  }

  updateSelectAllState(): void {
    if (this.selectedTabIndex === 0) {
      const pendingSelectedCount = this.pendingPersons.filter(p => p.selected).length;
      this.selectAllPending = pendingSelectedCount === this.pendingPersons.length && this.pendingPersons.length > 0;
    } else if (this.selectedTabIndex === 1) {
      const rejectedSelectedCount = this.rejectedPersons.filter(p => p.selected).length;
      this.selectAllRejected = rejectedSelectedCount === this.rejectedPersons.length && this.rejectedPersons.length > 0;
    } else if (this.selectedTabIndex === 2) {
      const approvedSelectedCount = this.approvedPersons.filter(p => p.selected).length;
      this.selectAllApproved = approvedSelectedCount === this.approvedPersons.length && this.approvedPersons.length > 0;
    }
  }

  isIndeterminatePending(): boolean {
    const selectedCount = this.pendingPersons.filter(p => p.selected).length;
    return selectedCount > 0 && selectedCount < this.pendingPersons.length;
  }

  isIndeterminateRejected(): boolean {
    const selectedCount = this.rejectedPersons.filter(p => p.selected).length;
    return selectedCount > 0 && selectedCount < this.rejectedPersons.length;
  }

  isIndeterminateApproved(): boolean {
    const selectedCount = this.approvedPersons.filter(p => p.selected).length;
    return selectedCount > 0 && selectedCount < this.approvedPersons.length;
  }

  hasSelectedItems(): boolean {
    switch(this.selectedTabIndex) {
      case 0: return this.pendingPersons.some(person => person.selected);
      case 1: return this.rejectedPersons.some(person => person.selected);
      case 2: return this.approvedPersons.some(person => person.selected);
      default: return false;
    }
  }

  selectedCount(): number {
    switch(this.selectedTabIndex) {
      case 0: return this.pendingPersons.filter(person => person.selected).length;
      case 1: return this.rejectedPersons.filter(person => person.selected).length;
      case 2: return this.approvedPersons.filter(person => person.selected).length;
      default: return 0;
    }
  }

  approveSelected(): void {
    let selectedPersons: Person[] = [];
    
    switch(this.selectedTabIndex) {
      case 0: 
        selectedPersons = this.pendingPersons.filter(p => p.selected);
        break;
      case 1:
        selectedPersons = this.rejectedPersons.filter(p => p.selected);
        break;
      default:
        return;
    }

    if (selectedPersons.length === 0) return;

    const approveRequests = selectedPersons.map(person => {
      const oldStatus = person.status;
      return this.pendingService.updatePersonStatus(person.id, 'approved').pipe(
        tap(() => this.showStatusChangeMessage(person, oldStatus, 'approved'))
      );
    });

    forkJoin(approveRequests).subscribe({
      next: () => {
        this.loadData();
        this.resetSelectAllStates();
      },
      error: (error) => console.error('Error approving selected persons:', error)
    });
  }

  rejectSelected(): void {
    let selectedPersons: Person[] = [];
    
    switch(this.selectedTabIndex) {
      case 0: 
        selectedPersons = this.pendingPersons.filter(p => p.selected);
        break;
      case 2:
        selectedPersons = this.approvedPersons.filter(p => p.selected);
        break;
      default:
        return;
    }

    if (selectedPersons.length === 0) return;

    const rejectRequests = selectedPersons.map(person => {
      const oldStatus = person.status;
      return this.pendingService.updatePersonStatus(person.id, 'rejected').pipe(
        tap(() => this.showStatusChangeMessage(person, oldStatus, 'rejected'))
      );
    });

    forkJoin(rejectRequests).subscribe({
      next: () => {
        this.loadData();
        this.resetSelectAllStates();
      },
      error: (error) => console.error('Error rejecting selected persons:', error)
    });
  }
  
  setPendingSelected(): void {
    if (this.selectedTabIndex !== 2) return;

    const selectedPersons = this.approvedPersons.filter(p => p.selected);
    if (selectedPersons.length === 0) return;

    const pendingRequests = selectedPersons.map(person => {
      const oldStatus = person.status;
      return this.pendingService.updatePersonStatus(person.id, 'hold').pipe(
        tap(() => this.showStatusChangeMessage(person, oldStatus, 'hold'))
      );
    });

    forkJoin(pendingRequests).subscribe({
      next: () => {
        this.loadData();
        this.resetSelectAllStates();
      },
      error: (error) => console.error('Error setting selected persons to pending:', error)
    });
  }

  private showStatusChangeMessage(person: Person, oldStatus: string, newStatus: string): void {
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
    switch(status.toLowerCase()) {
      case 'hold': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  }

  private resetSelectAllStates(): void {
    this.selectAllPending = false;
    this.selectAllRejected = false;
    this.selectAllApproved = false;
  }

}