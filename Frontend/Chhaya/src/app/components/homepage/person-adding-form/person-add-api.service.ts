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

//   postMissingPerson(payload: FormData): Observable<any> {
//     console.log("form data in servece________",formData)
//     formData.forEach((value, key) => {
//       console.log(`${key}:`, value);
//   });
//     return this.http.post<any>(this.apiUrl + 'missing-person/', formData);  
//     }
// }

postMissingPerson(payload: any): Observable<any> {
  console.log('Form data being sent:', payload);
  return this.http.post<any>(this.apiUrl + 'missing-person/', payload,{
    headers: { 'Content-Type': 'application/json' }
  });
}
}
