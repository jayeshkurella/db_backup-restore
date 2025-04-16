import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TablerIconsModule } from 'angular-tabler-icons';
import * as L from 'leaflet';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { environment } from 'src/envirnment/envirnment';
import { PoliceStationApiService } from './police-station-api.service';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { Router, RouterModule } from '@angular/router';
import { PoliceStatioDialogComponent } from './police-statio-dialog/police-statio-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-police-station',
  imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CommonModule,MatOptionModule,RouterModule],
  templateUrl: './police-station.component.html',
  styleUrl: './police-station.component.scss'
})
export class PoliceStationComponent implements OnInit {
  
  policeStationForm!: FormGroup;

  environment = environment;
  selectedPoliceStation: any = null;
  total_policestation: any;
  selectedPerson: any = null;
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  searchQuery: string = '';  
  searchName: string = '';
  searchCity: string = '';
  searchstate: string = '';
  searchdistrict: string = '';
  mapp!: L.Map;
  markerr!: L.Marker | null;
  latitude: number | null = null;
  longitude: number | null = null;
  markerMissing: any; 
  constructor(private policeapi:PoliceStationApiService,private fb: FormBuilder ,private router: Router,private dialog: MatDialog) { }

 

  ngOnInit(): void {
    this.getallPolicestation(1);
  }
 



  navigateToAddStation(): void {
    this.router.navigate(['/widgets/add-police-station']);
  }
  

  

  getallPolicestation(page:any): void { 
    this.policeapi.searchPoliceStations(page).subscribe(
      (res: any) => {
        if (res && res.results && Array.isArray(res.results)) {
          this.total_policestation = res.results;  
          console.log('Police stations found:', this.total_policestation);
        } else {
          console.log('No police stations found');
          this.total_policestation = [];
        }
      },
      error => {
        console.error("Error fetching police stations:", error);
        this.total_policestation = [];  
      }
    );
  }
  
  onSearch(): void {
    const queryParams: any = {
      name: this.searchName || '',
      city: this.searchCity || '',
      district: this.searchdistrict || '',
      state: this.searchstate || ''
    };
  
    this.policeapi.searchPoliceStations(queryParams).subscribe(
      (res: any) => {
        if (res && res.results) {  // ✅ Fixed: Using res.results instead of res.data
          console.log("Filtered Police Stations:", res.results);
          this.total_policestation = res.results;
        } else {
          console.log("No police stations found.");
          this.total_policestation = [];
        }
      },
      error => {
        console.error('Error during search:', error);
        this.total_policestation = [];
      }
    );
  }
  seeMores(police: any) {
    this.dialog.open(PoliceStatioDialogComponent, {
      width: '800px', // or '90vw' for responsive full width
      maxWidth: '80vw', // Optional: cap the max width for very large screens
      data: police
    });
  
  
  
  }
}