import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class LoginApiService {

  baseUrl = environment.apiUrl
  constructor(private http: HttpClient , private router :Router) {}


  login(credentials: any): Observable<any> {
    return this.http.post(this.baseUrl+'api/users/', { action: 'login', ...credentials });
  }


  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_id');
    this.router.navigate(['/login']);
  }
}
