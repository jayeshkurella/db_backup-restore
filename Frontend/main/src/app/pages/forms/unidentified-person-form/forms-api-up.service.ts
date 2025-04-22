import { HttpClient ,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

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
  postMissingPerson(payload: any): Observable<any> {
    const headers = this.createHeaders();  // Get headers with token
    console.log("Payload for Unidentified Person:", payload);
    return this.http.post<any>(this.apiUrl + "api/persons/", payload, { headers }).pipe(
      tap(
        (response: any) => console.log("✅ Response received:", response),
        (error: any) => console.error("❌ Error occurred:", error)
      )
    );
  }

  // Get All Persons with Authorization Token
  getallPerson(): Observable<any> {
    const headers = this.createHeaders();  // Get headers with token
    return this.http.get(this.apiUrl + "api/persons/", { headers, observe: 'response' }).pipe(
      tap(response => {
        console.log('Response Headers:', response.headers);
      }),
      map(response => response.body) // Extracting only the body
    );
  }
  
}
