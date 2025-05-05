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
  itemsPerPage = 5;
  currentPage = 1;
  constructor( private hospitalService: HospitalApiService,private fb: FormBuilder,private router :Router,private dialog: MatDialog){}
  
  

  ngOnInit(): void {
    this.fetchHospitalData()
  
  }

  addhospital(): void {
    this.router.navigate(['/widgets/add-hospitals']);
  }
  fetchHospitalData(): void {
    this.loading = true;
    this.hospitalService.getAllHospitals().subscribe(
      (data) => {
        setTimeout(() => {
          if (data) {
            console.log('Data fetched:', data);  // Debugging log
            this.allhospitals = data.results;
            this.totalHospitalItems = data.count; // Ensure this is set
          }
          this.loading = false;
        }, 2000); // 2-second delay
      },
      (error) => {
        setTimeout(() => {
          this.loading = false;
          console.error("Error fetching hospitals:", error);
        }, 2000);
      }
    );
  }
  
  onsearch(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;
  
    const queryParams: any = {
      name: this.searchName || '',
      city: this.searchCity || '',
      district: this.searchdistrict || '',
      state: this.searchstate || '',
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
    this.router.navigate(['/widgets/hospital', hospital.id], {
      state: { hospital } 
    });
  }
  
  
}
