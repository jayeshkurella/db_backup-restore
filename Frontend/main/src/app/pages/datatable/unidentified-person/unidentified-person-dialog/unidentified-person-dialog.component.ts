import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/envirnment/envirnment';
// import { MatList, MatListItem } from '@angular/material/list';
import { MatCard} from '@angular/material/card';
// import { MatDivider } from '@angular/material/divider';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatCardTitle } from '@angular/material/card';
import { SafeTitlecasePipe } from 'src/app/components/dashboard1/revenue-updates/person-details/safe-titlecase.pipe';

@Component({
  selector: 'app-unidentified-person-dialog',
   imports: [MatDialogModule ,MatButtonModule,SafeTitlecasePipe ,CommonModule,MatCardTitle,MatIcon,MatCard,MatButton,MatSpinner],
  templateUrl: './unidentified-person-dialog.component.html',
  styleUrl: './unidentified-person-dialog.component.scss'
})
export class UnidentifiedPersonDialogComponent {

    environment = environment;
    person: any;
  isLoading = false;
    constructor(private route: ActivatedRoute, private http: HttpClient,private router :Router) {}
  
    ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
  
    if (!id) {
      console.error('Missing or invalid ID in route');
      return;
    }
  
    this.isLoading = true;
  
    this.http.get<any>(`${environment.apiUrl}/api/persons/${id}/`).subscribe({
      next: (data) => {
        console.log('Person Data:', data);
        this.person = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading person data:', err);
        this.isLoading = false;
      }
    });
  }
  
   getImageUrl(imagePath: string): string {
    return imagePath ? `${environment.apiUrl}${imagePath}` : 'assets/old/images/Chhaya.png';
  }
  
  
  
   goBack(): void {
      this.router.navigate(['/datatable/unidentified-person']); // Navigate to the main component or home route
    }
  

}