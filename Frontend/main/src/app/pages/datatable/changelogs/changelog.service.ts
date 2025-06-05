import { Injectable } from '@angular/core';
import { DailyChangeLog } from './changelog.model';
import { environment } from 'src/envirnment/envirnment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {
  private apiUrl =environment.apiUrl


constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Unauthorized: No token found');
    }
    return new HttpHeaders().set('Authorization', `Token ${authToken}`);
  }


  getLogs(): Observable<DailyChangeLog[]> {
    // const headers = this.getAuthHeaders();
    return this.http.get<DailyChangeLog[]>(`${this.apiUrl}/api/changelogs/`);
  }
  
  addLog(log: DailyChangeLog): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/api/changelogs/`, log, { headers });
  }

  deleteLog(logId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/api/changelogs/${logId}/`, { headers });
    
  }

}
