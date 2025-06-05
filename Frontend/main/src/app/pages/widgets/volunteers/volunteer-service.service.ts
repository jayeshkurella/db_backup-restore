import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

@Injectable({
  providedIn: 'root'
})
export class VolunteerServiceService {

  private apiurl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getVolunteers(page: any = 1): Observable<any> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('No auth token found in localStorage!');
      return throwError(() => new Error('Unauthorized: No token found'));
    }
  
    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
  
    return this.http.get(`${this.apiurl}/api/volunteers/?page=${page}`, { headers }).pipe(
      catchError(error => {
        console.error("Error in getVolunteers:", error);
        return throwError(() => error);
      })
    );
  }
  getVolunteerById(id: string): Observable<any> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('No auth token found in localStorage!');
      return throwError(() => new Error('Unauthorized: No token found'));
    }
  
    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
    return this.http.get(`${this.apiurl}/api/volunteers/${id}`, { headers }).pipe(
      catchError(error => {
        console.error("Error fetching volunteer:", error);
        return throwError(() => error);
      })
    );
  }

}
