import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

@Injectable({
  providedIn: 'root'
})
export class HospitalApiService {

  private apiurl =environment.apiUrl

  constructor(private http: HttpClient) {}

  searchHospitals(queryParams: any): Observable<any> {
    let params = new HttpParams()
      .set('name', queryParams.name || '')
      .set('city', queryParams.city || '')
      .set('district', queryParams.district || '')
      .set('state', queryParams.state || '')
      .set('type', queryParams.type || '')
      .set('page', queryParams.page || 1)
      .set('page_size', queryParams.page_size );  // default fallback
  
    return this.http.get<any>(`${this.apiurl}/api/hospitals/`, { params }).pipe(
      catchError(error => {
        console.error("Error in searchHospitals:", error);
        return throwError(() => error);
      })
    );
  }
  
  getAllHospitals(): Observable<any> {
    return this.http.get<any>(`${this.apiurl}/api/hospitals/`).pipe(
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
