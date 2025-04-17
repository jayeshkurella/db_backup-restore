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

@Component({
  selector: 'app-hospitals',
 imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,
     MatInputModule,
     MatButtonModule,
     MatIconModule,
     FormsModule,
     CommonModule,MatOptionModule,RouterModule,MatDividerModule],
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
          console.log("data",this.allhospitals)
        } 
      },
    );
  }


  seeMoreHospital(hospital: any) {
    this.dialog.open(HospitalDialogComponent, {
      width: '80%',
      maxWidth: '800px',  
      data: hospital
    });
  }
  
}
