import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MatchDataStoreService {

  private matchData: any;

  set(data: any): void {
    this.matchData = data;
  }

  get(): any {
    return this.matchData;
  }

  clear(): void {
    this.matchData = null;
  }
}
