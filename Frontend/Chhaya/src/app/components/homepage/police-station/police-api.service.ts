import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class PoliceAPIService {

  private mainUrl = environment.apiUrl

  constructor(private http:HttpClient) { }

  // Search police stations based on query
  searchPoliceStations(queryParams: any): Observable<any> {
    const params = new HttpParams()
      .set('name', queryParams.name || '')
      .set('city', queryParams.city || '')
      .set('district', queryParams.district || '')
      .set('state', queryParams.state || '');
    return this.http.get<any>(`${this.mainUrl}police-stations/`, { params });
  }

  getallchowikis(page :number): Observable<any> {
    return this.http.get<any>(`${this.mainUrl +'police-chowkis/'}?page=${page}`);
  }

  getallchowikisbyid(id:string):Observable<any>{
    return this.http.get<any>(`${this.mainUrl+'police-chowkis/'}${id}/`);
  }

  
}
