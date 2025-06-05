import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';


@Injectable({
  providedIn: 'root'
})
export class AllcountServiceService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getmissingPersonscount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/missingpersonscount/`);
  }

  getunidentifiedPersonscount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unidentifiedpersoncount/`);
  }

  getunidentifiedbodiescount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unidentifiedbodiescount/`);
  }

  getmissingPersonGenderCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/countbygender/`);
  }
  
  getgenderListCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/genderList/`);
  }

  getvillagelist(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/villages/`);
  }
  
}
