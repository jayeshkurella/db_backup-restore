import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { AllcountServiceService } from 'src/app/services/allcount-service.service';
import { MissingpersonapiService } from '../homepage/missingperson/missingpersonapi.service';
import { environment } from 'src/envirnments/envirnment';
import { UnidentifiedPersonapiService } from '../homepage/unidentified-person/unidentified-personapi.service';
import { UnidentifiedbodiesapiService } from '../homepage/unidentified-bodies/unidentifiedbodiesapi.service';
import { PoliceStationaoiService } from 'src/app/services/police-stationaoi.service';
declare var bootstrap: any;
import 'leaflet-panel-layers';
import '../../../../src/leaflet-panel-layers'
import 'leaflet-basemaps/L.Control.Basemaps'; 

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit, AfterViewInit {
  // geoserver
  geo_url :any

  stateLayer = "GeoFlow_WCD:tblstates";
  stateLayerName: any;
  distLayer="GeoFlow_WCD:tbldistricts";
  distLayerName: any;
  



  environment = environment;
  allmissingperson: any[] = [];
  allunidentifiedperson: any[] = [];
  allunidentiedbodies: any[] = [];
  missingpersonscount: any[] = [];
  unidentifiedpersonscount: any[] = [];
  unidentifiedbodiescount: any[] = [];
  missingPersonGenderCounts: any[] = [];
  allpolicestations: any;
  allstates: any;
  allcities: any;
  alldistricts: any;
  selectedCity = 'All Cities';
  selectedState= 'All States';
  selectedDistrict= 'All Districts';
  selectedPoliceStation='All Police Stations';
  selectedgender='All Genders';
  allBloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']; 
  missingPersonsCount: number = 0;
  missingPersonGenderCountss: { Male: number; Female: number; Other: number } = { Male: 0, Female: 0, Other: 0 };
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

  years: number[] = [];
  months: { value: string, name: string }[] = [];
  days: number[] = [];
  selectedYear: string = '';
  selectedMonth: string = '';
  selectedDate: string = '';
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


  constructor(
    private router: Router, 
    private allcountapi: AllcountServiceService, 
    private missingperonapi: MissingpersonapiService,
    private unidentifiedpersonapi: UnidentifiedPersonapiService,
    private unidentifiedbodieapi: UnidentifiedbodiesapiService,
    private policestationapi :PoliceStationaoiService,
  ) {this.geo_url = "https://products.coderize.in/geoserver/GeoFlow_WCD/wms/"}

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
    // this.initMap();  
    this.getMissingPersonsData(this.pagination.current_page);
    this.getUnidentifiedBodiesData(this.pagination.current_page)
    this.getUnidentifiedPersonsData(this.pagination.current_page)
    this.getmissingpersoncount()
    this.getunidentifiedpersoncount()
    this.getunidentifiedbodiescount()
    this.getmissingPersonGenderCount()
    this.getallpolicestation()
    this.getallstates()
    this.getallcities()
    this.getalldistricts()
    this.getgenderst()
    this.getvillage()
  }

  filterDataByFilters(): void {
    this.missingPersonLayer.clearLayers();
    this.unidentifiedPersonLayer.clearLayers();
    this.unidentifiedBodiesLayer.clearLayers();
    
    const state = this.selectedState !== 'All States' ? this.selectedState : null;
    const district = this.selectedDistrict !== 'All Districts' ? this.selectedDistrict : null;
    const city = this.selectedCity !== 'All Cities' ? this.selectedCity : null;
    const gender =this.selectedgender !== 'All Genders' ? this.selectedgender : null;
    const policeStationId = this.selectedPoliceStation !== 'All Police Stations' ? this.selectedPoliceStation : null;

    const blood_group = this.selectedBloodGroup !== 'All Blood Groups' ? this.selectedBloodGroup : null;
    const village = this.selectedVillage !== 'All Villages' ? this.selectedVillage : null;

    const heightRange = this.selectedHeightRange !== 'All Heights' ? this.selectedHeightRange : null;
    const weightRange = this.selectedWeightRange !== 'All Weights' ? this.selectedWeightRange : null;
    const AgeRange = this.selectedAgeRange !== 'All Ages' ? this.selectedAgeRange : null;
    const marital = this.selectedmarital !== 'Marital status' ? this.selectedmarital : null;

    // Fetch filtered data based on the selected filters
    this.getFilteredMissingPersonsData(state, district, city, policeStationId ,gender,blood_group,village,heightRange, weightRange,AgeRange ,marital);
    this.getFilteredUnidentifiedPersonsData(state, district, city, policeStationId ,gender,blood_group,village,heightRange, weightRange,AgeRange,marital);
    this.getFilteredUnidentifiedBodiesData(state, district, city, policeStationId,gender,blood_group,village,heightRange, weightRange,AgeRange,marital);

  }

  private getFilteredMissingPersonsData(state: string | null, 
    district: string | null,
    city: string | null, 
    policeStationId: string | null,
    gender :string | null,
    blood_group: string | null,
    village :string | null,
    heightRange: string | null,  
    weightRange: string | null, 
    AgeRange: string | null, 
    marital: string | null, 
    ): void {
    this.missingperonapi.getMissingPersons(1).subscribe(response => {
      const persons = response.data;
      this.missingPersonLayer.clearLayers();

      this.state = state;
      this.district = district;
      this.city = city;
      this.policeStationId = policeStationId;
      this.gender = gender
      this.blood_group =blood_group
      this.village =village
      this.heightRange = heightRange;
      this.weightRange = weightRange;
      this.AgeRange =AgeRange
      this.Marital =marital

      let missingPersonsCount = 0;
      let maleCount = 0;
      let femaleCount = 0;
      let otherCount = 0;
      this.filteredMissingPersonssss = [];

      persons.forEach((person: {
        full_name: string;
        gender: string;
        blood_group: string;
        police_station_name_and_address: { id: number; name: string };
        address: { state: string; district: string; city: string; village: string };
        missing_location_geometry: { coordinates: number[] } | null;
        location_geometry: { coordinates: number[] } | null;
        photo_upload: string;
        location_metadata: string;
        marital_status: string;
        age: number;
        height: number; 
        weight: number; 
      }) => {

        if (state && person.address.state !== state) {
          return;
        }
        if (district && person.address.district !== district) {
          return;
        }
        if (city && person.address.city !== city) {
          return;
        }
        if (village && person.address.village !== village) {
          return;
        }
        if (policeStationId && person.police_station_name_and_address.id.toString() !== policeStationId) {
          return;
        }
      
        if (gender) {
          if (gender === 'Other' && person.gender !== 'Male' && person.gender !== 'Female') {
          } else if (person.gender !== gender) {
            return; 
          }
        }

        if (blood_group && person.blood_group !== blood_group) {
          return;
        }

        if (marital && person.marital_status !== marital) {
          return;
        }

        if (heightRange) {
          const height = person.height;
          if (heightRange === '133-150' && (height < 133 || height > 150)) {
            console.log(`Person ${person.full_name} does not match height range 133-150`);
            return;
          }
          if (heightRange === '151-180' && (height < 151 || height > 180)) {
            console.log(`Person ${person.full_name} does not match height range 151-180`);
            return;
          }
          if (heightRange === 'Above 180' && height <= 180) {
            console.log(`Person ${person.full_name} does not match height range Above 180`);
            return;
          }
        }

        if (weightRange) {
          const weight = person.weight;
          if (weightRange === '0-50' && (weight < 0 || weight > 50)) {
            console.log(`Person ${person.full_name} does not match weight range 0-50`);
            return;
          }
          if (weightRange === '51-70' && (weight < 51 || weight > 70)) {
            console.log(`Person ${person.full_name} does not match weight range 51-70`);
            return;
          }
          if (weightRange === 'Above 70' && weight <= 70) {
            console.log(`Person ${person.full_name} does not match weight range Above 70`);
            return;
          }
        }
        
        if (AgeRange) {
          const age = person.age;
          if (AgeRange === '0-18' && (age < 0 || age > 18)) {
            return;
          }
          if (AgeRange === '18-30' && (age < 18 || age > 30)) {
            return;
          }
          if (AgeRange === '30-50' && (age < 30 || age > 50)) {
            return;
          }
          if (AgeRange === '50-70' && (age < 50 || age > 70)) {
            return;
          }
          if (AgeRange === 'Above 70' && age <= 70) {
            return;
          }
        }

        
        

        missingPersonsCount++;
      
        if (person.gender === 'Male') {
          maleCount++;
        } else if (person.gender === 'Female') {
          femaleCount++;
        } else {
          otherCount++;
        }
      
        // Get Coordinates
        const coordinates = person.missing_location_geometry?.coordinates || person.location_geometry?.coordinates;
        if (!coordinates || coordinates.length !== 2) {
          return;
        }
      
        const lat = coordinates[1];
        const lng = coordinates[0];
      
        // Prepare Popup Content
        const popupContent = `
          <strong>Person Type: Missing</strong><br>
          <strong>${person.full_name || 'Unknown'}</strong><br>
          Gender: ${person.gender || 'Not specified'}<br>
          Age: ${person.age || 'Not specified'}<br>
          Location: ${person.location_metadata || 'Not specified'}<br>
          <img src="${environment.apiUrl + (person.photo_upload || 'default-photo.jpg')}" alt="Photo" style="width: 250px; height: 150px;">
        `;
      
        // Add Marker to Map
        const customIcon = L.icon({
          iconUrl: 'assets/leaflet/images/red_marker.png',
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
      });
      
      
      
      this.missingPersontotalcount = missingPersonsCount; 
      this.missingPersonGenderCountss = { Male: maleCount, Female: femaleCount, Other: otherCount };
    });

  }
 
  
  private getFilteredUnidentifiedPersonsData(state: string | null, district: string | null, city: string | null, policeStationId: string | null, gender: string | null,blood_group: string | null,
    village :string | null, heightRange: string | null,  weightRange: string | null, AgeRange: string | null,marital: string | null, ): void {
    this.unidentifiedpersonapi.getUnidentifiedPersons(1).subscribe(response => {
      const persons = response.data;
      this.unidentifiedPersonLayer.clearLayers();
  
      let unidentifiedPersonsCount = 0; 
      let maleCount = 0; 
      let femaleCount = 0; 
      let otherCount = 0; 

      this.filteredUnidentifiedPersonssss = [];
      persons.forEach((person: {
        photo_upload: string;
        address: {
          state: string;
          district: string;
          city: string;
          village: string;
        };
        police_station_name_and_address: { id: number; name: string };
        geometry: { coordinates: number[] } | null;
        location_metadata: any;
        gender: string;
        blood_group: string;
        marital_status: string;
        estimated_age: number;
        height: number;
        weight: number;
      }) => {
  
        // Apply filtering based on selected filters
        if ((state && person.address.state !== state) || 
            (district && person.address.district !== district) ||
            (city && person.address.city !== city) ||
            (policeStationId && person.police_station_name_and_address.id.toString() !== policeStationId)) {
          return;
        }
  
        if (gender) {
          if (gender === 'Other' && person.gender !== 'Male' && person.gender !== 'Female') {
          } else if (person.gender !== gender) {
            return; 
          }
        }
        if (village && person.address.village !== village) {

          return;
        }
        if (blood_group && person.blood_group !== blood_group) {

          return;
        }

        if (marital && person.marital_status !== marital) {
          console.log(`Excluded person with marital status ${person.marital_status}, expected ${marital}`);
          return;
        }

        

        if (heightRange) {
          const height = person.height;
          if (heightRange === '133-150' && (height < 133 || height > 150)) {
            return;
          }
          if (heightRange === '151-180' && (height < 151 || height > 180)) {
            return;
          }
          if (heightRange === 'Above 180' && height <= 180) {
            return;
          }
        }

        if (weightRange) {
          const weight = person.weight;
          if (weightRange === '0-50' && (weight < 0 || weight > 50)) {
            return;
          }
          if (weightRange === '51-70' && (weight < 51 || weight > 70)) {
            return;
          }
          if (weightRange === 'Above 70' && weight <= 70) {
            return;
          }
        }
        
        if (AgeRange) {
          const age = person.estimated_age;
          if (AgeRange === '0-18' && (age < 0 || age > 18)) {
            return;
          }
          if (AgeRange === '18-30' && (age < 18 || age > 30)) {
            return;
          }
          if (AgeRange === '30-50' && (age < 30 || age > 50)) {
            return;
          }
          if (AgeRange === '50-70' && (age < 50 || age > 70)) {
            return;
          }
          if (AgeRange === 'Above 70' && age <= 70) {
            return;
          }
        }

        this.filteredUnidentifiedPersonssss.push(person);
        unidentifiedPersonsCount++; 
  
        // Count gender
        if (person.gender === 'Male') {
          maleCount++;
        } else if (person.gender === 'Female') {
          femaleCount++;
        } else {
          otherCount++; 
        }
  
        // Extract coordinates from the geometry field
        const coordinates = person.geometry?.coordinates;
        if (!coordinates || coordinates.length !== 2) {
          return; 
        }
  
        const lat = coordinates[1];
        const lng = coordinates[0];
  
        // Popup content with person's details
        const popupContent = `
          <strong>Person Type: Unidentified Person</strong><br> 
          Age: ${person.estimated_age || 'Not specified'}<br>
          Gender: ${person.gender || 'Not specified'}<br>
          Location: ${person.location_metadata || 'Not specified'}<br>
          <img src="${environment.apiUrl + (person.photo_upload || 'default-photo.jpg')}" alt="Photo" style="width: 250px; height: 150px;">
        `;
  
        // Custom marker for Leaflet
        const customIcon = L.icon({
          iconUrl: 'assets/leaflet/images/green_marker.png',
          iconSize: [35, 35],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'assets/leaflet/images/marker-shadow.png',
          shadowSize: [41, 41],
          shadowAnchor: [12, 41]
        });
  
        // Create the marker and bind the popup content
        const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
        this.unidentifiedPersonLayer.addLayer(marker);
      });
  
      this.unidentifiedPersonTotalCounts = unidentifiedPersonsCount;
      this.unidentifiedPersonGenderCounts = {
        Male: maleCount,
        Female: femaleCount,
        Other: otherCount, 
      };
    });
  }
  
  

  private getFilteredUnidentifiedBodiesData(state: string | null, district: string | null, city: string | null, policeStationId: string | null, gender: string | null,
    blood_group: string | null,village :string | null,heightRange: string | null,  weightRange: string | null, AgeRange: string | null, marital: string | null, 
  ): void {
    this.unidentifiedbodieapi.getUnidentifiedBodies(1).subscribe(response => {
      const bodies = response.data;
      this.unidentifiedBodiesLayer.clearLayers(); 
  
      let unidentifiedBodiesCount = 0; 
      let maleCount = 0; 
      let femaleCount = 0; 
      let otherCount = 0; 
      this.filteredunidentifiedboidessss = []

      bodies.forEach((body: {
        body_photo_upload: string;
        address: {
          state: string;
          district: string;
          city: string;
          village: string;
        };
        police_station_name_and_address: { id: number; name: string };
        geometry: { coordinates: number[] } | null;
        body_seen_details: string;
        gender: string | null; 
        blood_group: string | null; 
        marital_status: string | null; 
        estimated_age: number;
        height: number;
        weight: number;
      }) => {
        if ((state && body.address.state !== state) || 
            (district && body.address.district !== district) ||
            (city && body.address.city !== city) ||
            (policeStationId && body.police_station_name_and_address.id.toString() !== policeStationId)) {
          return; 
        }
  
        if (gender) {
          if (gender === 'Other' && body.gender !== 'Male' && body.gender !== 'Female') {
          } else if (body.gender !== gender) {
            return; 
          }
        }
        if (village && body.address.village !== village) {

          return;
        }
        if (blood_group && body.blood_group !== blood_group) {

          return;
        }
        if (marital && body.marital_status !== marital) {

          return;
        }

        if (heightRange) {
          const height = body.height;
          if (heightRange === '133-150' && (height < 133 || height > 150)) {
            return;
          }
          if (heightRange === '151-180' && (height < 151 || height > 180)) {
            return;
          }
          if (heightRange === 'Above 180' && height <= 180) {
            return;
          }
        }

        if (weightRange) {
          const weight = body.weight;
          if (weightRange === '0-50' && (weight < 0 || weight > 50)) {
            return;
          }
          if (weightRange === '51-70' && (weight < 51 || weight > 70)) {
            return;
          }
          if (weightRange === 'Above 70' && weight <= 70) {
            return;
          }
        }
        
        if (AgeRange) {
          const age = body.estimated_age;
          if (AgeRange === '0-18' && (age < 0 || age > 18)) {
            return;
          }
          if (AgeRange === '18-30' && (age < 18 || age > 30)) {
            return;
          }
          if (AgeRange === '30-50' && (age < 30 || age > 50)) {
            return;
          }
          if (AgeRange === '50-70' && (age < 50 || age > 70)) {
            return;
          }
          if (AgeRange === 'Above 70' && age <= 70) {
            return;
          }
        }
  
        this.filteredunidentifiedboidessss.push(body)
        unidentifiedBodiesCount++; 
  
        if (body.gender === 'Male') {
          maleCount++;
        } else if (body.gender === 'Female') {
          femaleCount++;
        } else {
          otherCount++; 
        }
  
        const coordinates = body.geometry?.coordinates;
        if (!coordinates || coordinates.length !== 2) {
          return;
        }
  
        const lat = coordinates[1];
        const lng = coordinates[0];
  
    
        const popupContent = `
          <strong>Person Type: Unidentified Body</strong><br> 
          Location: ${body.body_seen_details || 'Not specified'}<br>
          <img src="${environment.apiUrl + (body.body_photo_upload || '/assets/images/noPhoto.png')}" alt="Photo" style="width: 250px; height: 150px;">
        `;
  
        // Custom marker for Leaflet
        const customIcon = L.icon({
          iconUrl: 'assets/leaflet/images/black_marker.png',
          iconSize: [35, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'assets/leaflet/images/marker-shadow.png',
          shadowSize: [41, 41],
          shadowAnchor: [12, 41]
        });
  
        // Create the marker and bind the popup content
        const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
        this.unidentifiedBodiesLayer.addLayer(marker);
      });
  
      // Update the total and gender counts
      this.unidentifiedBodyTotalCount = unidentifiedBodiesCount;
      this.unidentifiedBodyGenderCounts = {
        Male: maleCount,
        Female: femaleCount,
        Other: otherCount, // Transgender and other non-Male/Female genders are counted under "Other"
      };
    });
  }

  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('filteredDataModal'));
    modal.show();
     

  }

 
  private missingPersonLayer: L.LayerGroup = L.layerGroup();
  private unidentifiedPersonLayer: L.LayerGroup = L.layerGroup();
  private unidentifiedBodiesLayer: L.LayerGroup = L.layerGroup();
  private map: L.Map | undefined;

  ngAfterViewInit(): void {
    this.initMap();
    this.getMissingPersonsData(1); 
    this.getUnidentifiedPersonsData(1); 
    this.getUnidentifiedBodiesData(1); 
    // this.addCountsLegend();
    
  }

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
   // pannal code
  
   var panelLayers = new (L as any).Control.PanelLayers(null, this.overlays, {
    collapsibleGroups: false,
    collapsed:false
  });
  this.map.addControl(panelLayers);

    this.createLayers();
   
  }

  private createLayers(): void {
    // Add layers to the map
    this.missingPersonLayer.addTo(this.map!);
    this.unidentifiedPersonLayer.addTo(this.map!);
    this.unidentifiedBodiesLayer.addTo(this.map!);
   

    L.control.layers(undefined, {
      'Missing Person ': this.missingPersonLayer,
      'Unidentified Person ': this.unidentifiedPersonLayer,
      'Unidentified Bodies ': this.unidentifiedBodiesLayer
    }).addTo(this.map!);
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
        if (coordinates) {
          const lat = coordinates[1]; 
          const lng = coordinates[0]; 
          const popupContent = `
            <strong>person Type: Miising person</strong><br> 
            <strong>${person.full_name || 'Unknown'}</strong><br>
            Gender: ${person.gender || 'Not specified'}<br>
            Age: ${person.age || 'Not specified'}<br>
            Location: ${person.location_metadata || 'Not specified'}<br>
            <img src="${environment.apiUrl + person.photo_upload || 'assets/images/pngwing.com.png'}" alt="Photo" style="width: 250px; height: 150px;">
          `;
  
          // Set a custom icon for the markerFrontend
          const customIcon = L.icon({
            iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'assets/leaflet/images/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 41]
          });
  
          // Create and add the marker to the missingPersonLayer
          const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
          layerGroup.addLayer(marker);  
        }
        
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
        if (coordinates) {
          const lat = coordinates[1];
          const lng = coordinates[0];
          const popupContent = `
            <strong>Person Type: Unidentified person</strong><br> 
            Age: ${person.estimated_age}<br>
            Gender: ${person.gender}<br>
            Location: ${person.last_location }<br>
            <img [src]="person.photo_upload ? 'assets/' + person.photo_upload : 'assets/images/pngwing.com.png'" alt="Photo" style="width: 250px; height: 150px;">
          `;


          // Set custom icon for the marker
          const customIcon = L.icon({
            iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
            iconSize: [25, 41], 
            iconAnchor: [12, 41], 
            popupAnchor: [1, -34], 
            shadowUrl: 'assets/leaflet/images/marker-shadow.png', 
            shadowSize: [41, 41],
            shadowAnchor: [12, 41] 
          });

          const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
          this.unidentifiedPersonLayer.addLayer(marker);
        }
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
        if (coordinates) {
          const lat = coordinates[1];
          const lng = coordinates[0];
          const popupContent = `
            <strong>Person Type: Unidentified Body</strong><br> 
            Location: ${body.body_seen_details || 'Not specified'}<br>
            <img src="${environment.apiUrl + (body.body_photo_upload || 'assets/images/pngwing.com.png')}" alt="Photo" style="width: 250px; height: 150px;">
          `;

          // Set custom icon for the marker
          const customIcon = L.icon({
            iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
            iconSize: [25, 41], 
            iconAnchor: [12, 41], 
            popupAnchor: [1, -34], 
            shadowUrl: 'assets/leaflet/images/marker-shadow.png', 
            shadowSize: [41, 41],
            shadowAnchor: [12, 41] 
          });

          const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
          this.unidentifiedBodiesLayer.addLayer(marker);
        }
        // this.updateCounts();
      });
    });
  }

  // Toggle visibility of layers
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


  getallpolicestation(){
    this.policestationapi.getallpolicestations().subscribe(data => {
      this.allpolicestations = data.data
    });
  }

  getallstates(){
    this.policestationapi.getallstates().subscribe(data => {
      this.allstates = data
    });
  }

  getallcities(){
    this.policestationapi.getallcities().subscribe(data => {
      this.allcities = data
    });
  }

  getalldistricts(){
    this.policestationapi.getalldistricts().subscribe(data => {
      this.alldistricts = data
    });
  }



  isLoading = false;

  onNavigate(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false; 
      this.router.navigate(['/homepage']); 
    }, 3000); 
  }


  getmissingpersoncount(){
    this.allcountapi.getmissingPersonscount().subscribe(data => {
      this.missingpersonscount = data["Missing_persons_count"]
      console.log(this.missingpersonscount)
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
    this.allcountapi.getvillagelist().subscribe(data => {
      this.allVillages = data
    }, error => {
      console.error('Error fetching gender count:', error); 
    });
  }
  

  // geoserver
  initOperationalLayers() {
    // event.stopPropagation()
    


    let state: L.Layer = L.tileLayer.wms(this.geo_url, {
      layers: this.stateLayer, // worksapce + layer name 
      format: "image/png",
      transparent: true,
      opacity: 0.6
    });
    this.stateLayerName = state; // local variable declared in global one as layer name
    
    let dist: L.Layer = L.tileLayer.wms(this.geo_url, {
      layers: this.distLayer, // worksapce + layer name 
      format: "image/png",
      transparent: true,
      opacity: 0.6
    });
    this.distLayerName = dist; // local variable declared in global one as layer name

    
  }


  initOverlays() {
    // event.stopPropagation()
    function iconByName(name: any) {
      return '<i class="icon icon-' + name + '"></i>';
    }
    this.overlays = [
      {
        group: "Layers",
        icon: iconByName('parking'),
        collapsed:false,
        layers: [
          {
            name: "State Layer",  // show on UI 
            active: true,  // layer show on map by default
            layer: this.stateLayerName, // layer name assign
          },
          {
            name: "District Layer",  // show on UI 
            active: true,  // layer show on map by default
            layer: this.distLayerName, // layer name assign
          }
          
        ]
      }
      ]
      
  

    this.ddOverlays.push({ name: 'State Layer', layer: this.stateLayerName });
    this.ddOverlays.push({ name: 'District Layer', layer: this.distLayerName });

  }
}
