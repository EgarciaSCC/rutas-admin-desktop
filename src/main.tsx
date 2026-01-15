import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import 'mapbox-gl/dist/mapbox-gl.css';

// mapbox worker fix for bundlers like Vite
import mapboxgl from 'mapbox-gl';

(async () => {
  try {
    // Dynamic import to avoid static import issues with Vite prebundle
    const MapboxWorkerModule = await import('mapbox-gl/dist/mapbox-gl-csp-worker');
    const MapboxWorker: any = (MapboxWorkerModule as any).default || MapboxWorkerModule;
    (mapboxgl as any).workerClass = MapboxWorker;
  } catch (err) {
    // Non-fatal: Mapbox may fallback to built-in worker behavior; log for debugging
    // eslint-disable-next-line no-console
    console.warn('Mapbox worker dynamic import failed:', err);
  }

  createRoot(document.getElementById("root")!).render(<App />);
})();
