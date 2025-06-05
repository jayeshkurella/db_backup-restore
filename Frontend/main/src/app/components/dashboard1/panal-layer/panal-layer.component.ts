import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import * as L from 'leaflet';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/envirnment/envirnment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panal-layer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './panal-layer.component.html',
  styleUrls: ['./panal-layer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanalLayerComponent implements AfterViewInit {
  private map!: L.Map;

  // Layer names from your setup
  stateLayer = 'GeoFlow_WCD:tblstates';
  distLayer = 'GeoFlow_WCD:tbldistricts';

  // Actual Leaflet WMS layer refs
  private stateLayerRef!: L.TileLayer.WMS;
  private distLayerRef!: L.TileLayer.WMS;

  // Dynamic layer config for toggling
  operationalLayers: any[] = [];

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [21.1466, 79.0889], // India center
      zoom: 5,
    });

    // Base OSM
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Create and store WMS layers
    this.stateLayerRef = L.tileLayer.wms(environment.geo_url, {
      layers: this.stateLayer,
      format: 'image/png',
      transparent: true,
    });

    this.distLayerRef = L.tileLayer.wms(environment.geo_url, {
      layers: this.distLayer,
      format: 'image/png',
      transparent: true,
    });

    // Layer toggle config
    this.operationalLayers = [
      {
        name: 'State Layer',
        active: true,
        layerName: this.stateLayer,
        ref: this.stateLayerRef,
      },
      {
        name: 'District Layer',
        active: true,
        layerName: this.distLayer,
        ref: this.distLayerRef,
      },
    ];

    // Add active layers to map
    this.operationalLayers.forEach((layer) => {
      if (layer.active) {
        layer.ref.addTo(this.map);
      }
    });
  }

  toggleLayer(layer: any): void {
    if (!this.map || !layer.ref) return;
  
    if (layer.active) {
      this.map.addLayer(layer.ref);
    } else {
      this.map.removeLayer(layer.ref);
    }
  }
  
}
