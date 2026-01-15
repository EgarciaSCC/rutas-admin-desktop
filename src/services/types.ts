// Extracted interfaces for domain models
export interface Bus {
  id: string;
  placa: string;
  capacidad: number;
  marca: string;
  modelo: string;
  fechaRevisionTecnica: string;
  fechaSeguroObligatorio: string;
  tipoMotor: 'combustible' | 'hibrido' | 'electrico' | 'otro';
  tipoMotorOtro?: string;
  estado: 'activo' | 'mantenimiento' | 'inactivo';
}

export interface Conductor {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  licencia: string;
  estado: 'disponible' | 'asignado' | 'inactivo';
}

export interface Coordinador {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  estado: 'disponible' | 'asignado' | 'inactivo';
}

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  lat: number;
  lng: number;
}

export interface Estudiante {
  id: string;
  nombre: string;
  curso: string;
  direccion: string;
  barrio: string;
  lat: number;
  lng: number;
  asignado: boolean;
}

export interface Ruta {
  id: string;
  nombre: string;
  busId: string;
  conductorId: string;
  coordinadorId: string;
  sedeId: string;
  estudiantes: string[];
  estado: 'activa' | 'inactiva';
  createdAt: string;
}

export interface Novedad {
  id: string;
  rutaId: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'alerta' | 'urgente';
  categoria: 'cancelacion_ruta' | 'cancelacion_parada' | 'cambio_horario' | 'incidente' | 'otro';
  requiereAprobacion: boolean;
  estadoAprobacion: 'pendiente' | 'aprobada' | 'rechazada' | null;
  creadoPor: string;
  rolCreador: 'coordinador' | 'padre' | 'administrador';
  estudianteId?: string;
  createdAt: string;
  leida: boolean;
  aprobadoPor?: string;
  fechaAprobacion?: string;
  comentarioAprobacion?: string;
}

export interface HistorialRuta {
  id: string;
  rutaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estudiantesRecogidos: number;
  estudiantesTotales: number;
  kmRecorridos: number;
  novedades: string[];
  estado: 'completada' | 'cancelada' | 'parcial';
}
