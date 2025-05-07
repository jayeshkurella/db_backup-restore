import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/envirnment/envirnment';  
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider'; 
import { MatGridListModule } from '@angular/material/grid-list';  
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import * as L from 'leaflet';

import { VolunteerServiceService } from '../volunteer-service.service';
@Component({
  selector: 'app-volunteersdata',
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatGridListModule, 
    MatChipsModule, 
    TablerIconsModule, 
    MatButtonModule, 
    CommonModule,
    MatDividerModule
  ],
  templateUrl: './volunteersdata.component.html',
  styleUrl: './volunteersdata.component.scss'
})
export class VolunteersdataComponent implements AfterViewInit {
  volunteerId: string = '';
  volunteerData: any = null;
  environment = environment;
  private map: L.Map | null = null;

  constructor(
    private route: ActivatedRoute, 
    private volunteerService: VolunteerServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.volunteerId = params['id'];
      if (this.volunteerId) {
        this.loadVolunteerProfile(this.volunteerId);
      }
    });
  }

  loadVolunteerProfile(id: string) {
    this.volunteerService.getVolunteerById(id).subscribe({
      next: (data: any) => {
        this.volunteerData = data;
        this.cdr.detectChanges();
        this.initializeMapIfPossible();
      },
      error: (error) => {
        console.error('Error fetching volunteer data:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeMapIfPossible();
  }

  private initializeMapIfPossible(): void {
    if (this.volunteerData?.volunteer_Address?.length) {
      const location = this.volunteerData.volunteer_Address[0].location;
      const coords = this.extractCoordinates(location);
      if (coords.lat !== 0 && coords.lng !== 0) {
        this.initializeMap(coords.lat, coords.lng);
      }
    }
  }

  private extractCoordinates(location: string): { lat: number; lng: number } {
    const regex = /POINT \(([-+]?[0-9]*\.?[0-9]+) ([-+]?[0-9]*\.?[0-9]+)\)/;
    const matches = location.match(regex);
    return matches ? {
      lng: parseFloat(matches[1]),
      lat: parseFloat(matches[2])
    } : { lat: 0, lng: 0 };
  }

  private initializeMap(lat: number, lng: number): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    const defaultIcon = L.icon({
      iconUrl: 'assets/leaflet/images/marker-icon.png',
      iconRetinaUrl: 'assets/leaflet/images/marker-icon-2x.png',
      shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;
    const volunteerName = this.volunteerData?.full_name || 'Volunteer';
    L.marker([lat, lng], { icon: defaultIcon })
      .addTo(this.map)
      .bindPopup(volunteerName)
      .openPopup();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  goBack() {
    this.router.navigate(['/widgets/volunteers']);
  }
}
