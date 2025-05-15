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

@Component({
  selector: 'app-person-details',
  imports: [MatDialogModule ,MatButtonModule ,CommonModule,MatIcon,MatCard,MatButton,MatDivider,MatSpinner,MatDivider],
  templateUrl: './person-details.component.html',
  styleUrl: './person-details.component.scss'
})
export class PersonDetailsComponent implements OnInit{
  environment = environment;
  person: any;
isLoading = false;
  constructor(private route: ActivatedRoute, private http: HttpClient,private router :Router) {}

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.isLoading = true;
    this.http.get(`${environment.apiUrl}/api/persons/${id}/`).subscribe({
      next: data => {
        console.log('Person Data:', data);
        this.person = data;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading person data:', err);
        this.isLoading = false;
      }
    });
  } else {
    console.error('Missing or invalid ID in route');
  }
 }

 goBack(): void {
    this.router.navigate(['/dashboards/dashboard1']); // Navigate to the main component or home route
  }



}
