import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserAccessServiceService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPendingData(): Observable<any> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      return throwError(() => new Error('Unauthorized: No token found'));
    }
    
    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
    return this.http.get(`${this.apiUrl}/api/pending-users/`, { headers }).pipe(
      map((response: any) => {
        return {
          pending_data: response.data.hold || [],
          approved_data: response.data.approved || [],
          rejected_data: response.data.rejected || [],
          counts: response.counts
        };
      }),
      catchError(error => {
        console.error('Error fetching pending data:', error);
        return throwError(() => error);
      })
    );
  }

  updatePersonStatus(id: string, status: string): Observable<any> {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        return throwError(() => new Error('Unauthorized: No token found'));
      }
    
      const actionMap: {[key: string]: string} = {
        'approved': 'approve',
        'rejected': 'reject',
        'hold': 'hold'
      };
      
      const backendAction = actionMap[status] || status;
      
      const headers = new HttpHeaders({
        'Authorization': `Token ${authToken}`,
        'Content-Type': 'application/json'
      });
      
      const body = JSON.stringify({ action: backendAction });
      
      return this.http.patch(
        `${this.apiUrl}/api/users/approve/${id}/`,
        body,
        { headers }
      ).pipe(
        catchError(error => {
          console.error('Error updating status:', error);
          if (error.error) {
            console.error('Server response:', error.error);
          }
          return throwError(() => error);
        })
      );
    }

}
