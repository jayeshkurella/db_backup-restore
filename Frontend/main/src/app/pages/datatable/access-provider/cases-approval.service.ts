import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';
import { catchError, map, tap } from 'rxjs/operators';
import { Person, PaginatedResponse } from './access-provider.component';

@Injectable({
  providedIn: 'root'
})
export class CasesApprovalService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

getPendingPersons(filters?: any): Observable<PaginatedResponse<Person>> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    return throwError(() => new Error('Unauthorized: No token found'));
  }
  
  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
  
  let params = new HttpParams();
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'page' && key !== 'page_size') {
        params = params.set(key, filters[key]);
      }
    });
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.page_size) {
      params = params.set('page_size', filters.page_size.toString());
    }
  }

  return this.http.get<PaginatedResponse<Person>>(
    `${this.apiUrl}/api/persons_status/pending/`, 
    { headers, params }
  ).pipe(
    catchError(error => {
      console.error('Error fetching pending data:', error);
      return of({
        count: 0, 
        results: [], 
        next: null, 
        previous: null, 
        page_size: filters?.page_size || 10
      });
    })
  );
}
// In your CasesApprovalService

getHoldPersons(filters?: any): Observable<PaginatedResponse<Person>> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    return throwError(() => new Error('Unauthorized: No token found'));
  }
  
  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
  
  let params = new HttpParams();
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'page' && key !== 'page_size') {
        params = params.set(key, filters[key]);
      }
    });
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.page_size) {
      params = params.set('page_size', filters.page_size.toString());
    }
  }

  return this.http.get<PaginatedResponse<Person>>(
    `${this.apiUrl}/api/persons_status/on_hold/`, 
    { headers, params }
  ).pipe(
    catchError(error => {
      console.error('Error fetching hold data:', error);
      return of({
        count: 0, 
        results: [], 
        next: null, 
        previous: null, 
        page_size: filters?.page_size || 10
      });
    })
  );
}

getSuspendedPersons(filters?: any): Observable<PaginatedResponse<Person>> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    return throwError(() => new Error('Unauthorized: No token found'));
  }
  
  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
  
  let params = new HttpParams();
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'page' && key !== 'page_size') {
        params = params.set(key, filters[key]);
      }
    });
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.page_size) {
      params = params.set('page_size', filters.page_size.toString());
    }
  }

  return this.http.get<PaginatedResponse<Person>>(
    `${this.apiUrl}/api/persons_status/suspended/`, 
    { headers, params }
  ).pipe(
    catchError(error => {
      console.error('Error fetching suspended data:', error);
      return of({
        count: 0, 
        results: [], 
        next: null, 
        previous: null, 
        page_size: filters?.page_size || 10
      });
    })
  );
}

getApprovedPersons(filters?: any): Observable<PaginatedResponse<Person>> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    return throwError(() => new Error('Unauthorized: No token found'));
  }
  
  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);
  
  let params = new HttpParams();
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'page' && key !== 'page_size') {
        params = params.set(key, filters[key]);
      }
    });
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.page_size) {
      params = params.set('page_size', filters.page_size.toString());
    }
  }

  return this.http.get<PaginatedResponse<Person>>(
    `${this.apiUrl}/api/persons_status/approved/`, 
    { headers, params }
  ).pipe(
    catchError(error => {
      console.error('Error fetching approved data:', error);
      return of({
        count: 0, 
        results: [], 
        next: null, 
        previous: null, 
        page_size: filters?.page_size || 10
      });
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