// Mock data simulando respuestas de API REST

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

// Mock Buses
export const buses: Bus[] = [
  { 
    id: '1', 
    placa: 'NHI988', 
    capacidad: 40, 
    marca: 'Mercedes Benz',
    modelo: '2020', 
    fechaRevisionTecnica: '2024-06-15',
    fechaSeguroObligatorio: '2024-08-20',
    tipoMotor: 'combustible',
    estado: 'activo' 
  },
  { 
    id: '2', 
    placa: 'ABC123', 
    capacidad: 35, 
    marca: 'Volkswagen',
    modelo: '2019', 
    fechaRevisionTecnica: '2024-05-10',
    fechaSeguroObligatorio: '2024-07-15',
    tipoMotor: 'hibrido',
    estado: 'activo' 
  },
  { 
    id: '3', 
    placa: 'XYZ789', 
    capacidad: 45, 
    marca: 'Hyundai',
    modelo: '2021', 
    fechaRevisionTecnica: '2024-09-01',
    fechaSeguroObligatorio: '2024-10-05',
    tipoMotor: 'electrico',
    estado: 'activo' 
  },
  { 
    id: '4', 
    placa: 'DEF456', 
    capacidad: 30, 
    marca: 'Toyota',
    modelo: '2018', 
    fechaRevisionTecnica: '2024-03-20',
    fechaSeguroObligatorio: '2024-04-10',
    tipoMotor: 'combustible',
    estado: 'mantenimiento' 
  },
];

// Mock Conductores
export const conductores: Conductor[] = [
  { id: '1', nombre: 'Olvaldo Carbonell Rangel', cedula: '1098765432', telefono: '3001234567', licencia: 'C2', estado: 'disponible' },
  { id: '2', nombre: 'Carlos Eduardo Martínez', cedula: '1087654321', telefono: '3009876543', licencia: 'C2', estado: 'disponible' },
  { id: '3', nombre: 'Juan Pablo Rodríguez', cedula: '1076543210', telefono: '3005678901', licencia: 'C3', estado: 'asignado' },
  { id: '4', nombre: 'Miguel Ángel Torres', cedula: '1065432109', telefono: '3002345678', licencia: 'C2', estado: 'disponible' },
];

// Mock Coordinadores
export const coordinadores: Coordinador[] = [
  { id: '1', nombre: 'María Elena Gómez', cedula: '1098765433', telefono: '3101234567', email: 'maria.gomez@escuela.edu', estado: 'disponible' },
  { id: '2', nombre: 'Patricia Andrea Ruiz', cedula: '1087654322', telefono: '3109876543', email: 'patricia.ruiz@escuela.edu', estado: 'disponible' },
  { id: '3', nombre: 'Laura Marcela Castro', cedula: '1076543211', telefono: '3105678901', email: 'laura.castro@escuela.edu', estado: 'asignado' },
  { id: '4', nombre: 'Diana Carolina Peña', cedula: '1065432110', telefono: '3102345678', email: 'diana.pena@escuela.edu', estado: 'disponible' },
];

// Mock Sedes
export const sedes: Sede[] = [
  { id: '1', nombre: 'Sede Principal - Campus Norte', direccion: 'Calle 170 # 45-20', ciudad: 'Bogotá', lat: 4.7519, lng: -74.0452 },
  { id: '2', nombre: 'Sede Secundaria - Campus Sur', direccion: 'Carrera 68 # 12-30', ciudad: 'Bogotá', lat: 4.5981, lng: -74.1236 },
  { id: '3', nombre: 'Sede Primaria - Campus Centro', direccion: 'Avenida 19 # 100-15', ciudad: 'Bogotá', lat: 4.6853, lng: -74.0551 },
];

// Mock Estudiantes con coordenadas
export const estudiantes: Estudiante[] = [
  { id: '1', nombre: 'Daniel Jose Garcia Mendez', curso: '8vo grado', direccion: 'Calle 26 # 16 16 casa B', barrio: 'Suba', lat: 4.7110, lng: -74.0721, asignado: false },
  { id: '2', nombre: 'Alejandro Daniel Manosalva Villa', curso: '8vo grado', direccion: 'Calle 134 # 55-20', barrio: 'Suba', lat: 4.7231, lng: -74.0650, asignado: false },
  { id: '3', nombre: 'Lucas Ethan Ramirez', curso: '11 grado', direccion: 'Carrera 58 # 128-45', barrio: 'Suba', lat: 4.7180, lng: -74.0780, asignado: false },
  { id: '4', nombre: 'Sofia Isabella Torres', curso: '11 grado', direccion: 'Calle 145 # 60-30', barrio: 'Usaquén', lat: 4.7350, lng: -74.0320, asignado: false },
  { id: '5', nombre: 'Mateo Julian Cruz', curso: '10 grado', direccion: 'Avenida 19 # 135-10', barrio: 'Usaquén', lat: 4.7420, lng: -74.0280, asignado: false },
  { id: '6', nombre: 'Valentina Mia Gonzalez', curso: '7mo grado', direccion: 'Carrera 7 # 140-25', barrio: 'Usaquén', lat: 4.7480, lng: -74.0250, asignado: false },
  { id: '7', nombre: 'Diego Alejandro Morales', curso: '9 no grado', direccion: 'Calle 160 # 15-40', barrio: 'Usaquén', lat: 4.7550, lng: -74.0350, asignado: false },
  { id: '8', nombre: 'Camila Andrea Herrera', curso: '9 no grado', direccion: 'Carrera 20 # 155-18', barrio: 'Usaquén', lat: 4.7510, lng: -74.0410, asignado: false },
  { id: '9', nombre: 'Sebastian David Lopez', curso: '9 no grado', direccion: 'Calle 127 # 50-22', barrio: 'Suba', lat: 4.7090, lng: -74.0580, asignado: false },
  { id: '10', nombre: 'Isabella Maria Ruiz', curso: '6to grado', direccion: 'Carrera 45 # 78-90', barrio: 'Chapinero', lat: 4.6520, lng: -74.0640, asignado: false },
];

// Mock Rutas existentes
export const rutas: Ruta[] = [
  { 
    id: 'ruta-1', 
    nombre: 'Ruta Norte', 
    busId: '1', 
    conductorId: '3',
    coordinadorId: '3',
    sedeId: '1',
    estudiantes: ['1', '2', '3', '4', '5'],
    estado: 'activa',
    createdAt: '2024-01-15'
  },
  { 
    id: 'ruta-2', 
    nombre: 'Ruta Sur', 
    busId: '2', 
    conductorId: '1',
    coordinadorId: '1', 
    sedeId: '2',
    estudiantes: ['6', '7', '8'],
    estado: 'activa',
    createdAt: '2024-01-20'
  },
  { 
    id: 'ruta-3', 
    nombre: 'Ruta Centro', 
    busId: '3', 
    conductorId: '2',
    coordinadorId: '2', 
    sedeId: '3',
    estudiantes: ['9', '10'],
    estado: 'inactiva',
    createdAt: '2024-02-10'
  },
];

// Mock Novedades
export const novedades: Novedad[] = [
  {
    id: 'nov-1',
    rutaId: 'ruta-1',
    titulo: 'Retraso por tráfico',
    mensaje: 'La ruta presenta un retraso de 15 minutos debido al tráfico en la Autopista Norte.',
    tipo: 'alerta',
    categoria: 'incidente',
    requiereAprobacion: false,
    estadoAprobacion: null,
    creadoPor: 'María Elena Gómez',
    rolCreador: 'coordinador',
    createdAt: '2024-12-19T08:30:00',
    leida: false
  },
  {
    id: 'nov-2',
    rutaId: 'ruta-1',
    titulo: 'Solicitud cancelación de parada',
    mensaje: 'Solicito cancelar la parada del estudiante Daniel Garcia para el día de mañana por cita médica.',
    tipo: 'info',
    categoria: 'cancelacion_parada',
    requiereAprobacion: true,
    estadoAprobacion: 'pendiente',
    creadoPor: 'Carlos Garcia',
    rolCreador: 'padre',
    estudianteId: '1',
    createdAt: '2024-12-18T14:20:00',
    leida: true
  },
  {
    id: 'nov-3',
    rutaId: 'ruta-2',
    titulo: 'Cancelación de ruta por mantenimiento',
    mensaje: 'Se solicita cancelar la ruta del día 20 de diciembre por mantenimiento programado del bus.',
    tipo: 'urgente',
    categoria: 'cancelacion_ruta',
    requiereAprobacion: true,
    estadoAprobacion: 'pendiente',
    creadoPor: 'Patricia Andrea Ruiz',
    rolCreador: 'coordinador',
    createdAt: '2024-12-19T07:45:00',
    leida: false
  },
  {
    id: 'nov-4',
    rutaId: 'ruta-1',
    titulo: 'Cambio de horario solicitado',
    mensaje: 'Por favor considerar adelantar la hora de recogida en 10 minutos.',
    tipo: 'info',
    categoria: 'cambio_horario',
    requiereAprobacion: true,
    estadoAprobacion: 'aprobada',
    creadoPor: 'Laura Mendez',
    rolCreador: 'padre',
    estudianteId: '2',
    aprobadoPor: 'Administrador',
    fechaAprobacion: '2024-12-17T10:00:00',
    comentarioAprobacion: 'Aprobado, se notificará al conductor.',
    createdAt: '2024-12-16T09:00:00',
    leida: true
  },
  {
    id: 'nov-5',
    rutaId: 'ruta-3',
    titulo: 'Incidente menor reportado',
    mensaje: 'Se reporta un pequeño incidente con el retrovisor del bus, sin afectación a la ruta.',
    tipo: 'alerta',
    categoria: 'incidente',
    requiereAprobacion: false,
    estadoAprobacion: null,
    creadoPor: 'Laura Marcela Castro',
    rolCreador: 'coordinador',
    createdAt: '2024-12-18T16:30:00',
    leida: false
  },
];

// Mock Historial de Rutas
export const historialRutas: HistorialRuta[] = [
  {
    id: 'hist-1',
    rutaId: 'ruta-1',
    fecha: '2024-12-18',
    horaInicio: '06:30',
    horaFin: '08:15',
    estudiantesRecogidos: 5,
    estudiantesTotales: 5,
    kmRecorridos: 28.5,
    novedades: ['nov-2'],
    estado: 'completada'
  },
  {
    id: 'hist-2',
    rutaId: 'ruta-1',
    fecha: '2024-12-17',
    horaInicio: '06:30',
    horaFin: '08:00',
    estudiantesRecogidos: 5,
    estudiantesTotales: 5,
    kmRecorridos: 27.2,
    novedades: [],
    estado: 'completada'
  },
  {
    id: 'hist-3',
    rutaId: 'ruta-2',
    fecha: '2024-12-18',
    horaInicio: '06:45',
    horaFin: '08:30',
    estudiantesRecogidos: 2,
    estudiantesTotales: 3,
    kmRecorridos: 15.8,
    novedades: [],
    estado: 'parcial'
  },
  {
    id: 'hist-4',
    rutaId: 'ruta-2',
    fecha: '2024-12-16',
    horaInicio: '06:45',
    horaFin: '07:00',
    estudiantesRecogidos: 0,
    estudiantesTotales: 3,
    kmRecorridos: 2.1,
    novedades: [],
    estado: 'cancelada'
  },
];

// Simulated API responses
export const apiResponses = {
  getBuses: () => Promise.resolve({ success: true, data: buses }),
  getConductores: () => Promise.resolve({ success: true, data: conductores }),
  getCoordinadores: () => Promise.resolve({ success: true, data: coordinadores }),
  getSedes: () => Promise.resolve({ success: true, data: sedes }),
  getEstudiantes: () => Promise.resolve({ success: true, data: estudiantes }),
  getRutas: () => Promise.resolve({ success: true, data: rutas }),
  getNovedades: () => Promise.resolve({ success: true, data: novedades }),
  getHistorial: () => Promise.resolve({ success: true, data: historialRutas }),
  
  createRuta: (ruta: Omit<Ruta, 'id' | 'createdAt'>) => {
    const newRuta: Ruta = {
      ...ruta,
      id: `ruta-${rutas.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    rutas.push(newRuta);
    return Promise.resolve({ success: true, data: newRuta });
  },
  
  createNovedad: (novedad: Omit<Novedad, 'id' | 'createdAt' | 'leida'>) => {
    const newNovedad: Novedad = {
      ...novedad,
      id: `nov-${novedades.length + 1}`,
      createdAt: new Date().toISOString(),
      leida: false,
    };
    novedades.push(newNovedad);
    return Promise.resolve({ success: true, data: newNovedad });
  },
  
  createConductor: (conductor: Omit<Conductor, 'id'>) => {
    const newConductor: Conductor = {
      ...conductor,
      id: String(conductores.length + 1),
    };
    conductores.push(newConductor);
    return Promise.resolve({ success: true, data: newConductor });
  },

  createCoordinador: (coordinador: Omit<Coordinador, 'id'>) => {
    const newCoordinador: Coordinador = {
      ...coordinador,
      id: String(coordinadores.length + 1),
    };
    coordinadores.push(newCoordinador);
    return Promise.resolve({ success: true, data: newCoordinador });
  },

  createBus: (bus: Omit<Bus, 'id'>) => {
    const newBus: Bus = {
      ...bus,
      id: String(buses.length + 1),
    };
    buses.push(newBus);
    return Promise.resolve({ success: true, data: newBus });
  },
};
