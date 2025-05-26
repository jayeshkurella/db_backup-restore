import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/envirnment/envirnment';
// import { MatList, MatListItem } from '@angular/material/list';
import { MatCard } from '@angular/material/card';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatCardTitle } from '@angular/material/card';
import { SafeTitlecasePipe } from 'src/app/components/dashboard1/revenue-updates/person-details/safe-titlecase.pipe';

@Component({
  selector: 'app-unidentified-bodies-dialog',
  imports: [MatDialogModule, SafeTitlecasePipe, MatCardTitle, MatButtonModule, CommonModule, MatIcon, MatCard, MatButton, MatSpinner],
  templateUrl: './unidentified-bodies-dialog.component.html',
  styleUrl: './unidentified-bodies-dialog.component.scss'
})
export class UnidentifiedBodiesDialogComponent {

  environment = environment;
  person: any;
  isLoading = false;
  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

  //   ngOnInit(): void {
  //   const id = this.route.snapshot.paramMap.get('id');

  //   if (!id) {
  //     console.error('Missing or invalid ID in route');
  //     return;
  //   }

  //   this.isLoading = true;

  //   this.http.get<any>(`${environment.apiUrl}/api/persons/${id}/`).subscribe({
  //     next: (data) => {
  //       console.log('Person Data:', data);
  //       this.person = data;
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       console.error('Error loading person data:', err);
  //       this.isLoading = false;
  //     }
  //   });
  // }

  ngOnInit(): void {
    const stored = sessionStorage.getItem('viewData');
    const id = stored ? JSON.parse(stored).id : null;

    if (!id) {
      console.error('Missing ID to load person details');
      this.router.navigate(['/search-by-id']); // or any fallback page
      return;
    }

    this.isLoading = true;

    this.http.get<any>(`${environment.apiUrl}/api/persons/${id}/`).subscribe({
      next: (data) => {
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
    return imagePath ? `${environment.ImgUrlss}${imagePath}` : '/assets/old/images/Chhaya.png';
  }



  goBack(): void {
    sessionStorage.removeItem('viewData'); // ✅ Clear the stored ID
    this.router.navigate(['/search/unidentified-bodies']); // Navigate to the main component or home route
  }


  getPhotoUrl(person: any): string {
    const type = person?.type;

    if (type === 'Unidentified Body') {
      return 'assets/old/images/body_default.jpeg'; // Default for Unidentified Body
    }

    return 'assets/old/images/body_default.jpeg'; // Default for everyone else
  }

}