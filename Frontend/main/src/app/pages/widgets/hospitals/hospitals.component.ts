import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { environment } from 'src/envirnment/envirnment';
import { HospitalApiService } from './hospital-api.service';
import * as L from 'leaflet';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatDividerModule } from '@angular/material/divider';
import { HospitalDialogComponent } from './hospital-dialog/hospital-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {  ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UnidentifiedpersonApiService } from '../../datatable/unidentified-person/unidentifiedperson-api.service';

@Component({
  selector: 'app-hospitals',
 imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,
     MatInputModule,
     MatButtonModule,
     MatIconModule,
     FormsModule,ReactiveFormsModule ,
     CommonModule,MatOptionModule,RouterModule,MatDividerModule,MatSelectModule,MatProgressSpinnerModule ,MatPaginatorModule],
  templateUrl: './hospitals.component.html',
  styleUrl: './hospitals.component.scss'
})
export class HospitalsComponent implements OnInit{

  hospitalForm!: FormGroup;
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
  searchtype: string = '';
  mapp!: L.Map;
  markerr!: L.Marker | null;
  latitude: number | null = null;
  longitude: number | null = null;
  loading: boolean = false;
  environment = environment;
  allhospitals:any = []
  totalHospitalItems = 0;
  itemsPerPage = 6;
  currentPage = 1;
  allstates: string[] = [];
  alldistricts: string[] = [];
  allcities: string[] = [];
  isAdmin: boolean = false;
  isLoggedIn = false;

  constructor( private hospitalService: HospitalApiService,private fb: FormBuilder,private router :Router,private dialog: MatDialog,private missingPersonService: UnidentifiedpersonApiService){}
  
  searchFilters = {
    name: '',
    city: '',
    district: '',
    state: ''
  };

  defaultHospitalImage = 'assets/old/images/hospital_default.png'; 
  onImageError(event: any) {
  event.target.src = this.defaultHospitalImage;
}

  ngOnInit(): void {
    const userType = localStorage.getItem('user_type');
    this.isAdmin = userType === 'admin';
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;
    this.fetchHospitalData()
    this.getStates();
  }

  addhospital(): void {
    this.router.navigate(['/resources/add-hospitals']);
  }
  fetchHospitalData(): void {
  this.loading = true;
  this.hospitalService.getAllHospitals().subscribe(
    (data) => {
      if (data) {
        console.log('Data fetched:', data);  // Debugging log
        this.allhospitals = data.results;
        this.totalHospitalItems = data.count; // Ensure this is set
      }
      this.loading = false;
    },
    (error) => {
      this.loading = false;
      console.error("Error fetching hospitals:", error);
    }
  );
}

  
 onsearch(page: number = 1): void {
  this.loading = true;
  this.currentPage = page;

  const queryParams: any = {
    name: this.searchFilters.name || '',
    city: this.searchFilters.city || '',
    district: this.searchFilters.district || '',
    state: this.searchFilters.state || '',
    type: this.searchtype || '',
    page: this.currentPage,
    page_size: this.itemsPerPage
  };

  this.hospitalService.searchHospitals(queryParams).subscribe(
    (data) => {
      setTimeout(() => {
        if (data && data.results) {
          console.log('Hospital data:', data); // Debugging log
          this.allhospitals = data.results;
          this.totalHospitalItems = data.count;
        } else {
          this.allhospitals = [];
          this.totalHospitalItems = 0;
        }
        this.loading = false;
      }, 1000);
    },
    (error) => {
      setTimeout(() => {
        console.error("Error fetching hospitals:", error);
        this.allhospitals = [];
        this.totalHospitalItems = 0;
        this.loading = false;
      }, 1000);
    }
  );
}

  
  onHospitalPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1; // 0-based index
    this.itemsPerPage = event.pageSize;
    console.log('Page changed:', this.currentPage, this.itemsPerPage);  // Debugging log
    this.onsearch(this.currentPage);
  }
  
    

  seeMoreHospital(hospital: any) {
    this.dialog.open(HospitalDialogComponent, {
      width: '80%',
      maxWidth: '800px',  
      data: hospital
    });
  }

  seeMoreHospitaldata(hospital: any) {
    this.router.navigate(['/resources/hospital', hospital.id], {
      state: { hospital } 
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
