import * as L from 'leaflet';

declare module 'leaflet' {
  namespace control {
    function panelLayers(
      baseLayers: any,
      overlays: any,
      options?: any
    ): Control;
  }
}
