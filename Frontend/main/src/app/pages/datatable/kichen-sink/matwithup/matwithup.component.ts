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
  viewDetails(_t185: any) {
    throw new Error('Method not implemented.');
  }
  confirmMatch(_t185: any) {
    throw new Error('Method not implemented.');
  }
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
  dataSourceMatches = new MatTableDataSource();
  dataSourcePrevious = new MatTableDataSource(); 

  constructor(private route: ActivatedRoute,
    private matchapi: MissingPersonApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadMatchData();
    if (this.matchData?.newly_matched?.length > 0) {
      this.dataSourceMatches.data = this.matchData.newly_matched;
    }
  }

  loadMatchData(): void {
    this.matchData = history.state.data || {
      newly_matched: [],
      previously_matched: [],
      rejected: [],
      confirmed: [],
      missing_person: {}
    };
    this.setUUIDFromMissingPerson();
      // Set data sources only after matchData is initialized
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





}




































