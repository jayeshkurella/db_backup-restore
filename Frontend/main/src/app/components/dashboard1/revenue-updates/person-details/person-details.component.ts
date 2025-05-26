import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/envirnment/envirnment';
import { MatList, MatListItem } from '@angular/material/list';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { SafeTitlecasePipe } from './safe-titlecase.pipe';

@Component({
  selector: 'app-person-details',
  imports: [MatDialogModule ,MatButtonModule ,CommonModule,MatIcon,MatCard,MatButton,MatSpinner,SafeTitlecasePipe,MatCardTitle],
  templateUrl: './person-details.component.html',
  styleUrl: './person-details.component.scss'
})
export class PersonDetailsComponent implements OnInit{
  environment = environment;
  person: any;
isLoading = false;
  constructor(private route: ActivatedRoute, private http: HttpClient,private router :Router) {}

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


 goBack(): void {
    sessionStorage.removeItem('viewData'); // ✅ Clear the stored ID
    this.router.navigate(['/']); // Navigate to the main component or home route
  }

 onImgError(event: Event, type?: string, gender?: string) {
  const imgElement = event.target as HTMLImageElement;

  if (type?.toLowerCase() === 'Unidentified Body') {
    imgElement.src = 'assets/old/images/body_default.png'; // always use default body image for body type
  } else if (gender?.toLowerCase() === 'male') {
    imgElement.src = 'assets/old/images/final_male.png';   // male default
  } else if (gender?.toLowerCase() === 'female') {
    imgElement.src = 'assets/old/images/final_female.png'; // female default
  } 
}





}
