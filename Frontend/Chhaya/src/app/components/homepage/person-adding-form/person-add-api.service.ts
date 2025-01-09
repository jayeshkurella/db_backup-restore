import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';
import { MissingPerson } from './exportData';

@Injectable({
  providedIn: 'root'
})
export class PersonAddAPIService {

  private apiUrl = environment.apiUrl


  constructor(private http: HttpClient) { }

  postMissingPerson(missingPerson: MissingPerson): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'missing-person/', missingPerson);  
    }
}
