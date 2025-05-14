import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';
@Injectable({
  providedIn: 'root'
})
export class IdserviceService {

   private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

 private getAuthHeaders(): HttpHeaders | null {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('No auth token found in localStorage!');
      return null;
    }
    return new HttpHeaders().set('Authorization', `Token ${authToken}`);
  }

  searchCase(caseId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('Unauthorized: No token found'));
    }

    const url = `${this.apiUrl}/api/persons/search/${caseId}/`;
    return this.http.get(url, { headers });
  }

}