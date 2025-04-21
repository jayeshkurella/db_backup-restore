import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

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

@Component({
  selector: 'app-revenue-updates',
  imports: [ MaterialModule, TablerIconsModule,FormsModule ,CommonModule,MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule, ],
  templateUrl: './revenue-updates.component.html',
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
    private dialog: MatDialog
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
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
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
    this.selectedStartDate = yesterday;
    this.selectedEndDate = today;
    this.filterDataByFilters()    
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private loadStateData(): void {
    this.http.get<any[]>('assets/state.json').subscribe(data => {
      this.stateCoordinates = data;
      this.allstates = data.map(state => state.name); 
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
        this.moveMapToState(this.selectedState);

        if (this.selectedState && this.selectedState !== 'All States') {
            this.onStateChange(this.selectedState);
        }

        if (this.selectedDistrict && this.selectedDistrict !== 'All Districts') {
            this.onDistrictChange(this.selectedDistrict);
        }

        if (this.selectedCity && this.selectedCity !== 'All Cities') {
            this.onCityChange(this.selectedCity);
        }

        if (this.selectedVillage && this.selectedVillage !== 'All Villages') {
            this.onVillageChange(this.selectedVillage);
        }
 }


  

  
  
  
 viewDetails(person: any): void {
    const personId = person.id.split('.')[1];
  
    fetch(`${environment.apiUrl}api/persons/${personId}/`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch person details: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.dialog.open(DialogModelViewComponent, {
          width: '55vw',
          maxWidth: 'none',
          data: data, 
        });
      })
      .catch(error => console.error('Error fetching person details:', error));
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
  
      this.initOperationalLayers(); // 🔁 re-fetch data with updated date
    }
  }
  

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // returns '2025-04-20'
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
  const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      shadowSize: [41, 41]
  });

  this.missingPersonLayer = L.layerGroup();
  this.unidentifiedPersonLayer = L.layerGroup();
  this.unidentifiedBodiesLayer = L.layerGroup();

  // Build the CQL filter based on selected filters
  let cqlFilter = '';

  if (this.selectedState && this.selectedState !== 'All States') {
      cqlFilter += `state='${this.selectedState}'`;
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
      const [minHeight, maxHeight] = this.selectedHeightRange.split('-');
      cqlFilter += `height BETWEEN ${minHeight} AND ${maxHeight}`;
  }

  if (this.selectedAgeRange && this.selectedAgeRange !== 'All Ages') {
      if (cqlFilter !== '') {
          cqlFilter += ' AND ';
      }
      const [minAge, maxAge] = this.selectedAgeRange.split('-');
      cqlFilter += `age BETWEEN ${minAge} AND ${maxAge}`;
  }

  if (this.selectedmarital && this.selectedmarital !== 'Marital status') {
      if (cqlFilter !== '') {
          cqlFilter += ' AND ';
      }
      cqlFilter += `marital_status='${this.selectedmarital}'`;
  }

 

  if (this.selectedStartDate && this.selectedEndDate) {
    const startDate = new Date(this.selectedStartDate);
    const endDate = new Date(this.selectedEndDate);
  
    if (startDate > endDate) {
      console.error("Invalid date range: Start date cannot be after End date.");
      alert("Start date cannot be after End date. Please select a valid range.");
    } else {
      const formattedStart = this.formatDate(startDate);
      const formattedEnd = this.formatDate(endDate);
  
      if (cqlFilter !== '') {
        cqlFilter += ' AND ';
      }
  
      cqlFilter += `reported_date BETWEEN '${formattedStart}' AND '${formattedEnd}'`;
    }
  }
  
  console.log("Filtering Data Between:", this.selectedStartDate, "and", this.selectedEndDate);



  // WFS request with CQL filters
  const wfsUrl = `${environment.person_geoserver_url}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=chhaya_demo:Mainapp_person&outputFormat=application/json${cqlFilter ? `&cql_filter=${encodeURIComponent(cqlFilter)}` : ''}`;

  fetch(wfsUrl)
      .then(response => {
          if (!response.ok) {
              throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
          }
          return response.json();
      })
      .then(async (data) => { // ✅ Make this async to handle markers better
          if (!data.features || data.features.length === 0) {
              console.warn("No features returned by GeoServer for the applied filter.");
              this.missingPersonsCount = 0;
              this.unidentifiedPersonTotalCounts = 0;
              this.unidentifiedBodyTotalCount = 0;
              this.maleCount = 0;
              this.femaleCount = 0;
              this.pendingcount = 0;
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
          
          console.log(this.unidentifiedBodyMatchedWithMissingFemale,"person")
          
          
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
          const initialPoints = data.features.slice(0, 100);
          this.addMarkersToMap(initialPoints, customIcon);

          // Load remaining points asynchronously
          const remainingPoints = data.features.slice(100);
          if (remainingPoints.length > 0) {
              setTimeout(() => {
                  this.addMarkersToMap(remainingPoints, customIcon);
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

 

  async addMarkersToMap(features: any[], customIcon: L.Icon) {
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

            const personResponse = await fetch(`${environment.apiUrl}api/persons/${personId}/`);
            if (!personResponse.ok) throw new Error(`Failed to fetch person details: ${personResponse.status}`);

            const personDetails = await personResponse.json();

            const marker = L.marker(latlng, { icon: customIcon });

            const imageUrl = personDetails.photo_photo 
                ? `${environment.apiUrl.replace(/\/$/, '')}/${personDetails.photo_photo.replace(/^\//, '')}` 
                : 'assets/old/images/Chhaya.png';

            const popupContent = `
                <div style="max-width: 400px; padding: 5px;">
                    <img src="${imageUrl}" 
                        alt="Person Image" 
                        style="width: 100%; max-width: 400px; max-height: 400px; object-fit: contain; margin: 10px 0;">
                    <b>Type:</b> ${personDetails.type || 'N/A'}<br>
                    <b>Name:</b> ${personDetails.full_name || 'N/A'}<br>
                    <b>Age:</b> ${personDetails.age || 'N/A'}<br>
                    <b>Gender:</b> ${personDetails.gender || 'N/A'}<br>
                    <b>City:</b> ${personDetails.city || 'N/A'}<br>
                    <b>State:</b> ${personDetails.state || 'N/A'}<br>
                    <b>Country:</b> ${personDetails.country || 'N/A'}<br>
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
