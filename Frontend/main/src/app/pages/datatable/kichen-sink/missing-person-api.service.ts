import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

@Injectable({
  providedIn: 'root'
})
export class MissingPersonApiService {

  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  getPersonsByFilters(filters: any): Observable<any> {
  const { page, page_size, ...filterParams } = filters;

  let params = new HttpParams({ fromObject: filterParams });

  // Add pagination separately
  if (page) params = params.set('page', page);
  if (page_size) params = params.set('page_size', page_size);

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.error('No auth token found in localStorage!');
    return throwError(() => new Error('Unauthorized: No token found'));
  }

  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

  return this.http.get(`${this.apiUrl}/api/persons/missing-persons/`, {
    params,
    headers,
    observe: 'response'
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
  

  matchMissingPersonWithUP(uuid: string): Observable<any> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.error('No auth token found in localStorage!');
    return throwError(() => new Error('Unauthorized: No token found'));
  }

  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

  return this.http.get(`${this.apiUrl}/api/missing-person-with-ups/${uuid}/`, {
    headers,
    observe: 'response'
  }).pipe(
    tap(response => console.log("Response Headers:", response.headers)),
    catchError(error => {
      console.error("Error Response:", error);
      return throwError(() => error);
    })
  );
  }
  
  rejectMatchWithUP(uuid: string, matchId: string, rejectReason: string): Observable<any> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('No auth token found in localStorage!');
      return throwError(() => new Error('Unauthorized: No token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

    const body = {
      match_id: matchId,
      reject_reason: rejectReason
    };

    return this.http.post(`${this.apiUrl}/api/missing-person-with-ups/${uuid}/match-reject/`, body, {
      headers,
      observe: 'response'
    }).pipe(
      tap(response => console.log("Response Headers:", response.headers)),
      catchError(error => {
        console.error("Error Response:", error);
        return throwError(() => error);
      })
    );
  }

  rejectUnrejectMatchWithUP(uuid: string, matchId: string, unrejectReason: string): Observable<any> {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.error('No auth token found in localStorage!');
    return throwError(() => new Error('Unauthorized: No token found'));
  }

  const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

  const body = {
    match_id: matchId,
    new_status: 'matched',  // Status when match is unrejected
    unreject_reason: unrejectReason
  };

  return this.http.post(`${this.apiUrl}/api/missing-person-with-ups/${uuid}/match-unreject/`, body, {
    headers,
    observe: 'response'
  }).pipe(
    tap(response => console.log("Response Headers:", response.headers)),
    catchError(error => {
      console.error("Error Response:", error);
      return throwError(() => error);
    })
  );
  }

  confirmMatchWithUP(uuid: string, matchId: string, confirmationNote: string): Observable<any> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('No auth token found in localStorage!');
      return throwError(() => new Error('Unauthorized: No token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

    const body = {
      match_id: matchId,
      confirmation_note: confirmationNote
    };

    return this.http.post(`${this.apiUrl}/api/missing-person-with-ups/${uuid}/match-confirm/`, body, {
      headers,
      observe: 'response'
    }).pipe(
      tap(response => console.log("Response Headers:", response.headers)),
      catchError(error => {
        console.error("Error Response:", error);
        return throwError(() => error);
      })
    );
  }

  unconfirmMatchWithUP(uuid: string, matchId: string, unconfirmReason: string): Observable<any> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('No auth token found in localStorage!');
      return throwError(() => new Error('Unauthorized: No token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Token ${authToken}`);

    const body = {
      match_id: matchId,
      new_status: 'matched',  // Status when match is unconfirmed
      unconfirm_reason: unconfirmReason
    };

    return this.http.post(`${this.apiUrl}/api/missing-person-with-ups/${uuid}/match-unconfirm/`, body, {
      headers,
      observe: 'response'
    }).pipe(
      tap(response => console.log("Response Headers:", response.headers)),
      catchError(error => {
        console.error("Error Response:", error);
        return throwError(() => error);
      })
    );
  }

}
