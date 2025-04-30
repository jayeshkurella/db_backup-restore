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

@Component({
  selector: 'app-hospitals',
 imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,
     MatInputModule,
     MatButtonModule,
     MatIconModule,
     FormsModule,ReactiveFormsModule ,
     CommonModule,MatOptionModule,RouterModule,MatDividerModule,MatSelectModule ],
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

  environment = environment;
  allhospitals:any = []
  constructor( private hospitalService: HospitalApiService,private fb: FormBuilder,private router :Router,private dialog: MatDialog){}
  
  

  ngOnInit(): void {
    this.fetchHospitalData()
  
  }

  addhospital(): void {
    this.router.navigate(['/widgets/add-hospitals']);
  }
  fetchHospitalData(): void {
    this.hospitalService.getAllHospitals().subscribe(
      (data) => {
        if (data) {
          this.allhospitals = data.results; 
        } 
      },
    );
  }

  onsearch(): void {
    const queryParams: any = {
      name: this.searchName || '',
      city: this.searchCity || '',
      district: this.searchdistrict || '',
      state: this.searchstate || '',
      type: this.searchtype || '' 

    };
    this.hospitalService.searchHospitals(queryParams).subscribe(
      (data) => {
        if (data && data.results) {
          this.allhospitals = data.results; 
        } else {
          console.log('No hospitals found');
          this.allhospitals = []; 
        }
      },
      error => {
        console.error("Error fetching hospitals:", error);
        this.allhospitals = [];  
      }
    );
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
