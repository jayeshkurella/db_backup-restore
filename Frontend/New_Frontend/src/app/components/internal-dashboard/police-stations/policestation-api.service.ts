import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class PolicestationApiService {
  private apiurl = environment.apiUrl

  constructor(private http:HttpClient) { }


  searchPoliceStations(queryParams: any): Observable<any> {
    const params = new HttpParams()
      .set('name', queryParams.name || '')
      .set('city', queryParams.city || '')
      .set('district', queryParams.district || '')
      .set('state', queryParams.state || '');
  
    return this.http.get<any>(`${this.apiurl}api/police-stations/`, { params });
  }

  // Add a new police station
  addPoliceStation(data: any): Observable<any> {
    return this.http.post(`${this.apiurl}api/police-stations/`, data);
  }

  // Fetch all police stations (with pagination)
  getAllPoliceStations(page: any): Observable<any> {
    return this.http.get(`${this.apiurl}?page=${page}`);
  }

 
}
