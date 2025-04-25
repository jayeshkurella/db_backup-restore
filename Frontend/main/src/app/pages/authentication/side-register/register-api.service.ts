import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

@Injectable({
  providedIn: 'root'
})
export class RegisterApiService {

  baseUrl = environment.apiUrl
  constructor(private http: HttpClient) {}


  register(userData: any): Observable<any> {
    return this.http.post(this.baseUrl+'/api/users/', { action: 'register', ...userData });
  }

}
