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

  searchCase(caseId: string): Observable<any> {
    const url = `${this.apiUrl}/api/persons/search/${caseId}/`;
    return this.http.get(url); 
  }


}