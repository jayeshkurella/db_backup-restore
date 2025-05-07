import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CasesApprovalService {
  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) {}
  getPendingData(): Observable<any> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      return throwError(() => new Error('Unauthorized: No token found'));
    }
    
    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
    return this.http.get(`${this.apiUrl}/api/persons/pending_or_rejected/`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching pending data:', error);
        return throwError(() => error);
      })
    );
  }

  updatePersonStatus(id: string, status: string, reason?: string): Observable<any> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      return throwError(() => new Error('Unauthorized: No token found'));
    }
  
    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
  
    if (status === 'on_hold') {
      return this.http.post<any>(
        `${this.apiUrl}/api/persons/${id}/hold_person/`, 
        { reason },
        { headers }
      ).pipe(
        map(response => ({
          ...response,
          id: response.id || id,
          full_name: response.full_name || 'Unknown',
          village: response.village || '',
          city: response.city || '',
          state: response.state || '',
          person_approve_status: 'on_hold',
          case_status: 'on_hold',
          status_reason: reason
        })),
        catchError(error => {
          console.error('Error putting person on hold:', error);
          return throwError(() => error);
        })
      );
    } else {
      return this.http.patch<any>(
        `${this.apiUrl}/api/persons/${id}/`,  
        { person_approve_status: status },
        { headers }
      ).pipe(
        catchError(error => {
          console.error('Error updating status:', error);
          return throwError(() => error);
        })
      );
    }
  }

}
