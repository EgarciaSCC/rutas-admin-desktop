/**
 * GPS Simulation Service
 * 
 * Este servicio emula el envío de coordenadas GPS del bus hacia la API de Mapbox
 * para realizar el posicionamiento en tiempo real del vehículo en el mapa.
 * 
 * ============================================================================
 * DOCUMENTACIÓN DE LA API DE MAPBOX UTILIZADA
 * ============================================================================
 * 
 * 1. DIRECTIONS API (Obtención de ruta)
 *    Endpoint: https://api.mapbox.com/directions/v5/mapbox/{profile}/{coordinates}
 *    
 *    Parámetros de entrada:
 *    - profile: Tipo de transporte ('driving', 'walking', 'cycling', 'driving-traffic')
 *    - coordinates: Lista de coordenadas en formato "lng,lat;lng,lat;..."
 *    - geometries: Formato de geometría ('geojson', 'polyline', 'polyline6')
 *    - overview: Nivel de detalle de la ruta ('full', 'simplified', 'false')
 *    - access_token: Token público de Mapbox
 *    
 *    Respuesta:
 *    {
 *      routes: [{
 *        geometry: {
 *          type: 'LineString',
 *          coordinates: [[lng, lat], [lng, lat], ...]  // Array de coordenadas de la ruta
 *        },
 *        distance: number,    // Distancia total en metros
 *        duration: number,    // Duración estimada en segundos
 *        legs: [{             // Segmentos de la ruta
 *          distance: number,
 *          duration: number,
 *          steps: [...]       // Instrucciones de navegación
 *        }]
 *      }]
 *    }
 *    
 *    Ejemplo de uso:
 *    ```
 *    const response = await fetch(
 *      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}?geometries=geojson&overview=full&access_token=${token}`
 *    );
 *    ```
 * 
 * 2. MARKER API (Posicionamiento del marcador)
 *    Clase: mapboxgl.Marker
 *    
 *    Métodos principales:
 *    - setLngLat([lng, lat]): Actualiza la posición del marcador
 *    - addTo(map): Añade el marcador al mapa
 *    - remove(): Elimina el marcador del mapa
 *    
 *    Propiedades de configuración:
 *    - element: Elemento HTML personalizado para el marcador
 *    - anchor: Punto de anclaje ('center', 'top', 'bottom', 'left', 'right')
 *    - offset: Desplazamiento en píxeles [x, y]
 *    - rotation: Rotación en grados
 *    
 *    Ejemplo de actualización de posición (simulación GPS):
 *    ```
 *    marker.setLngLat([newLng, newLat]);
 *    ```
 * 
 * ============================================================================
 * LÓGICA DE SIMULACIÓN GPS
 * ============================================================================
 * 
 * La simulación calcula el movimiento del bus a lo largo de la ruta considerando:
 * 
 * 1. VELOCIDAD: 50 km/h (configurable)
 * 2. CÁLCULO DE DISTANCIA: Fórmula de Haversine para distancia entre coordenadas
 * 3. INTERPOLACIÓN: Calcula posiciones intermedias entre puntos de la ruta
 * 4. HEADING: Dirección calculada desde el punto actual al siguiente
 * 
 * Fórmula de velocidad:
 * - Velocidad = 50 km/h = 50000 m/h = 13.89 m/s
 * - Intervalo de actualización: 100ms (10 actualizaciones/segundo)
 * - Distancia por intervalo: 13.89 * 0.1 = 1.389 metros
 * 
 * ============================================================================
 */

// Tipos para la simulación GPS
export interface GPSCoordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface GPSSimulationState {
  currentPosition: GPSCoordinate;
  heading: number;          // Dirección en grados (0-360)
  speed: number;            // Velocidad en km/h
  progress: number;         // Progreso de la ruta (0-100%)
  distanceTraveled: number; // Distancia recorrida en metros
  totalDistance: number;    // Distancia total de la ruta en metros
  isMoving: boolean;
  currentSegmentIndex: number;
  segmentProgress: number;  // Progreso dentro del segmento actual (0-1)
}

export interface GPSSimulationConfig {
  speedKmh: number;              // Velocidad en km/h
  updateIntervalMs: number;      // Intervalo de actualización en ms
  routeCoordinates: [number, number][]; // Coordenadas de la ruta [lng, lat]
  onPositionUpdate: (state: GPSSimulationState) => void;
  onRouteComplete?: () => void;
}

/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 * @param coord1 - Primera coordenada [lng, lat]
 * @param coord2 - Segunda coordenada [lng, lat]
 * @returns Distancia en metros
 */
export function calculateHaversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const lat1 = coord1[1] * (Math.PI / 180);
  const lat2 = coord2[1] * (Math.PI / 180);
  const deltaLat = (coord2[1] - coord1[1]) * (Math.PI / 180);
  const deltaLng = (coord2[0] - coord1[0]) * (Math.PI / 180);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calcula el heading (dirección) entre dos coordenadas
 * @param from - Coordenada de origen [lng, lat]
 * @param to - Coordenada de destino [lng, lat]
 * @returns Ángulo en grados (0-360, donde 0 es Norte)
 */
export function calculateHeading(
  from: [number, number],
  to: [number, number]
): number {
  const dLng = (to[0] - from[0]) * (Math.PI / 180);
  const lat1 = from[1] * (Math.PI / 180);
  const lat2 = to[1] * (Math.PI / 180);

  const x = Math.sin(dLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - 
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let bearing = Math.atan2(x, y) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

/**
 * Interpola una posición entre dos coordenadas
 * @param from - Coordenada de origen [lng, lat]
 * @param to - Coordenada de destino [lng, lat]
 * @param t - Factor de interpolación (0-1)
 * @returns Coordenada interpolada [lng, lat]
 */
export function interpolatePosition(
  from: [number, number],
  to: [number, number],
  t: number
): [number, number] {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t
  ];
}

/**
 * Calcula la distancia total de una ruta
 * @param coordinates - Array de coordenadas [lng, lat]
 * @returns Distancia total en metros
 */
export function calculateTotalRouteDistance(
  coordinates: [number, number][]
): number {
  let total = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    total += calculateHaversineDistance(coordinates[i], coordinates[i + 1]);
  }
  return total;
}

/**
 * Clase principal para la simulación GPS
 * Emula el envío de coordenadas del bus a Mapbox a una velocidad de 50 km/h
 */
export class GPSSimulator {
  private config: GPSSimulationConfig;
  private state: GPSSimulationState;
  private intervalId: number | null = null;
  private segmentDistances: number[] = [];

  constructor(config: GPSSimulationConfig) {
    this.config = config;
    
    // Calcular distancias de cada segmento
    for (let i = 0; i < config.routeCoordinates.length - 1; i++) {
      this.segmentDistances.push(
        calculateHaversineDistance(
          config.routeCoordinates[i],
          config.routeCoordinates[i + 1]
        )
      );
    }

    const totalDistance = this.segmentDistances.reduce((a, b) => a + b, 0);

    // Estado inicial
    this.state = {
      currentPosition: {
        lng: config.routeCoordinates[0][0],
        lat: config.routeCoordinates[0][1],
        timestamp: Date.now()
      },
      heading: config.routeCoordinates.length > 1 
        ? calculateHeading(config.routeCoordinates[0], config.routeCoordinates[1])
        : 0,
      speed: config.speedKmh,
      progress: 0,
      distanceTraveled: 0,
      totalDistance,
      isMoving: false,
      currentSegmentIndex: 0,
      segmentProgress: 0
    };
  }

  /**
   * Inicia la simulación GPS
   * El bus se moverá a la velocidad configurada (default: 50 km/h)
   */
  start(): void {
    if (this.intervalId) return;

    this.state.isMoving = true;
    
    // Calcular distancia a recorrer por intervalo
    // speedKmh km/h = speedKmh * 1000 / 3600 m/s = speedKmh / 3.6 m/s
    const speedMs = this.config.speedKmh / 3.6; // metros por segundo
    const distancePerInterval = speedMs * (this.config.updateIntervalMs / 1000);

    this.intervalId = window.setInterval(() => {
      this.updatePosition(distancePerInterval);
    }, this.config.updateIntervalMs);

    // Emitir posición inicial
    this.config.onPositionUpdate({ ...this.state });
  }

  /**
   * Pausa la simulación GPS
   */
  pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state.isMoving = false;
  }

  /**
   * Detiene y reinicia la simulación
   */
  stop(): void {
    this.pause();
    this.resetToStart();
  }

  /**
   * Reinicia la posición al inicio de la ruta
   */
  resetToStart(): void {
    this.state = {
      ...this.state,
      currentPosition: {
        lng: this.config.routeCoordinates[0][0],
        lat: this.config.routeCoordinates[0][1],
        timestamp: Date.now()
      },
      heading: this.config.routeCoordinates.length > 1 
        ? calculateHeading(this.config.routeCoordinates[0], this.config.routeCoordinates[1])
        : 0,
      progress: 0,
      distanceTraveled: 0,
      currentSegmentIndex: 0,
      segmentProgress: 0,
      isMoving: false
    };
  }

  /**
   * Actualiza la posición del bus basado en la distancia a recorrer
   */
  private updatePosition(distanceToTravel: number): void {
    const coords = this.config.routeCoordinates;
    
    if (this.state.currentSegmentIndex >= coords.length - 1) {
      // Ruta completada, reiniciar en loop
      this.resetToStart();
      this.config.onRouteComplete?.();
      this.config.onPositionUpdate({ ...this.state });
      return;
    }

    let remainingDistance = distanceToTravel;
    
    while (remainingDistance > 0 && this.state.currentSegmentIndex < coords.length - 1) {
      const segmentDistance = this.segmentDistances[this.state.currentSegmentIndex];
      const distanceInSegment = segmentDistance * this.state.segmentProgress;
      const remainingInSegment = segmentDistance - distanceInSegment;

      if (remainingDistance >= remainingInSegment) {
        // Avanzar al siguiente segmento
        remainingDistance -= remainingInSegment;
        this.state.distanceTraveled += remainingInSegment;
        this.state.currentSegmentIndex++;
        this.state.segmentProgress = 0;
      } else {
        // Avanzar dentro del segmento actual
        this.state.segmentProgress += remainingDistance / segmentDistance;
        this.state.distanceTraveled += remainingDistance;
        remainingDistance = 0;
      }
    }

    // Calcular posición interpolada
    if (this.state.currentSegmentIndex < coords.length - 1) {
      const from = coords[this.state.currentSegmentIndex];
      const to = coords[this.state.currentSegmentIndex + 1];
      
      const interpolated = interpolatePosition(from, to, this.state.segmentProgress);
      
      this.state.currentPosition = {
        lng: interpolated[0],
        lat: interpolated[1],
        timestamp: Date.now()
      };

      this.state.heading = calculateHeading(from, to);
    } else {
      // Fin de la ruta
      const lastCoord = coords[coords.length - 1];
      this.state.currentPosition = {
        lng: lastCoord[0],
        lat: lastCoord[1],
        timestamp: Date.now()
      };
    }

    // Calcular progreso total
    this.state.progress = Math.min(
      100,
      (this.state.distanceTraveled / this.state.totalDistance) * 100
    );

    // Notificar actualización
    /**
     * AQUÍ SE ENVÍA LA POSICIÓN A MAPBOX
     * 
     * En una implementación real, aquí se enviarían las coordenadas a:
     * 1. El servidor backend para almacenar histórico
     * 2. La API de Mapbox para actualizar el marcador del bus
     * 
     * La actualización del marcador se realiza mediante:
     * marker.setLngLat([this.state.currentPosition.lng, this.state.currentPosition.lat])
     */
    this.config.onPositionUpdate({ ...this.state });
  }

  /**
   * Obtiene el estado actual de la simulación
   */
  getState(): GPSSimulationState {
    return { ...this.state };
  }

  /**
   * Destruye el simulador y limpia recursos
   */
  destroy(): void {
    this.stop();
  }
}

// ============================================================================
// EJEMPLO DE USO
// ============================================================================
/**
 * Ejemplo de integración con Mapbox:
 * 
 * ```typescript
 * import { GPSSimulator } from '@/services/gpsSimulationService';
 * 
 * // Crear simulador con ruta obtenida de Mapbox Directions API
 * const simulator = new GPSSimulator({
 *   speedKmh: 50,
 *   updateIntervalMs: 100,
 *   routeCoordinates: routeFromMapbox.geometry.coordinates,
 *   onPositionUpdate: (state) => {
 *     // Actualizar marcador en Mapbox
 *     busMarker.setLngLat([state.currentPosition.lng, state.currentPosition.lat]);
 *     
 *     // Actualizar UI con información del bus
 *     updateBusInfo({
 *       speed: state.speed,
 *       progress: state.progress,
 *       heading: state.heading
 *     });
 *   },
 *   onRouteComplete: () => {
 *     console.log('Ruta completada, reiniciando...');
 *   }
 * });
 * 
 * // Iniciar simulación
 * simulator.start();
 * 
 * // Pausar cuando sea necesario
 * simulator.pause();
 * 
 * // Detener y limpiar
 * simulator.destroy();
 * ```
 */
