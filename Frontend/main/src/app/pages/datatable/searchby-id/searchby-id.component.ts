import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from 'src/envirnment/envirnment';
import { IdserviceService } from './idservice.service';
import { Router } from '@angular/router';
import { SafeTitlecasePipe } from 'src/app/components/dashboard1/revenue-updates/person-details/safe-titlecase.pipe';
import { MatDivider } from '@angular/material/divider';
// import { MatListItem } from '@angular/material/list';
// import { MatList } from '@angular/material/list';
// import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-searchby-id',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SafeTitlecasePipe,
    MatDivider
  ],  templateUrl: './searchby-id.component.html',
  styleUrl: './searchby-id.component.scss'
})
export class SearchbyIDComponent {
    environment = environment
  caseId: string = '';
  caseData: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private caseService: IdserviceService,
    private snackBar: MatSnackBar,
     private router: Router
  ) {}

  searchCase() {
    if (!this.caseId) {
      this.snackBar.open('Please enter a case ID', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.caseData = null;
    this.errorMessage = '';

    this.caseService.searchCase(this.caseId).subscribe({
      next: (response) => {
        this.caseData = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to fetch case details';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
      }
    });
  }
  getImageUrl(imagePath: string): string {
  const fullPath = imagePath ? `${environment.apiUrl}${imagePath}` : 'assets/old/images/Chhaya.png';
  return fullPath;
  }

  // goBack(): void {
  //   this.router.navigate(['datatable/missing-person']);
  // }

}
