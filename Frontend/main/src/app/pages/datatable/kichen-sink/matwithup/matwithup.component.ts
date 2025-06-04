import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MissingPersonApiService } from '../missing-person-api.service';
import { MatDivider } from '@angular/material/divider';
import { RejectDialogComponent } from './reject-dialog/reject-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UnrejectDialogComponent } from './unreject-dialog/unreject-dialog.component';
import { environment } from 'src/envirnment/envirnment';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatchDataStoreService } from './match-data-store.service';

@Component({
  selector: 'app-matwithup',
  imports: [
    MatToolbarModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatButton,
    TablerIconsModule,
    MatTableModule,
  ],
  templateUrl: './matwithup.component.html',
  styleUrl: './matwithup.component.scss'
})
export class MatwithupComponent implements OnInit {



  matchData: any;
  uuid: string = '';
  match_id: string = '';
  rejectReason: string = '';
  environment = environment.ImgUrlss
  displayedColumnsMatches: string[] = [
    'score',
    'full_name',
    'age_range',
    'gender',
    'reported_date',
    'location',
    'actions',
  ];
  previousDisplayedColumns: string[] = [
    'score',
    'full_name',
    'age_range',
    'gender',
    'reported_date',
    'location',
    'actions',
  ];
  rejectedDisplayedColumns = ['score', 'full_name', 'age_range', 'gender', 'reported_date', 'location', 'reject_reason', 'actions'];
  confirmedDisplayedColumns = ['score', 'full_name', 'age_range', 'gender', 'reported_date', 'location', 'confirmed_date', 'actions'];

  dataSourceMatches = new MatTableDataSource();
  dataSourcePrevious = new MatTableDataSource();

  constructor(private route: ActivatedRoute,
    private matchapi: MissingPersonApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private matchDataStore: MatchDataStoreService) { }

  ngOnInit(): void {
    this.loadMatchData();
    if (this.matchData?.newly_matched?.length > 0) {
      this.dataSourceMatches.data = this.matchData.newly_matched;
    }
  }

  viewDetails(matchData: any) {
    console.log("data", matchData);

    const personId = matchData?.person?.id;

    if (!personId) {
      console.error('Person ID is undefined', matchData);
      return;
    }

    this.router.navigate(['search/match-details', personId], { state: { person: matchData.person } });
  }





  // loadMatchData(): void {
  //   this.matchData = history.state.data || {
  //     newly_matched: [],
  //     previously_matched: [],
  //     rejected: [],
  //     confirmed: [],
  //     missing_person: {}
  //   };
  //   this.setUUIDFromMissingPerson();
  //   // Set data sources only after matchData is initialized
  //   this.dataSourceMatches.data = this.matchData.newly_matched || [];
  //   this.dataSourcePrevious.data = this.matchData.previously_matched || [];

  //   this.cdr.detectChanges();
  // }

  loadMatchData(): void {
  this.matchData = history.state.data || this.matchDataStore.get() || {
    newly_matched: [],
    previously_matched: [],
    rejected: [],
    confirmed: [],
    missing_person: {}
  };

  this.matchDataStore.set(this.matchData);
    this.setUUIDFromMissingPerson(); 


  this.dataSourceMatches.data = this.matchData.newly_matched || [];
  this.dataSourcePrevious.data = this.matchData.previously_matched || [];
   this.cdr.detectChanges();
}

  onMatchWithUP(uuid: string): void {
    this.matchapi.matchMissingPersonWithUP(uuid).subscribe({
      next: response => {
        const resultData = response.body;
        history.state.data = resultData;
        this.loadMatchData();
      },
      error: err => {
        console.error('Failed to match with UP:', err);
      }
    });
  }


  setUUIDFromMissingPerson(): void {
    this.uuid = this.matchData?.missing_person?.id || '';
  }
  goBack(): void {
    this.router.navigate(['search/missing-person']);
  }


  // Method to call the reject match API
  onRejectMatch(match_id: string): void {
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '400px',
      data: { match_id }
    });
    dialogRef.afterClosed().subscribe((reason: string) => {
      if (reason) {
        this.matchapi.rejectMatchWithUP(this.uuid, match_id, reason).subscribe({
          next: (response) => {
            console.log('Match rejected successfully:', response);
            this.onMatchWithUP(this.uuid)
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Failed to reject match:', err);
          }
        });
      } else {
        console.log('Reject dialog was closed without a reason.');
      }
    });
  }

  onUnrejectMatch(match_id: string): void {
    const dialogRef = this.dialog.open(UnrejectDialogComponent, {
      width: '400px',
      data: { match_id }
    });
    dialogRef.afterClosed().subscribe((unrejectReason: string) => {
      if (unrejectReason) {
        this.matchapi.rejectUnrejectMatchWithUP(this.uuid, match_id, unrejectReason).subscribe({
          next: (response) => {
            console.log('Match un-rejected successfully:', response);
            this.onMatchWithUP(this.uuid)
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Failed to un-reject match:', err);
          }
        });
      } else {
        console.log('Unreject dialog was closed without a reason.');
      }
    });
  }


  confirmMatch(match_id: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirm Match',
        message: 'Are you sure you want to confirm this match?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        showNote: true,
        match_id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        const confirmationNote = result.note || '';
        this.matchapi.confirmMatchWithUP(
          this.uuid,
          match_id,
          confirmationNote
        ).subscribe({
          next: (response) => {
            this.snackBar.open('Match confirmed successfully!', 'Close', { duration: 1000 });
            this.onMatchWithUP(this.uuid)
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error confirming match:', err);
            this.snackBar.open('Error confirming match', 'Close', { duration: 1000 });
          }
        });
      }
    });
  }

  onUnconfirmMatch(uuid: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Unconfirm Match',
        message: 'Are you sure you want to unconfirm this match?',
        confirmText: 'Unconfirm',
        cancelText: 'Cancel',
        showNote: true,
        noteLabel: 'Reason for unconfirming',
        uuid
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        const unconfirmReason = result.note || '';
        this.matchapi.unconfirmMatchWithUP(
          this.uuid,
          unconfirmReason
        ).subscribe({
          next: (response) => {
            this.onMatchWithUP(this.uuid)
            this.snackBar.open('Match unconfirmed successfully!', 'Close', { duration: 1000 });
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error unconfirming match:', err);
            this.snackBar.open('Error unconfirming match', 'Close', { duration: 1000 });
          }
        });
      }
    });
  }


}




































