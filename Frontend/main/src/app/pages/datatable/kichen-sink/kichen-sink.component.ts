import {
  Component,
  Inject,
  Optional,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  MatTableDataSource,
  MatTable,
  MatTableModule,
} from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

import { CommonModule, DatePipe } from '@angular/common';
import { AppAddKichenSinkComponent } from './add/add.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatNativeDateModule } from '@angular/material/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MaterialModule } from 'src/app/material.module';
// import * as bootstrap from 'bootstrap';
import * as L from 'leaflet';
import { environment } from 'src/envirnment/envirnment';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavigationExtras, Router } from '@angular/router';
import { MissingPersonApiService } from './missing-person-api.service';
import { STATES } from 'src/app/constants/states';
// import { ConsoleReporter } from 'jasmine';

export interface Employee {
  id: number;
  Name: string;
  Position: string;
  Email: string;
  Mobile: number;
  DateOfJoining: Date;
  imagePath: string;
}

export interface Person {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  date_reported: string;
  photo_photo?: string;
}

const employees = [
  {
    id: 1,
    Name: 'Johnathan Deo',
    Position: 'Seo Expert',
    Email: 'r@gmail.com',
    Mobile: 9786838,
    DateOfJoining: new Date('01-2-2020'),
    Salary: 12000,
    Projects: 10,
    imagePath: 'assets/images/profile/user-2.jpg',
  },
  {
    id: 2,
    Name: 'Mark Zukerburg',
    Position: 'Web Developer',
    Email: 'mark@gmail.com',
    Mobile: 8786838,
    DateOfJoining: new Date('04-2-2020'),
    Salary: 12000,
    Projects: 10,
    imagePath: 'assets/images/profile/user-3.jpg',
  },
  {
    id: 3,
    Name: 'Sam smith',
    Position: 'Web Designer',
    Email: 'sam@gmail.com',
    Mobile: 7788838,
    DateOfJoining: new Date('02-2-2020'),
    Salary: 12000,
    Projects: 10,
    imagePath: 'assets/images/profile/user-4.jpg',
  },
  {
    id: 4,
    Name: 'John Deo',
    Position: 'Tester',
    Email: 'john@gmail.com',
    Mobile: 8786838,
    DateOfJoining: new Date('03-2-2020'),
    Salary: 12000,
    Projects: 11,
    imagePath: 'assets/images/profile/user-5.jpg',
  },
  {
    id: 5,
    Name: 'Genilia',
    Position: 'Actor',
    Email: 'genilia@gmail.com',
    Mobile: 8786838,
    DateOfJoining: new Date('05-2-2020'),
    Salary: 12000,
    Projects: 19,
    imagePath: 'assets/images/profile/user-6.jpg',
  },
  {
    id: 6,
    Name: 'Jack Sparrow',
    Position: 'Content Writer',
    Email: 'jac@gmail.com',
    Mobile: 8786838,
    DateOfJoining: new Date('05-21-2020'),
    Salary: 12000,
    Projects: 5,
    imagePath: 'assets/images/profile/user-7.jpg',
  },
  {
    id: 7,
    Name: 'Tom Cruise',
    Position: 'Actor',
    Email: 'tom@gmail.com',
    Mobile: 8786838,
    DateOfJoining: new Date('02-15-2019'),
    Salary: 12000,
    Projects: 9,
    imagePath: 'assets/images/profile/user-3.jpg',
  },
  {
    id: 8,
    Name: 'Hary Porter',
    Position: 'Actor',
    Email: 'hary@gmail.com',
    Mobile: 8786838,
    DateOfJoining: new Date('07-3-2019'),
    Salary: 12000,
    Projects: 7,
    imagePath: 'assets/images/profile/user-6.jpg',
  },
  {
    id: 9,
    Name: 'Kristen Ronaldo',
    Position: 'Player',
    Email: 'kristen@gmail.com',
    Mobile: 8786838,
    DateOfJoining: new Date('01-15-2019'),
    Salary: 12000,
    Projects: 1,
    imagePath: 'assets/images/profile/user-5.jpg',
  },
];

@Component({
  templateUrl: './kichen-sink.component.html',
  styleUrls: ['./kichen-sink.component.scss'],
  imports: [
    MaterialModule,
    TablerIconsModule,
    MatNativeDateModule,
    NgScrollbarModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatProgressSpinnerModule
  ],
  providers: [DatePipe]
})

export class AppKichenSinkComponent {

  today: Date = new Date();

  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  castes = ['General', 'OBC', 'SC', 'ST'];
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  environment = environment;
  missingPersons: any[] = [];
  filteredPersons: any[] = [];
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  selectedPerson: any = null;
  selectedMatch: any = null;
  searchText: any;
  allstates: string[] = STATES;
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




  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  paginationLinks: any = {};

  displayedColumnsPending: string[] = ['sr', 'photo', 'full_name', 'age', 'gender', 'date_of_missing', 'action', 'match_with'];
  displayedColumnsResolved: string[] = ['sr', 'photo', 'full_name', 'age', 'gender', 'date_of_missing', 'action'];



  displayedColumns: string[] = ['sr', 'photo', 'full_name', 'age', 'gender', 'date_of_missing', 'action', 'match_with'];

  // dataSource = new MatTableDataSource(employees);
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
  //   Object.create(null);
  dataSourcePending = new MatTableDataSource<any>([]);
  dataSourceResolved = new MatTableDataSource<any>([]);
  // ngAfterViewInit() {
  //   this.dataSourcePending.paginator = this.paginatorPending;
  //   this.dataSourceResolved.paginator = this.paginatorResolved;
  // }

  // @ViewChild('paginatorPending') paginatorPending!: MatPaginator;
  // @ViewChild('paginatorResolved') paginatorResolved!: MatPaginator;
  constructor(
    public dialog: MatDialog,
    public datePipe: DatePipe,
    private missingPersonService: MissingPersonApiService,
    private router: Router
  ) {
    // Load saved state from sessionStorage if available
    const savedState = sessionStorage.getItem('missingPersonsSearchState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      this.filters = parsedState.filters || this.defaultFilters();
      this.dataSourcePending.data = parsedState.pendingPersons || [];
      this.dataSourceResolved.data = parsedState.resolvedPersons || [];
      this.filtersApplied = parsedState.filtersApplied || false;
      this.currentPage = parsedState.currentPage || 1;
      this.totalItems = parsedState.totalItems || 0;
    } else {
      // Apply default filters
      this.filters = this.defaultFilters();
    }
  }
  defaultFilters() {
    return {
      full_name: '',
      city: '',
      state: 'Maharashtra',
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
  }
  filters = {
    full_name: '',
    city: '',
    state: 'Maharashtra',
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



  pendingPersons: any[] = [];
  resolvedPersons: any[] = [];
  ngOnInit() {
    this.allstates = STATES;
    this.filters.state = 'Maharashtra';
    this.onStateChange();
    this.applyFilters();
  }
  // getStates() {
  //   this.missingPersonService.getStates().subscribe(states => {
  //     this.allstates = states;

  //     // Ensure 'Maharashtra' is in the list before setting
  //     if (this.allstates.includes('Maharashtra')) {
  //       this.filters.state = 'Maharashtra';
  //       this.onStateChange();

  //       // Automatically apply filters
  //       this.applyFilters();
  //     }
  //   });
  // }

  onPaginatorChange(event: PageEvent): void {
    this.itemsPerPage = event.pageSize;
    this.currentPage = event.pageIndex + 1; // Angular Material paginator is zero-based
    this.applyFilters();
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

  onPageSizeChange() {
    this.currentPage = 1; // Reset to first page
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getLastPageNumber()) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  goToFirstPage(): void {
    if (this.paginationLinks?.first) {
      this.loadPageByUrl(this.paginationLinks.first);
    } else {
      this.goToPage(1);
    }
  }

  // Previous Page (FIXED)
  goToPreviousPage(): void {
    if (this.paginationLinks?.previous) {
      this.loadPageByUrl(this.paginationLinks.previous);
    } else if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  // Next Page
  goToNextPage(): void {
    if (this.paginationLinks?.next) {
      this.loadPageByUrl(this.paginationLinks.next);
    } else {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Last Page
  goToLastPage(): void {
    if (this.paginationLinks?.last) {
      this.loadPageByUrl(this.paginationLinks.last);
    } else {
      this.goToPage(this.getLastPageNumber());
    }
  }
  loadPageByUrl(url: string): void {
    this.loading = true;
    this.missingPersonService.getPersonsByUrl(url).subscribe(
      (response) => {
        this.loading = false;
        this.handleApiResponse(response);
        // Explicitly update current page from meta
        this.currentPage = response?.meta?.current_page || this.currentPage;
      },
      (error) => {
        this.loading = false;
        console.error('Error loading page:', error);
      }
    );
  }

  getLastPageNumber(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getFirstItemNumber(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getLastItemNumber(): number {
    const lastItem = this.currentPage * this.itemsPerPage;
    return lastItem > this.totalItems ? this.totalItems : lastItem;
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

    if (!this.filters.state) {
      this.filters.state = 'Maharashtra';
    }

    const requestParams = {
      ...this.filters,
      page: this.currentPage,
      page_size: this.itemsPerPage
    };

    this.missingPersonService.getPersonsByFilters(requestParams).subscribe(
      (response) => {
        this.loading = false;
        this.handleApiResponse(response);
      },
      (error) => {
        this.loading = false;
        console.error('Error fetching data:', error);
        this.progressMessage = error.error?.message || "❌ Error applying filters!";
      }
    );
  }
  handleApiResponse(response: any): void {
    const responseData = response?.body?.results || response?.results || [];
    console.log("Total records from API:", responseData.length); 
    this.totalItems = response?.body?.count || response?.count || 0;
    this.paginationLinks = response?.body?.links || response?.links || null;

    // Sync current page with API meta data
    if (response?.meta?.current_page) {
      this.currentPage = response.meta.current_page;
    }

    this.dataSourcePending.data = [];
    this.dataSourceResolved.data = [];

    if (responseData?.message) {
      this.progressMessage = responseData.message;
    } else if (Array.isArray(responseData)) {
      this.dataSourcePending.data = responseData.filter(person => person.case_status === 'pending');
      this.dataSourceResolved.data = responseData.filter(person => person.case_status === 'resolved');

      this.progressMessage = responseData.length > 0
        ? "✅ Filters applied successfully!"
        : "No matching records found";
    } else {
      this.progressMessage = "❌ Unexpected response format from server";
    }
  }
  resetFilters(): void {
    this.filters = {
      full_name: '',
      city: '',
      state: 'Maharashtra',
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
    sessionStorage.removeItem('missingPersonsSearchState');

    this.progressMessage = "Filters have been reset";
    // Load district and cities again for Maharashtra
    this.onStateChange();

    // Apply Maharashtra filters again
    this.applyFilters();
  }


  // Update your saveSearchState method
  private saveSearchState(): void {
    const state = {
      filters: this.filters,
      // pendingPersons: this.dataSourcePending.data,
      // resolvedPersons: this.dataSourceResolved.data,
      filtersApplied: this.filtersApplied,
      currentPage: this.currentPage,
      totalItems: this.totalItems
    };
    sessionStorage.setItem('missingPersonsSearchState', JSON.stringify(state));
  }


  // ✅ Helper function
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


  // openDialog(obj: any): void {
  //   const dialogRef = this.dialog.open(AppKichenSinkDialogContentComponent, {
  //     width: '80vw', // 80% of the viewport width
  //     maxWidth: '900px', // Limit max width
  //     data: obj,
  //     panelClass: 'custom-dialog-container'
  //   });

  //   // Ensure `selectedPerson` is set before initializing the map
  //   this.selectedPerson = obj;

  //   // Delay to allow the dialog to render before initializing the map
  //   setTimeout(() => {
  //     this.initMap();
  //   }, 500);

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result?.event === 'Update') {
  //       this.updateRowData(result.data);
  //     }
  //   });
  // }

  // tslint:disable-next-line - Disables all
  // updateRowData(row_obj: Employee): boolean | any {
  //   this.dataSource.data = this.dataSource.data.filter((value: any) => {
  //     if (value.id === row_obj.id) {
  //       value.Name = row_obj.Name;
  //       value.Position = row_obj.Position;
  //       value.Email = row_obj.Email;
  //       value.Mobile = row_obj.Mobile;
  //       value.DateOfJoining = row_obj.DateOfJoining;
  //       value.imagePath = row_obj.imagePath;
  //     }
  //     return true;
  //   });
  // }

  // tslint:disable-next-line - Disables all
  // deleteRowData(row_obj: Employee): boolean | any {
  //   this.dataSource.data = this.dataSource.data.filter((value: any) => {
  //     return value.id !== row_obj.id;
  //   });
  // }

  removePreviousMarker(): void {
    if (this.marker) {
      this.map?.removeLayer(this.marker);
      this.marker = undefined;
    }
  }

  initMap(): void {
    if (!this.selectedPerson) {
      console.error('No selected person available');
      return;
    }

    const location = this.parseWKT(this.selectedPerson.location);

    if (!location) {
      console.error('No valid coordinates found for the selected person');
      return;
    }

    if (this.map) {
      this.map.remove();
    }

    // Initialize map
    this.map = L.map('map', {
      center: [location.lat, location.lng],
      zoom: 13,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
    if (match) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
    return null;
  }


  onMatchWithUP(uuid: string): void {
    this.missingPersonService.matchMissingPersonWithUP(uuid).subscribe({
      next: response => {
        const resultData = response.body;
        console.log('Matched with UP:', resultData);

        this.router.navigate(['/search/match-up-result'], {
          state: { data: resultData }
        });
      },
      error: err => {
        console.error('Failed to match with UP:', err);
      }
    });
  }

  hasGeographicFiltersApplied(): boolean {
    return !!this.filters.state || !!this.filters.district && !!this.filters.city;
  }

  hasdatefilterApplied(): boolean {
    return !!this.filters.startDate && !!this.filters.endDate;

  }
  hasActiveFilters(): boolean {
    return Object.values(this.filters).some(value => value !== '');
  }

  hasFiltersApplied(): boolean {
    return this.hasGeographicFiltersApplied() || this.hasdatefilterApplied() ||
      !!(this.filters.full_name ||

        this.filters.caste ||
        this.filters.gender ||
        this.filters.age_range ||
        this.filters.marital_status ||
        this.filters.blood_group ||
        this.filters.height_range);
  }


  viewDetails(person: Person): void {
    this.saveSearchState();
    sessionStorage.setItem('viewData', JSON.stringify({ id: person.id }));
    this.router.navigate(['/search/view-missing-person']);
  }
}


@Component({
  selector: 'app-dialog-content',
  imports: [MatDialogModule, FormsModule, MaterialModule, CommonModule],
  providers: [DatePipe],
  templateUrl: 'kichen-sink-dialog-content.html'
})
export class AppKichenSinkDialogContentComponent {
  action: string;
  local_data: any;
  selectedImage: any = '';
  joiningDate: any = '';
  environment = environment
  constructor(
    public dialogRef: MatDialogRef<AppKichenSinkDialogContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  doAction(): void {
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }
  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }
  selectFile(event: any): void {
    if (!event.target.files[0] || event.target.files[0].length === 0) {
      return;
    }
    const mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (_event) => {
      this.local_data.imagePath = reader.result;
    };
  }

}