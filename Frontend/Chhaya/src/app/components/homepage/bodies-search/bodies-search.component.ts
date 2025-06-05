import { Component } from '@angular/core';
import { BodiesSearchApiService } from './bodies-search-api.service';
import { environment } from 'src/envirnments/envirnment';
declare var bootstrap: any;
@Component({
  selector: 'app-bodies-search',
  templateUrl: './bodies-search.component.html',
  styleUrls: ['./bodies-search.component.css']
})
export class BodiesSearchComponent {
  environment = environment
  bodyName: string = '';
  selectedMatch: any = null;

  uniqueId: string = '';
  result: any = null;
  errorMessage: string = '';
  searchResults: any = {
    newly_matched: [],
    previously_matched: [],
    previously_rejected: [],
  }; 
  previousMatches: any[] | undefined;
  loading: boolean = false;

  constructor(private bodySearchService : BodiesSearchApiService){}
  
  

  onSearch(): void {
    if (this.bodyName.trim() === '' && this.uniqueId.trim() === '') {
      this.errorMessage = 'Either body_name or unique_id is required';
      return;
    }
  
    this.bodySearchService.searchUnidentifiedBody(this.bodyName, this.uniqueId).subscribe({
      next: (data) => {
        // Ensure the data is in the correct format
        this.searchResults = {
          newly_matched: Array.isArray(data.newly_matched) ? data.newly_matched : [data.newly_matched],
          previously_matched: Array.isArray(data.previously_matched) ? data.previously_matched : [],
          previously_rejected: Array.isArray(data.previously_rejected) ? data.previously_rejected : [data.previously_rejected],
          rematch_attempt: data.rematch_attempt || 0,
          unidentified_body: data.unidentified_body || {}
        };
        console.log("previously ",this.searchResults.previously_matched)
        console.log(this.searchResults);
        this.errorMessage = '';
      },
      error: (error) => {
        this.result = null;
        this.errorMessage = error.error?.error || 'An error occurred';
      }
    });
  }

  viewDetails(match:any){
    this.selectedMatch ={
      ...match,
      
    }
  }
  
  

}
