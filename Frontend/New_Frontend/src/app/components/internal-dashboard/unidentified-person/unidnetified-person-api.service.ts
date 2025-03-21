import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class UnidnetifiedPersonApiService {

  private apiUrl = environment.apiUrl; 
    
      constructor(private http: HttpClient) { }
    
      getPersonsByType(type: string): Observable<any> {
        return this.http.get(`${this.apiUrl}api/persons/unidentified-persons/`);
      }
    
}
