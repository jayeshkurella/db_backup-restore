import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class ApproveServiceService {
  baseUrl = environment.apiUrl

  constructor(private http: HttpClient , private router :Router) {}

  getPendingUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}api/pending-users/`);
  }

  updateUserStatus(userId: string, action: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}api/users/approve/${userId}/`, 
      { action },
    );
  }
}
