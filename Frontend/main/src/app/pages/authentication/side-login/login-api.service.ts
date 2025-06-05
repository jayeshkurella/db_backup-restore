import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';
declare var google :any;

@Injectable({
  providedIn: 'root'
})
export class LoginApiService {
  public isLoggedInSubject = new BehaviorSubject<boolean>(this.isUserLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); 

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  setUser(user: any) {
    this.userSubject.next(user);
  }

  getUser(): any {
    return this.userSubject.value;
  }
  profilePicSubject = new BehaviorSubject<string | null>(null);
  profilePic$ = this.profilePicSubject.asObservable();

  setProfilePic(picUrl: string) {
    this.profilePicSubject.next(picUrl);
    localStorage.setItem('profilePic', picUrl);  
  }

  initializeProfilePic() {
    const storedPic = localStorage.getItem('profilePic');
    if (storedPic) {
      this.profilePicSubject.next(storedPic);
    }
  }

  baseUrl = environment.apiUrl
  constructor(private http: HttpClient , private router :Router) {}
// Check if the user is logged in (Example: Check localStorage or session)
 public isUserLoggedIn(): boolean {
    return !!localStorage.getItem('authToken'); // If token exists, user is logged in
  }
  public getLoggedInUserId(): string | null {
  return localStorage.getItem('user_id'); // Return the raw string
 }

  login(credentials: any): Observable<any> {
    return this.http.post(this.baseUrl + '/api/users/', { action: 'login', ...credentials }).pipe(
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
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_id');
    localStorage.removeItem('profilePic');
    this.isLoggedInSubject.next(false); 
    google.accounts.id.disableAutoSelect();
    this.router.navigate(['/authentication/login']);

  }


  // google login
  loginWithGoogle(token: string) {
    return this.http.post(this.baseUrl + '/api/users/', {
      action: 'google_login',
      token: token,
      // ...userTypeData
    });
    
  }

  forgotPassword(email: string): Observable<any> {
    const payload = {
      action: 'forgot-password',
      email_id: email,
    };
    return this.http.post(`${this.baseUrl}/api/users/`, payload);
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const payload = {
      action: 'reset-password',
      token,
      new_password: newPassword,
    };
    return this.http.post(`${this.baseUrl}/api/users/`, payload);
  }

  changePassword(data: { old_password: string; new_password: string }): Observable<any> {
      const token = localStorage.getItem('authToken'); // Or sessionStorage
      const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

  const payload = {
    action: 'change-password',
    ...data
  };
    return this.http.post(`${this.baseUrl}/api/users/`, payload,{ headers });
  }

  deleteProfile(): Observable<any> {
    const token = localStorage.getItem('authToken'); // Or sessionStorage
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const payload = {
      action: 'delete_profile',
    };
    return this.http.post(`${this.baseUrl}/api/users/`, payload, { headers });
  }

  editProfile(userId: number, formData: FormData): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
        'Authorization': `Token ${token}`
        // Don't set Content-Type - let browser handle it for FormData
    });

    return this.http.put(`${this.baseUrl}/api/users/`, formData, { headers });
  }

  getUserProfile(userId: string): Observable<any> {
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
  const body = {
    action: 'get_profile',
    pk: userId
  };

  return this.http.post(`${this.baseUrl}/api/users/`, body, { headers });
}




  

}  
