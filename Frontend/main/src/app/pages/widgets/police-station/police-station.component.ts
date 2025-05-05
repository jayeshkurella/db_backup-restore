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
import { delay } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-police-station',
  imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CommonModule,MatOptionModule,RouterModule,MatProgressSpinnerModule,MatPaginatorModule ],
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

  searchFilters = {
    name: '',
    city: '',
    district: '',
    state: ''
  };
  

  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 5; // Adjust as needed
  constructor(private policeapi:PoliceStationApiService,private fb: FormBuilder ,private router: Router,private dialog: MatDialog) { }

 

  ngOnInit(): void {
    this.getallPolicestation(1);
  }
 



  navigateToAddStation(): void {
    this.router.navigate(['/widgets/add-police-station']);
  }
  

  

  loading: boolean = false;

  getallPolicestation(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;
  
    const queryParams: any = {
      name: this.searchFilters.name || '',
      city: this.searchFilters.city || '',
      district: this.searchFilters.district || '',
      state: this.searchFilters.state || '',
      page: this.currentPage
    };
  
    this.policeapi.searchPoliceStations(queryParams).subscribe(
      (res: any) => {
        this.total_policestation = res.results || [];
        this.totalItems = res.count || 0;
        this.loading = false;
      },
      error => {
        console.error("Error fetching police stations:", error);
        this.total_policestation = [];
        this.totalItems = 0;
        this.loading = false;
      }
    );
  }
  
  
  
  // Modified search method
  onSearch(): void {
    this.currentPage = 1;
    this.searchFilters = {
      name: this.searchName || '',
      city: this.searchCity || '',
      district: this.searchdistrict || '',
      state: this.searchstate || ''
    };
    this.getallPolicestation(this.currentPage);
  }
  
  
  
  // Pagination event handler
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
  
    this.getallPolicestation(this.currentPage);
  }
  

  seeMores(police: any) {
    this.dialog.open(PoliceStatioDialogComponent, {
      width: '800px', 
      maxWidth: '80vw', 
    });
  }


  seeMorepolicestationdata(policestation: any) {
    console.log('policesstation', policestation),
    this.router.navigate(['/widgets/police-station-detail/', policestation.id], {
      state: { policestation  } 
    });
  }
}