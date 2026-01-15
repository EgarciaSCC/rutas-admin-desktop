import { Bus, Conductor, Coordinador, Sede, Estudiante, Ruta, Novedad, HistorialRuta } from './types';
import * as mock from './mockData';

// Use relative /api by default so the Vite dev proxy can forward requests and avoid CORS in development.
// In production set VITE_API_BASE_URL to the real API base (e.g., https://api.example.com/api)
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

type ApiResult<T> = {
  success: boolean;
  status: number;
  data?: T;
  error?: string;
};

async function request<T>(path: string, options: RequestInit = {}, timeoutMs = 10000): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers || {}) } });
    clearTimeout(id);
    const status = res.status;
    if (!res.ok) {
      let text = '';
      try { text = await res.text(); } catch (e) {}
      return { success: false, status, error: text || res.statusText };
    }
    // parse JSON safely
    let body: any = null;
    try { body = await res.json(); } catch (e) { return { success: false, status, error: 'Invalid JSON response' }; }
    // normalize: if backend returns { data: ... } or returns directly
    const data = body && body.data !== undefined ? body.data : body;
    return { success: true, status, data } as ApiResult<T>;
  } catch (err: any) {
    clearTimeout(id);
    // fallback to mock data in case of network error (development convenience)
    console.error('API request failed', path, err?.message || err);
    return { success: false, status: 0, error: err?.message || 'Network error' };
  }
}

export const apiClient = {
  // GET collections
  async getBuses() { return await request<Bus[]>('/buses'); },
  async getBusById(id: string) { return await request<Bus>(`/buses/${id}`); },
  async getConductores() { return await request<Conductor[]>('/conductores'); },
  async getConductorById(id: string) { return await request<Conductor>(`/conductores/${id}`); },
  async getCoordinadores() { return await request<Coordinador[]>('/coordinadores'); },
  async getSedes() { return await request<Sede[]>('/sedes'); },
  async getSedeById(id: string) { return await request<Sede>(`/sedes/${id}`); },
  // Note: API uses 'pasajeros' path for estudiantes/pasajeros
  async getEstudiantes() { return await request<Estudiante[]>('/pasajeros'); },
  async getEstudianteById(id: string) { return await request<Estudiante>(`/pasajeros/${id}`); },
  async getRutas() { return await request<Ruta[]>('/rutas'); },
  async getRutaById(id: string) { return await request<Ruta>(`/rutas/${id}`); },
  async getNovedades() { return await request<Novedad[]>('/novedades'); },
  async getNovedadById(id: string) { return await request<Novedad>(`/novedades/${id}`); },
  // historial-rutas in API
  async getHistorial() { return await request<HistorialRuta[]>('/historial-rutas'); },
  async getHistorialById(id: string) { return await request<HistorialRuta>(`/historial-rutas/${id}`); },

  // POST creates
  async createRuta(payload: Omit<Ruta, 'id' | 'createdAt'>) { return await request<Ruta>('/rutas', { method: 'POST', body: JSON.stringify(payload) }); },
  async createNovedad(payload: Omit<Novedad, 'id' | 'createdAt' | 'leida'>) { return await request<Novedad>('/novedades', { method: 'POST', body: JSON.stringify(payload) }); },
  // Paradas temporales dentro de una ruta
  async createParadaTemporal(rutaId: string, payload: { estudianteId: string; direccion: string; lat: number; lng: number; motivo: string; creadoPor: string; rolCreador: string; }) {
    return await request<any>(`/rutas/${rutaId}/paradas-temporales`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async createConductor(payload: Omit<Conductor, 'id'>) { return await request<Conductor>('/conductores', { method: 'POST', body: JSON.stringify(payload) }); },
  async createCoordinador(payload: Omit<Coordinador, 'id'>) { return await request<Coordinador>('/coordinadores', { method: 'POST', body: JSON.stringify(payload) }); },
  async createBus(payload: Omit<Bus, 'id'>) { return await request<Bus>('/buses', { method: 'POST', body: JSON.stringify(payload) }); },
  async createEstudiante(payload: Omit<Estudiante, 'id'>) { return await request<Estudiante>('/pasajeros', { method: 'POST', body: JSON.stringify(payload) }); },

  // PUT updates
  async updateRuta(id: string, payload: Partial<Ruta>) { return await request<Ruta>(`/rutas/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  async updateNovedad(id: string, payload: Partial<Novedad>) { return await request<Novedad>(`/novedades/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  async updateBus(id: string, payload: Partial<Bus>) { return await request<Bus>(`/buses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  async updateConductor(id: string, payload: Partial<Conductor>) { return await request<Conductor>(`/conductores/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  async updateSede(id: string, payload: Partial<Sede>) { return await request<Sede>(`/sedes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },

  // DELETE
  async deleteRuta(id: string) { return await request<void>(`/rutas/${id}`, { method: 'DELETE' }); },
  async deleteNovedad(id: string) { return await request<void>(`/novedades/${id}`, { method: 'DELETE' }); },
  async deleteParadaTemporal(rutaId: string, paradaId: string) { return await request<void>(`/rutas/${rutaId}/paradas-temporales/${paradaId}`, { method: 'DELETE' }); },

  // Realtime positions - optional endpoint (keep as-is)
  async getRealtimePositions() { return await request<Record<string, { lat: number; lng: number; heading?: number; speed?: number; lastUpdate?: string; progress?: number }>>('/realtime/positions'); },
};

// Development helpers: functions that fall back to mock data (used by components while API unavailable)
export async function fallbackGetBuses() { try { const r = await apiClient.getBuses(); if (r.success && r.data) return r; } catch (e) {} return { success: true, status: 200, data: mock.buses as Bus[] }; }
export async function fallbackGetConductores() { try { const r = await apiClient.getConductores(); if (r.success && r.data) return r; } catch (e) {} return { success: true, status: 200, data: mock.conductores as Conductor[] }; }
export async function fallbackGetCoordinadores() { try { const r = await apiClient.getCoordinadores(); if (r.success && r.data) return r; } catch (e) {} return { success: true, status: 200, data: mock.coordinadores as coordinadores[] }; }
export async function fallbackGetSedes() { try { const r = await apiClient.getSedes(); if (r.success && r.data) return r; } catch (e) {} return { success: true, status: 200, data: mock.sedes as Sede[] }; }
export async function fallbackGetEstudiantes() { try { const r = await apiClient.getEstudiantes(); if (r.success && r.data) return r; } catch (e) {} return { success: true, status: 200, data: mock.estudiantes as Estudiante[] }; }
export async function fallbackGetRutas() { try { const r = await apiClient.getRutas(); if (r.success && r.data) return r; } catch (e) {} return { success: true, status: 200, data: mock.rutas as Ruta[] }; }
export async function fallbackGetNovedades() { try { const r = await apiClient.getNovedades(); if (r.success && r.data) return r; } catch (e) {} return { success: true, status: 200, data: mock.novedades as Novedad[] }; }
export async function fallbackGetHistorial() { try { const r = await apiClient.getHistorial(); if (r.success && r.data) return r; } catch (e) {} return { success: true, status: 200, data: mock.historialRutas as HistorialRuta[] }; }
export async function fallbackGetParadasTemporales(rutaId: string) {
  try {
    const r = await apiClient.getParadasTemporales(rutaId);
    if (r.success && r.data) return r;
  } catch (e) {}
  // Derivar paradas temporales desde mock.rutas
  const ruta = mock.rutas.find(r => r.id === rutaId);
  const data = ruta && ruta.paradasTemporales ? ruta.paradasTemporales : [];
  return { success: true, status: 200, data } as any;
}

// Attach fallback helpers onto apiClient so callers can use apiClient.fallbackGetX() as well as named imports
;(apiClient as any).fallbackGetBuses = fallbackGetBuses;
;(apiClient as any).fallbackGetConductores = fallbackGetConductores;
;(apiClient as any).fallbackGetCoordinadores = fallbackGetCoordinadores;
;(apiClient as any).fallbackGetSedes = fallbackGetSedes;
;(apiClient as any).fallbackGetEstudiantes = fallbackGetEstudiantes;
;(apiClient as any).fallbackGetRutas = fallbackGetRutas;
;(apiClient as any).fallbackGetNovedades = fallbackGetNovedades;
;(apiClient as any).fallbackGetHistorial = fallbackGetHistorial;
;(apiClient as any).fallbackGetParadasTemporales = fallbackGetParadasTemporales;

export default apiClient;
