import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Ruta, Bus, Conductor, Sede, sedes, buses, conductores, estudiantes as allEstudiantes } from '@/services/mockData';
import { MAPBOX_CONFIG } from '@/config/mapbox';
import { AlertCircle, Bus as BusIcon, Users, Clock, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { GPSSimulator, GPSSimulationState } from '@/services/gpsSimulationService';

interface RutasMapViewProps {
  rutas: Ruta[];
}

interface RoutePoint {
  lat: number;
  lng: number;
}

// Mock real-time positions for active routes (starting positions)
const mockRealTimePositions: Record<string, { 
  lat: number; 
  lng: number; 
  heading: number; 
  speed: number; 
  lastUpdate: string;
  progress: number; // 0-100% del recorrido
}> = {
  'ruta-1': { lat: 4.7110, lng: -74.0721, heading: 45, speed: 35, lastUpdate: '2 min ago', progress: 25 },
  'ruta-2': { lat: 4.6520, lng: -74.0640, heading: 120, speed: 28, lastUpdate: '1 min ago', progress: 60 },
};

const RutasMapView = ({ rutas }: RutasMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const busMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const busElementRef = useRef<HTMLDivElement | null>(null);
  const gpsSimulatorRef = useRef<GPSSimulator | null>(null);
  const routeCoordinatesRef = useRef<[number, number][]>([]);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');
  const [selectedRuta, setSelectedRuta] = useState<Ruta | null>(null);
  const [gpsState, setGpsState] = useState<GPSSimulationState | null>(null);

  const rutasActivas = rutas.filter(r => r.estado === 'activa');

  const getBusInfo = (busId: string): Bus | undefined => buses.find(b => b.id === busId);
  const getConductor = (conductorId: string): Conductor | undefined => conductores.find(c => c.id === conductorId);
  const getSede = (sedeId: string): Sede | undefined => sedes.find(s => s.id === sedeId);

  // Calculate heading between two points
  const calculateHeading = (from: [number, number], to: [number, number]): number => {
    const dLng = to[0] - from[0];
    const dLat = to[1] - from[1];
    const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
    return (angle + 360) % 360;
  };

  // Callback para manejar actualizaciones de posición del GPS
  const handleGPSUpdate = useCallback((state: GPSSimulationState) => {
    setGpsState(state);
    
    // Actualizar posición del marcador del bus en Mapbox
    if (busMarkerRef.current) {
      busMarkerRef.current.setLngLat([state.currentPosition.lng, state.currentPosition.lat]);
    }

    // Actualizar rotación del modelo 3D del bus
    if (busElementRef.current) {
      const busIcon = busElementRef.current.querySelector('.bus-3d-model') as HTMLElement;
      if (busIcon) {
        busIcon.style.transform = `rotateY(${state.heading - 90}deg)`;
      }
    }
  }, []);

  // Iniciar simulación GPS con velocidad de 50 km/h
  const startGPSSimulation = useCallback((coordinates: [number, number][], startProgress: number = 0) => {
    // Limpiar simulador anterior
    if (gpsSimulatorRef.current) {
      gpsSimulatorRef.current.destroy();
    }

    // Crear nuevo simulador GPS a 50 km/h
    const simulator = new GPSSimulator({
      speedKmh: 50, // Velocidad del bus: 50 km/h
      updateIntervalMs: 100, // Actualización cada 100ms (10 FPS)
      routeCoordinates: coordinates,
      onPositionUpdate: handleGPSUpdate,
      onRouteComplete: () => {
        console.log('GPS Simulation: Ruta completada, reiniciando loop...');
      }
    });

    gpsSimulatorRef.current = simulator;
    simulator.start();
  }, [handleGPSUpdate]);

  // Fetch and display route for selected ruta
  const fetchAndDisplayRoute = async (ruta: Ruta) => {
    if (!map.current || !mapLoaded) return;

    const sede = getSede(ruta.sedeId);
    if (!sede) return;

    const estudiantesRuta = allEstudiantes.filter(e => ruta.estudiantes.includes(e.id));
    
    const coordinates: [number, number][] = [
      [sede.lng, sede.lat],
      ...estudiantesRuta.map(e => [e.lng, e.lat] as [number, number]),
      [sede.lng, sede.lat]
    ];

    const coordString = coordinates.map(c => c.join(',')).join(';');

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}?geometries=geojson&overview=full&access_token=${MAPBOX_CONFIG.accessToken}`
      );
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const routeGeometry = data.routes[0].geometry;
        routeCoordinatesRef.current = routeGeometry.coordinates;
        
        const position = mockRealTimePositions[ruta.id];
        const progressIndex = position 
          ? Math.floor((position.progress / 100) * routeGeometry.coordinates.length)
          : 0;

        // Remove existing route layers
        ['route-complete', 'route-remaining', 'route-glow', 'route-complete-glow'].forEach(layer => {
          if (map.current?.getLayer(layer)) map.current.removeLayer(layer);
        });
        ['route-source', 'route-remaining-source'].forEach(source => {
          if (map.current?.getSource(source)) map.current.removeSource(source);
        });

        // Completed route (darker)
        const completedCoords = routeGeometry.coordinates.slice(0, progressIndex + 1);
        const remainingCoords = routeGeometry.coordinates.slice(progressIndex);

        if (completedCoords.length > 1) {
          map.current.addSource('route-source', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: completedCoords },
            },
          });

          map.current.addLayer({
            id: 'route-complete-glow',
            type: 'line',
            source: 'route-source',
            paint: {
              'line-color': '#22c55e',
              'line-width': 12,
              'line-opacity': 0.3,
              'line-blur': 6,
            },
          });

          map.current.addLayer({
            id: 'route-complete',
            type: 'line',
            source: 'route-source',
            paint: {
              'line-color': '#22c55e',
              'line-width': 5,
              'line-opacity': 1,
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
          });
        }

        // Remaining route (primary color)
        if (remainingCoords.length > 1) {
          map.current.addSource('route-remaining-source', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: remainingCoords },
            },
          });

          map.current.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route-remaining-source',
            paint: {
              'line-color': '#FC4554',
              'line-width': 12,
              'line-opacity': 0.2,
              'line-blur': 6,
            },
          });

          map.current.addLayer({
            id: 'route-remaining',
            type: 'line',
            source: 'route-remaining-source',
            paint: {
              'line-color': '#FC4554',
              'line-width': 4,
              'line-opacity': 1,
              'line-dasharray': [2, 2],
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
          });
        }

        // Add student markers
        estudiantesRuta.forEach((est, idx) => {
          const el = document.createElement('div');
          el.className = 'route-student-marker';
          el.innerHTML = `<div class="marker-number">${idx + 1}</div>`;
          
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([est.lng, est.lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <strong>${est.nombre}</strong><br/>
              <small>${est.direccion}</small>
            `))
            .addTo(map.current!);
          markersRef.current.push(marker);
        });

        // Iniciar simulación GPS a 50 km/h
        routeCoordinatesRef.current = routeGeometry.coordinates;
        startGPSSimulation(routeGeometry.coordinates, progressIndex);

        // Fit bounds
        const bounds = new mapboxgl.LngLatBounds();
        routeGeometry.coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
      }
    } catch (err) {
      console.error('Error fetching route:', err);
    }
  };

  const clearRoute = () => {
    // Detener simulador GPS
    if (gpsSimulatorRef.current) {
      gpsSimulatorRef.current.destroy();
      gpsSimulatorRef.current = null;
    }
    
    ['route-complete', 'route-remaining', 'route-glow', 'route-complete-glow'].forEach(layer => {
      if (map.current?.getLayer(layer)) map.current.removeLayer(layer);
    });
    ['route-source', 'route-remaining-source'].forEach(source => {
      if (map.current?.getSource(source)) map.current.removeSource(source);
    });

    // Remove student markers (keep sede markers)
    markersRef.current.forEach(marker => {
      const el = marker.getElement();
      if (el.classList.contains('route-student-marker')) {
        marker.remove();
      }
    });
    markersRef.current = markersRef.current.filter(m => !m.getElement().classList.contains('route-student-marker'));
    
    // Remove bus marker
    if (busMarkerRef.current) {
      busMarkerRef.current.remove();
      busMarkerRef.current = null;
      busElementRef.current = null;
    }
    
    setGpsState(null);
    routeCoordinatesRef.current = [];
  };

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.defaultStyle,
        center: MAPBOX_CONFIG.defaultCenter,
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        setError('');
        updateMarkers();
      });

      map.current.on('error', () => {
        setError('Error al cargar el mapa');
        setMapLoaded(false);
      });
    } catch (err) {
      setError('Error al inicializar el mapa');
    }
  };

  const updateMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (!map.current || !mapLoaded) return;

    // Add sede markers
    sedes.forEach(sede => {
      const el = document.createElement('div');
      el.className = 'sede-marker-small';
      el.innerHTML = `
        <div class="sede-marker-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/></svg>
        </div>
      `;
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([sede.lng, sede.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <strong>🏫 ${sede.nombre}</strong><br/>
            <small>${sede.direccion}</small>
          </div>
        `))
        .addTo(map.current!);
      markersRef.current.push(marker);
    });

    // Add active route bus markers with real-time positions
    rutasActivas.forEach(ruta => {
      const position = mockRealTimePositions[ruta.id];
      const bus = getBusInfo(ruta.busId);
      
      if (position && (!selectedRuta || selectedRuta.id !== ruta.id)) {
        const el = document.createElement('div');
        el.className = 'bus-marker-realtime';
        el.innerHTML = `
          <div class="bus-pulse-ring"></div>
          <div class="bus-marker-icon" style="transform: rotate(${position.heading}deg)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
          </div>
          <div class="bus-label">${bus?.placa || 'N/A'}</div>
        `;
        
        el.addEventListener('click', () => handleRutaSelect(ruta));
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([position.lng, position.lat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      sedes.forEach(s => bounds.extend([s.lng, s.lat]));
      Object.values(mockRealTimePositions).forEach(p => bounds.extend([p.lng, p.lat]));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 14 });
    }
  };

  const handleRutaSelect = (ruta: Ruta | null) => {
    if (selectedRuta?.id === ruta?.id) {
      setSelectedRuta(null);
      clearRoute();
      updateMarkers();
    } else {
      setSelectedRuta(ruta);
      clearRoute();
      if (ruta) {
        fetchAndDisplayRoute(ruta);
      }
    }
  };

  // Create 3D bus marker once when route is selected
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedRuta) {
      // Clean up bus marker when route is deselected
      if (busMarkerRef.current) {
        busMarkerRef.current.remove();
        busMarkerRef.current = null;
        busElementRef.current = null;
      }
      return;
    }

    // Don't recreate if already exists
    if (busMarkerRef.current) return;

    const position = mockRealTimePositions[selectedRuta.id];
    if (!position) return;

    const el = document.createElement('div');
    el.className = 'bus-3d-container';
    el.innerHTML = `
      <div class="bus-3d-shadow"></div>
      <div class="bus-3d-model" style="transform: rotateY(${position.heading - 90}deg)">
        <div class="bus-body">
          <div class="bus-front"></div>
          <div class="bus-windows"></div>
          <div class="bus-stripe"></div>
        </div>
        <div class="bus-wheels">
          <div class="wheel wheel-front"></div>
          <div class="wheel wheel-back"></div>
        </div>
      </div>
    `;
    
    busElementRef.current = el;
    
    const marker = new mapboxgl.Marker({ 
      element: el,
      anchor: 'center' // Center the marker on the route coordinates
    })
      .setLngLat([position.lng, position.lat])
      .addTo(map.current);
    
    busMarkerRef.current = marker;
    
    return () => {
      if (busMarkerRef.current) {
        busMarkerRef.current.remove();
        busMarkerRef.current = null;
        busElementRef.current = null;
      }
    };
  }, [selectedRuta, mapLoaded]);

  useEffect(() => {
    if (!map.current) {
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      updateMarkers();
    }
  }, [rutas, mapLoaded]);

  useEffect(() => {
    return () => {
      // Limpiar simulador GPS al desmontar
      if (gpsSimulatorRef.current) {
        gpsSimulatorRef.current.destroy();
      }
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const selectedBus = selectedRuta ? getBusInfo(selectedRuta.busId) : null;
  const selectedConductor = selectedRuta ? getConductor(selectedRuta.conductorId) : null;
  const selectedPosition = selectedRuta ? mockRealTimePositions[selectedRuta.id] : null;

  return (
    <div className="relative">
      <style>{`
        .sede-marker-small {
          cursor: pointer;
        }
        .sede-marker-icon {
          background: linear-gradient(135deg, #FC4554 0%, #d93545 100%);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .bus-marker-realtime {
          position: relative;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .bus-marker-realtime:hover {
          transform: scale(1.1);
        }
        .bus-pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(97, 12, 244, 0.2);
          animation: bus-pulse 2s ease-out infinite;
        }
        @keyframes bus-pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        .bus-marker-icon {
          position: relative;
          z-index: 10;
          background: linear-gradient(135deg, #610CF4 0%, #4a09b8 100%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 3px 12px rgba(97, 12, 244, 0.4);
        }
        .bus-label {
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          background: #610CF4;
          color: white;
          font-size: 9px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .route-student-marker {
          cursor: pointer;
        }
        .route-student-marker .marker-number {
          background: linear-gradient(135deg, #610CF4 0%, #4a09b8 100%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        /* 3D School Bus Styles */
        .bus-3d-container {
          position: relative;
          width: 60px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bus-3d-shadow {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 10px;
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
          filter: blur(4px);
        }
        .bus-3d-model {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }
        .bus-body {
          width: 50px;
          height: 28px;
          background: linear-gradient(180deg, #FFD500 0%, #FFC107 50%, #FFB300 100%);
          border-radius: 6px 6px 4px 4px;
          position: relative;
          box-shadow: 
            inset 0 -4px 0 rgba(0,0,0,0.1),
            0 4px 8px rgba(0,0,0,0.3);
          border: 2px solid #E6A800;
        }
        .bus-front {
          position: absolute;
          left: -4px;
          top: 4px;
          width: 6px;
          height: 20px;
          background: linear-gradient(90deg, #333 0%, #444 100%);
          border-radius: 3px 0 0 3px;
        }
        .bus-front::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 1px;
          width: 3px;
          height: 4px;
          background: #fff;
          border-radius: 1px;
        }
        .bus-front::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 1px;
          width: 3px;
          height: 4px;
          background: #fff;
          border-radius: 1px;
        }
        .bus-windows {
          position: absolute;
          top: 4px;
          left: 6px;
          right: 4px;
          height: 12px;
          background: linear-gradient(180deg, #87CEEB 0%, #6BB3D9 100%);
          border-radius: 2px;
          display: flex;
          gap: 2px;
          padding: 1px;
        }
        .bus-windows::before {
          content: '';
          flex: 1;
          background: rgba(255,255,255,0.3);
          border-radius: 1px;
        }
        .bus-windows::after {
          content: '';
          flex: 1;
          background: rgba(255,255,255,0.3);
          border-radius: 1px;
        }
        .bus-stripe {
          position: absolute;
          bottom: 6px;
          left: 6px;
          right: 4px;
          height: 3px;
          background: #333;
          border-radius: 1px;
        }
        .bus-wheels {
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 6px;
        }
        .wheel {
          width: 10px;
          height: 10px;
          background: radial-gradient(circle at 30% 30%, #555 0%, #222 100%);
          border-radius: 50%;
          border: 2px solid #111;
          animation: wheel-spin 0.5s linear infinite;
        }
        @keyframes wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {error && (
        <div className="flex items-center gap-2 text-destructive mb-3 text-sm p-4">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Map */}
        <div className="flex-1">
          <div 
            ref={mapContainer} 
            className="w-full rounded-xl overflow-hidden border border-border"
            style={{ height: '500px', background: '#e5e7eb' }}
          />
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary"></div>
              <span>Sedes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-accent animate-pulse"></div>
              <span>Bus en ruta</span>
            </div>
            {selectedRuta && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-success rounded"></div>
                  <span>Recorrido completado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-primary rounded" style={{ background: 'repeating-linear-gradient(90deg, #FC4554, #FC4554 4px, transparent 4px, transparent 8px)' }}></div>
                  <span>Recorrido restante</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active Routes Panel */}
        <div className="w-full lg:w-80 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
            <BusIcon className="w-4 h-4 text-accent" />
            Rutas en Progreso ({rutasActivas.length})
          </h3>
          
          <div className="space-y-2 max-h-[400px] lg:max-h-[450px] overflow-y-auto pr-1">
            {rutasActivas.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No hay rutas activas en este momento
              </p>
            ) : (
              rutasActivas.map(ruta => {
                const bus = getBusInfo(ruta.busId);
                const conductor = getConductor(ruta.conductorId);
                const position = mockRealTimePositions[ruta.id];
                const isSelected = selectedRuta?.id === ruta.id;
                
                return (
                  <Card 
                    key={ruta.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-accent bg-accent/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleRutaSelect(isSelected ? null : ruta)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{ruta.nombre}</h4>
                            <Badge variant="default" className="text-[10px] h-5 bg-success">
                              En ruta
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {conductor?.nombre || 'Sin conductor'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-accent">
                            {bus?.placa}
                          </span>
                        </div>
                      </div>
                      
                      {position && (
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{position.lastUpdate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            <span>{position.speed} km/h</span>
                          </div>
                          <div className="flex items-center gap-1 ml-auto">
                            <span className="text-success font-medium">{position.progress}%</span>
                          </div>
                        </div>
                      )}

                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-accent font-medium flex items-center gap-1">
                            <BusIcon className="w-3 h-3" />
                            Ver recorrido en el mapa
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Selected Route Details - Muestra datos del GPS Simulator cuando está activo */}
          {selectedRuta && (selectedPosition || gpsState) && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-3">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  Detalles: {selectedRuta.nombre}
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bus:</span>
                    <span className="font-medium">{selectedBus?.placa} ({selectedBus?.marca})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conductor:</span>
                    <span className="font-medium">{selectedConductor?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Velocidad:</span>
                    <span className="font-medium">{gpsState?.speed ?? selectedPosition?.speed ?? 0} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progreso:</span>
                    <span className="font-medium text-success">
                      {(gpsState?.progress ?? selectedPosition?.progress ?? 0).toFixed(1)}% completado
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distancia:</span>
                    <span className="font-medium">
                      {gpsState ? `${(gpsState.distanceTraveled / 1000).toFixed(2)} / ${(gpsState.totalDistance / 1000).toFixed(2)} km` : 'Calculando...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estudiantes:</span>
                    <span className="font-medium">{selectedRuta.estudiantes.length} asignados</span>
                  </div>
                  {gpsState && (
                    <div className="flex justify-between text-accent">
                      <span>Heading:</span>
                      <span className="font-medium">{gpsState.heading.toFixed(0)}°</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RutasMapView;
