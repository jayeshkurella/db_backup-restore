import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, throwError } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class UserAccessServiceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPendingData(filters?: any): Observable<any> {
    return this.makeUserRequest('hold', filters);
  }

  getApprovedData(filters?: any): Observable<any> {
    return this.makeUserRequest('approved', filters);
  }

  getRejectedData(filters?: any): Observable<any> {
    return this.makeUserRequest('rejected', filters);
  }

  getPaginatedData(url: string): Observable<any> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      return of({ results: [], next: null, previous: null, count: 0 });
    }
    
    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
    return this.http.get(url, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching paginated data:', error);
        return of({ results: [], next: null, previous: null, count: 0 });
      })
    );
  }


private makeUserRequest(status: string, filters?: any): Observable<any> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      return of({ results: [], links: {}, meta: {}, count: 0 });
    }
    
    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.append(key, filters[key]);
        }
      });
    }
    
    return this.http.get(`${this.apiUrl}/api/users/${status}/`, { headers, params }).pipe(
      map((response: any) => {
        // Match the structure with your API response
        return {
          data: {
            results: response.data?.results || [],
            links: response.data?.links || {
              first: null,
              previous: null,
              next: null,
              last: null
            },
            meta: response.data?.meta || {
              current_page: 1,
              page_size: 10,
              total_pages: 1,
              total_items: 0
            }
          },
          counts: response.counts || {
            hold: 0,
            approved: 0,
            rejected: 0
          }
        };
      }),
      catchError(error => {
        console.error(`Error fetching ${status} users:`, error);
        return of({ 
          data: {
            results: [],
            links: {
              first: null,
              previous: null,
              next: null,
              last: null
            },
            meta: {
              current_page: 1,
              page_size: 10,
              total_pages: 1,
              total_items: 0
            }
          },
          counts: {
            hold: 0,
            approved: 0,
            rejected: 0
          }
        });
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