import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridList, MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import * as L from 'leaflet';
import { environment } from 'src/envirnment/envirnment';
@Component({
  selector: 'app-hospital-detail-component',
  imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule, MatFormFieldModule,
       MatInputModule,
       MatButtonModule,
       MatIconModule,
       FormsModule,
       CommonModule,MatOptionModule,RouterModule,MatDividerModule,MatChipsModule ],
  templateUrl: './HospitalDetailComponent.component.html',
  styleUrl: './HospitalDetailComponent.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HospitalDetailComponentComponent implements OnInit { 
  hospital: any;
  environment =environment
  constructor(private route: ActivatedRoute, private router: Router) {}
  ngOnInit(): void {
    this.hospital = history.state.hospital;

    // If someone lands directly without selection
    if (!this.hospital) {
      this.router.navigate(['/widgets/hospitals']);
    }
  }

  ngAfterViewInit(): void {
    if (this.hospital?.address_details?.location) {
      const coords = this.extractLatLng(this.hospital.address_details.location);
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
    const map = L.map('hospitalMap').setView([lat, lng], 15);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  
    // ✅ Define custom icon
    const customIcon = L.icon({
      iconUrl: 'assets/leaflet/images/green_marker.png', 
      iconSize: [40, 40],      
      iconAnchor: [20, 40],    
      popupAnchor: [0, -35]   
    });
  
    // ✅ Add marker with custom icon
    L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .openPopup();
  }

  goBack(): void {
    this.router.navigate(['/widgets/hospitals']);
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
