import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

@Injectable({
  providedIn: 'root'
})
export class MapApiService {

  environment = environment.apiUrl

  constructor(private http:HttpClient) { }

   // Fetch all states
   getStates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.environment}/api/filters_address/states/`);
  }

  // Fetch districts for a selected state
  getDistricts(state: string): Observable<string[]> {
    console.log(state)
    return this.http.get<string[]>(`${this.environment}/api/filters_address/districts/?state=${state}`);
  }

  // Fetch cities for a selected district
  getCities(district: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.environment}/api/filters_address/cities/?district=${district}`);
  }

  // Fetch villages for a selected city
  getVillages(city: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.environment}/api/filters_address/villages/?city=${city}`);
  }

}
