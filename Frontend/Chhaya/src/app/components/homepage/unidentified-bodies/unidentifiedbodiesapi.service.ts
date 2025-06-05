import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';
import { CacheService } from '../../../services/chacheservice.service';

@Injectable({
  providedIn: 'root',
})
export class UnidentifiedbodiesapiService {

  private apiUrl = environment.apiUrl;
  private cacheExpiryTimeInMinutes = 10; 
  private cacheKey = 'unidentifiedBodiesCache'; 

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  // Method to cache the data with expiry time
  cacheDataWithExpiry(page: number, data: any): void {
    const expiryTime = Date.now() + this.cacheExpiryTimeInMinutes * 60 * 1000; 

    const cacheObject = {
      data: data.data,
      pagination: data.pagination, 
      expiryTime: expiryTime, 
    };

    this.cacheService.set(`${this.cacheKey}-page-${page}`, cacheObject); 
  }

  // Get cached data for the page if available and valid
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

  // Fetch unidentified bodies data from the backend if no valid cache exists
  getUnidentifiedBodies(page: number): Observable<any> {
    const cachedData = this.getCachedData(page); 
    if (cachedData) {
      console.log('Using cached data for page', page);
      return new Observable((observer) => {
        observer.next(cachedData); 
        observer.complete(); 
      });
    } else {
      const url = `${this.apiUrl}/unidentified-bodies/?page=${page}`;
      return this.http.get(url); 
    }
  }


  getunidentifiedbodiesWithFilters(page: number, filters: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('full_name', filters.full_name || '')
      .set('gender', filters.gender === 'all' ? '' : filters.gender)
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
      
  
    return this.http.get<any>(`${this.apiUrl}/unidentified-bodies/?page=${page}`, { params });
  }
  

  // Clear all cached data
  clearAllCache(): void {
    this.cacheService.clear();
  }

}
