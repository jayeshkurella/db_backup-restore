import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';
import { CacheService } from '../../../services/chacheservice.service';

@Injectable({
  providedIn: 'root',
})
export class MissingpersonapiService {

  private apiUrl = environment.apiUrl;
  private cacheExpiryTimeInMinutes = 10;
  private cacheKey = 'missingpersonCache';  

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  cacheDataWithExpiry(page: number, data: any): void {

    const expiryTime = Date.now() + this.cacheExpiryTimeInMinutes * 60 * 1000;
    
    
    const cacheObject = {
      data: data.data,
      pagination: data.pagination,
      expiryTime: expiryTime,
    };
    
    
    this.cacheService.set(`${this.cacheKey}-page-${page}`, cacheObject);
  }

 
  getCachedData(page: number): any {
    const cacheForPage = this.cacheService.get(`${this.cacheKey}-page-${page}`);

    if (cacheForPage) {
      const isCacheExpired = Date.now() > cacheForPage.expiryTime;
      if (isCacheExpired) {
        this.cacheService.delete(`${this.cacheKey}-page-${page}`);
        return null; 
      } else {
        return cacheForPage; 
      }
    }

    return null; 
  }

  getMissingPersons(page: number): Observable<any> {
    const cachedData =this.getCachedData(page)
    if(cachedData){
      return new Observable((observer)=>{
        observer.next(cachedData);
        observer.complete()
      })
    }
    const url = `${this.apiUrl}/missing-person/?page=${page}`;
    return this.http.get(url);
  }

  // Method to fetch missing persons data from the backend
  getMissingPersonsWithFilters(page: number, filters: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('full_name', filters.full_name || '')
      .set('city', filters.city === 'all' ? '' : filters.city)
      .set('state', filters.state === 'all' ? '' : filters.state)
      .set('district', filters.district === 'all' ? '' : filters.district)
      .set('year', filters.year || '')
      .set('month', filters.month || '')
      .set('caste', filters.caste === 'all' ? '' : filters.caste)
      .set('age', filters.age || '')
      .set('marital_status', filters.marital_status === 'all' ? '' : filters.marital_status) 
      .set('blood_group', filters.blood_group === 'all' ? '' : filters.blood_group) 
      .set('height', filters.height || '')
      
  
    return this.http.get<any>(`${this.apiUrl}/missing-person/?page=${page}`, { params });
  }
  
  matchWithUP(personId: number): Observable<any> {
    const url = `${this.apiUrl}search/undefined_missing_person_matches/${personId}/`;
    return this.http.get(url, {});
  }

  // Method for UB match
  matchWithUB(personId: number): Observable<any> {
    const url = `${this.apiUrl}search/unidentified_body_matches/${personId}/`;
    return this.http.get(url, {});
  }


  rejectMatch(uniqueId: string, matchId: number, rejectionReason: string): Observable<any> {
    const body = {
      match_id: matchId,
      rejection_reason: rejectionReason
    };
  
    // Ensure there is no double slash
    return this.http.post<any>(`${this.apiUrl}rejecte/${uniqueId}/${matchId}/`, body).pipe(
      catchError(this.handleError)
    );
  }
  
  
  unrejectMatch(uniqueId: string, matchId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}unreject/${uniqueId}/${matchId}/`, {}).pipe(
      catchError(this.handleError)
    );
  }


  confirmMatch(confirmationData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}confirm_match/`, confirmationData);
  }

  unmatchConfirmedMatch(matchId: string) {
    return this.http.post<any>(`${this.apiUrl}unconfirm_match/`, { match_id: matchId });
  }
  


  getReportByMatchName(personName: string): Observable<any> {
    // Ensure you're passing the correct endpoint and parameter (e.g., `personName`)
    return this.http.get<any>(`${this.apiUrl}report/${personName}/`);
  }


  private handleError(error: any): Observable<never> {
      console.error('Error occurred:', error);
      return throwError(error.error || 'An error occurred while rejecting the match.');
    }


  // Clear all cached data
  clearAllCache(): void {
    this.cacheService.clear(); 
  }
}
