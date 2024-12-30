import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class PoliceStationaoiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getallpolicestations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}police-stations/`);
  }
  
  getallstates(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}StateList/`);
  }

  getallcities(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}CitiesList/`);
  }

  getalldistricts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}districtList/`);
  }

  getallmarital(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}maritallist/`);
  }
}
