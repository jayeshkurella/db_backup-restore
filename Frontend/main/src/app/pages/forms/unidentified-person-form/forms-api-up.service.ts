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
      map(response => response.body) 
    );
  }
  // Get Police Station List
 // Get Police Station List
  getPoliceStationList(): Observable<any[]> {
    const headers = this.createHeaders();
    return this.http.get<any[]>(this.apiUrl + '/api/police-station-name-list/', { headers });
  }
  
  getHospitalList(): Observable<any> {
    const headers = this.createHeaders(); // for token if needed
    return this.http.get<any>(this.apiUrl + '/api/hospital-name-list/', { headers });
  }
  
}
