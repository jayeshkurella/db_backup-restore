import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class PersonAddApiService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  postMissingPerson(payload: any): Observable<any> {  
    return this.http.post<any>(this.apiUrl + "persons/", payload).pipe(
      tap(
        (response: any) => console.log("✅ Response received:", response),
        (error: any) => console.error("❌ Error occurred:", error)
      )
    );
  }

  getallPerson(): Observable<any> {  
    return this.http.get(this.apiUrl + "persons/");
  }
}
