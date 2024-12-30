
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private cache: Map<string, any> = new Map();  

  constructor() {}

  
  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  
  get(key: string): any {
    return this.cache.get(key);
  }

  
  has(key: string): boolean {
    return this.cache.has(key);
  }

  
  delete(key: string): void {
    this.cache.delete(key);
  }


  clear(): void {
    this.cache.clear();
  }
}





// private cache: Map<string, { data: any, timestamp: number }> = new Map();
// private cacheExpiry = 3600000;  // Cache expiry time in milliseconds (1 hour)

// set(key: string, value: any): void {
//   const cacheEntry = { data: value, timestamp: Date.now() };
//   this.cache.set(key, cacheEntry);
// }

// get(key: string): any {
//   const cacheEntry = this.cache.get(key);
//   if (cacheEntry) {
//     const isExpired = Date.now() - cacheEntry.timestamp > this.cacheExpiry;
//     if (isExpired) {
//       this.cache.delete(key);  // Clear expired data
//       return null;
//     }
//     return cacheEntry.data;
//   }
//   return null;
// }