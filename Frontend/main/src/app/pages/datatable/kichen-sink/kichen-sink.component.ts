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
import { MatPaginator } from '@angular/material/paginator';
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
import { MissingPersonApiService } from './missing-person-api.service';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
        HttpClientModule ,
        MatProgressSpinnerModule
    ],
    providers: [DatePipe]
})
export class AppKichenSinkComponent implements AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);
  states = ['Maharashtra', 'Gujarat', 'Delhi', 'Karnataka']; 
  districts = ['Pune', 'Ahmedabad', 'Mumbai', 'Bangalore'];
  cities = ['Pune', 'Ahmedabad', 'Mumbai', 'Bangalore'];
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
  

  
  displayedColumns: string[] = ['sr', 'photo', 'full_name', 'age', 'gender', 'date_of_missing', 'action','match_with'];

  dataSource = new MatTableDataSource(employees);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);
   // ✅ Initialize data sources with empty arrays
   dataSourcePending = new MatTableDataSource<any>([]);
   dataSourceResolved = new MatTableDataSource<any>([]);
  

  @ViewChild('paginatorPending') paginatorPending!: MatPaginator;
  @ViewChild('paginatorResolved') paginatorResolved!: MatPaginator;
  constructor(public dialog: MatDialog, public datePipe: DatePipe,private missingPersonService:MissingPersonApiService) {}

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
  ngOnInit() {
    this.getStates();
  }
  getStates() {
    this.missingPersonService.getStates().subscribe(states => {
      this.allstates = states;
    });
  }
  ngAfterViewInit(): void {
    this.dataSourcePending.paginator = this.paginatorPending;
    this.dataSourceResolved.paginator = this.paginatorResolved;
    this.dataSource.paginator = this.paginator;
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
                this.pendingPersons = responseData.filter(person => person.case_status === 'Pending') || [];
                this.resolvedPersons = responseData.filter(person => person.case_status === 'Resolved') || [];

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






openDialog(obj: any): void {
  const dialogRef = this.dialog.open(AppKichenSinkDialogContentComponent, {
    width: '80vw', // 80% of the viewport width
    maxWidth: '900px', // Limit max width
    data: obj,
    panelClass: 'custom-dialog-container' 
  });

  // Ensure `selectedPerson` is set before initializing the map
  this.selectedPerson = obj; 

  // Delay to allow the dialog to render before initializing the map
  setTimeout(() => {
    this.initMap();
  }, 500);

  dialogRef.afterClosed().subscribe((result) => {
    if (result?.event === 'Update') {
      this.updateRowData(result.data);
    }
  });
}



  
  // tslint:disable-next-line - Disables all
  updateRowData(row_obj: Employee): boolean | any {
    this.dataSource.data = this.dataSource.data.filter((value: any) => {
      if (value.id === row_obj.id) {
        value.Name = row_obj.Name;
        value.Position = row_obj.Position;
        value.Email = row_obj.Email;
        value.Mobile = row_obj.Mobile;
        value.DateOfJoining = row_obj.DateOfJoining;
        value.imagePath = row_obj.imagePath;
      }
      return true;
    });
  }

  // tslint:disable-next-line - Disables all
  deleteRowData(row_obj: Employee): boolean | any {
    this.dataSource.data = this.dataSource.data.filter((value: any) => {
      return value.id !== row_obj.id;
    });
  }

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
  
    // Remove previous instance before creating a new one
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
}

@Component({
    selector: 'app-dialog-content',
    imports: [MatDialogModule, FormsModule, MaterialModule,CommonModule],
    providers: [DatePipe],
    templateUrl: 'kichen-sink-dialog-content.html'
})
export class AppKichenSinkDialogContentComponent {
  action: string;
  local_data: any;
  selectedImage: any = '';
  joiningDate: any = '';
  environment =environment
  constructor(
    public dialogRef: MatDialogRef<AppKichenSinkDialogContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // constructor(
  //   public datePipe: DatePipe,
  //   public dialogRef: MatDialogRef<AppKichenSinkDialogContentComponent>,
  //   @Optional() @Inject(MAT_DIALOG_DATA) public data: Employee
  // ) {
  //   this.local_data = { ...data };
  //   this.action = this.local_data.action;
  //   if (this.local_data.DateOfJoining !== undefined) {
  //     this.joiningDate = this.datePipe.transform(
  //       new Date(this.local_data.DateOfJoining),
  //       'yyyy-MM-dd'
  //     );
  //   }
  //   if (this.local_data.imagePath === undefined) {
  //     this.local_data.imagePath = 'assets/images/profile/user-1.jpg';
  //   }
  // }
  // closeDialog(): void {
  //   this.dialogRef.close();
  // }
  doAction(): void {
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }
  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }

  selectFile(event: any): void {
    if (!event.target.files[0] || event.target.files[0].length === 0) {
      // this.msg = 'You must select an image';
      return;
    }
    const mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      // this.msg = "Only images are supported";
      return;
    }
    // tslint:disable-next-line - Disables all
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    // tslint:disable-next-line - Disables all
    reader.onload = (_event) => {
      // tslint:disable-next-line - Disables all
      this.local_data.imagePath = reader.result;
    };
  }
}
