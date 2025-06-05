import { Component, OnInit } from '@angular/core';
import { HospitalAPIService } from './hospital-api.service';
import { environment } from 'src/envirnments/envirnment';

@Component({
  selector: 'app-hospitals',
  templateUrl: './hospitals.component.html',
  styleUrls: ['./hospitals.component.css']
})
export class HospitalsComponent implements OnInit {
seeMoreHospital(_t9: any) {
throw new Error('Method not implemented.');
}
  environment =environment
  allhospitals:any = []
  constructor( private hospitalService: HospitalAPIService){}
  ngOnInit(): void {
    this.fetchHospitalData()
  }

  fetchHospitalData(): void {
    this.hospitalService.getallhospitals().subscribe(
      (data) => {
        if (data) {
          this.allhospitals = data.res; 
          console.log("data",this.allhospitals)
        } 
      },
    );
  }

}
