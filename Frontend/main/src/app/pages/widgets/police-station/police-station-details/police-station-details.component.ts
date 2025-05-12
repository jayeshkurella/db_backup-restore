import { Component, OnInit ,AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/envirnment/envirnment';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridList, MatGridListModule, MatGridTile } from '@angular/material/grid-list';

@Component({
  selector: 'app-police-station-details',
  imports: [CommonModule,MatCardModule,MatIconModule,MatButtonModule,MatListModule,MatDividerModule,MatChipsModule,MatChipsModule,MatGridListModule],
  templateUrl: './police-station-details.component.html',
  styleUrl: './police-station-details.component.scss'
})
export class PoliceStationDetailsComponent implements OnInit { 
  policestation: any;
  environment =environment
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.policestation = history.state.policestation;
    if (!this.policestation) {
      this.router.navigate(['/widgets/police-station']);
    }
  }

  ngAfterViewInit(): void {
    if (this.policestation?.address_details?.location) {
      const coords = this.extractLatLng(this.policestation.address_details.location);
      if (coords) this.loadMap(coords.lat, coords.lng);
    }
  }

  extractLatLng(wkt: string): { lat: number, lng: number } | null {
    const match = wkt.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);
    if (match) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
    return null;
  }

  loadMap(lat: number, lng: number): void {
    const map = L.map('policeStationMap').setView([lat, lng], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/green_marker.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -35]
    });

    L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(this.policestation.name)
      .openPopup();
  }

  goBack(): void {
    this.router.navigate(['/widgets/police-station']);
  }
  sanitizeUrl(url: string): string {
  const trimmedUrl = url.trim();
  
  // Add https:// protocol if the URL doesn't have one
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return `https://${trimmedUrl}`;
  }
  
  return trimmedUrl;
}


}
