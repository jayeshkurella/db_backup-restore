import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

@Injectable({
  providedIn: 'root'
})
export class HospitalApiService {

  private apiurl =environment.apiUrl

  constructor(private http: HttpClient) {}

  // Fetch all hospitals
getAllHospitals(): Observable<any> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.error('No auth token found in localStorage!');
    return throwError(() => new Error('Unauthorized: No token found'));
  }

  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

  return this.http.get<any>(`${this.apiurl}/api/hospitals/`, { headers }).pipe(
    catchError(error => {
      console.error("Error in getAllHospitals:", error);
      return throwError(() => error);
    })
  );
}

// Add a hospital
addHospital(hospitalData: any): Observable<any> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.error('No auth token found in localStorage!');
    return throwError(() => new Error('Unauthorized: No token found'));
  }

  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

  return this.http.post<any>(`${this.apiurl}/api/hospitals/`, hospitalData, { headers }).pipe(
    catchError(error => {
      console.error("Error in addHospital:", error);
      return throwError(() => error);
    })
  );
}

}
