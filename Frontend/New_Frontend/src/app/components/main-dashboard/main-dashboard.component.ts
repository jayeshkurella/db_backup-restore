import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
declare var bootstrap: any;
import * as L from 'leaflet';
// import 'leaflet-panel-layers';
import '../../../../src/leaflet-panel-layers'

import 'leaflet-basemaps/L.Control.Basemaps'; 
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/envirnments/envirnment';
import { Router } from '@angular/router';
import { MainDashboardServiceService } from './main-dashboard-service.service';

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit ,AfterViewInit {
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
  geoServerClusterGroup: L.MarkerClusterGroup | undefined;
  permanentAddressLayer: any;
  temporaryAddressLayer: any;


  states:any;
  selectedState= 'state';
  selectedDistrict = 'district';
  selectedCity= 'city';
  selectedVillage = 'village';
  
 
  
  constructor(
    private router: Router, 
    private http: HttpClient,
    private filterService :MainDashboardServiceService,
    // private allcountapi: AllcountServiceService, 
    // private missingperonapi: MissingpersonapiService,
    // private unidentifiedpersonapi: UnidentifiedPersonapiService,
    // private unidentifiedbodieapi: UnidentifiedbodiesapiService,
    // private policestationapi :PoliceStationaoiService,
    // private fitereddataapi :MainDashserviceService,
    private cdr: ChangeDetectorRef,
  ) {}

 
  ngAfterViewInit(): void {
    this.initMap();
    // this.getMissingPersonsData(1); 
    // this.getUnidentifiedPersonsData(1); 
    // this.getUnidentifiedBodiesData(1); 
    // this.addCountsLegend();
    
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
    // this.initMap();  
    // this.getMissingPersonsData(this.pagination.current_page);
    // this.getUnidentifiedBodiesData(this.pagination.current_page)
    // this.getUnidentifiedPersonsData(this.pagination.current_page)
    // this.getmissingpersoncount()
    // this.getunidentifiedpersoncount()
    // this.getunidentifiedbodiescount()
    // this.getmissingPersonGenderCount()
    // // this.getallpolicestation()
    // this.getallstates()
    // // this.getallcities()
    // // this.getalldistricts()
    // this.getgenderst()
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
  


//   filterDataByFilters(): void {
//     this.moveMapToState(this.selectedState);
//     if (this.selectedState && this.selectedState !== 'All States') {
        
//         this.onStateChange(this.selectedState);
//     }

//     if (this.selectedDistrict && this.selectedDistrict !== 'All Districts') {
//         this.onDistrictChange({ target: { value: this.selectedDistrict } } as unknown as Event);
//     }

//     if (this.selectedCity && this.selectedCity !== 'All Cities') {
//         this.onCityChange(this.selectedCity);
//     }

//     if (this.selectedVillage && this.selectedVillage !== 'All Villages') {
//         this.onVillageChange(this.selectedVillage);
//     }
//  }

filterDataByFilters(): void {
    this.moveMapToState(this.selectedState);
    // this.initOperationalLayers();

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
  private markerClusterGroup!: L.MarkerClusterGroup;




  private initMap(): void {
    // this.initOperationalLayers();
    this.initOverlays();

    this.map = L.map('map', {
        center: [20.5937, 78.9629],
        zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Add only the cluster group to the map initially
    this.geoServerClusterGroup!.addTo(this.map);

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
      case 'State Layer':
          if (event.target.checked) {
              this.stateLayerName.addTo(this.map!); 
          } else {
              this.stateLayerName.remove(); 
          }
          break;
      case 'District Layer':
          if (event.target.checked) {
              this.distLayerName.addTo(this.map!); 
          } else {
              this.distLayerName.remove(); 
          }
          break;
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
      case 'GeoServer Markers':
          if (event.target.checked) {
              this.geoServerClusterGroup?.addTo(this.map!); 
          } else {
              this.geoServerClusterGroup?.remove();
          }
          break;
      default:
          console.warn(`Layer '${layer}' not found.`);
          break;
  }
  }

  
  initOperationalLayers() {
    // Clear existing markers and layers
    console.log("Clearing existing layers...");
    if (this.geoServerClusterGroup) {
        this.geoServerClusterGroup.clearLayers();
    }
    if (this.missingPersonLayer) {
        this.missingPersonLayer.clearLayers();
    }
    if (this.unidentifiedPersonLayer) {
        this.unidentifiedPersonLayer.clearLayers();
    }
    if (this.unidentifiedBodiesLayer) {
        this.unidentifiedBodiesLayer.clearLayers();
    }

    // Reinitialize the marker cluster group
    this.geoServerClusterGroup = L.markerClusterGroup();

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

    // Build the CQL filter based on selected state and district
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

    // Log the constructed CQL filter
    console.log("Selected State:", this.selectedState);
    console.log("Selected District:", this.selectedDistrict);
    console.log("Constructed CQL Filter:", cqlFilter);

    // WFS request with CQL filters
    // const wfsUrl = `${environment.person_geoserver_url}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=Chhaya:Mainapp_person&outputFormat=application/json${cqlFilter ? `&cql_filter=${encodeURIComponent(cqlFilter)}` : ''}`;
    // const wfsUrl = `http://localhost:8080/geoserver/Chhaya/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=Chhaya:Mainapp_person&outputFormat=application/json${cqlFilter ? `&cql_filter=${encodeURIComponent(cqlFilter)}` : ''}`;
    // console.log("WFS Request URL:", wfsUrl);

    const wfsUrl = `${environment.person_geoserver_url}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=chhaya:Mainapp_person&outputFormat=application/json${cqlFilter ? `&cql_filter=${encodeURIComponent(cqlFilter)}` : ''}`;
console.log("WFS Request URL:", wfsUrl);

    fetch(wfsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched Data:", data);

            if (!data.features || data.features.length === 0) {
                console.warn("No features returned by GeoServer for the applied filter.");
                alert("No data available for the selected state and district.");
                return;
            }

            const markerPromises = data.features.map(async (feature: any) => {
                try {
                    const fullPersonId = feature.id; // e.g., "Mainapp_person.977b76d5-f4c7-4955-b239-b232ace34b39"
                    const personId = fullPersonId.split('.')[1]; // Extract only the ID part
                    const geometry = feature.geometry;
                    const personType = feature.properties.person_type;

                    if (!geometry || geometry.type !== 'Point' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length !== 2) {
                        console.warn("Invalid or missing 'geometry' data for feature:", feature);
                        return null;
                    }

                    const [lng, lat] = geometry.coordinates;
                    const latlng: L.LatLngTuple = [lat, lng];

                    const personResponse = await fetch(`${environment.apiUrl}persons/${personId}/`);
                    if (!personResponse.ok) {
                        throw new Error(`Failed to fetch person details: ${personResponse.status}`);
                    }

                    const personDetails = await personResponse.json();
                    const marker = L.marker(latlng, { icon: customIcon });
                    marker.feature = feature;

                    const popupContent = 
                        `<img src="${environment.defaultPersonImage}" alt="Person Image" style="max-width: 100px; max-height: 100px; margin: 5px 0;"><br>
                        <b>Type:</b> ${personDetails.type || 'N/A'}<br>
                        <b>Name:</b> ${personDetails.full_name || 'N/A'}<br>
                        <b>Age:</b> ${personDetails.age || 'N/A'}<br>
                        <b>Gender:</b> ${personDetails.gender || 'N/A'}<br>`;

                    marker.bindPopup(popupContent);

                    switch (personType) {
                        case 'Missing person':
                            this.missingPersonLayer.addLayer(marker);
                            break;
                        case 'Unidentified person':
                            this.unidentifiedPersonLayer.addLayer(marker);
                            break;
                        case 'Unidentified Bodies':
                            this.unidentifiedBodiesLayer.addLayer(marker);
                            break;
                        default:
                            console.warn("Unknown person type:", personType);
                            break;
                    }

                    return marker;

                } catch (error) {
                    console.error("Error processing feature:", feature, error);
                    return null;
                }
            });

            Promise.all(markerPromises).then(markers => {
                markers.forEach(marker => {
                    if (marker) this.geoServerClusterGroup?.addLayer(marker);
                });

                this.geoServerClusterGroup?.addTo(this.map!);
            });

        })
        .catch(error => console.error("Error fetching GeoJSON:", error));

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

// initOperationalLayers() {
//     console.log("Clearing existing layers...");

//     // Clear existing markers and layers
//     if (this.geoServerClusterGroup) {
//         this.geoServerClusterGroup.clearLayers();
//     }
//     if (this.missingPersonLayer) {
//         this.missingPersonLayer.clearLayers();
//     }
//     if (this.unidentifiedPersonLayer) {
//         this.unidentifiedPersonLayer.clearLayers();
//     }
//     if (this.unidentifiedBodiesLayer) {
//         this.unidentifiedBodiesLayer.clearLayers();
//     }

//     // Reinitialize the marker cluster group
//     this.geoServerClusterGroup = L.markerClusterGroup();

//     const customIcon = L.icon({
//         iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
//         iconSize: [25, 41],
//         iconAnchor: [12, 41],
//         popupAnchor: [1, -34],
//         shadowUrl: 'assets/leaflet/images/marker-shadow.png',
//         shadowSize: [41, 41]
//     });

//     this.missingPersonLayer = L.layerGroup();
//     this.unidentifiedPersonLayer = L.layerGroup();
//     this.unidentifiedBodiesLayer = L.layerGroup();

//     // Build the CQL filter based on selected state and district
//     let cqlFilter = '';

//     if (this.selectedState && this.selectedState !== 'All States') {
//         cqlFilter = `INTERSECTS(location, querySingle('GeoFlow_WCD:tblstates', 'geom', 'state_name=''${this.selectedState}'''))`;
//     }

//     if (this.selectedDistrict && this.selectedDistrict !== 'All Districts') {
//         if (cqlFilter) {
//             cqlFilter += ' AND ';
//         }
//         cqlFilter += `INTERSECTS(location, querySingle('GeoFlow_WCD:tbldistricts', 'geom', 'district_name=''${this.selectedDistrict}'''))`;
//     }

//     console.log("Selected State:", this.selectedState);
//     console.log("Selected District:", this.selectedDistrict);
//     console.log("Constructed CQL Filter:", cqlFilter);

//     // WFS request with CQL filters
//     const wfsUrl = `http://localhost:8080/geoserver/Chhaya/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=Chhaya:Mainapp_person&outputFormat=application/json${cqlFilter ? `&cql_filter=${encodeURIComponent(cqlFilter)}` : ''}`;
//     console.log("WFS Request URL:", wfsUrl);

//     fetch(wfsUrl)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("Fetched Data:", data);

//             if (!data.features || data.features.length === 0) {
//                 console.warn("No features returned by GeoServer for the applied filter.");
//                 alert("No data available for the selected state and district.");
//                 return;
//             }

//             const markerPromises = data.features.map(async (feature: any) => {
//                 try {
//                     const fullPersonId = feature.id;
//                     const personId = fullPersonId.split('.')[1];
//                     const geometry = feature.geometry;
//                     const personType = feature.properties.person_type;

//                     if (!geometry || geometry.type !== 'Point' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length !== 2) {
//                         console.warn("Invalid or missing 'geometry' data for feature:", feature);
//                         return null;
//                     }

//                     const [lng, lat] = geometry.coordinates;
//                     const latlng: L.LatLngTuple = [lat, lng];

//                     const personResponse = await fetch(`http://127.0.0.1:8000/api/persons/${personId}/`);
//                     if (!personResponse.ok) {
//                         throw new Error(`Failed to fetch person details: ${personResponse.status}`);
//                     }

//                     const personDetails = await personResponse.json();
//                     const marker = L.marker(latlng, { icon: customIcon });
//                     marker.feature = feature;

//                     const popupContent = 
//                         `<img src="${environment.defaultPersonImage}" alt="Person Image" style="max-width: 100px; max-height: 100px; margin: 5px 0;"><br>
//                         <b>Type:</b> ${personDetails.type || 'N/A'}<br>
//                         <b>Name:</b> ${personDetails.full_name || 'N/A'}<br>
//                         <b>Age:</b> ${personDetails.age || 'N/A'}<br>
//                         <b>Gender:</b> ${personDetails.gender || 'N/A'}<br>`;

//                     marker.bindPopup(popupContent);

//                     switch (personType) {
//                         case 'Missing person':
//                             this.missingPersonLayer.addLayer(marker);
//                             break;
//                         case 'Unidentified person':
//                             this.unidentifiedPersonLayer.addLayer(marker);
//                             break;
//                         case 'Unidentified Bodies':
//                             this.unidentifiedBodiesLayer.addLayer(marker);
//                             break;
//                         default:
//                             console.warn("Unknown person type:", personType);
//                             break;
//                     }

//                     return marker;

//                 } catch (error) {
//                     console.error("Error processing feature:", feature, error);
//                     return null;
//                 }
//             });

//             Promise.all(markerPromises).then(markers => {
//                 markers.forEach(marker => {
//                     if (marker) this.geoServerClusterGroup?.addLayer(marker);
//                 });

//                 this.geoServerClusterGroup?.addTo(this.map!);
//             });

//         })
//         .catch(error => console.error("Error fetching GeoJSON:", error));

//     // Add state and district boundary layers to the map
//     this.stateLayerName = L.tileLayer.wms(this.geo_url, {
//         layers: this.stateLayer,
//         format: "image/png",
//         transparent: true,
//         opacity: 0.75
//     });
//     this.map?.addLayer(this.stateLayerName);

//     this.distLayerName = L.tileLayer.wms(this.geo_url, {
//         layers: this.distLayer,
//         format: "image/png",
//         transparent: true,
//         opacity: 0.75
//     });
//     this.map?.addLayer(this.distLayerName);
// }




 

  initOverlays() {
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
                    active: true, // Initially inactive
                    layer: this.stateLayerName,
                },
                {
                    name: "District Layer",
                    active: true, // Initially inactive
                    layer: this.distLayerName,
                }
            ]
        },
        {
            group: "Person Data",
            icon: iconByName('location'),
            collapsed: false,
            layers: [
                {
                    name: "Missing Person",
                    active: false, // Initially inactive
                    layer: this.missingPersonLayer,
                },
                {
                    name: "Unidentified Person",
                    active: false, // Initially inactive
                    layer: this.unidentifiedPersonLayer,
                },
                {
                    name: "Unidentified Bodies",
                    active: false, // Initially inactive
                    layer: this.unidentifiedBodiesLayer,
                }
            ]
        },
        // {
        //     group: "GeoServer Markers",
        //     icon: iconByName('marker'),
        //     collapsed: false,
        //     layers: [
        //         {
        //             name: "GeoServer Markers",
        //             active: true, // Initially active
        //             layer: this.geoServerClusterGroup,
        //         }
        //     ]
        // }
    ];
  }
    

 

  

  isLoading = false;

  onNavigate(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); 
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/internal-dashboard']).catch((error) => {
        console.error('Navigation error:', error);
      });
    }, 1000);
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

    if (state && state !== 'All States') {
        this.filterService.getDistricts(state).subscribe((data) => {
            this.alldistricts = data;
            console.log("on state change", this.alldistricts);
            this.moveMapToState(state);
        });
    }
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
        }, error => {
            console.error('Error fetching cities:', error);
        });
    } else {
        console.warn('No district selected or "All Districts" selected');
    }
}


  onCityChange(city: string): void {
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
    this.selectedVillage = village;
  }

  

}


