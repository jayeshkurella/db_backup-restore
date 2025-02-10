import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/envirnments/envirnment';

@Injectable({
  providedIn: 'root'
})
export class UnidentifiedpersonformApiService {
  apiUrl =environment.apiUrl

  constructor(private http : HttpClient) { }

  postMissingPerson(payload: any): Observable<any> {
    console.log("📝 Form Data Before Sending:", JSON.stringify(payload, null, 2));

    return this.http.post<any>(this.apiUrl + "unidentified-person/", payload).pipe(
      tap(
        (response: any) => console.log("✅ Response received:", response),
        (error: any) => console.error("❌ Error occurred:", error)
      )
    );
  }
  
}
