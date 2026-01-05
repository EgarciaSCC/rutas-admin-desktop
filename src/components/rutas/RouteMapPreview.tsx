import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Estudiante, Sede } from '@/services/mockData';
import { MapPin, AlertCircle } from 'lucide-react';
import { MAPBOX_CONFIG } from '@/config/mapbox';

interface RouteMapPreviewProps {
  estudiantes: Estudiante[];
  asignados: string[];
  sede: Sede | undefined;
  height?: number;
}

const RouteMapPreview = ({ estudiantes, asignados, sede, height = 300 }: RouteMapPreviewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animationRef = useRef<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');

  const estudiantesAsignados = estudiantes.filter(e => asignados.includes(e.id));

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.defaultStyle,
        center: sede ? [sede.lng, sede.lat] : MAPBOX_CONFIG.defaultCenter,
        zoom: MAPBOX_CONFIG.defaultZoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        setError('');
        updateMarkers();
        if (estudiantesAsignados.length > 0) {
          fetchRoute();
        }
      });

      map.current.on('error', () => {
        setError('Error al cargar el mapa. Verifica la configuración.');
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

    // Add sede marker with pulsing animation
    if (sede) {
      const sedeEl = document.createElement('div');
      sedeEl.className = 'sede-marker-container';
      sedeEl.innerHTML = `
        <div class="sede-pulse-ring"></div>
        <div class="sede-pulse-ring sede-pulse-ring-2"></div>
        <div class="sede-pulse-ring sede-pulse-ring-3"></div>
        <div class="sede-marker">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6 3v6.64l-6 3-6-3V7.18l6-3z"/></svg>
        </div>
        <div class="sede-label">INICIO</div>
      `;
      
      const sedeMarker = new mapboxgl.Marker({ element: sedeEl })
        .setLngLat([sede.lng, sede.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>🚏 Punto de Inicio</strong><br/>${sede.nombre}<br/><small>${sede.direccion}</small>`))
        .addTo(map.current);
      markersRef.current.push(sedeMarker);
    }

    // Add student markers with numbers
    estudiantesAsignados.forEach((estudiante, index) => {
      const el = document.createElement('div');
      el.className = 'student-marker';
      el.innerHTML = `<div class="student-marker-inner">${index + 1}</div>`;
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([estudiante.lng, estudiante.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${estudiante.nombre}</strong><br/>${estudiante.direccion}`))
        .addTo(map.current!);
      markersRef.current.push(marker);
    });
  };

  const fetchRoute = async () => {
    if (!map.current || !mapLoaded || estudiantesAsignados.length === 0 || !sede) return;

    const coordinates = [
      [sede.lng, sede.lat],
      ...estudiantesAsignados.map(e => [e.lng, e.lat]),
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

        // Remove existing layers
        ['route-outline', 'route', 'route-glow', 'route-arrows', 'route-animated'].forEach(layer => {
          if (map.current?.getLayer(layer)) map.current.removeLayer(layer);
        });
        if (map.current?.getSource('route')) map.current.removeSource('route');

        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: routeGeometry,
          },
        });

        // Glow effect
        map.current.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#FC4554',
            'line-width': 14,
            'line-opacity': 0.15,
            'line-blur': 8,
          },
        });

        // Route outline (shadow)
        map.current.addLayer({
          id: 'route-outline',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#610CF4',
            'line-width': 8,
            'line-opacity': 0.4,
          },
        });

        // Main route line
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#FC4554',
            'line-width': 4,
            'line-opacity': 1,
          },
        });

        // Create animated dash pattern for direction
        map.current.addLayer({
          id: 'route-animated',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 2,
            'line-dasharray': [0, 4, 3],
          },
        });

        // Animate the dash pattern
        let dashArraySeq = [
          [0, 4, 3],
          [0.5, 4, 2.5],
          [1, 4, 2],
          [1.5, 4, 1.5],
          [2, 4, 1],
          [2.5, 4, 0.5],
          [3, 4, 0],
          [0, 0.5, 3, 3.5],
          [0, 1, 3, 3],
          [0, 1.5, 3, 2.5],
          [0, 2, 3, 2],
          [0, 2.5, 3, 1.5],
          [0, 3, 3, 1],
          [0, 3.5, 3, 0.5],
        ];
        
        let step = 0;
        const animateDash = () => {
          if (!map.current?.getLayer('route-animated')) return;
          
          step = (step + 1) % dashArraySeq.length;
          map.current.setPaintProperty('route-animated', 'line-dasharray', dashArraySeq[step]);
          animationRef.current = requestAnimationFrame(animateDash);
        };
        
        // Slower animation (every 100ms)
        const startAnimation = () => {
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          const animate = () => {
            if (!map.current?.getLayer('route-animated')) return;
            step = (step + 1) % dashArraySeq.length;
            map.current.setPaintProperty('route-animated', 'line-dasharray', dashArraySeq[step]);
            setTimeout(() => {
              animationRef.current = requestAnimationFrame(animate);
            }, 120);
          };
          animate();
        };
        startAnimation();

        // Direction arrows with better styling
        if (!map.current.hasImage('direction-arrow')) {
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Clear background
            ctx.clearRect(0, 0, 32, 32);
            
            // Draw arrow pointing right (direction of travel)
            ctx.fillStyle = '#FC4554';
            ctx.beginPath();
            ctx.moveTo(8, 10);
            ctx.lineTo(24, 16);
            ctx.lineTo(8, 22);
            ctx.lineTo(12, 16);
            ctx.closePath();
            ctx.fill();
            
            // Add white stroke
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          const imageData = ctx!.getImageData(0, 0, 32, 32);
          map.current.addImage('direction-arrow', { 
            width: 32, 
            height: 32, 
            data: new Uint8Array(imageData.data) 
          });
        }

        map.current.addLayer({
          id: 'route-arrows',
          type: 'symbol',
          source: 'route',
          layout: {
            'symbol-placement': 'line',
            'symbol-spacing': 80,
            'icon-image': 'direction-arrow',
            'icon-size': 0.7,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-rotation-alignment': 'map',
          },
        });

        // Fit bounds
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord as [number, number]));
        map.current.fitBounds(bounds, { padding: 60 });
      }
    } catch (err) {
      console.error('Error fetching route:', err);
    }
  };

  useEffect(() => {
    if (!map.current) {
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      updateMarkers();
      if (estudiantesAsignados.length > 0) {
        fetchRoute();
      } else if (map.current?.getSource('route')) {
        ['route-outline', 'route', 'route-glow', 'route-arrows', 'route-animated'].forEach(layer => {
          if (map.current?.getLayer(layer)) map.current.removeLayer(layer);
        });
        map.current.removeSource('route');
      }
    }
  }, [asignados, mapLoaded]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="bg-muted/30 rounded-lg p-3 md:p-4 border border-border">
      <style>{`
        .sede-marker-container {
          position: relative;
          width: 50px;
          height: 50px;
        }
        @media (min-width: 768px) {
          .sede-marker-container {
            width: 60px;
            height: 60px;
          }
        }
        .sede-pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(252, 69, 84, 0.25);
          animation: pulse-ring 2.5s ease-out infinite;
        }
        @media (min-width: 768px) {
          .sede-pulse-ring {
            width: 60px;
            height: 60px;
          }
        }
        .sede-pulse-ring-2 {
          animation-delay: 0.8s;
        }
        .sede-pulse-ring-3 {
          animation-delay: 1.6s;
        }
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.4);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0;
          }
        }
        .sede-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #FC4554 0%, #d93545 100%);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 4px 15px rgba(252, 69, 84, 0.5), 0 0 0 4px rgba(252, 69, 84, 0.2);
          animation: marker-glow 2s ease-in-out infinite;
          z-index: 10;
        }
        @media (min-width: 768px) {
          .sede-marker {
            width: 36px;
            height: 36px;
            border-width: 3px;
          }
        }
        .sede-label {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          background: #FC4554;
          color: white;
          font-size: 8px;
          font-weight: bold;
          padding: 1px 4px;
          border-radius: 3px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 11;
        }
        @media (min-width: 768px) {
          .sede-label {
            top: -8px;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 4px;
          }
        }
        @keyframes marker-glow {
          0%, 100% { 
            box-shadow: 0 4px 15px rgba(252, 69, 84, 0.5), 0 0 0 4px rgba(252, 69, 84, 0.2);
          }
          50% { 
            box-shadow: 0 4px 25px rgba(252, 69, 84, 0.7), 0 0 0 8px rgba(252, 69, 84, 0.1);
          }
        }
        .student-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .student-marker:hover {
          transform: scale(1.1);
        }
        .student-marker-inner {
          background: linear-gradient(135deg, #610CF4 0%, #4a09b8 100%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 3px 8px rgba(97, 12, 244, 0.4);
          color: white;
          font-size: 10px;
          font-weight: bold;
        }
        @media (min-width: 768px) {
          .student-marker-inner {
            width: 30px;
            height: 30px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h4 className="font-medium text-foreground text-sm md:text-base">Ruta Óptima del Recorrido</h4>
        </div>
        {estudiantesAsignados.length > 0 && (
          <span className="text-xs md:text-sm text-muted-foreground">
            {estudiantesAsignados.length} estudiante(s) en ruta
          </span>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-destructive mb-3 text-xs md:text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div 
        ref={mapContainer} 
        className="w-full rounded-lg overflow-hidden"
        style={{ height: `${height}px`, background: '#e5e7eb' }}
      />

      {estudiantesAsignados.length === 0 && mapLoaded && (
        <p className="text-xs md:text-sm text-muted-foreground mt-3 text-center">
          Asigna estudiantes para visualizar la ruta óptima del recorrido
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-3 text-[10px] md:text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-primary animate-pulse"></div>
          <span>Inicio (Sede)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-secondary"></div>
          <span>Estudiantes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="w-3 md:w-4 h-0.5 bg-primary rounded"></div>
            <div className="w-0 h-0 border-t-[2px] md:border-t-[3px] border-t-transparent border-b-[2px] md:border-b-[3px] border-b-transparent border-l-[4px] md:border-l-[5px] border-l-primary"></div>
          </div>
          <span>Dirección</span>
        </div>
      </div>
    </div>
  );
};

export default RouteMapPreview;
