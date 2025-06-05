import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AllcountServiceService } from 'src/app/services/allcount-service.service';
import { environment } from 'src/envirnments/envirnment';
import { MissingpersonapiService } from '../homepage/missingperson/missingpersonapi.service';
import { UnidentifiedPersonapiService } from '../homepage/unidentified-person/unidentified-personapi.service';
import { UnidentifiedbodiesapiService } from '../homepage/unidentified-bodies/unidentifiedbodiesapi.service';
import { PoliceStationaoiService } from 'src/app/services/police-stationaoi.service';

declare var bootstrap: any;
import * as L from 'leaflet';
// import 'leaflet-panel-layers';
import '../../../../src/leaflet-panel-layers'

import 'leaflet-basemaps/L.Control.Basemaps'; 
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster';

import { MainDashserviceService } from './main-dashservice.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-dashboard-demo',
  templateUrl: './dashboard-demo.component.html',
  styleUrls: ['./dashboard-demo.component.css']
})
export class DashboardDemoComponent implements OnInit ,AfterViewInit{
  environment = environment;
  geo_url =environment.geo_url
  stateLayer = "GeoFlow_WCD:tblstates";
  stateLayerName: any;
  distLayer="GeoFlow_WCD:tbldistricts";
  distLayerName: any;
 
  allmissingperson: any[] = [];
  allunidentifiedperson: any[] = [];
  allunidentiedbodies: any[] = [];
  missingpersonscount: any[] = [];
  unidentifiedpersonscount: any[] = [];
  unidentifiedbodiescount: any[] = [];
  missingPersonGenderCounts: any[] = [];
  allpolicestations: any[] = [];
  allstates: string[] = [];
  allcities: string[] = [];
  alldistricts: string[] = [];
  selectedCity = 'All Cities';
  selectedState= 'All States';
  selectedcase= 'All Cases';
  stateCoordinates: any[] = []; 
  selectedDistrict= 'All Districts';
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
  selectedVillage = 'All Villages';
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
  
 
  
  constructor(
    private router: Router, 
    private http: HttpClient,
    private allcountapi: AllcountServiceService, 
    private missingperonapi: MissingpersonapiService,
    private unidentifiedpersonapi: UnidentifiedPersonapiService,
    private unidentifiedbodieapi: UnidentifiedbodiesapiService,
    private policestationapi :PoliceStationaoiService,
    private fitereddataapi :MainDashserviceService,
    private cdr: ChangeDetectorRef,
  ) {}

 
  ngAfterViewInit(): void {
    this.initMap();
    this.getMissingPersonsData(1); 
    this.getUnidentifiedPersonsData(1); 
    this.getUnidentifiedBodiesData(1); 
    // this.addCountsLegend();
    
  }
  

  pagination: any = {
    current_page: 1,
    total_pages: 1,
    has_previous: false,
    has_next: false
  };

  onPageChangeevent(page: number): void {
    this.getMissingPersonsData(page);
    
  }
 
  ngOnInit(): void {
    // Set default state to Maharashtra
    this.loadStateData();
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
    // this.initMap();  
    this.getMissingPersonsData(this.pagination.current_page);
    this.getUnidentifiedBodiesData(this.pagination.current_page)
    this.getUnidentifiedPersonsData(this.pagination.current_page)
    this.getmissingpersoncount()
    this.getunidentifiedpersoncount()
    this.getunidentifiedbodiescount()
    this.getmissingPersonGenderCount()
    // this.getallpolicestation()
    this.getallstates()
    // this.getallcities()
    // this.getalldistricts()
    this.getgenderst()
    // this.getallvillges()
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
      this.allstates = data.map(state => state.name); // Populate the state dropdown
    });
  }

  moveMapToState(stateCode: string): void {
    const indiaCoordinates: [number, number] = [20.5937, 78.9629];  // Center of India (LatLngTuple)
    const indiaZoomLevel = 6;  // Zoom level for the whole country
    
    if (stateCode === 'All States') {
      // If 'All States' is selected, move the map to the center of India
      if (this.map) {
        this.map.flyTo(indiaCoordinates, indiaZoomLevel, {
          duration: 3, // Duration of the animation (in seconds)
          easeLinearity: 0.25 // Controls the easing of the transition
        });
      }
    } else {
      const state = this.stateCoordinates.find(s => s.name === stateCode);
      if (this.map && state) {
        // Fly to the center of the selected state with smooth transition
        this.map.flyTo(state.coordinates, 7, {
          duration: 2, // Duration of the animation (in seconds)
          easeLinearity: 0.25 // Controls the easing of the transition
        });
      }
    }
  }
  
  
  moveMapToDistrict(districtName: string): void {
    // Find the district's coordinates
    const state = this.stateCoordinates.find(s => s.districts && s.districts.some((d: { name: string; }) => d.name === districtName));
    if (state) {
      const district = state.districts.find((d: { name: string; }) => d.name === districtName);
      if (district && this.map) {
        this.map.setView(district.coordinates, 9); // Adjust zoom level for district
      }
    }
  }

  loadDistrictsForState(stateName: string): void {
    if (!this.stateCoordinates) {
      console.error('State coordinates are not defined');
      return; // Return early to prevent further execution
    }
  
    console.log('State Coordinates:', this.stateCoordinates); // Log the entire stateCoordinates array
    console.log('Looking for state:', stateName); // Log the stateName being passed in
  
    const state = this.stateCoordinates.find(s => s.name === stateName);
  
    if (state) {
      // Using setTimeout to mimic a delay in populating districts
      setTimeout(() => {
        this.alldistrictss = state.districts.map((d: { name: any; }) => d.name); // Populate district dropdown based on state
      }, 300); // Delay to show the change smoothly (300ms delay, adjust as needed)
    } else {
      console.error('State not found in stateCoordinates:', stateName);
    }
  }
  
  

  filterDataByFilters(): void {
    // Clear any existing data before applying the new filter
    this.filteredMissingPersonssss = []; 
    this.filteredUnidentifiedPersonssss = [];  
    this.filteredunidentifiedboidessss = [];  
    this.missingPersonLayer.clearLayers();
    this.unidentifiedPersonLayer.clearLayers();
    this.unidentifiedBodiesLayer.clearLayers();
  
    
    
    const state = this.selectedState !== 'All States' ? this.selectedState : null;
    const district = this.selectedDistrict !== 'All Districts' ? this.selectedDistrict : null;
    const city = this.selectedCity !== 'All Cities' ? this.selectedCity : null;
    const gender =this.selectedgender !== 'All Genders' ? this.selectedgender : null;
    const policeStationId = this.selectedPoliceStation !== 'All Police Stations' && this.selectedPoliceStation && this.selectedPoliceStation.id
    ? this.selectedPoliceStation.id.toString()
    : null;
    console.log('Selected Police Station:', this.selectedPoliceStation);


    const blood_group = this.selectedBloodGroup !== 'All Blood Groups' ? this.selectedBloodGroup : null;
    const village = this.selectedVillage !== 'All Villages' ? this.selectedVillage : null;

    const heightRange = this.selectedHeightRange !== 'All Heights' ? this.selectedHeightRange : null;
    const weightRange = this.selectedWeightRange !== 'All Weights' ? this.selectedWeightRange : null;
    const AgeRange = this.selectedAgeRange !== 'All Ages' ? this.selectedAgeRange : null;
    const marital = this.selectedmarital !== 'Marital status' ? this.selectedmarital : null;
    const startDate = this.selectedStartDate ? this.selectedStartDate : null;
    const endDate = this.selectedEndDate ? this.selectedEndDate : null;

    // Fetch filtered data based on the selected filters
    this.getFilteredMissingPersonsData(state, district, city, policeStationId ,gender,blood_group,village,heightRange,AgeRange ,marital,startDate, endDate);
    this.getFilteredUnidentifiedPersonsData(state, district, city, policeStationId ,gender,blood_group,village,heightRange,AgeRange,marital,startDate, endDate);
    this.getFilteredUnidentifiedBodiesData(state, district, city, policeStationId,gender,blood_group,village,heightRange,AgeRange,marital,startDate, endDate);
    
    this.getDistrictsByState('Maharashtra'); 
    this.getCitiesByDistrict('All Cities')
    this.getvillagesbyCity('All Villages')
    this.getpolicestationbycity("All Police Stations")

    if (this.selectedState !== 'All States') {
      this.moveMapToState(this.selectedState);
      this.getDistrictsByState(this.selectedState);
      this.loadDistrictsForState(this.selectedState);
    } else {
      this.alldistricts = [];
    }

    // Check if district is selected, then get the cities for that district
    if (this.selectedDistrict !== 'All Districts') {
      this.moveMapToDistrict(this.selectedDistrict);
      this.getCitiesByDistrict(this.selectedDistrict);
    } else {
      this.allcities = [];
    }

    

    // Check if city is selected, then and villages for that city
    if (this.selectedCity !== 'All Cities') {
      this.getvillagesbyCity(this.selectedCity);
    } else {
      this.allVillages = [];
    }
    if (this.selectedCity !== 'All Cities') {
      this.getpolicestationbycity(this.selectedCity);
    } else {
      this.allpolicestations = [];
    }

    
  }
    


  private getFilteredMissingPersonsData(
    state: string | null,
    district: string | null,
    city: string | null,
    policeStationId: string | null,
    gender: string | null,
    blood_group: string | null,
    village: string | null,
    heightRange: string | null,
    AgeRange: string | null,
    marital: string | null,
    startDate: string | null, 
    endDate: string | null 
  ): void {
    const filters = {
      state,
      district,
      city,
      policeStationId,
      gender,
      blood_group,
      village,
      heightRange,
      AgeRange,
      marital,
      startDate,  
      endDate 
    };
  
    this.fitereddataapi.getFilteredMissingPersons(filters).subscribe(
      (response: any) => {  
        if (Array.isArray(response) && response.length > 0) {
          const persons = response;
          this.missingPersonLayer.clearLayers();
          this.filteredMissingPersonssss = [];

          // const missingPersonClusterGroup = (L as any).markerClusterGroup({
          //   zoomToBoundsOnClick: true,
          // });
  
          let missingPersonsCount = 0;
          let maleCount = 0;
          let femaleCount = 0;
          let otherCount = 0;
          let allcasestutuscount = 0;
          let ongoing = 0;
          let solved =0;
          let solvedMaleCount = 0;
          let solvedFemaleCount = 0;
          let solvedotherCount = 0
          let pending =0;
          let pendingMaleCount = 0;
          let pendingFemaleCount = 0;
          let pendignothercount =0

          let Deceased =0;
          let deceasedmale = 0;
          let deceasedfemale = 0;
          let deceasedother = 0;

          let Found_alive =0;
          let foundalivemale = 0;
          let foundalivefemale = 0;
          let foundalivother = 0;
          
  
          persons.forEach((person: { 
            address: { state: string; district: string; city: string; village: string };
            missing_location_geometry: { coordinates: any }; 
            location_geometry: { coordinates: any }; 
            full_name: any; 
            gender: string; 
            age: any; 
            location_metadata: any; 
            photo_upload: any;
            case_status: string; 
          }) => {
            
            const coordinates = person.missing_location_geometry?.coordinates || person.location_geometry?.coordinates;
            if (!coordinates || coordinates.length !== 2) {
              console.warn(`Person ${person.full_name} is missing valid coordinates.`);
              return; 
            }
  
            const lat = coordinates[1];
            const lng = coordinates[0];
  
            const popupContent = `
              <strong><i class="fa fa-exclamation-circle" style="font-size: 20px; color: red; margin-right: 5px;"></i>Person Type: Missing</strong><br>
              <strong>${person.full_name || 'Unknown'}</strong><br>
              Gender: ${person.gender || 'Not specified'}<br>
              Age: ${person.age || 'Not specified'}<br>
              Location: ${person.address.city || 'Not specified'}<br>
              <img 
                  src="${person.photo_upload ? environment.apiUrl + person.photo_upload : '/assets/images/Chhaya.png'}" 
                  alt="No Photo Updated" 
                  style="width: 200px; height: 100px;"
                  onerror="this.onerror=null; this.src='/assets/images/Chhaya.png';"
              /><br>
              
          `;

  
            const customIcon = L.icon({
              iconUrl: 'assets/leaflet/images/green_marker.png',
              iconSize: [35, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowUrl: 'assets/leaflet/images/marker-shadow.png',
              shadowSize: [41, 41],
              shadowAnchor: [12, 41],
            });
  
            this.filteredMissingPersonssss.push(person);
            const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
            this.missingPersonLayer.addLayer(marker);


            // const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
            // missingPersonClusterGroup.addLayer(marker); // Add marker to cluster group

  
            // Update counts based on gender
            missingPersonsCount++;
  
            if (person.gender === 'Male') {
              maleCount++;
            } else if (person.gender === 'Female') {
              femaleCount++;
            } else {
              otherCount++;
            }

            allcasestutuscount++;  

          if (person.case_status === 'Open') {
            ongoing++;
          } else if (person.case_status === 'Resolved') {
            solved++;
            if (person.gender === 'Male') {
                solvedMaleCount++;
            } else if (person.gender === 'Female') {
                solvedFemaleCount++;
            } else if (person.gender === 'Transgender') {
                solvedotherCount++;
            }
        } else if (person.case_status === 'Deceased') {
            Deceased++;
            if (person.gender === 'Male') {
                 deceasedmale++;
            } else if (person.gender === 'Female') {
              deceasedfemale++;
            } else if (person.gender === 'Transgender') {
              deceasedother++;
            }
        } else if (person.case_status === 'Found Alive') {
            Found_alive++;
            if (person.gender === 'Male') {
              foundalivemale++;
            } else if (person.gender === 'Female') {
              foundalivefemale++;
            } else if (person.gender === 'Transgender') {
              foundalivother++;
            }
        

          } else if (person.case_status === 'Pending') {
            pending++;
            if(person.gender === 'Male'){
              pendingMaleCount++;
            }else if(person.gender === 'Female'){
              pendingFemaleCount++;
            }else if(person.gender === 'Transgender'){
              pendignothercount++;
            }
          }else if (person.case_status === 'Deceased') {
            Deceased++;
          }else if (person.case_status === 'Found Alive') {
            Found_alive++;
          }

          });

          // this.missingPersonLayer.addLayer(missingPersonClusterGroup);
          // this.map!.addLayer(this.missingPersonLayer);

  
          // Update the missing persons count and gender counts
          this.missingPersontotalcount = missingPersonsCount;
          this.missingPersonGenderCountss = { Male: maleCount, Female: femaleCount, Other: otherCount };
          this.allcasestutuscount = allcasestutuscount;
          this.ongoingcount = ongoing;
          this.solvedcount = solved;
          this.pendingcount = pending;
          this.Deceasedcount =Deceased
          this.Found_alivecount = Found_alive
          this.solvedGenderCounts = { Male: 0, Female: 0 , Other :0};
          this.solvedGenderCounts = { Male: solvedMaleCount, Female: solvedFemaleCount , Other :solvedotherCount  };
          this.pendingGendercounts = { Male: 0, Female: 0 , Other : 0 };
          this.pendingGendercounts= {Male:pendingMaleCount , Female :pendingFemaleCount , Other : pendignothercount}
          this.found_alivegendercount ={ Male: 0, Female: 0 , Other : 0 };
          this.found_alivegendercount = {Male:foundalivemale , Female :foundalivefemale, Other :foundalivother}
          this.deceasedCountgendercount ={ Male: 0, Female: 0 , Other : 0 };
          this.deceasedCountgendercount = {Male:deceasedmale , Female :deceasedfemale, Other :deceasedother}

        } else {
          this.missingPersontotalcount = 0;
          this.missingPersonGenderCountss = { Male: 0, Female: 0, Other: 0 };
          this.allcasestutuscount = 0;
          this.ongoingcount = 0;
          this.solvedcount = 0;
          this.pendingcount = 0;
          this.Found_alivecount = 0;
          this.Deceasedcount = 0
        }
      },
      error => {
        // Handle errors in API call
        console.error('Error fetching filtered missing persons data:', error);
        this.missingPersontotalcount = 0;
        this.missingPersonGenderCountss = { Male: 0, Female: 0, Other: 0 };
        this.allcasestutuscount = 0;
        this.ongoingcount = 0;
        this.solvedcount = 0;
        this.pendingcount = 0;
        this.Found_alivecount =0
        this.Found_alivecount = 0;
        this.solvedGenderCounts = { Male: 0, Female: 0 , Other: 0 };
        this.pendingGendercounts = { Male: 0, Female: 0, Other: 0  };
        this.deceasedCountgendercount = { Male: 0, Female: 0, Other: 0  };
        this.found_alivegendercount = { Male: 0, Female: 0, Other: 0  };
      }
    );
  }
  


  private getFilteredUnidentifiedPersonsData(
    state: string | null,
    district: string | null,
    city: string | null,
    policeStationId: string | null,
    gender: string | null,
    blood_group: string | null,
    village: string | null,
    heightRange: string | null,
    AgeRange: string | null,
    marital: string | null,
    startDate: string | null, 
    endDate: string | null 
  ): void {
    const filters = {
      state,
      district,
      city,
      policeStationId,
      gender,
      blood_group,
      village,
      heightRange,
      AgeRange,
      marital,startDate,  
      endDate
    };
  
    // Call the API with the filters
    this.fitereddataapi.getFilteredunidentifiedPersons(filters).subscribe(response => {
      if (Array.isArray(response) && response.length > 0) {
        const persons = response;
        this.unidentifiedPersonLayer.clearLayers();
        this.filteredUnidentifiedPersonssss = [];
  
        let ongoing = 0;
        let solved = 0;
        let solvedMaleCount = 0;
        let solvedFemaleCount = 0;
        let solvedOtherCount = 0;
  
        let unidentifiedPersonsCount = 0;
        let maleCount = 0;
        let femaleCount = 0;
        let otherCount = 0;
  
        let pending = 0;
        let pendingMaleCount = 0;
        let pendingFemaleCount = 0;
        let pendingOtherCount = 0;
  
        let deceased = 0;
        let deceasedMale = 0;
        let deceasedFemale = 0;
        let deceasedOther = 0;
  
        let foundAlive = 0;
        let foundAliveMale = 0;
        let foundAliveFemale = 0;
        let foundAliveOther = 0;
  
        persons.forEach((person: {
          photo_upload: string;
          address: { state: string; district: string; city: string; village: string };
          police_station_name_and_address: { id: number; name: string };
          geometry: { coordinates: number[] } | null;
          location_metadata: any;
          gender: string;
          blood_group: string;
          marital_status: string;
          estimated_age: number;
          height: number;
          case_status: string;
        }) => {
          this.filteredUnidentifiedPersonssss.push(person);
          unidentifiedPersonsCount++;
  
          // Count persons by gender
          if (person.gender === 'Male') {
            maleCount++;
          } else if (person.gender === 'Female') {
            femaleCount++;
          } else {
            otherCount++;
          }
  
          // Count by case status
          switch (person.case_status) {
            case 'Open':
              ongoing++;
              break;
            case 'Resolved':
              solved++;
              if (person.gender === 'Male') solvedMaleCount++;
              else if (person.gender === 'Female') solvedFemaleCount++;
              else solvedOtherCount++;
              break;
            case 'Pending':
              pending++;
              if (person.gender === 'Male') pendingMaleCount++;
              else if (person.gender === 'Female') pendingFemaleCount++;
              else pendingOtherCount++;
              break;
            case 'Deceased':
              deceased++;
              if (person.gender === 'Male') deceasedMale++;
              else if (person.gender === 'Female') deceasedFemale++;
              else deceasedOther++;
              break;
            case 'Found Alive':
              foundAlive++;
              if (person.gender === 'Male') foundAliveMale++;
              else if (person.gender === 'Female') foundAliveFemale++;
              else foundAliveOther++;
              break;
          }
  
          // Extract coordinates from the geometry field
          const coordinates = person.geometry?.coordinates;
          if (!coordinates || coordinates.length !== 2) {
            return; // Skip invalid coordinates
          }
  
          const lat = coordinates[1];
          const lng = coordinates[0];
  
          const popupContent = `
            <strong>Person Type: Unidentified Person</strong><br>
            Age: ${person.estimated_age || 'Not specified'}<br>
            Gender: ${person.gender || 'Not specified'}<br>
            Location: ${person.address.city || 'Not specified'}<br>
             <img 
              src="${person.photo_upload ? environment.apiUrl + person.photo_upload : '/assets/images/Chhaya.png'}" 
              alt="No Photo Updated" 
              style="width: 200px; height: 100px;"
              onerror="this.onerror=null; this.src='/assets/images/Chhaya.png';"
          />
   
          `;
  
          const customIcon = L.icon({
            iconUrl: 'assets/leaflet/images/red_marker.png',
            iconSize: [35, 35],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'assets/leaflet/images/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 41]
          });
  
          const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
          this.unidentifiedPersonLayer.addLayer(marker);
        });
  
        // Update the counts
        this.unidentifiedPersonTotalCounts = unidentifiedPersonsCount;
        this.unidentifiedPersonGenderCounts = {
          Male: maleCount,
          Female: femaleCount,
          Other: otherCount,
        };
  
        this.UPongoingcount = ongoing;
        this.UPsolvedcount = solved;
        this.UPpendingcount = pending;
        this.UPDeceasedcount = deceased;
        this.UPFound_alivecount = foundAlive;
  
        this.UPsolvedGenderCounts = { Male: solvedMaleCount, Female: solvedFemaleCount, Other: solvedOtherCount };
        this.UPpendingGendercounts = { Male: pendingMaleCount, Female: pendingFemaleCount, Other: pendingOtherCount };
        this.UPfound_alivegendercount = { Male: foundAliveMale, Female: foundAliveFemale, Other: foundAliveOther };
        this.UPdeceasedCountgendercount = { Male: deceasedMale, Female: deceasedFemale, Other: deceasedOther };
      } else {
        this.resetCounts();
      }
  
      
    }, error => {
      this.resetCounts();
    });
  }
  
  private resetCounts(): void {
    this.unidentifiedPersonTotalCounts = 0;
    this.unidentifiedPersonGenderCounts = { Male: 0, Female: 0, Other: 0 };
    this.UPongoingcount = 0;
    this.UPsolvedcount = 0;
    this.UPpendingcount = 0;
    this.UPDeceasedcount = 0;
    this.UPFound_alivecount = 0;
    this.UPsolvedGenderCounts = { Male: 0, Female: 0, Other: 0 };
    this.UPpendingGendercounts = { Male: 0, Female: 0, Other: 0 };
    this.UPfound_alivegendercount = { Male: 0, Female: 0, Other: 0 };
    this.UPdeceasedCountgendercount = { Male: 0, Female: 0, Other: 0 };
  }
  
  private getFilteredUnidentifiedBodiesData(
    state: string | null,
    district: string | null,
    city: string | null,
    policeStationId: string | null,
    gender: string | null,
    blood_group: string | null,
    village: string | null,
    heightRange: string | null,
    AgeRange: string | null,
    marital: string | null,
    startDate: string | null, 
    endDate: string | null 
  ): void {
    const filters = {
      state,
      district,
      city,
      policeStationId,
      gender,
      blood_group,
      village,
      heightRange,
      AgeRange,
      marital,
      startDate,  
      endDate
    };
   
  
    // Call the API with the filters
    this.fitereddataapi.getFilteredunidentifiedbodies(filters).subscribe(response => {
  
      if (Array.isArray(response) && response.length > 0) {
        const bodies = response;
  
        this.unidentifiedBodiesLayer.clearLayers();
        this.filteredunidentifiedboidessss = [];
  
        let unidentifiedBodiesCount = 0;
        let maleCount = 0;
        let femaleCount = 0;
        let otherCount = 0;

        let pending = 0;
        let pendingMaleCount = 0;
        let pendingFemaleCount = 0;
        let pendingOtherCount = 0;
  
        let foundAliveUP = 0;
        let foundAliveMaleUP = 0;
        let foundAliveFemaleUP = 0;
        let foundAliveOtherUP = 0;
  
        let foundAliveMP = 0;
        let foundAliveMaleMP = 0;
        let foundAliveFemaleMP = 0;
        let foundAliveOtherMP = 0;
        
  
        // Process each body
        bodies.forEach((body: {
          body_photo_upload: string;
          address: { state: string; district: string; city: string; village: string };
          police_station_name_and_address: { id: number; name: string };
          geometry: { coordinates: number[] } | null;
          body_seen_details: string;
          gender: string | null;
          blood_group: string | null;
          marital_status: string | null;
          estimated_age: number;
          height: number;
          weight: number;
          case_status :string
        }) => {
          this.filteredunidentifiedboidessss.push(body);
          unidentifiedBodiesCount++;
  
          // Count bodies by gender
          if (body.gender === 'Male') {
            maleCount++;
          } else if (body.gender === 'Female') {
            femaleCount++;
          } else if (body.gender === 'Other') {
            otherCount++;
          } 

          switch (body.case_status) {
            case 'Pending':
              pending++;
              if (body.gender === 'Male') pendingMaleCount++;
              else if (body.gender === 'Female') pendingFemaleCount++;
              else pendingOtherCount++;
              break;
            case 'Found Alive_with_missing':
              foundAliveMP++;
              if (body.gender === 'Male') foundAliveMaleMP++;
              else if (body.gender === 'Female') foundAliveFemaleMP++;
              else foundAliveOtherMP++;
              break;
            case 'Found_Alive_With_Unidentified':
              foundAliveUP++;
              if (body.gender === 'Male') foundAliveMaleUP++;
              else if (body.gender === 'Female') foundAliveFemaleUP++;
              else foundAliveOtherUP++;
              break;
          }
  
          // Extract coordinates and ensure they are valid
          const coordinates = body.geometry?.coordinates;
          if (!coordinates || coordinates.length !== 2) {
            return; // Skip if coordinates are invalid
          }
  
          const lat = coordinates[1];
          const lng = coordinates[0];
  
          // Prepare popup content
          const popupContent = `
            <strong>Person Type: Unidentified Body</strong><br>
            Estimated Age: ${body.estimated_age || 'Not specified'}<br>
            Location: ${body.body_seen_details || 'Not specified'}<br>
            Body found city: ${body.address.city || 'Not specified'}<br>
            <img 
              src="${body.body_photo_upload ? environment.apiUrl + body.body_photo_upload : '/assets/images/Chhaya.png'}" 
              alt="No Photo Updated" 
              style="width: 200px; height: 100px;"
              onerror="this.onerror=null; this.src='/assets/images/Chhaya.png';"
          />
            `;
  
          // Create a custom marker for Leaflet
          const customIcon = L.icon({
            iconUrl: 'assets/leaflet/images/black_marker.png',
            iconSize: [35, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'assets/leaflet/images/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 41]
          });
  
          // Create marker and bind the popup content
          const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
          this.unidentifiedBodiesLayer.addLayer(marker);
        });
  
        // Update the total count and gender count for unidentified bodies
        this.unidentifiedBodyTotalCount = unidentifiedBodiesCount;
        this.unidentifiedBodyGenderCounts = {
          Male: maleCount,
          Female: femaleCount,
          Other: otherCount,
          };
          this.UBpendingcount = pending;
          this.UBDeceasedcount =foundAliveUP
          this.UBFound_alivecount = foundAliveMP

          this.UBpendingGendercounts= {Male:pendingMaleCount , Female :pendingFemaleCount , Other : pendingOtherCount}
          this.UBfound_alivegendercount = {Male:foundAliveMaleMP , Female :foundAliveFemaleMP, Other :foundAliveOtherMP}
          this.UBdeceasedCountgendercount = {Male:foundAliveMaleUP , Female :foundAliveFemaleUP, Other :foundAliveOtherUP}


        
  
      } else {
        this.unidentifiedBodyTotalCount = 0;
        this.unidentifiedBodyGenderCounts = { Male: 0, Female: 0, Other: 0};
        this.resetBodyCounts()
      }
      
    }, error => {
      console.error('Error fetching unidentified persons data:', error);
      this.unidentifiedBodyTotalCount = 0;
      this.unidentifiedBodyGenderCounts = { Male: 0, Female: 0, Other: 0};
      this.resetBodyCounts()
    });
  }

 

  private resetBodyCounts(): void {
    this.UBpendingcount = 0;
    this.UBFound_alivecount = 0;
    this.UBDeceasedcount = 0;
    this.UBpendingGendercounts = { Male: 0, Female: 0, Other: 0 };
    this.UBfound_alivegendercount = { Male: 0, Female: 0, Other: 0 };
    this.UBdeceasedCountgendercount = { Male: 0, Female: 0, Other: 0 };
  }
  
  
  viewDetails(person: any): void {
    console.log(person)
    this.selectedPerson = person;
    

    // Open the modal
    const modal = new bootstrap.Modal(document.getElementById('filteredDataModal'));
    modal.show();
  }

  private missingPersonLayer: L.LayerGroup = L.layerGroup();
  private unidentifiedPersonLayer: L.LayerGroup = L.layerGroup();
  private unidentifiedBodiesLayer: L.LayerGroup = L.layerGroup();
  private map: L.Map | undefined;

 

 





  // private initMap(): void {
  //   this.initOperationalLayers();
  //   this.initOverlays();

  //   // Initialize the map
  //   this.map = L.map('map', {
  //     center: [20.5937, 78.9629], // Centering the map on India
  //     zoom: 6,
  //   });

  //   // Tile layer for the map
  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     maxZoom: 19,
  //     attribution: '&copy; OpenStreetMap contributors',
  //   }).addTo(this.map);

  //   // Panel control for layers
  //   var panelLayers = new (L as any).Control.PanelLayers(null, this.overlays, {
  //     collapsibleGroups: true,
  //     collapsed: false,
  //     groupMaxHeight: 50,
  //   });
  //   this.map.addControl(panelLayers);

  //   // Create a marker cluster group
  //   const markers = (L as any).markerClusterGroup();

  //   // Example of adding 100 random markers (you can replace this with your own data)
  //   for (let i = 0; i < 100; i++) {
  //     const lat = 20.5 + (Math.random() - 0.5) * 2; // Random latitude
  //     const lon = 78.5 + (Math.random() - 0.5) * 2; // Random longitude
  //     const marker = L.marker([lat, lon]);

  //     // Add the marker to the cluster group
  //     markers.addLayer(marker);
  //   }

  //   // Add the marker cluster group to the map
  //   this.map.addLayer(markers);
  // }


  private initMap(): void {
    this.initOperationalLayers();
    this.initOverlays();
    this.map = L.map('map', {
      center: [20.5937, 78.9629], 
      zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Panel control for layers
    var panelLayers = new (L as any).Control.PanelLayers(null, this.overlays, {
      collapsibleGroups: true,
      collapsed: false,
      groupMaxHeight: 50,
    });
    this.map.addControl(panelLayers);
 }
 
  toggleLayer(layer: string, event: any): void {
    switch (layer) {
      case 'Missing Person':
        if (event.target.checked) {
          this.missingPersonLayer.addTo(this.map!); 
        } else {
          this.missingPersonLayer.remove(); 
        }
        break;
      case 'Unidentified Person':
        if (event.target.checked) {
          this.unidentifiedPersonLayer.addTo(this.map!); 
        } else {
          this.unidentifiedPersonLayer.remove(); 
        }
        break;
      case 'Unidentified Bodies':
        if (event.target.checked) {
          this.unidentifiedBodiesLayer.addTo(this.map!); 
        } else {
          this.unidentifiedBodiesLayer.remove();
        }
        break;
    }
  }

  initOperationalLayers() {
    let state: L.Layer = L.tileLayer.wms(this.geo_url, {
      layers: this.stateLayer, 
      format: "image/png",
      transparent: true,
      opacity: 0.75  // Increased opacity for better visibility
    });
    this.stateLayerName = state;
    
    let dist: L.Layer = L.tileLayer.wms(this.geo_url, {
      layers: this.distLayer, 
      format: "image/png",
      transparent: true,
      opacity: 0.75  // Increased opacity for better visibility
    });
    this.distLayerName = dist;
  }

  initOverlays() {
    // Helper function for adding icons
    function iconByName(name: string) {
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
            layer: this.stateLayerName,
          },
          {
            name: "District Layer",
            active: true,
            layer: this.distLayerName,
          }
        ]
      },
      {
        group: "Person Data",
        icon: iconByName('person'),
        collapsed: true,
        layers: [
          {
            name: "Missing Persons",
            active: true,
            layer: this.missingPersonLayer,
          },
          {
            name: "Unidentified Persons",
            active: true,
            layer: this.unidentifiedPersonLayer,
          },
          {
            name: "Unidentified Bodies",
            active: true,
            layer: this.unidentifiedBodiesLayer,
          }
        ]
      }
    ];
  
    // Push the operational layers into ddOverlays
    this.ddOverlays.push({ name: 'State Layer', layer: this.stateLayerName });
    this.ddOverlays.push({ name: 'District Layer', layer: this.distLayerName });
    this.ddOverlays.push({ name: 'Missing Persons', layer: this.missingPersonLayer });
    this.ddOverlays.push({ name: 'Unidentified Persons', layer: this.unidentifiedPersonLayer });
    this.ddOverlays.push({ name: 'Unidentified Bodies', layer: this.unidentifiedBodiesLayer });
  }


  



  // Fetch and display Missing Persons data
  private getMissingPersonsData(page: number): void {
    this.missingperonapi.getMissingPersons(page).subscribe(response => {
      this.allmissingperson =response.data
      const persons = response.data;
  
      persons.forEach((person: { 
        missing_location_geometry: { coordinates: any; }; 
        location_geometry: { coordinates: any; }; 
        location_metadata: string; 
        full_name: string; 
        gender: string; 
        age: number; 
        photo_upload: string;
        address: { type: string }; }) => {
  
        let coordinates;
        let layerGroup = this.missingPersonLayer; 
        if (person.missing_location_geometry && person.missing_location_geometry.coordinates) {
          coordinates = person.missing_location_geometry.coordinates; 
        } 
        else if (person.location_geometry && person.location_geometry.coordinates) {
          coordinates = person.location_geometry.coordinates; 
        } else {
          return; 
        }
  
        // Proceed only if coordinates are available
        // if (coordinates) {
        //   const lat = coordinates[1]; 
        //   const lng = coordinates[0]; 
        //   const popupContent = `
        //     <strong>person Type: Miising person</strong><br> 
        //     <strong>${person.full_name || 'Unknown'}</strong><br>
        //     Gender: ${person.gender || 'Not specified'}<br>
        //     Age: ${person.age || 'Not specified'}<br>
        //     Location: ${person.location_metadata || 'Not specified'}<br>
        //     <img src="${environment.apiUrl + person.photo_upload || 'assets/images/pngwing.com.png'}" alt="Photo" style="width: 250px; height: 150px;">
        //   `;
  
        //   // Set a custom icon for the markerFrontend
        //   const customIcon = L.icon({
        //     iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
        //     iconSize: [25, 41],
        //     iconAnchor: [12, 41],
        //     popupAnchor: [1, -34],
        //     shadowUrl: 'assets/leaflet/images/marker-shadow.png',
        //     shadowSize: [41, 41],
        //     shadowAnchor: [12, 41]
        //   });
  
        //   // Create and add the marker to the missingPersonLayer
        //   const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
        //   layerGroup.addLayer(marker);  
        // }
        
      });
      
    });

  }
  
  // Fetch and display Unidentified Persons data
  private getUnidentifiedPersonsData(page: number): void {
    this.unidentifiedpersonapi.getUnidentifiedPersons(page).subscribe(response => {
      const persons = response.data;
      this.allunidentifiedperson =response.data
      persons.forEach((person: { 
        geometry: { coordinates: any; }; 
        estimated_age :number;
        gender :string;
        last_location :string;
         photo_upload: string;
         address: { type: string }; 
         }) => {
        const coordinates = person.geometry.coordinates;
        // if (coordinates) {
        //   const lat = coordinates[1];
        //   const lng = coordinates[0];
        //   const popupContent = `
        //     <strong>Person Type: Unidentified person</strong><br> 
        //     Age: ${person.estimated_age}<br>
        //     Gender: ${person.gender}<br>
        //     Location: ${person.last_location }<br>
        //     <img [src]="person.photo_upload ? 'assets/' + person.photo_upload : 'assets/images/pngwing.com.png'" alt="Photo" style="width: 250px; height: 150px;">
        //   `;


        //   // Set custom icon for the marker
        //   const customIcon = L.icon({
        //     iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
        //     iconSize: [25, 41], 
        //     iconAnchor: [12, 41], 
        //     popupAnchor: [1, -34], 
        //     shadowUrl: 'assets/leaflet/images/marker-shadow.png', 
        //     shadowSize: [41, 41],
        //     shadowAnchor: [12, 41] 
        //   });

        //   const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
        //   this.unidentifiedPersonLayer.addLayer(marker);
        // }
        // this.updateCounts();
      });
    });
  }

  // Fetch and display Unidentified Bodies data
  private getUnidentifiedBodiesData(page: number): void {
    this.unidentifiedbodieapi.getUnidentifiedBodies(page).subscribe(response => {
      const bodies = response.data;
      this.allunidentiedbodies =response.data
      bodies.forEach((body: { geometry: { coordinates: any; }; 
        body_seen_details: any; 
        body_photo_upload: string;
        address: { type: string }; }) => {
        const coordinates = body.geometry.coordinates;
        // if (coordinates) {
        //   const lat = coordinates[1];
        //   const lng = coordinates[0];
        //   const popupContent = `
        //     <strong>Person Type: Unidentified Body</strong><br> 
        //     Location: ${body.body_seen_details || 'Not specified'}<br>
        //     <img src="${environment.apiUrl + (body.body_photo_upload || 'assets/images/pngwing.com.png')}" alt="Photo" style="width: 250px; height: 150px;">
        //   `;

        //   // Set custom icon for the marker
        //   const customIcon = L.icon({
        //     iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
        //     iconSize: [25, 41], 
        //     iconAnchor: [12, 41], 
        //     popupAnchor: [1, -34], 
        //     shadowUrl: 'assets/leaflet/images/marker-shadow.png', 
        //     shadowSize: [41, 41],
        //     shadowAnchor: [12, 41] 
        //   });

        //   const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
        //   this.unidentifiedBodiesLayer.addLayer(marker);
        // }
        // this.updateCounts();
      });
    });
  }

 

  // getallpolicestation(){
  //   this.policestationapi.getallpolicestations().subscribe(data => {
  //     this.allpolicestations = data.data
  //   });
  // }

  getallstates(){
    this.policestationapi.getallstates().subscribe(data => {
      this.allstates = data
    });
  }

  // getallcities(){
  //   this.policestationapi.getallcities().subscribe(data => {
  //     this.allcities = data
  //   });
  // }

  // getalldistricts(){
  //   this.policestationapi.getalldistricts().subscribe(data => {
  //     this.alldistricts = data
  //   });
  // }

  getallvillges(){
    this.policestationapi.getvillagelist().subscribe(data=>{
      this.allVillages =data
    })
  }

  getDistrictsByState(state: string) {
    console.log('Fetching districts for state:', state);
    if (state && state !== 'All States') {
      this.policestationapi.getDistrictsByState(state).subscribe(data => {
        this.alldistricts = data;
      });
    } else {
      // Handle the case where 'state' is not selected or is 'All States'
      this.alldistricts = [];
    }
  }
  

  getCitiesByDistrict(district: string) {
    this.policestationapi.getCitiesByDistrict(district).subscribe(data => {
      this.allcities = data;
    });
  }



  getvillagesbyCity(city: string) {
    this.policestationapi.getvillegesbycity(city).subscribe(data => {
      this.allVillages = data;
    });
  }
  
  getpolicestationbycity(city: string): void {
    if (city !== 'All Police Stations') {
        this.policestationapi.getPoliceStationsByCity(city).subscribe({
            next: (data) => {
                this.allpolicestations = data;
                console.log(this.allpolicestations)
            },
            error: (error) => {
                console.error('Error fetching police stations:', error);
            }
        });
    } else {
        this.allpolicestations = []; // Clear the list if "All stations" is selected
    }
}




  isLoading = false;

  onNavigate(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); 
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/homepage']).catch((error) => {
        console.error('Navigation error:', error);
      });
    }, 1000);
  }
  


  getmissingpersoncount(){
    this.allcountapi.getmissingPersonscount().subscribe(data => {
      this.missingpersonscount = data["Missing_persons_count"]
      
    });
  }

  getunidentifiedpersoncount(){
    this.allcountapi.getunidentifiedPersonscount().subscribe(data => {
      this.unidentifiedpersonscount = data["Unidentified_persons_count"]
    });
    
  }

  getunidentifiedbodiescount(){
    this.allcountapi.getunidentifiedbodiescount().subscribe(data =>{
      this.unidentifiedbodiescount = data["Unidentified_bodies_count"]
    })
  }

  getmissingPersonGenderCount() {
    this.allcountapi.getmissingPersonGenderCount().subscribe(data => {
      this.missingPersonGenderCounts = data.gender_counts;  
    }, error => {
      console.error('Error fetching gender count:', error); 
    });
  }

  getgenderst() {
    this.allcountapi.getgenderListCount().subscribe(data => {
      this.allgenders = data
    }, error => {
      console.error('Error fetching gender count:', error); 
    });
  }

  getvillage() {
    this.policestationapi.getvillagelist().subscribe(data => {
      this.allVillages = data
    }, error => {
      console.error('Error fetching gender count:', error); 
    });
  }
  

 

  

 
  
  

}
