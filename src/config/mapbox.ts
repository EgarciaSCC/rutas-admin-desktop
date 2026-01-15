// Mapbox Configuration
export const MAPBOX_CONFIG = {
  accessToken: (import.meta.env.VITE_MAPBOX_TOKEN as string) || 'pk.eyJ1IjoiZXNuZWlkZXJnZyIsImEiOiJjbWo5N3F1MmwwOGR0M2ZvOHRnOTU3djg4In0.X6ESalQHbXIrN4pdrADtqQ',
  defaultStyle: 'mapbox://styles/mapbox/streets-v12',
  defaultCenter: [-74.0721, 4.7110] as [number, number], // Bogotá, Colombia
  defaultZoom: 11,
};
