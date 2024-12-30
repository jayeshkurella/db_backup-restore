import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';
import { CacheService } from '../../../services/chacheservice.service';

@Injectable({
  providedIn: 'root'
})
export class VolunteeapiService {

  private apiUrl = environment.apiUrl;
  private cacheExpiryTimeInMinutes = 10;
  private cacheKey = 'volunteerdata';  

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

  // Method to fetch volunteer persons data from the backend
  getvolunteerPersonss(page: number): Observable<any> {
    const cachedData =this.getCachedData(page)
    if(cachedData){
      return new Observable((observer)=>{
        observer.next(cachedData);
        observer.complete()
      })
    }
    const url = `${this.apiUrl}/volunteer/?page=${page}`;
    return this.http.get(url);
  }



  // Clear all cached data
  clearAllCache(): void {
    this.cacheService.clear(); 
  }
}
