import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class MainDashboardServiceService {
  environment = environment.apiUrl

  constructor(private http:HttpClient) { }

   // Fetch all states
   getStates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.environment}filters_address/states/`);
  }

  // Fetch districts for a selected state
  getDistricts(state: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.environment}filters_address/districts/?state=${state}`);
  }

  // Fetch cities for a selected district
  getCities(district: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.environment}filters_address/cities/?district=${district}`);
  }

  // Fetch villages for a selected city
  getVillages(city: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.environment}filters_address/villages/?city=${city}`);
  }

  
}
