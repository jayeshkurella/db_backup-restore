import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';


export interface Caste {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Helper function to create headers
  private createHeaders() {
    const authToken = this.getAuthToken();
    let headers = new HttpHeaders();
    if (authToken) {
      headers = headers.set('Authorization', `Token ${authToken}`);
    }
    return headers;
  }

  // Post Missing Person with Authorization Token
  postMissingPerson(data: FormData): Observable<any> {
    const headers = this.createHeaders();  // Get headers with token
    console.log("Payload for Missing Person:", data);
    return this.http.post<any>(this.apiUrl + "/api/persons/", data, { headers }).pipe(
      tap(
        (response: any) => console.log("✅ Response received:", response),
        (error: any) => console.error("❌ Error occurred:", error)
      )
    );
  }

  // Get All Persons with Authorization Token
  getallPerson(): Observable<any> {
    const headers = this.createHeaders();  // Get headers with token
    return this.http.get(this.apiUrl + "/api/persons/", { headers, observe: 'response' }).pipe(
      tap(response => {
        console.log('Response Headers:', response.headers);
      }),
      map(response => response.body) // Extracting only the body
    );
  }
  // Get all castes with auth headers, observe full response for headers if needed
  getCastes(): Observable<Caste[]> {
    const headers = this.createHeaders();
    return this.http
      .get<Caste[]>(`${this.apiUrl}/api/castes_tags/`, { headers, observe: 'response' })
      .pipe(
        tap((response) => {
          console.log('Response Headers:', response.headers);
        }),
        map((response) => response.body || [])
      );
  }

  // Add new caste with auth headers, observe full response if needed
  addCaste(name: string): Observable<Caste> {
    const headers = this.createHeaders();
    return this.http
      .post<Caste>(
        `${this.apiUrl}/api/castes_tags/`,
        { name },
        { headers, observe: 'response' }
      )
      .pipe(
        tap((response) => {
          console.log('Added caste response headers:', response.headers);
        }),
        map((response) => response.body as Caste)
      );
  }

  deleteCaste(id: number): Observable<void> {
    const headers = this.createHeaders();

    // Check user_type from localStorage and throw error if not admin
    const userType = localStorage.getItem('user_type');
    if (userType !== 'admin') {
      return throwError(() => new Error('Only admins can delete castes.'));
    }

    return this.http
      .delete<void>(`${this.apiUrl}/api/caste_delete/${id}/`, { headers, observe: 'response' })
      .pipe(
        tap(response => {
          console.log('Deleted caste response status:', response.status);
        }),
        map(() => {
          // map response to void since no body expected on delete success
          return;
        }),
        catchError(err => {
          console.error('Delete caste failed', err);
          return throwError(() => err);
        })
      );
  }


  getHospitalNames(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(this.apiUrl + "/api/hospital-name-list/", { headers, observe: 'response' }).pipe(
      tap(response => {
      }),
      map(response => response.body)
    );
  }

  getPoliceStationNames(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(this.apiUrl + "/api/police-station-name-list/", { headers, observe: 'response' }).pipe(
      tap(response => {
      }),
      map(response => response.body)
    );
  }

  getEducationalTags(): Observable<any[]> {
    const headers = this.createHeaders();
    return this.http
      .get<any[]>(`${this.apiUrl}/api/educational_tags/`, { headers, observe: 'response' })
      .pipe(
        tap((response) => {
          console.log('Educational Tags Headers:', response.headers);
        }),
        map((response) => response.body || [])
      );
  }

  addEducationalTag(name: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http
      .post<any>(
        `${this.apiUrl}/api/educational_tags/`,
        { name },
        { headers, observe: 'response' }
      )
      .pipe(
        tap((response) => {
          console.log('Added Educational Tag Headers:', response.headers);
        }),
        map((response) => response.body as any)
      );
  }

  getOccupationTags(): Observable<any[]> {
    const headers = this.createHeaders();
    return this.http
      .get<any[]>(`${this.apiUrl}/api/occupation_tags/`, { headers, observe: 'response' })
      .pipe(
        tap((response) => {
          console.log('Occupation Tags Headers:', response.headers);
        }),
        map((response) => response.body || [])
      );
  }

  addOccupationTag(name: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http
      .post<any>(
        `${this.apiUrl}/api/occupation_tags/`,
        { name },
        { headers, observe: 'response' }
      )
      .pipe(
        tap((response) => {
          console.log('Added Occupation Tag Headers:', response.headers);
        }),
        map((response) => response.body as any)
      );
  }





}
