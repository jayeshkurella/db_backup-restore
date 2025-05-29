import { ChangeDetectionStrategy, Component, OnInit, Optional } from '@angular/core';
import {
  ViewChild,
  AfterViewInit,
  TemplateRef,
} from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet';
import { environment } from 'src/envirnment/envirnment';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatNativeDateModule } from '@angular/material/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MaterialModule } from 'src/app/material.module';
// import * as bootstrap from 'bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UnidentifiedpersonApiService } from './unidentifiedperson-api.service';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UnidentifiedPersonDialogComponent } from './unidentified-person-dialog/unidentified-person-dialog.component';
import { Router } from '@angular/router';
import { SafeTitlecasePipe } from "../../../components/dashboard1/revenue-updates/person-details/safe-titlecase.pipe";
export interface Person {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  date_reported: string;
  photo_photo?: string;
}
@Component({
  selector: 'app-unidentified-person',
  imports: [MaterialModule,
    TablerIconsModule,
    MatNativeDateModule,
    NgScrollbarModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatProgressSpinnerModule, SafeTitlecasePipe],
  templateUrl:'./unidentified-person.component.html',
  styleUrls: ['./unidentified-person.component.css'], // ✅ Correct
  standalone: true,
  providers: [DatePipe], 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnidentifiedPersonComponent implements AfterViewInit , OnInit{
  today: Date = new Date();

  @ViewChild(MatTable, { static: true }) table!: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild('dialogTemplate', { static: true }) dialogTemplate!: TemplateRef<any>;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumnsPending: string[] = ['sr', 'photo', 'full_name', 'age', 'gender', 'date_of_missing', 'action', 'match_with'];
  displayedColumnsResolved: string[] = ['sr', 'photo', 'full_name', 'age', 'gender', 'date_of_missing', 'action'];
  displayedColumns: string[] = ['sr', 'photo', 'full_name', 'age', 'gender', 'date_of_missing', 'action','match_with'];
  selectedPerson: any = null;
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  environment = environment;
  missingPersons: any[] = [];
  filteredPersons: any[] = []; 
  selectedMatch: any = null;
  searchText: any;
  allstates: any;
  allcities: any;
  alldistricts: any;
  allmarital: any;
  loading: boolean = false; 
  selectedMatched: any;
  message: string = '';  
  errorMessage: string = '';
  uniqueId: string = ''; 
  matchId: number = 0;  
  rejectionReason: string = '';  
  selectedMatchForConfirmation: any;  
  showConfirmModal: boolean = false;
  existing_reports: any[] = [];  // To store existing reports
  report_data: any[] = []; 
  selectedReport: any;  // Variable to hold the selected report for details
  isModalOpen: boolean = false; 
  isInitialLoad = true;
  filtersApplied: boolean = false;  // Initially false
  progress: number = 0;
  progressColor: string = 'bg-primary'; // Corrected type of progressColor
  progressMessage: string = '';
        paginationLinks: any = {
  first: null,
  last: null,
  next: null,
  previous: null
};

    currentPage: number = 1;
  itemsPerPage: number = 10; // Default items per page
  totalItems: number = 0;
  
   // ✅ Initialize data sources with empty arrays
    dataSourcePending = new MatTableDataSource<any>([]);
    dataSourceResolved = new MatTableDataSource<any>([]);
      @ViewChild('paginatorPending') paginatorPending!: MatPaginator;
       @ViewChild('paginatorResolved') paginatorResolved!: MatPaginator;
  months: any;
  years: any;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public datePipe: DatePipe,
    private missingPersonService: UnidentifiedpersonApiService,
    private router: Router,
  ) {
        // Load saved state from sessionStorage if available
  const savedState = sessionStorage.getItem('unidentifiedBodySearchState');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    this.filters = parsedState.filters;
    this.dataSourcePending.data = parsedState.pendingPersons || [];
    this.dataSourceResolved.data = parsedState.resolvedPersons || [];
    this.filtersApplied = parsedState.filtersApplied || false;
            this.currentPage = parsedState.currentPage || 1;
      this.totalItems = parsedState.totalItems || 0;
  }
  }
  filters = {
    full_name: '',
    city: '',
    state: '',
    startDate: null as string | null,  // Change type to string | null
    endDate: null as string | null,    // Change type to string | null
    caste: '',
    age_range: '',
    marital_status: '',
    blood_group: '',
    height_range: '',
    district: '',
    gender: ''
};
casteOptions = [
  { value: 'open', label: 'Open / General' },
  { value: 'obc', label: 'OBC' },
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'nt', label: 'NT' },
  { value: 'vj', label: 'VJ' },
  { value: 'sbc', label: 'SBC' },
  { value: 'sebc', label: 'SEBC' },
  { value: 'other', label: 'Other' },
];

heightRangeOptions = [
  { value: '<150', label: 'Less than 150 cm' },
  { value: '150-160', label: '150 - 160 cm' },
  { value: '161-170', label: '161 - 170 cm' },
  { value: '171-180', label: '171 - 180 cm' },
  { value: '181-190', label: '181 - 190 cm' },
  { value: '>190', label: 'More than 190 cm' }
];

ageRanges = [
  { value: "0-5", label: "0 - 5" },
  { value: "6-12", label: "6 - 12" },
  { value: "13-17", label: "13 - 17" },
  { value: "18-24", label: "18 - 24" },
  { value: "25-34", label: "25 - 34" },
  { value: "35-44", label: "35 - 44" },
  { value: "45-54", label: "45 - 54" },
  { value: "55-64", label: "55 - 64" },
  { value: "65-74", label: "65 - 74" },
  { value: "75-84", label: "75 - 84" },
  { value: "85-100", label: "85+" }
];

  anyFilterSelected(): boolean {
    return Object.values(this.filters).some(value => value !== '');
  }

  pendingPersons: any[] = [];
  resolvedPersons: any[] = [];
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSourcePending.paginator = this.paginatorPending;
    this.dataSourceResolved.paginator = this.paginatorResolved;
  }
  ngOnInit() {
    this.getStates();

  }
  getStates() {
    this.missingPersonService.getStates().subscribe(states => {
      this.allstates = states;
    });
  }
  onStateChange() {
    this.filters.district = '';
    this.filters.city = '';
    this.alldistricts = [];
    this.allcities = [];

    if (this.filters.state) {
      this.missingPersonService.getDistricts(this.filters.state).subscribe(districts => {
        this.alldistricts = districts;
      });
    }
  }
  onDistrictChange() {
    this.filters.city = '';
    this.allcities = [];

    if (this.filters.district) {
      this.missingPersonService.getCities(this.filters.district).subscribe(cities => {
        this.allcities = cities;
      });
    }
  }
//  private saveSearchState(): void {
//   const state = {
//     filters: this.filters,
//     pendingPersons: this.dataSourcePending.data,
//     resolvedPersons: this.dataSourceResolved.data,
//     filtersApplied: this.filtersApplied
//   };
//   sessionStorage.setItem('unidentifiedBodySearchState', JSON.stringify(state));
// }
// resetFilters(): void {
//   this.filters = {
//     full_name: '',
//     city: '',
//     state: '',
//     startDate: null,
//     endDate: null,
//     caste: '',
//     age_range: '',
//     marital_status: '',
//     blood_group: '',
//     height_range: '',
//     district: '',
//     gender: ''
//   };

//   this.dataSourcePending.data = [];
//   this.dataSourceResolved.data = [];
//   this.filtersApplied = false;
  
//   // Clear saved state
//   sessionStorage.removeItem('unidentifiedBodySearchState');
  
//   // Reset pagination
//   if (this.paginatorPending) {
//     this.paginatorPending.firstPage();
//   }
//   if (this.paginatorResolved) {
//     this.paginatorResolved.firstPage();
//   }
  
//   this.progressMessage = "Filters have been reset";
// }

resetFilters(): void {
  this.filters = {
    full_name: '',
    city: '',
    state: '',
    startDate: null,
    endDate: null,
    caste: '',
    age_range: '',
    marital_status: '',
    blood_group: '',
    height_range: '',
    district: '',
    gender: ''
  };
  this.currentPage = 1; // Reset to first page
    this.totalItems = 0;
    
    this.dataSourcePending.data = [];
    this.dataSourceResolved.data = [];
    this.filtersApplied = false;
    
    // Clear saved state
    sessionStorage.removeItem('unidentifiedPersonsSearchState');
    
    this.progressMessage = "Filters have been reset";
}
  private saveSearchState(): void {
    const state = {
      filters: this.filters,
      pendingPersons: this.dataSourcePending.data,
      resolvedPersons: this.dataSourceResolved.data,
      filtersApplied: this.filtersApplied,
      currentPage: this.currentPage,
      totalItems: this.totalItems
    };
    sessionStorage.setItem('unidentifiedPersonsSearchState', JSON.stringify(state));
  }
  hasGeographicFiltersApplied(): boolean {
  return !!this.filters.state && !!this.filters.district && !!this.filters.city;
}
   hasActiveFilters(): boolean {
  return Object.values(this.filters).some(value => value !== '');
}
  // applyFilters(): void {
  //   this.loading = true;
  //   this.progressMessage = "🔄 Applying filters...";
  //   this.filtersApplied = true; // Ensure this is set when filters are applied
  
  //   // Safely parse and format dates
  //   const parsedStartDate = this.parseToDate(this.filters.startDate);
  //   const parsedEndDate = this.parseToDate(this.filters.endDate);
  
  //   if (parsedStartDate) {
  //     this.filters.startDate = this.formatDate(parsedStartDate);
  //   }
  
  //   if (parsedEndDate) {
  //     this.filters.endDate = this.formatDate(parsedEndDate);
  //   }
  
  //   this.missingPersonService.getPersonsByFilters(this.filters).subscribe(
  //     (response) => {
  //       this.loading = false;
  //       const responseData = response?.body.results || response;
  
  //       // Clear previous data
  //       this.dataSourcePending.data = [];
  //       this.dataSourceResolved.data = [];
  
  //       if (responseData?.message) {
  //         this.progressMessage = responseData.message;
  //       } else if (Array.isArray(responseData)) {
  //         // Filter and set data
  //         this.dataSourcePending.data = responseData.filter(person => person.case_status === 'pending');
  //         this.dataSourceResolved.data = responseData.filter(person => person.case_status === 'resolved');

  //         this.saveSearchState();
  
  //         console.log("Pending Persons:", this.dataSourcePending.data);
  //         console.log("Resolved Persons:", this.dataSourceResolved.data);
  //         // Connect paginators (needed if data changes)
  //         this.dataSourcePending.paginator = this.paginatorPending;
  //         this.dataSourceResolved.paginator = this.paginatorResolved;
  
  //         // Reset pagination to first page
  //         if (this.paginatorPending) {
  //           this.paginatorPending.firstPage();
  //         }
  //         if (this.paginatorResolved) {
  //           this.paginatorResolved.firstPage();
  //         }
  
  //         this.progressMessage = responseData.length > 0 
  //           ? "✅ Filters applied successfully!" 
  //           : "No matching records found";
  //       } else {
  //         this.progressMessage = "❌ Unexpected response format from server";
  //       }
  //     },
  //     (error) => {
  //       this.loading = false;
  //       console.error('Error fetching data:', error);
  //       this.progressMessage = error.error?.message 
  //         ? `❌ ${error.error.message}` 
  //         : "❌ Error applying filters!";
  //     }
  //   );
  // }
  
  
  
  // ✅ Helper function
     getTotalItems(): number {
    // Return the total count from your API response
    return this.totalItems;
  }

  getFirstItemNumber(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  getLastItemNumber(): number {
    const lastItem = this.currentPage * this.itemsPerPage;
    return lastItem > this.totalItems ? this.totalItems : lastItem;
  }

  getLastPageNumber(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

 goToFirstPage(): void {
  if (this.paginationLinks.first && this.currentPage !== 1) {
    this.currentPage = 1;
    this.applyFilters();
  }
}

goToPreviousPage(): void {
  if (this.paginationLinks.previous && this.currentPage > 1) {
    this.currentPage--;
    this.applyFilters();
  }
}

goToNextPage(): void {
  if (this.paginationLinks.next && this.currentPage < this.getLastPageNumber()) {
    this.currentPage++;
    this.applyFilters();
  }
}

goToLastPage(): void {
  if (this.paginationLinks.last) {
    const lastPage = this.getLastPageNumber();
    if (this.currentPage !== lastPage) {
      this.currentPage = lastPage;
      this.applyFilters();
    }
  }
}
    applyFilters(): void {
  this.loading = true;
  this.progressMessage = "🔄 Applying filters...";
  this.filtersApplied = true;

  const parsedStartDate = this.parseToDate(this.filters.startDate);
  const parsedEndDate = this.parseToDate(this.filters.endDate);

  if (parsedStartDate) {
    this.filters.startDate = this.formatDate(parsedStartDate);
  }

  if (parsedEndDate) {
    this.filters.endDate = this.formatDate(parsedEndDate);
  }

  this.missingPersonService.getPersonsByFilters(this.filters, this.currentPage).subscribe(
    (response) => {
      this.loading = false;
      const responseData = response?.body?.results || response?.results || [];
      
      // Update pagination info from API response
      if (response?.body?.count || response?.count) {
        this.totalItems = response.body?.count || response.count;
      }
      
      if (response?.body?.links || response?.links) {
        this.paginationLinks = response.body?.links || response.links;
      }

      // Clear previous data
      this.dataSourcePending.data = [];
      this.dataSourceResolved.data = [];

      if (responseData?.message) {
        this.progressMessage = responseData.message;
      } else if (Array.isArray(responseData)) {
        this.dataSourcePending.data = responseData.filter(person => person.case_status === 'pending');
        this.dataSourceResolved.data = responseData.filter(person => person.case_status === 'resolved');

        // Save state to sessionStorage
        this.saveSearchState();

        this.dataSourcePending.paginator = this.paginatorPending;
        this.dataSourceResolved.paginator = this.paginatorResolved;

        this.progressMessage = responseData.length > 0 
          ? "✅ Filters applied successfully!" 
          : "No matching records found";
      } else {
        this.progressMessage = "❌ Unexpected response format from server";
      }
    },
    (error) => {
      this.loading = false;
      console.error('Error fetching data:', error);
      this.progressMessage = error.error?.message 
        ? `❌ ${error.error.message}` 
        : "❌ Error applying filters!";
    }
  );
}
  parseToDate(input: string | null): Date | null {
    if (!input) return null;
  
    const parsed = new Date(input);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // ✅ Already existing date formatter
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  
  viewDetails(person: Person): void {
    this.saveSearchState();
    sessionStorage.setItem('viewData', JSON.stringify({ id: person.id }));
    this.router.navigate(['/search/view-unidentified-person']);
  }
  

  /** Initialize Leaflet map */
  initMap(): void {
    if (!this.selectedPerson) {
      console.error('No selected person available');
      return;
    }

    const location = this.parseWKT(this.selectedPerson.location);
    if (!location) {
      console.error('No valid coordinates found');
      return;
    }

    if (this.map) this.map.remove();

    this.map = L.map('map', {
      center: [location.lat, location.lng],
      zoom: 13,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      shadowSize: [41, 41],
    });

    this.marker = L.marker([location.lat, location.lng], { icon: customIcon })
      .addTo(this.map)
      .bindPopup(`<p><strong>Location</strong></p><p>Coordinates: ${location.lat}, ${location.lng}</p>`)
      .openPopup();

    this.map.setView([location.lat, location.lng], 13);
    this.map.invalidateSize();
  }

  parseWKT(wkt: string | null): { lat: number; lng: number } | null {
    if (!wkt) return null;
    const match = wkt.match(/POINT\s?\(([-\d.]+)\s+([-\d.]+)\)/);
    return match ? { lng: parseFloat(match[1]), lat: parseFloat(match[2]) } : null;
  }

  /** Update data after dialog action */
  updateRowData(row_obj: any): void {
    this.dataSource.data = this.dataSource.data.map((value) => {
      if (value.id === row_obj.id) {
        return { ...value, ...row_obj };
      }
      return value;
    });
  }

  /** File selection logic */
  selectFile(event: any): void {
    if (!event.target.files[0]) return;
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = () => {
      if (this.selectedPerson) {
        this.selectedPerson.imagePath = reader.result;
      }
    };
  }
 hasdatefilterApplied():boolean{
  return !!this.filters.startDate && !!this.filters.endDate;

  }
hasFiltersApplied(): boolean {
  return this.hasdatefilterApplied() ||!(
    !this.filters.full_name &&
  
    !this.filters.caste &&
    !this.filters.gender &&
    !this.filters.age_range &&
    !this.filters.marital_status &&
    !this.filters.blood_group &&
    !this.filters.height_range
  );
}
}