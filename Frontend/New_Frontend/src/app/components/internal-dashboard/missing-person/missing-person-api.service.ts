import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class MissingPersonApiService {

  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  getPersonsByFilters(filters: any): Observable<any> {
    const params = new HttpParams({ fromObject: filters }); // Convert object to query params
    return this.http.get(`${this.apiUrl}api/persons/missing-persons/`, { params });
  }
  getStates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/filters_address/states/`);
  }

  // Fetch districts for a selected state
  getDistricts(state: string): Observable<string[]> {
    console.log(state)
    return this.http.get<string[]>(`${this.apiUrl}api/filters_address/districts/?state=${state}`);
  }

  // Fetch cities for a selected district
  getCities(district: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/filters_address/cities/?district=${district}`);
  }

  // Fetch villages for a selected city
  getVillages(city: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/filters_address/villages/?city=${city}`);
  }  
  
  

}

