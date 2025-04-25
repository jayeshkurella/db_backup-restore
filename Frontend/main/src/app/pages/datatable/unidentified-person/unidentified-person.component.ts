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
  imports: [ MaterialModule,
          TablerIconsModule,
          MatNativeDateModule,
          NgScrollbarModule,
          CommonModule,
          FormsModule,
          HttpClientModule ,
          MatProgressSpinnerModule],
  templateUrl:'./unidentified-person.component.html',
  styleUrls: ['./unidentified-person.component.css'], // ✅ Correct
  standalone: true,
  providers: [DatePipe], 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnidentifiedPersonComponent implements AfterViewInit , OnInit{
  @ViewChild(MatTable, { static: true }) table!: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild('dialogTemplate', { static: true }) dialogTemplate!: TemplateRef<any>;

  dataSource = new MatTableDataSource<any>([]);
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
    private missingPersonService: UnidentifiedpersonApiService
  ) {}
  filters = {
    full_name :'',
    city: '',
    state: '',
    year: '',
    month: '',
    caste: '', 
    age: '',
    marital_status: '',
    blood_group: '',
    height: '',
    district:'',
    gender:''

  };
  pendingPersons: any[] = [];
  resolvedPersons: any[] = [];
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSourcePending.paginator = this.paginatorPending;
    this.dataSourceResolved.paginator = this.paginatorResolved;
  }
  ngOnInit() {
    this.getStates();
    console.log("Dialog Template:", this.dialogTemplate);

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
  applyFilters(): void {
    this.loading = true;   // Show full-screen spinner
    this.progressMessage = "🔄 Applying filters...";

    this.missingPersonService.getPersonsByFilters(this.filters).subscribe(
        (response) => {
            this.loading = false;  // Hide spinner

            const responseData = response?.body || response;
            console.log("Extracted API Response:", responseData);

            if (responseData && Array.isArray(responseData)) {
                this.pendingPersons = responseData.filter(person => person.case_status === 'pending') || [];
                this.resolvedPersons = responseData.filter(person => person.case_status === 'resolved') || [];

                if (this.dataSourcePending) this.dataSourcePending.data = this.pendingPersons;
                if (this.dataSourceResolved) this.dataSourceResolved.data = this.resolvedPersons;

                this.progressMessage = "✅ Filters applied successfully!";
            } else {
                console.error('Unexpected API response:', responseData);

                this.pendingPersons = [];
                this.resolvedPersons = [];
                if (this.dataSourcePending) this.dataSourcePending.data = [];
                if (this.dataSourceResolved) this.dataSourceResolved.data = [];

                this.progressMessage = "❌ No data found!";
            }
        },
        (error) => {
            this.loading = false;  // Hide spinner
            console.error('Error fetching data:', error);
            this.progressMessage = "❌ Error applying filters!";
        }
    );
}


  /** Open MatDialog */
  openDialog(person: Person): void {
    const dialogRef = this.dialog.open(UnidentifiedPersonDialogComponent, {
      width: '600px',
      data: person,
    });
  
    dialogRef.afterOpened().subscribe(() => {
      setTimeout(() => this.initMap(), 300);
    });
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


}

