 
#   // Method to filter data based on the selected police station
#   // filterDataByPoliceStation(): void {
#   //   this.missingPersonLayer.clearLayers();
#   //   this.unidentifiedPersonLayer.clearLayers();
#   //   this.unidentifiedBodiesLayer.clearLayers();
  
#   //   const policeStationId = this.selectedPoliceStation === 'all' ? null : this.selectedPoliceStation;
  
#   //   this.getFilteredMissingPersonsData(policeStationId);
#   //   this.getFilteredUnidentifiedPersonsData(policeStationId);
#   //   this.getFilteredUnidentifiedBodiesData(policeStationId);
#   // }
  
  
#  // Fetch and display filtered Missing Persons data
#   //  private getFilteredMissingPersonsData(policeStationId: string | null): void {
#   //   this.missingperonapi.getMissingPersons(1).subscribe(response => {
#   //       const persons = response.data;

#   //       persons.forEach((person: { 
#   //           full_name: string; 
#   //           police_station_name_and_address: { id: number; name: string }; 
#   //           missing_location_geometry: { coordinates: number[] } | null; 
#   //           location_geometry: { coordinates: number[] } | null; 
#   //           gender: string; 
#   //           age: number; 
#   //           location_metadata: string; 
#   //           photo_upload: string; 
#   //       }) => {
#   //           if (!person.police_station_name_and_address) {
#   //               return;
#   //           }

#   //           if (policeStationId && person.police_station_name_and_address.id.toString() !== policeStationId) {
#   //               return;
#   //           }

#   //           const coordinates = person.missing_location_geometry?.coordinates || person.location_geometry?.coordinates;
#   //           if (!coordinates || coordinates.length !== 2) {
#   //               return;
#   //           }

#   //           const lat = coordinates[1];
#   //           const lng = coordinates[0];

#   //           const popupContent = `
#   //               <strong>Person Type: Missing</strong><br>
#   //               <strong>${person.full_name || 'Unknown'}</strong><br>
#   //               Gender: ${person.gender || 'Not specified'}<br>
#   //               Age: ${person.age || 'Not specified'}<br>
#   //               Location: ${person.location_metadata || 'Not specified'}<br>
#   //               <img src="${environment.apiUrl + (person.photo_upload || 'default-photo.jpg')}" alt="Photo" style="width: 250px; height: 150px;">
#   //           `;

#   //           const customIcon = L.icon({
#   //               iconUrl: 'assets/leaflet/images/red_marker.png',
#   //               iconSize: [35, 41],
#   //               iconAnchor: [12, 41],
#   //               popupAnchor: [1, -34],
#   //               shadowUrl: 'assets/leaflet/images/marker-shadow.png',
#   //               shadowSize: [41, 41],
#   //               shadowAnchor: [12, 41]
#   //           });

#   //           const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
#   //           this.missingPersonLayer.addLayer(marker);
#   //       });
#   //   });
#   // }




# // Fetch and display filtered Unidentified Persons data
#   // private getFilteredUnidentifiedPersonsData(policeStationId: string | null): void {
#   //   this.unidentifiedpersonapi.getUnidentifiedPersons(1).subscribe(response => {
#   //       const persons = response.data;

#   //       persons.forEach((person: {
#   //           photo_upload: string;
#   //           police_station_name_and_address: { id: number; name: string }; 
#   //           geometry: { coordinates: number[] } | null; 
#   //           location_metadata: any;
#   //           gender: string; 
#   //           estimated_age: number;
#   //       }) => {
#   //           if (!person.police_station_name_and_address) {
#   //               return; 
#   //           }

#   //           if (policeStationId && person.police_station_name_and_address.id.toString() !== policeStationId) {
#   //             return;
#   //         }

#   //           const coordinates = person.geometry?.coordinates;
#   //           if (!coordinates || coordinates.length !== 2) {
#   //               return;
#   //           }

#   //           const lat = coordinates[1];
#   //           const lng = coordinates[0];

#   //           const popupContent = `
#   //               <strong>Person Type: Unidentified Person</strong><br> 
#   //               Age: ${person.estimated_age }<br>
#   //               Gender: ${person.gender }<br>
#   //               Location: ${person.location_metadata || 'Not specified'}<br>
#   //               <img src="${environment.apiUrl + (person.photo_upload || 'default-photo.jpg')}" alt="Photo" style="width: 250px; height: 150px;">
#   //           `;

#   //           const customIcon = L.icon({
#   //               iconUrl: 'assets/leaflet/images/green_marker.png',
#   //               iconSize: [35, 35], 
#   //               iconAnchor: [12, 41], 
#   //               popupAnchor: [1, -34], 
#   //               shadowUrl: 'assets/leaflet/images/marker-shadow.png', 
#   //               shadowSize: [41, 41],
#   //               shadowAnchor: [12, 41] 
#   //           });

#   //           const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
#   //           this.unidentifiedPersonLayer.addLayer(marker);
#   //       });
#   //   });
#   // }
  
  
  
#   // Fetch and display filtered Unidentified Bodies data
#   // private getFilteredUnidentifiedBodiesData(policeStationId: string | null): void {
#   //   this.unidentifiedbodieapi.getUnidentifiedBodies(1).subscribe(response => {
#   //       const bodies = response.data;

#   //       bodies.forEach((body: { 
#   //           geometry: { coordinates: number[] } | null;
#   //           police_station_name_and_address: { id: number; name: string };  
#   //           body_seen_details: string; 
#   //           body_photo_upload: string;
            
#   //       }) => {
#   //         if (!body.police_station_name_and_address) {
#   //           return; 
#   //       }

#   //       if (policeStationId && body.police_station_name_and_address.id.toString() !== policeStationId) {
#   //         return;
#   //     }

#   //     const coordinates = body.geometry?.coordinates;
#   //     if (!coordinates || coordinates.length !== 2) {
#   //         return;
#   //     }

#   //           const lat = coordinates[1];
#   //           const lng = coordinates[0];

#   //           const popupContent = `
#   //               <strong>Person Type: Unidentified Body</strong><br> 
#   //               Location: ${body.body_seen_details || 'Not specified'}<br>
#   //               <img src="${environment.apiUrl + (body.body_photo_upload || '/assets/images/noPhoto.png')}" alt="Photo" style="width: 250px; height: 150px;">
#   //           `;

#   //           const customIcon = L.icon({
#   //               iconUrl: 'assets/leaflet/images/black_marker.png',
#   //               iconSize: [35, 41], 
#   //               iconAnchor: [12, 41], 
#   //               popupAnchor: [1, -34], 
#   //               shadowUrl: 'assets/leaflet/images/marker-shadow.png', 
#   //               shadowSize: [41, 41],
#   //               shadowAnchor: [12, 41] 
#   //           });

#   //           const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
#   //           this.unidentifiedBodiesLayer.addLayer(marker);
#   //       });
#   //   });
#   // }




#   // Add a legend to the map to show the color coding
#     // private addCountsLegend(): void {
#     //   // Create a div for the legend
#     //   const countsLegendDiv = L.DomUtil.create('div', 'info counts-legend');
    
#     //   // Enhanced content for the legend
#     //   countsLegendDiv.innerHTML = `
#     //     <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #333;">
#     //       Counts
#     //     </div>
#     //     <div style="display: flex; flex-direction: column; gap: 6px;">
#     //       <div style="display: flex; justify-content: space-between; align-items: center;">
#     //         <span style="color: #555;">Missing Persons:</span>
#     //         <span id="missing-count" style="font-weight: bold; color: #e63946;">0</span>
#     //       </div>
#     //       <div style="display: flex; justify-content: space-between; align-items: center;">
#     //         <span style="color: #555;">Unidentified Persons:</span>
#     //         <span id="unidentified-count" style="font-weight: bold; color: #1d3557;">0</span>
#     //       </div>
#     //       <div style="display: flex; justify-content: space-between; align-items: center;">
#     //         <span style="color: #555;">Unidentified Bodies:</span>
#     //         <span id="bodies-count" style="font-weight: bold; color: #2a9d8f;">0</span>
#     //       </div>
#     //     </div>
#     //   `;
    
#     //   // Improved styling for the legend container
#     //   countsLegendDiv.style.position = 'absolute';
#     //   countsLegendDiv.style.bottom = '20px';
#     //   countsLegendDiv.style.right = '20px';
#     //   countsLegendDiv.style.backgroundColor = '#f8f9fa';
#     //   countsLegendDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
#     //   countsLegendDiv.style.border = '1px solid #ddd';
#     //   countsLegendDiv.style.padding = '15px';
#     //   countsLegendDiv.style.borderRadius = '10px';
#     //   countsLegendDiv.style.zIndex = '1000';
#     //   countsLegendDiv.style.fontSize = '14px';
#     //   countsLegendDiv.style.lineHeight = '1.5';
    
#     //   // Append the legend to the map container
#     //   this.map?.getContainer().appendChild(countsLegendDiv);
#     // }
    

#     // private updateCounts(): void {
#     //   const missingCount = this.missingPersonLayer.getLayers().length;
#     //   const unidentifiedCount = this.unidentifiedPersonLayer.getLayers().length;
#     //   const bodiesCount = this.unidentifiedBodiesLayer.getLayers().length;
    
#     //   // Update the counts in the legend
#     //   (document.getElementById('missing-count') as HTMLElement).textContent = missingCount.toString();
#     //   (document.getElementById('unidentified-count') as HTMLElement).textContent = unidentifiedCount.toString();
#     //   (document.getElementById('bodies-count') as HTMLElement).textContent = bodiesCount.toString();
#     // }





#  // private updateLegend(): void {
#   //   const missingCount = this.missingPersonLayer.getLayers().length;
#   //   const unidentifiedPersonCount = this.unidentifiedPersonLayer.getLayers().length;
#   //   const unidentifiedBodiesCount = this.unidentifiedBodiesLayer.getLayers().length;
  
#   //   // Find the legend div
#   //   const legendDiv = document.querySelector('.info.legend');
#   //   if (legendDiv) {
#   //     legendDiv.innerHTML = `
#   //       <strong>Legend:</strong><br>
#   //       <i style="background: #FF0000"></i> Missing Persons: ${missingCount}<br>
#   //       <i style="background: #FFFF00"></i> Unidentified Persons: ${unidentifiedPersonCount}<br>
#   //       <i style="background: #000000"></i> Unidentified Bodies: ${unidentifiedBodiesCount}
#   //     `;
#   //   }
#   // }
  





#   // Initialize layers for Missing Person, Unidentified Person, and Unidentified Bodies
  