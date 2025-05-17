import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as L from 'leaflet';

// import 'leaflet.markercluster'; 

// import '../../../../../src/leaflet-panel-layers'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

import 'leaflet-basemaps/L.Control.Basemaps'; 


import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/envirnment/envirnment';
import { MapApiService } from './map-api.service';
import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogModelViewComponent } from './dialog-model-view/dialog-model-view.component';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-revenue-updates',
  imports: [ MaterialModule, TablerIconsModule,FormsModule ,CommonModule,MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButton ],
  templateUrl: './revenue-updates.component.html',
  styleUrls: ['./revenue-updates.component.css'],
})
export class AppRevenueUpdatesComponent implements OnInit ,AfterViewInit {

  environment = environment;
  geo_url =environment.geo_url
  selectedPersonDetails: any = null;
  stateLayer = "GeoFlow_WCD:tblstates";
  stateLayerName: any;
  distLayer="GeoFlow_WCD:tbldistricts";
  distLayerName: any;
 
  allmissingperson: any[] = [];
  allunidentifiedperson: any[] = [];
  allunidentiedbodies: any[] = [];
  missingpersonscount: any[] = [];
  unidentifiedpersonscount: any[] = [];
  missingPersonGenderCounts: any[] = [];
  allpolicestations: any[] = [];
  allstates: string[] = [];
  allcities: string[] = [];
  alldistricts: string[] = [];
  
  selectedcase= 'All Cases';
  stateCoordinates: any[] = []; 

  alldistrictss: string[] = [];
  selectedPoliceStation: { id: number; name: string } | 'All Police Stations' = 'All Police Stations';
  selectedgender='All Genders';
  allBloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']; 
  missingPersonsCount: number = 0;
  missingPersonGenderCountss: { Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0 };
  solvedGenderCounts: { Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0};
  pendingGendercounts: { Male: number; Female: number ; Other: number } = { Male: 0, Female: 0, Other:0};
  unidentifiedPersonGenderCounts: { Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0 };
  unidentifiedBodyGenderCounts: { Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0 };
  missingPersontotalcount: number = 0; 
  unidentifiedPersonTotalCounts: number = 0; 
  unidentifiedBodyTotalCount: number = 0; 
  selectedBloodGroup = 'All Blood Groups'; 
  state: string | null = null;
  district: string | null = null;
  city: string | null = null;
  policeStationId: string | null = null;
  gender: string | null = null;
  village: string | null = null;
  height: string | null = null;
  weight: string | null = null;
  blood_group: string | null = null;
  Marital: string | null = null;
  allgenders: any;
  selectedStartDate: any;
  selectedEndDate: any;
  allVillages: any;
  heightRange:string | null = null;
  weightRange: string | null = null;
  AgeRange: string | null = null;
  selectedWeightRange: string = 'All Weights';
  selectedHeightRange: string = 'All Heights';
  selectedAgeRange: string = 'All Ages';
  selectedmarital :string ='Marital status'
  filteredMissingPersonssss: any[] = [];
  filteredUnidentifiedPersonssss: any[] = [];
  filteredunidentifiedboidessss: any[] = [];
  ddOverlays: { name: string, layer: L.Layer }[] = [];
  overlays:any;
  selectedPerson: any = null;
  allcasestutuscount: number | undefined;
  ongoingcount: number = 0;
  solvedcount:number = 0;
  pendingcount: number = 0;
  femaleCount:number = 0;
  maleCount:number = 0;
  
  Found_alivecount: number = 0;
  Deceasedcount: number = 0;
  marker: any;
  found_alivegendercount :{ Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0};
  deceasedCountgendercount :{ Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0};

  UPsolvedcount:number = 0;
  UPongoingcount : number = 0
  UPallcasestutuscount : number = 0
  UPpendingcount: number = 0;
  UPFound_alivecount: number = 0;
  UPDeceasedcount: number = 0;
  UPfound_alivegendercount :{ Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0};
  UPdeceasedCountgendercount :{ Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0};
  UPpendingGendercounts: { Male: number; Female: number ; Other: number } = { Male: 0, Female: 0, Other:0};
  UPsolvedGenderCounts: { Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0};

  UBsolvedcount:number = 0;
  UBongoingcount : number = 0
  UBallcasestutuscount : number = 0
  UBpendingcount: number = 0;
  UBFound_alivecount: number = 0;
  UBDeceasedcount: number = 0;
  UBfound_alivegendercount :{ Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0};
  UBdeceasedCountgendercount :{ Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0};
  UBpendingGendercounts: { Male: number; Female: number ; Other: number } = { Male: 0, Female: 0, Other:0};
  UBsolvedGenderCounts: { Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0};
  mainAppLayer: L.Layer | undefined;
  // geoServerClusterGroup: L.MarkerClusterGroup | undefined;
  permanentAddressLayer: any;
  temporaryAddressLayer: any;


  states:any;
  selectedState= 'state';
  selectedDistrict = 'district';
  selectedCity= 'city';
  selectedVillage = 'village';
  filteredData: any[] = [];
  missingPersonPendingMale: number =0
  unidentifiedPersonPendingFemale: number=0
  unidentifiedPersonPendingMale: number=0
  unidentifiedBodyPendingMale: number=0
  unidentifiedBodyPendingFemale: number=0
  missingPersonPendingFemale: number=0
  missingPersonResolvedMale: number=0;
  missingPersonResolvedFemale: number=0;
  missingPersonMatchedWithUnidentifiedMale: number =0;
  missingPersonMatchedWithUnidentifiedFemale: number=0;
  missingPersonMatchedWithUnidentifiedBodyMale: number =0;
  missingPersonMatchedWithUnidentifiedBodyFemale: number=0;
  unidentifiedPersonMatchedWithMissingMale: number=0;
  unidentifiedPersonMatchedWithMissingFemale: number=0;
  unidentifiedBodyMatchedWithMissingMale: number =0;
  unidentifiedBodyMatchedWithMissingFemale: number=0;
    months: any;
    displayedColumns: string[] = ['srNo', 'photo', 'fullName', 'age', 'gender', 'city', 'district', 'state', 'action'];   


  constructor(
    private router: Router, 
    private http: HttpClient,
    private filterService :MapApiService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
  }
  ngAfterViewInit(): void {
    this.initMap();
    
  }
  pagination: any = {
    current_page: 1,
    total_pages: 1,
    has_previous: false,
    has_next: false
  };

  onPageChangeevent(page: number): void {
    // this.getMissingPersonsData(page);
    
  }
 
  ngOnInit(): void {
    this.loadStateData();
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // this.loadStateData();
    this.selectedState = 'Maharashtra';
    this.selectedDistrict = 'All Districts';
    this.selectedCity = 'All Cities';
    this.selectedgender = 'All Genders';
    this.selectedPoliceStation = 'All Police Stations';
    this.selectedBloodGroup = 'All Blood Groups';
    this.selectedVillage = 'All Villages';
    this.selectedHeightRange = 'All Heights';
    this.selectedWeightRange = 'All Weights';
    this.selectedAgeRange = 'All Ages';
    this.selectedmarital = 'Marital status';
    // Set dates after initializing other properties
    this.selectedStartDate = thirtyDaysAgo;
    this.selectedEndDate = today;
    // Set the max end date for the date picker
    this.maxEndDate = new Date(thirtyDaysAgo);
    this.maxEndDate.setMonth(this.maxEndDate.getMonth() + 1);

    // Set max selectable date to today
    this.maxSelectableDate = new Date(today);

    this.filterDataByFilters()
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
maxEndDate: Date | null = null;
maxSelectableDate: Date | null = null;

// onStartDateChange(startDate: Date) {
//   if (startDate) {
//     this.selectedStartDate = new Date(startDate);
    
//     this.maxEndDate = new Date(startDate);
//     this.maxEndDate.setDate(this.maxEndDate.getDate() + 30);
    
//     // Reset end date if beyond new max
//     if (this.selectedEndDate && this.selectedEndDate > this.maxEndDate) {
//       this.selectedEndDate = null;
//     }
    
//     // Auto-apply filters only if both dates are set
//     if (this.selectedEndDate) {
//     }
//   }
// }

// onEndDateChange(endDate: Date) {
//   if (endDate) {
//     this.selectedEndDate = new Date(endDate);
    
//     // Auto-apply filters if both dates are set
//     if (this.selectedStartDate) {
//     }
//   }
// }

  onStartDateChange(startDate: Date) {
    if (startDate) {
      // Create date without time component to avoid timezone issues
      const localDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      this.selectedStartDate = localDate;

      // Rest of your logic...
    }
    if (!startDate) {
      this.selectedStartDate = null;
      this.maxEndDate = null;
      return;
    }

    const today = new Date();
    const selectedStart = new Date(startDate);

    // Prevent future start dates
    if (selectedStart > today) {
      this.snackBar.open('start date cannot be in the future', 'Close', {
        duration: 3000,  // auto close after 3 seconds
        verticalPosition: 'top',  // or 'bottom'
        horizontalPosition: 'right', // or 'left', 'right'
      });
      this.selectedStartDate = null;
      return;
    }

    this.selectedStartDate = selectedStart;

    // Calculate maximum end date (either 30 days later or today, whichever comes first)
    const maxPossibleEndDate = new Date(selectedStart);
    maxPossibleEndDate.setDate(selectedStart.getDate() + 30);

    this.maxEndDate = maxPossibleEndDate > today ? today : maxPossibleEndDate;

    // Auto-adjust end date if it's now invalid
    if (this.selectedEndDate && (this.selectedEndDate > this.maxEndDate || this.selectedEndDate < selectedStart)) {
      this.selectedEndDate = this.maxEndDate;
    }

  }

  onEndDateChange(endDate: Date) {
    if (endDate) {
      // Create date without time component
      const localDate = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      this.selectedEndDate = localDate;
    }
    if (!endDate) {
      this.selectedEndDate = null;
      return;
    }

    const today = new Date();
    const selectedEnd = new Date(endDate);

    // Prevent future end dates
    if (selectedEnd > today) {
      this.snackBar.open('End date cannot be in the future', 'Close', {
        duration: 3000,  // auto close after 3 seconds
        verticalPosition: 'top',  // or 'bottom'
        horizontalPosition: 'right', // or 'left', 'right'
      }); this.selectedEndDate = today;
      return;
    }

    // Ensure end date is within 30 days of start date
    if (this.selectedStartDate) {
      const diffInDays = (selectedEnd.getTime() - this.selectedStartDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffInDays > 30) {
        this.snackBar.open('Maximum date range is 30 days', 'Close', {
          duration: 3000,  // auto close after 3 seconds
          verticalPosition: 'top',  // or 'bottom'
          horizontalPosition: 'right', // or 'left', 'right'
        });
        this.selectedEndDate = new Date(this.selectedStartDate);
        this.selectedEndDate.setDate(this.selectedStartDate.getDate() + 30);
        if (this.selectedEndDate > today) {
          this.selectedEndDate = today;
        }
        return;
      }
    }

    this.selectedEndDate = selectedEnd;
  }

  private loadStateData(): void {
    this.http.get<any[]>('assets/state.json').subscribe(data => {
      this.stateCoordinates = data;
      this.allstates = data.map(state => state.name); 
      if (this.selectedState && this.selectedState !== 'All States') {
    this.onStateChange(this.selectedState);
  }
    });
  }

  
  moveMapToState(stateCode: string): void {
    const indiaCoordinates: [number, number] = [20.5937, 78.9629];  
    const indiaZoomLevel = 6; 
    
    if (stateCode === 'All States') {
      // If 'All States' is selected, move the map to the center of India
      if (this.map) {
        this.map.flyTo(indiaCoordinates, indiaZoomLevel, {
          duration: 3,
          easeLinearity: 0.25 
        });
      }
    } else {
      const state = this.stateCoordinates.find(s => s.name === stateCode);
      if (this.map && state) {
        // Fly to the center of the selected state with smooth transition
        this.map.flyTo(state.coordinates, 7, {
          duration: 2,
          easeLinearity: 0.25 
        });
      }
    }
  }
  
  

  filterDataByFilters(): void {
    // First validate dates
  const dateFilter = this.validateAndBuildDateFilter();
  if (dateFilter === null) {
    return; // Stop execution if date validation fails
  }
        this.moveMapToState(this.selectedState);

        const shouldLoadState = this.selectedState && this.selectedState !== 'All States' && this.district?.length === 0;
    const shouldLoadDistrict = this.selectedDistrict && this.selectedDistrict !== 'All Districts' && this.city?.length === 0;
    const shouldLoadCity = this.selectedCity && this.selectedCity !== 'All Cities' && this.village?.length === 0;

    if (shouldLoadState) {
        this.onStateChange(this.selectedState);
    }

    if (shouldLoadDistrict) {
        this.onDistrictChange(this.selectedDistrict);
    }

    if (shouldLoadCity) {
        this.onCityChange(this.selectedCity);
    }

    this.initOperationalLayers();

 }


  

  viewDetails(person: any): void {
  const personId = person.id.split('.')[1];
  console.log(personId)
  this.router.navigate(['/person', personId]);
 }
  
  

  private missingPersonLayer: L.LayerGroup = L.layerGroup();
  private unidentifiedPersonLayer: L.LayerGroup = L.layerGroup();
  private unidentifiedBodiesLayer: L.LayerGroup = L.layerGroup();
  private map: L.Map | undefined;
  
  private initMap(): void { 
    const baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    });
  
    const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    });
  
    const baseMaps = {
      "Base Map": baseMap,
      "Satellite Map": satelliteMap
    };
  
    this.map = L.map('map', {
      center: [20.5937, 78.9629],
      zoom: 6,
      layers: [baseMap]
    });
  
    this.stateLayerName = L.tileLayer.wms(environment.geo_url, {
      layers: this.stateLayer,
      format: 'image/png',
      transparent: true
    });
  
    this.distLayerName = L.tileLayer.wms(environment.geo_url, {
      layers: this.distLayer,
      format: 'image/png',
      transparent: true
    });
  
    this.initOverlays();
  
    this.stateLayerName.addTo(this.map);
    this.distLayerName.addTo(this.map);
  
    // Removed markerClusterGroup related code
  
    if (typeof L.control.panelLayers === 'function') {
      const panelLayers = L.control.panelLayers({}, this.overlays, {
        collapsed: false,
        collapsibleGroups: true,
        position: 'topright'
      }).addTo(this.map!);
    }
  }
  
  
  
  

 
  toggleLayer(event: any) {
    this.overlays.forEach((group: { layers: any[]; }) => {
      group.layers.forEach(layer => {
        if (event.target.value === layer.name) {
          if (event.target.checked) {
            console.log(`Adding ${layer.name}`);
            layer.layer.addTo(this.map!);
          } else {
            console.log(`Removing ${layer.name}`);
            layer.layer.remove();
          }
        }
      });
    });
  }
  
  onDateChange() {
    if (this.selectedStartDate && this.selectedEndDate) {
      const startDate = new Date(this.selectedStartDate);
      const endDate = new Date(this.selectedEndDate);
  
      if (startDate > endDate) {
        alert("Start date cannot be after end date.");
        return;
      }
  
      this.initOperationalLayers(); 
    }
  }
    showNoDataMessage() {
        // Displaying a console message
        console.log("No data available for the current filters");

        // Display a message using Angular Material Snackbar
        this.snackBar.open('No data available for the current filters', 'OK', {
            duration: 3000,  // The duration for which the snackbar is visible (in milliseconds)
            horizontalPosition: 'center',  // Snackbar position horizontally
            verticalPosition: 'bottom',  // Snackbar position vertically
            panelClass: ['custom-snackbar'], // Optional: you can style it further
        });
    }
  private formatDated(date: Date): string {
    // Use local date components instead of UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; 
    
  }
//  validateAndBuildDateFilter() {
//   // Check if both dates are empty
//   if (!this.selectedStartDate && !this.selectedEndDate) {
//     alert("Please select date range (maximum one month)");
//     return null;
//   }

//   // Check if only one date is selected
//   if (!this.selectedStartDate || !this.selectedEndDate) {
//     alert("Please select both start and end dates");
//     return null;
//   }
//   if (this.selectedStartDate && this.selectedEndDate) {
//     const startDate = new Date(this.selectedStartDate);
//     const endDate = new Date(this.selectedEndDate);

//     // Set time components
//     startDate.setHours(0, 0, 0, 0);
//     endDate.setHours(23, 59, 59, 999);

//     // Calculate difference in milliseconds
//     const diffInMs = endDate.getTime() - startDate.getTime();
//     const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    
//     // Allow exactly 30 days range (not calendar month)
//     if (diffInDays > 31) {
//       alert("Date range cannot exceed 30 days. Please adjust your dates.");
//       return null;
//     }

//     // Format dates for backend (YYYY-MM-DD)
//     const formatDate = (date: Date) => {
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       return `${year}-${month}-${day}`;
//     };

//     const formattedStart = formatDate(startDate);
//     const formattedEnd = formatDate(endDate);

//     return `reported_date >= '${formattedStart}' AND reported_date <= '${formattedEnd}'`;
//   }
//   return null;
// }

  validateAndBuildDateFilter() {
    // Check if dates are selected

    if (!this.selectedStartDate) {
      this.snackBar.open('Please select the Start Date', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['snackbar-warning']
      });
      return null;
    }

    if (!this.selectedEndDate) {
      this.snackBar.open('Please select the End Date', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['snackbar-warning']
      });
      return null;
    }
    if (!this.selectedStartDate || !this.selectedEndDate) {
      this.snackBar.open('Please select both start and end dates', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['snackbar-warning']  // optional, for styling
      });
      return null;
    }

    const startDate = new Date(this.selectedStartDate);
    const endDate = new Date(this.selectedEndDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Prevent future dates
    if (startDate > today || endDate > today) {
      this.snackBar.open('Dates cannot be in the future', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['snackbar-warning']  // optional, for styling
      });
      return null;
    }

    // Validate date order
    if (startDate > endDate) {
      this.snackBar.open('Start date must be before end date', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['snackbar-warning']  // optional, for styling
      });
      return null;
    }

    // Validate 30-day range
    const diffInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffInDays > 31) {
      this.snackBar.open('Maximum date range is 30 days', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['snackbar-warning']  // optional, for styling
      });
      return null;
    }


    // Use local date formatting
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedStart = formatDate(new Date(this.selectedStartDate));
    const formattedEnd = formatDate(new Date(this.selectedEndDate));

    return `person_approve_status='approved' AND state='${this.selectedState}' AND reported_date >= '${formattedStart}' AND reported_date <= '${formattedEnd}'`;
  }

  initOperationalLayers() {
    console.log("Clearing existing layers...");
    if (this.missingPersonLayer) this.missingPersonLayer.clearLayers();
    if (this.unidentifiedPersonLayer) this.unidentifiedPersonLayer.clearLayers();
    if (this.unidentifiedBodiesLayer) this.unidentifiedBodiesLayer.clearLayers();

    // Reinitialize individual layer groups
    this.missingPersonLayer = L.layerGroup();
    this.unidentifiedPersonLayer = L.layerGroup();
    this.unidentifiedBodiesLayer = L.layerGroup();
    // const customIcon = L.icon({
    //     iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
    //     iconSize: [25, 41],
    //     iconAnchor: [12, 41],
    //     popupAnchor: [1, -34],
    //     shadowUrl: 'assets/leaflet/images/marker-shadow.png',
    //     shadowSize: [41, 41]
    // });

    // Define male and female icons
    const maleIcon = L.icon({
      iconUrl: 'assets/old/images/final_male.png',
      iconSize: [41, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      // shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      shadowSize: [41, 41]
    });

    const femaleIcon = L.icon({
      iconUrl: 'assets/old/images/final_female.png',
      iconSize: [41, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      // shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      shadowSize: [41, 41]
    });


    // Build the CQL filter based on selected filters
    let cqlFilter = `person_approve_status='approved'`;


    if (this.selectedState && this.selectedState !== 'All States') {
      cqlFilter += ` AND state='${this.selectedState}'`;
    }

    if (this.selectedDistrict && this.selectedDistrict !== 'All Districts') {
      if (cqlFilter !== '') {
        cqlFilter += ' AND ';
      }
      cqlFilter += `district='${this.selectedDistrict}'`;
    }

    if (this.selectedCity && this.selectedCity !== 'All Cities') {
      if (cqlFilter !== '') {
        cqlFilter += ' AND ';
      }
      cqlFilter += `city='${this.selectedCity}'`;
    }

    if (this.selectedVillage && this.selectedVillage !== 'All Villages') {
      if (cqlFilter !== '') {
        cqlFilter += ' AND ';
      }
      cqlFilter += `village='${this.selectedVillage}'`;
    }

    if (this.selectedPoliceStation && this.selectedPoliceStation !== 'All Police Stations') {
      if (cqlFilter !== '') {
        cqlFilter += ' AND ';
      }
      cqlFilter += `police_station_id='${this.selectedPoliceStation}'`;
    }

    if (this.selectedcase && this.selectedcase !== 'All Cases') {
      if (cqlFilter !== '') {
        cqlFilter += ' AND ';
      }
      cqlFilter += `case_status='${this.selectedcase}'`;
    }

    if (this.selectedgender && this.selectedgender !== 'All Genders') {
      if (cqlFilter !== '') {
        cqlFilter += ' AND ';
      }
      cqlFilter += `gender='${this.selectedgender}'`;
    }

    if (this.selectedHeightRange && this.selectedHeightRange !== 'All Heights') {
      if (cqlFilter !== '') {
        cqlFilter += ' AND ';
      }
      // Directly match the height_range field with selected value
      cqlFilter += `height_range='${this.selectedHeightRange}'`;
    }

    if (this.selectedAgeRange && this.selectedAgeRange !== 'All Ages') {
  if (cqlFilter !== '') {
    cqlFilter += ' AND ';
  }
  const [minAge, maxAge] = this.selectedAgeRange.split('-');
  cqlFilter += `(age BETWEEN ${minAge} AND ${maxAge} OR age_range = '${minAge}-${maxAge}')`;
}


    if (this.selectedmarital && this.selectedmarital !== 'Marital status') {
      if (cqlFilter !== '') {
        cqlFilter += ' AND ';
      }
      cqlFilter += `marital_status='${this.selectedmarital}'`;
    }



    const dateFilter = this.validateAndBuildDateFilter();
    if (dateFilter) {
      if (cqlFilter !== '') {
        cqlFilter += ' AND ';
      }
      cqlFilter += dateFilter;
    }


    console.log("Filtering Data Between:", this.selectedStartDate, "and", this.selectedEndDate);



    // WFS request with CQL filters
    // const wfsUrl = `${environment.person_geoserver_url}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=chhaya_demo:Mainapp_person&outputFormat=application/json${cqlFilter ? `&cql_filter=${encodeURIComponent(cqlFilter)}` : ''}`;
    const wfsUrl = `${environment.person_geoserver_url}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=chhaya_demo:Mainapp_person&outputFormat=application/json${cqlFilter ? `&cql_filter=${encodeURIComponent(cqlFilter)}` : ''}`;

    fetch(wfsUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
        }
        return response.json();
      })
      .then(async (data) => {
        if (!data.features || data.features.length === 0) {
          console.warn("No features returned by GeoServer for the applied filter.");
          this.missingPersonsCount = 0;
          this.unidentifiedPersonTotalCounts = 0;
          this.unidentifiedBodyTotalCount = 0;
          this.maleCount = 0;
          this.femaleCount = 0;
          this.pendingcount = 0;
          this.missingPersonLayer.clearLayers();
          this.unidentifiedPersonLayer.clearLayers();
          this.unidentifiedBodiesLayer.clearLayers();
          // Clear the filtered data arrays
          this.filteredData = [];
          this.filteredMissingPersonssss = [];
          this.filteredUnidentifiedPersonssss = [];
          this.filteredunidentifiedboidessss = [];
          this.showNoDataMessage();
          return;
        }

        this.filteredData = data.features;

        // Categorize the data based on the 'type' field
        this.filteredMissingPersonssss = this.filteredData.filter(
          (person: any) => person.properties.type === 'Missing Person'
        );
        this.filteredUnidentifiedPersonssss = this.filteredData.filter(
          (person: any) => person.properties.type === 'Unidentified Person'
        );
        this.filteredunidentifiedboidessss = this.filteredData.filter(
          (person: any) => person.properties.type === 'Unidentified Body'
        );
        console.log(this.filteredunidentifiedboidessss)


        // Get Pending Male & Female for each category
        this.missingPersonPendingMale = this.filteredMissingPersonssss.filter(
          (person: any) => person.properties.case_status === 'Pending' && person.properties.gender === 'male'
        ).length;

        this.missingPersonPendingFemale = this.filteredMissingPersonssss.filter(
          (person: any) => person.properties.case_status === 'Pending' && person.properties.gender === 'female'
        ).length;



        this.unidentifiedPersonPendingMale = this.filteredUnidentifiedPersonssss.filter(
          (person: any) => person.properties.case_status === 'Pending' && person.properties.gender === 'male'
        ).length;

        this.unidentifiedPersonPendingFemale = this.filteredUnidentifiedPersonssss.filter(
          (person: any) => person.properties.case_status === 'Pending' && person.properties.gender === 'female'
        ).length;

        this.unidentifiedBodyPendingMale = this.filteredunidentifiedboidessss.filter(
          (person: any) => person.properties.case_status === 'Pending' && person.properties.gender === 'male'
        ).length;

        this.unidentifiedBodyPendingFemale = this.filteredunidentifiedboidessss.filter(
          (person: any) => person.properties.case_status === 'Pending' && person.properties.gender === 'female'
        ).length;

        // ✅ Matching Cases Based on `match_with` Feature
        this.missingPersonMatchedWithUnidentifiedMale = this.filteredMissingPersonssss.filter(
          (person: any) => person.properties.match_with === 'Unidentified Person' && person.properties.gender === 'male'
        ).length;


        this.missingPersonMatchedWithUnidentifiedFemale = this.filteredMissingPersonssss.filter(
          (person: any) => person.properties.match_with === 'Unidentified Person' && person.properties.gender === 'female'
        ).length;

        this.missingPersonMatchedWithUnidentifiedBodyMale = this.filteredMissingPersonssss.filter(
          (person: any) => person.properties.match_with === 'Unidentified Body' && person.properties.gender === 'male'
        ).length;

        this.missingPersonMatchedWithUnidentifiedBodyFemale = this.filteredMissingPersonssss.filter(
          (person: any) => person.properties.match_with === 'Unidentified Body' && person.properties.gender === 'female'
        ).length;


        // Unidentified Person Male Matched with Missing Person
        this.unidentifiedPersonMatchedWithMissingMale = this.filteredUnidentifiedPersonssss.filter(
          (person: any) => person.properties.match_with === 'Missing Person' && person.properties.gender === 'male'
        ).length;

        // Unidentified Person Female Matched with Missing Person
        this.unidentifiedPersonMatchedWithMissingFemale = this.filteredUnidentifiedPersonssss.filter(
          (person: any) => person.properties.match_with === 'Missing Person' && person.properties.gender === 'female'
        ).length;

        // Unidentified Body Male Matched with Missing Person
        this.unidentifiedBodyMatchedWithMissingMale = this.filteredunidentifiedboidessss.filter(
          (person: any) => person.properties.match_with === 'Missing Person' && person.properties.gender === 'male'
        ).length;

        // Unidentified Body Female Matched with Missing Person
        this.unidentifiedBodyMatchedWithMissingFemale = this.filteredunidentifiedboidessss.filter(
          (person: any) => person.properties.match_with === 'Missing Person' && person.properties.gender === 'female'
        ).length;

        console.log(this.unidentifiedBodyMatchedWithMissingFemale, "person")


        // Get counts
        this.missingPersonsCount = this.filteredMissingPersonssss.length;
        this.unidentifiedPersonTotalCounts = this.filteredUnidentifiedPersonssss.length;
        this.unidentifiedBodyTotalCount = this.filteredunidentifiedboidessss.length;
        this.maleCount = data.features.filter((person: any) => person.properties.gender === 'male').length;
        this.femaleCount = data.features.filter((person: any) => person.properties.gender === 'female').length;
        this.pendingcount = data.features.filter((person: any) => person.properties.case_status === 'Pending').length;

        // Add layers to map
        this.map!.addLayer(this.missingPersonLayer);
        this.map!.addLayer(this.unidentifiedPersonLayer);
        this.map!.addLayer(this.unidentifiedBodiesLayer);

        // Call the method to display details (if needed)
        this.displayFilteredDataDetails();

        // Load initial subset of points (e.g., first 100 points)
        // const initialPoints = data.features.slice(0, 100);
        // this.addMarkersToMap(initialPoints, customIcon);

        const initialPoints = data.features.slice(0, 100);
        this.addMarkersToMap(initialPoints, maleIcon, femaleIcon);


        // Load remaining points asynchronously
        const remainingPoints = data.features.slice(100);
        if (remainingPoints.length > 0) {
          setTimeout(() => {
            this.addMarkersToMap(remainingPoints, maleIcon, femaleIcon);
          }, 1000); // Delay to ensure initial points are rendered first
        }

      })
      .catch(error => {
        console.error("Error fetching GeoJSON:", error);
        alert("An error occurred while fetching data. Please try again.");
      });

    let state: L.Layer = L.tileLayer.wms(this.geo_url, {
      layers: this.stateLayer,
      format: "image/png",
      transparent: true,
      opacity: 0.75
    });
    this.stateLayerName = state;

    let dist: L.Layer = L.tileLayer.wms(this.geo_url, {
      layers: this.distLayer,
      format: "image/png",
      transparent: true,
      opacity: 0.75
    });
    this.distLayerName = dist;

  }

  async addMarkersToMap(features: any[], maleIcon: L.Icon, femaleIcon: L.Icon) {
    if (!this.map) {
      console.error("Map is not initialized yet.");
      return;
    }

    const markerPromises = features.map(async (feature: any) => {
      try {
        const fullPersonId = feature.id;
        const personId = fullPersonId.split('.')[1];
        const geometry = feature.geometry;

        if (!geometry || geometry.type !== 'Point' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length !== 2) {
          console.warn("Invalid or missing 'geometry' data for feature:", feature);
          return null;
        }

        const [lng, lat] = geometry.coordinates;
        const latlng: L.LatLngTuple = [lat, lng];

        const personResponse = await fetch(`${environment.apiUrl}/api/persons/${personId}/`);
        if (!personResponse.ok) throw new Error(`Failed to fetch person details: ${personResponse.status}`);

        const personDetails = await personResponse.json();

        // Choose icon based on gender
        const icon = personDetails.gender === 'female' ? femaleIcon : maleIcon;
        const marker = L.marker(latlng, { icon });

        const imageUrl = personDetails.photo_photo
          ? `${environment.apiUrl.replace(/\/$/, '')}/${personDetails.photo_photo.replace(/^\//, '')}`
          : '/assets/old/images/Chhaya.png';

 const popupContent = `
    <div style="width: 370px; font-family: 'Segoe UI', sans-serif; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.15); overflow: hidden; position: relative; margin-bottom: 10px;">

    <div style="position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 10px solid white; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.15));"></div>
    <!-- Header -->
    <div style="background-color:#f58200; padding: 10px; text-align: center; font-weight: bold; font-size: 16px;">
      TraceMapr Case Information
    </div>

    <!-- Body -->
    <div style="display: flex; padding: 16px; background: white;">

      <!-- Left: Image and Basic Info -->
      <div style="width: 120px; text-align: center; margin-right: 12px;">
        <img src="${imageUrl || 'assets/old/images/Chhaya.png'}" 
            onerror="this.src='https://via.placeholder.com/80?text=No+Image'" 
            alt="Person Photo"
            style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
        <div style="font-weight: bold; font-size: 14px; margin-top: 8px;">${personDetails.full_name 
        ? personDetails.full_name.charAt(0).toUpperCase() + personDetails.full_name.slice(1).toLowerCase()
        : 'N/A'}</div>
        <div style="font-size: 13px; color: #555;">
            ${personDetails.type === 'Missing Person'
            ? `Age: ${personDetails.age || 'N/A'}`
            : `Age: ${personDetails.age_range || 'N/A'}`}
            |
            ${personDetails.gender 
              ? personDetails.gender.charAt(0).toUpperCase() + personDetails.gender.slice(1).toLowerCase()
              : 'N/A'}
          </div>

      </div>

      <!-- Right: Info -->
      <div style="flex: 1;">
        <div style="margin-bottom: 8px;">
          <span style="display: inline-block; font-size: 12px; padding: 4px 10px; border-radius: 12px; margin-right: 6px; background-color: #f8d7da; color: #721c24;">
            ${personDetails.type || 'Missing'}
          </span>
          <span style="display: inline-block; font-size: 12px; padding: 4px 10px; border-radius: 12px; 
                background-color: ${personDetails.case_status.toLowerCase() === 'resolved' ? '#d4edda' : '#fff3cd'}; 
                color: ${personDetails.case_status.toLowerCase() === 'resolved' ? '#155724' : '#856404'};">
            ${personDetails.case_status 
            ? personDetails.case_status.charAt(0).toUpperCase() + personDetails.case_status.slice(1).toLowerCase()
            : 'N/A'}

          </span>
        </div>

              <div style="margin-bottom: 6px; font-size: 14px;">
          <strong>Address:</strong><br>
          ${personDetails.city || 'N/A'}, ${personDetails.state || 'N/A'}, ${personDetails.country || 'N/A'}
        </div>


        <div style="margin-bottom: 6px; font-size: 14px;">
          <strong>Police Station:</strong><br>
          ${personDetails.firs && personDetails.firs.length > 0 ? personDetails.firs[0].police_station || 'N/A' : 'N/A'}
        </div>

        <div style="font-size: 14px;">
          <strong>Case ID:</strong><br>
          ${personDetails.case_id || 'N/A'}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="font-size: 11px; color: #999; text-align: right; padding: 0 12px 8px; font-style: italic;">
      TraceMapr by Chhaya Foundation
    </div>
  </div>
`;

        marker.bindPopup(popupContent);

        // Add to respective layer group
        const type = personDetails.type;
        if (type === 'Missing Person') {
          this.missingPersonLayer.addLayer(marker);
        } else if (type === 'Unidentified Person') {
          this.unidentifiedPersonLayer.addLayer(marker);
        } else if (type === 'Unidentified Body') {
          this.unidentifiedBodiesLayer.addLayer(marker);
        }

        return marker;
      } catch (error) {
        console.error("Error processing feature:", feature, error);
        return null;
      }
    });

    await Promise.all(markerPromises);
  }
 



  initOverlays() {
    
    function iconByName(name: string) {
      console.log("Icon Name:", name);
      return `<i class="icon icon-${name}"></i>`;
    }
  
    this.overlays = [
      {
        group: "Operational Layers",
        icon: iconByName('map'),
        collapsed: false,
        layers: [
          {
            name: "State Layer",
            active: true,
            layer: this.stateLayerName
          },
          {
            name: "District Layer",
            active: true,
            layer: this.distLayerName
          }
        ]
      }
    ];
  }
  
    

 
  displayFilteredDataDetails() {
    if (this.filteredData.length === 0) {
        console.warn("No filtered data available.");
        return;
    }

    // Example: Display details in the console
    this.filteredData.forEach((feature, index) => {
        console.log(`Feature ${index + 1}:`, feature.properties);
    });
 }
  

  isLoading = false;

  onNavigate(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); 
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/login']).catch((error) => {
        console.error('Navigation error:', error);
      });
    }, 1000);
  }
  
  getImageUrl(photoPath: string | null | undefined): string {
    if (photoPath) {
        const baseUrl = environment.apiUrl.replace(/\/$/, '');
        const cleanPath = photoPath.replace(/^\//, '');
        
        // Ensure the /media/ prefix is added if not already present
        const mediaPath = cleanPath.startsWith('media/') ? cleanPath : `media/${cleanPath}`;
        
        const finalUrl = `${baseUrl}/${mediaPath}`;
        return finalUrl;
    }
    return 'assets/old/images/Chhaya.png';
  }

  
  onStateChange(state: string): void {
    this.selectedState = state;
    this.initOperationalLayers();
    this.selectedDistrict = 'All Districts';
    this.selectedCity = 'All Cities';
    this.selectedVillage = 'All Villages';
    this.alldistricts = [];
    this.allcities = [];
    this.allVillages = [];

    this.updateStateLayer();

    if (state && state !== 'All States') {
        this.filterService.getDistricts(state).subscribe((data) => {
            this.alldistricts = data;
            console.log("on state change", this.alldistricts);
            this.moveMapToState(state);
        });
    }
  }

  private updateStateLayer(): void {
    // if (this.geoServerClusterGroup) {
    //     this.geoServerClusterGroup.clearLayers();
    // }
  }

    onDistrictChange(district: string): void {
        this.selectedDistrict = district;
        this.initOperationalLayers();
        this.selectedCity = 'All Cities';
        this.selectedVillage = 'All Villages';
        this.allcities = [];
        this.allVillages = [];

        if (district && district !== 'All Districts') {
            this.filterService.getCities(district).subscribe((data) => {
                console.log('Cities fetched:', data);
                this.allcities = data;

                // Move the map to the district
                this.moveMapToDistrict(district);
            }, error => {
                console.error('Error fetching cities:', error);
            });
        } else {
            console.warn('No district selected or "All Districts" selected');
        }
  }

    moveMapToDistrict(districtName: string): void {
        if (!districtName || districtName === 'All Districts') {
            return;
        }

        const state = this.stateCoordinates.find(s => 
            s.districts && s.districts.some((d: { name: string; }) => d.name === districtName)
        );

        if (state) {
            const district = state.districts.find((d: { name: string; }) => d.name === districtName);
            if (this.map && district && district.coordinates) {
                this.map.flyTo(district.coordinates, 8, { 
                    duration: 3,
                    easeLinearity: 0.25
                });
            } else {
                console.warn('District not found in state data:', districtName);
            }
        } else {
            console.warn('No matching state found for district:', districtName);
        }
  }



  onCityChange(city: string): void {
    this.initOperationalLayers();
    this.selectedCity = city;
    this.selectedVillage = 'All Villages';
    this.allVillages = [];

    if (city && city !== 'All Cities') {
        this.filterService.getVillages(city).subscribe((data) => {
            this.allVillages = data;
        });
    }
  }

  onVillageChange(village: string): void {
    this.initOperationalLayers();
    this.selectedVillage = village;
  }

  
}
