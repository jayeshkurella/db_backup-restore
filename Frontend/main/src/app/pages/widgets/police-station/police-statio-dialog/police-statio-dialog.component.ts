import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import * as L from 'leaflet';
import { environment } from 'src/envirnment/envirnment';
@Component({
  selector: 'app-police-statio-dialog',
  imports: [ MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule],
  templateUrl: './police-statio-dialog.component.html',
  styleUrl: './police-statio-dialog.component.scss'
})
export class PoliceStatioDialogComponent implements AfterViewInit {

  environment = environment
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PoliceStatioDialogComponent>
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      const location = this.data.address_details?.location;
      const coords = this.extractLatLngFromWKT(location);
  
      if (coords) {
        const map = L.map('stationMap', {
          zoomControl: true,
          attributionControl: false
        }).setView([coords.lat, coords.lng], 13);
  
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
  
        const customIcon = L.icon({
          iconUrl: 'assets/leaflet/images/marker-icon-2x.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
  
        L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map)
          .bindPopup(`${this.data.name}`)
          .openPopup();
      }
    }, 200); // 100–200ms is typically enough
  }
  
  

  extractLatLngFromWKT(wkt: string): { lat: number, lng: number } | null {
    if (!wkt) return null;
    const match = wkt.match(/POINT\s*\(([^ ]+)\s+([^ ]+)\)/);
    if (match && match.length === 3) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) }; // Note lng first in WKT
    }
    return null;
  }
}
