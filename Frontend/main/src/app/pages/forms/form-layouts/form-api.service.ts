import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from 'src/envirnment/envirnment';

@Injectable({
  providedIn: 'root'
})
export class FormApiService {

  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  postMissingPerson(payload: any): Observable<any> {  
    return this.http.post<any>(this.apiUrl + "api/persons/", payload).pipe(
      tap(
        (response: any) => console.log("✅ Response received:", response),
        (error: any) => console.error("❌ Error occurred:", error)
      )
    );
  }

  getallPerson(): Observable<any> {  
    return this.http.get(this.apiUrl + "api/persons/", { observe: 'response' }).pipe(
      tap(response => {
        console.log('Response Headers:', response.headers);
      }),
      map(response => response.body) // Extracting only the body
    );
  }
  
}
