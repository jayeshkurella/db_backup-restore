import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

@Injectable({
  providedIn: 'root'
})
export class UnidentifiedbodyApiService {

  private apiUrl = environment.apiUrl; 
  
  constructor(private http: HttpClient) { }
  
  getPersonsByFilters(filters: any,page: number = 1): Observable<any> {
    const params = new HttpParams({ fromObject: filters });
  
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('No auth token found in localStorage!');
      return throwError(() => new Error('Unauthorized: No token found'));
    }
  
    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
  
    return this.http.get(`${this.apiUrl}/api/persons/unidentified-bodies/`, {
      params,
      headers: headers,
      observe: 'response' // Include full response for debugging
    }).pipe(
      tap(response => console.log("Response Headers:", response.headers)),
      catchError(error => {
        console.error("Error Response:", error);
        return throwError(() => error);
      })
    );
  }
  
  getStates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/api/filters_address/states/`);
  }

  // Fetch districts for a selected state
  getDistricts(state: string): Observable<string[]> {
    console.log(state)
    return this.http.get<string[]>(`${this.apiUrl}/api/filters_address/districts/?state=${state}`);
  }

  // Fetch cities for a selected district
  getCities(district: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/api/filters_address/cities/?district=${district}`);
  }

  // Fetch villages for a selected city
  getVillages(city: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/api/filters_address/villages/?city=${city}`);
  }  
}
