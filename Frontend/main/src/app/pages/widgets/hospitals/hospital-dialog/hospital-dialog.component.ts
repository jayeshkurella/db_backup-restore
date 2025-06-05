import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import * as L from 'leaflet';
import { environment } from 'src/envirnment/envirnment';

@Component({
  selector: 'app-hospital-dialog',
 imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,
     MatInputModule,
     MatButtonModule,
     MatIconModule,
     FormsModule,
     CommonModule,MatOptionModule,RouterModule,MatDividerModule ,MatDialogModule ],
  templateUrl: './hospital-dialog.component.html',
  styleUrl: './hospital-dialog.component.scss'
})
export class HospitalDialogComponent implements AfterViewInit{
  environment = environment;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  public  dialogRef :MatDialogRef<HospitalDialogComponent>) {}
  ngAfterViewInit(): void {
    setTimeout(() => {
      const location = this.data.address_details?.location;
      const coords = this.extractLatLngFromWKT(location);
  
      if (coords) {
        const map = L.map('hospitalMap', {
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
  
      
    }, 200); // Delay ensures DOM and map container are rendered
  }
  
  

  extractLatLngFromWKT(wkt: string): { lat: number; lng: number } | null {
    if (!wkt) return null;
    const match = wkt.match(/POINT\s*\(([^ ]+)\s+([^ ]+)\)/);
    if (match && match.length === 3) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
    return null;
  }
}
