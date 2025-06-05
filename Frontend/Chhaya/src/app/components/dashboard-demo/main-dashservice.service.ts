import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class MainDashserviceService {

  private apiUrl =environment.apiUrl

  constructor(private http : HttpClient) { }

  getFilteredMissingPersons(filters: any): Observable<any> {
    const params = new HttpParams({ fromObject: filters });
    return this.http.get<any>(`${this.apiUrl + 'filtered-missing-person/'}`, { params });
  }

  getFilteredunidentifiedPersons(filters: any): Observable<any> {
    const params = new HttpParams({ fromObject: filters });
    return this.http.get<any>(`${this.apiUrl + 'filtered-unidentified-person/'}`, { params });
  }

  getFilteredunidentifiedbodies(filters: any): Observable<any> {
    const params = new HttpParams({ fromObject: filters });
    return this.http.get<any>(`${this.apiUrl + 'filtered-unidentified-bodies/'}`, { params });
  }
}
