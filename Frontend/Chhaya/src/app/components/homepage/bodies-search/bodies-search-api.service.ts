import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class BodiesSearchApiService {

  private mainUrl = environment.apiUrl
    constructor(private http: HttpClient) {}
    
  searchUnidentifiedBody(bodyName: string | null, uniqueId: string | null): Observable<any> {
    let params = new HttpParams();

    if (bodyName) {
      params = params.append('body_name', bodyName);
    }
    if (uniqueId) {
      params = params.append('unique_id', uniqueId);
    }

    return this.http.get<any>(this.mainUrl +'search-with-bodies/', { params });
  }
}
