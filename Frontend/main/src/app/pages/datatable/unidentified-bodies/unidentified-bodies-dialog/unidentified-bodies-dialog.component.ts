import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { environment } from 'src/envirnment/envirnment';
import * as L from 'leaflet';


@Component({
  selector: 'app-unidentified-bodies-dialog',
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './unidentified-bodies-dialog.component.html',
  styleUrl: './unidentified-bodies-dialog.component.scss'
})
export class UnidentifiedBodiesDialogComponent {
environment =environment
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
   map: any;
    marker: any;
    ngAfterViewInit(): void {
      setTimeout(() => this.initMap(), 400);
    }
  
    initMap(): void {
      const location = this.parseWKT(this.data.location);
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
  
}
