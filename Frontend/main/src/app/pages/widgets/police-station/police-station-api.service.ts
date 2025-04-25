import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

@Injectable({
  providedIn: 'root'
})
export class PoliceStationApiService {

  private apiurl = environment.apiUrl

  constructor(private http:HttpClient) { }


 // Search police stations with filters
searchPoliceStations(queryParams: any): Observable<any> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.error('No auth token found in localStorage!');
    return throwError(() => new Error('Unauthorized: No token found'));
  }

  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

  const params = new HttpParams()
    .set('name', queryParams.name || '')
    .set('city', queryParams.city || '')
    .set('district', queryParams.district || '')
    .set('state', queryParams.state || '');

  return this.http.get<any>(`${this.apiurl}/api/police-stations/`, { headers, params }).pipe(
    catchError(error => {
      console.error("Error in searchPoliceStations:", error);
      return throwError(() => error);
    })
  );
}

// Add a new police station
addPoliceStation(data: any): Observable<any> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.error('No auth token found in localStorage!');
    return throwError(() => new Error('Unauthorized: No token found'));
  }

  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

  return this.http.post(`${this.apiurl}/api/police-stations/`, data, { headers }).pipe(
    catchError(error => {
      console.error("Error in addPoliceStation:", error);
      return throwError(() => error);
    })
  );
}

// Fetch all police stations (with pagination)
getAllPoliceStations(page: any): Observable<any> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.error('No auth token found in localStorage!');
    return throwError(() => new Error('Unauthorized: No token found'));
  }

  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

  return this.http.get(`${this.apiurl}/api/police-stations/?page=${page}`, { headers }).pipe(
    catchError(error => {
      console.error("Error in getAllPoliceStations:", error);
      return throwError(() => error);
    })
  );
}

}
