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
  mainAppLayer: L.Layer | undefined;
  geoServerClusterGroup: L.MarkerClusterGroup | undefined;
  permanentAddressLayer: any;
  temporaryAddressLayer: any;
  
 
  
  constructor(
    private router: Router, 
    private http: HttpClient,
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
      console.log('State Coordinates:', this.stateCoordinates);
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
  


  filterDataByFilters(): void {
    if (this.selectedState !== 'All States') {
      this.moveMapToState(this.selectedState);
      // this.getDistrictsByState(this.selectedState);
      // this.loadDistrictsForState(this.selectedState);
    } else {
      this.alldistricts = [];
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
    default:
      console.warn(`Layer '${layer}' not found.`);
      break;
  }
}

  initOperationalLayers() {
    this.geoServerClusterGroup = L.markerClusterGroup();

    // Define custom icon for markers
    const customIcon = L.icon({
        iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'assets/leaflet/images/marker-shadow.png',
        shadowSize: [41, 41]
    });

    // Fetch GeoJSON from GeoServer
    fetch("http://localhost:8080/geoserver/chhaya/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=chhaya:Mainapp_address&outputFormat=application/json")
        .then(response => response.json())
        .then(data => {
            console.log("GeoServer Response:", data);

            // Array to hold all marker promises
            const markerPromises = data.features.map(async (feature: any) => {
                try {
                    const personId = feature.properties.person_id;
                    const geometry = feature.geometry;

                    // Check if geometry data is valid
                    if (!geometry || geometry.type !== 'Point' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length !== 2) {
                        console.warn("Invalid or missing 'geometry' data for feature:", feature);
                        return null;
                    }

                    const [lng, lat] = geometry.coordinates;
                    const latlng: L.LatLngTuple = [lat, lng];

                    // Auto-fetch related person data from the backend
                    const personResponse = await fetch(`http://127.0.0.1:8000/api/persons/${personId}/`);
                    if (!personResponse.ok) {
                        throw new Error(`Failed to fetch person details: ${personResponse.status}`);
                    }
                    const personDetails = await personResponse.json();
                    console.log("Fetched Person Details:", personDetails);

                    // Create marker with popup showing person details
                    const marker = L.marker(latlng, { icon: customIcon });

                    const popupContent = `
                        <b>Person Details</b><br>
                        <b>Name:</b> ${personDetails.name || 'N/A'}<br>
                        <b>Age:</b> ${personDetails.age || 'N/A'}<br>
                        <b>Gender:</b> ${personDetails.gender || 'N/A'}<br>
                        <b>Addresses:</b><br>
                        ${personDetails.addresses?.map((address: any) => `
                            <b>Street:</b> ${address.street || 'N/A'}<br>
                            <b>City:</b> ${address.city || 'N/A'}<br>
                            <b>State:</b> ${address.state || 'N/A'}<br>
                            <b>Pincode:</b> ${address.pincode || 'N/A'}<br>
                            <b>Coordinates:</b> ${address.latitude || 'N/A'}, ${address.longitude || 'N/A'}<br>
                        `).join('<br>') || 'No addresses available'}
                        <b>Contacts:</b><br>
                        ${personDetails.contacts?.map((contact: any) => `
                            <b>Phone:</b> ${contact.phone || 'N/A'}<br>
                            <b>Email:</b> ${contact.email || 'N/A'}<br>
                        `).join('<br>') || 'No contacts available'}
                    `;

                    marker.bindPopup(popupContent);
                    return marker;
                } catch (error) {
                    console.error("Error processing feature:", feature, error);
                    return null;
                }
            });

            // Wait for all markers to be created
            Promise.all(markerPromises).then(markers => {
                markers.forEach(marker => {
                    if (marker) this.geoServerClusterGroup!.addLayer(marker);
                });
            });

        })
        .catch(error => console.error("Error fetching GeoJSON:", error));

    // Add other layers (state, district, etc.)
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
        icon: iconByName('location'),
        collapsed: false,
        layers: [
          {
            name: "Missing Person",
            active: true,
            layer: this.missingPersonLayer,
          },
          {
            name: "Unidentified Person",
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

    // Add the GeoServer Markers layer only if it's defined
    if (this.geoServerClusterGroup) {
      this.overlays.push({
        group: "Operational Layers",
        icon: iconByName('marker'),
        collapsed: false,
        layers: [
          {
            name: "GeoServer Markers",
            active: true,
            layer: this.geoServerClusterGroup,
          }
        ]
      });
    }
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
  



 
  
  

}


