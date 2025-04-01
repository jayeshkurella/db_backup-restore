import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

@Injectable({
  providedIn: 'root'
})
export class LoginApiService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isUserLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); // Observable to track login state


  baseUrl = environment.apiUrl
  constructor(private http: HttpClient , private router :Router) {}
// Check if the user is logged in (Example: Check localStorage or session)
  private isUserLoggedIn(): boolean {
    return !!localStorage.getItem('authToken'); // If token exists, user is logged in
  }

  login(credentials: any): Observable<any> {
    return this.http.post(this.baseUrl + 'api/users/', { action: 'login', ...credentials }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          // Store authentication data in localStorage
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user_type', response.user.user_type);
          localStorage.setItem('user_id', response.user.id);
  
          // Update login state
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }
  


  // Call this on logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_id');

    this.isLoggedInSubject.next(false); // Update state
    this.router.navigate(['/authentication/login']);

  }
}
