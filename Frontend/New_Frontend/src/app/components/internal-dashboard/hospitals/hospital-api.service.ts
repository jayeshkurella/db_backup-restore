import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class HospitalApiService {

  private apiurl =environment.apiUrl

  constructor(private http: HttpClient) {}

  // to get all data
  getallhospitals():Observable<any>{
   return this.http.get<any>(`${this.apiurl+'api/hospitals/'}`);
   }

   addHospital(hospitalData: any): Observable<any> {
    return this.http.post<any>(`${this.apiurl + 'api/hospitals/'}`, hospitalData);
  }
  
}
