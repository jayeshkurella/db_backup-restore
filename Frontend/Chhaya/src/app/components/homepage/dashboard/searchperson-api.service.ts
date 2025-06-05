import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class SearchpersonAPIService {
  private mainUrl = environment.apiUrl
  constructor(private http: HttpClient) {}


  searchMatches(fullName: string): Observable<any> {
    const params = new HttpParams().set('full_name', fullName);
    return this.http.get<any>(this.mainUrl +'search-all-matches/', { params });
  }

  // Function to get previously fetched matches (you can customize this based on your API)
  getMatches(): Observable<any> {
    return this.http.get(`${this.mainUrl}search-all-matches/`);
  }

  rejectMatch(uniqueId: string, matchId: number, rejectionReason: string): Observable<any> {
    const body = {
      match_id: matchId,
      rejection_reason: rejectionReason
    };

    return this.http.post<any>(`${this.mainUrl}rejecte/${uniqueId}/${matchId}/`, body).pipe(
      catchError(this.handleError)
    );
  }

  unrejectMatch(uniqueId: string, matchId: string): Observable<any> {
    return this.http.patch<any>(`${this.mainUrl}unreject/${uniqueId}/${matchId}/`, {}).pipe(
      catchError(this.handleError)
    );
  }

  confirmMatch(confirmationData: any): Observable<any> {
    return this.http.post<any>(`${this.mainUrl}confirm_match/`, confirmationData);
  }

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(error.error || 'An error occurred while rejecting the match.');
  }

  
}


