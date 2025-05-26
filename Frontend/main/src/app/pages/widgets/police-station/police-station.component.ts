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
import { UnidentifiedpersonApiService } from '../../datatable/unidentified-person/unidentifiedperson-api.service';
import { MatSelectModule } from '@angular/material/select';
import { StateAbbreviationPipe } from 'src/app/components/dashboard1/revenue-updates/person-details/safe-titlecase.pipe';

@Component({
  selector: 'app-police-station',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,StateAbbreviationPipe,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CommonModule,MatOptionModule,RouterModule,MatProgressSpinnerModule,MatPaginatorModule,MatSelectModule ],
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
  
  isAdmin: boolean = false;
  isLoggedIn = false;


  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 4;
  allstates: string[] = [];
  alldistricts: string[] = [];
  allcities: string[] = [];
  constructor(private policeapi:PoliceStationApiService,private fb: FormBuilder ,private router: Router,private dialog: MatDialog,private missingPersonService: UnidentifiedpersonApiService) { }

 

  ngOnInit(): void {
    const userType = localStorage.getItem('user_type');
    this.isAdmin = userType === 'admin';
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;
    this.getStates();

    this.getallPolicestation(1);
  }
 



  navigateToAddStation(): void {
    this.router.navigate(['/resources/add-police-station']);
  }
  
  defaultHospitalImage = 'assets/old/images/polices_default.jpeg'; 
  
onImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = this.defaultHospitalImage;
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
    // No need to reassign searchFilters - it's already bound to the form
    this.getallPolicestation(this.currentPage);
  }
  
  resetFilters(): void {
  this.searchFilters = {
    name: '',
    state: '',
    district: '',
    city: ''
  };
  // this.onSearch(); 
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
    this.router.navigate(['/resources/police-station-detail/', policestation.id], {
      state: { policestation  } 
    });
  }

  getStates() {
    this.missingPersonService.getStates().subscribe(states => {
      this.allstates = states;
    });
  }
  onStateChange() {
    this.searchFilters.district = '';
    this.searchFilters.city = '';
    this.alldistricts = [];
    this.allcities = [];

    if (this.searchFilters.state) {
      this.missingPersonService.getDistricts(this.searchFilters.state).subscribe(districts => {
        this.alldistricts = districts;
      });
    }
  }
  onDistrictChange() {
    this.searchFilters.city = '';
    this.allcities = [];

    if (this.searchFilters.district) {
      this.missingPersonService.getCities(this.searchFilters.district).subscribe(cities => {
        this.allcities = cities;
      });
    }
  }
}