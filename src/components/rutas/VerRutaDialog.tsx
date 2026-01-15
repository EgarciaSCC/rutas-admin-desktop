import { useEffect, useState } from 'react';
import { Ruta, Bus, Conductor, Coordinador, Sede, Estudiante } from '@/services/types';
import { fallbackGetBuses, fallbackGetConductores, fallbackGetSedes, fallbackGetEstudiantes } from '@/services/apiClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bus, User, Users, MapPin, Calendar, GraduationCap, MapPinPlus, Clock, Check, X, Loader2 } from 'lucide-react';
import RouteMapPreview from './RouteMapPreview';
import { toast } from 'sonner';

interface VerRutaDialogProps {
  ruta: Ruta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParadaUpdated?: () => void;
}

const VerRutaDialog = ({ ruta, open, onOpenChange, onParadaUpdated }: VerRutaDialogProps) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  if (!ruta) return null;

  const [busesList, setBusesList] = useState<Bus[]>([]);
  const [conductoresList, setConductoresList] = useState<Conductor[]>([]);
  const [coordinadoresList, setCoordinadoresList] = useState<Coordinador[]>([]);
  const [sedesList, setSedesList] = useState<Sede[]>([]);
  const [estudiantesList, setEstudiantesList] = useState<Estudiante[]>([]);
  const paradasPendientes = ruta.paradasTemporales?.filter(p => p.estado === 'pendiente') || [];

  const handleAprobarParada = async (paradaId: string) => {
    setProcessingId(paradaId);
    try {
      const success = aprobarParadaTemporal(ruta.id, paradaId, 'Administrador');
      if (success) {
        toast.success('Parada temporal aprobada correctamente', {
          description: 'La parada ha sido agregada a la ruta.'
        });
        onParadaUpdated?.();
        onOpenChange(false);
      } else {
        toast.error('Error al aprobar la parada');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazarParada = async (paradaId: string) => {
    setProcessingId(paradaId);
    try {
      const success = rechazarParadaTemporal(ruta.id, paradaId, 'Administrador');
      if (success) {
        toast.error('Parada temporal rechazada', {
          description: 'La solicitud de parada ha sido rechazada.'
        });
        onParadaUpdated?.();
        onOpenChange(false);
      } else {
        toast.error('Error al rechazar la parada');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const getTimeRemaining = (expiraAt: string) => {
    const now = new Date();
    const expira = new Date(expiraAt);
    const diff = expira.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    (async () => {
      const [bRes, cRes, sRes, eRes] = await Promise.all([
        fallbackGetBuses(),
        fallbackGetConductores(),
        fallbackGetSedes(),
        fallbackGetEstudiantes(),
      ]);
      if (bRes.success && bRes.data) setBusesList(bRes.data);
      if (cRes.success && cRes.data) setConductoresList(cRes.data);
      if (sRes.success && sRes.data) setSedesList(sRes.data);
      if (eRes.success && eRes.data) setEstudiantesList(eRes.data);
      // coordinadores fallback uses conductores for now
      setCoordinadoresList(cRes.success && cRes.data ? (cRes.data as any) : []);
    })();
  }, []);

  const bus = busesList.find(b => b.id === ruta.busId);
  const conductor = conductoresList.find(c => c.id === ruta.conductorId);
  const coordinador = coordinadoresList.find(c => c.id === ruta.coordinadorId);
  const sede = sedesList.find(s => s.id === ruta.sedeId);
  const estudiantesRuta = estudiantesList.filter(e => ruta.estudiantes.includes(e.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{ruta.nombre}</DialogTitle>
            <Badge variant={ruta.estado === 'activa' ? 'default' : 'secondary'}>
              {ruta.estado === 'activa' ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Paradas Temporales Pendientes */}
          {paradasPendientes.length > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPinPlus className="w-5 h-5 text-warning" />
                  <h4 className="font-semibold text-warning">Paradas Temporales Pendientes ({paradasPendientes.length})</h4>
                </div>
                <div className="space-y-3">
                  {paradasPendientes.map((parada) => {
                    const estudiante = estudiantes.find(e => e.id === parada.estudianteId);
                    return (
                      <div key={parada.id} className="p-3 bg-background rounded-lg border border-warning/30">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{estudiante?.nombre || 'Estudiante'}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{parada.direccion}</p>
                            <p className="text-xs text-muted-foreground mt-1 italic">"{parada.motivo}"</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>Por: {parada.creadoPor} ({parada.rolCreador})</span>
                              <span className="flex items-center gap-1 text-warning">
                                <Clock className="w-3 h-3" />
                                Expira en {getTimeRemaining(parada.expiraAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-success text-success hover:bg-success hover:text-success-foreground"
                              onClick={() => handleAprobarParada(parada.id)}
                              disabled={processingId !== null}
                            >
                              {processingId === parada.id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3 mr-1" />
                              )}
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRechazarParada(parada.id)}
                              disabled={processingId !== null}
                            >
                              {processingId === parada.id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <X className="w-3 h-3 mr-1" />
                              )}
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BusIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Bus Asignado</span>
                </div>
                <p className="font-semibold text-sm">{bus?.placa}</p>
                <p className="text-xs text-muted-foreground">{bus?.marca} {bus?.modelo}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Conductor</span>
                </div>
                <p className="font-semibold text-sm truncate">{conductor?.nombre}</p>
                <p className="text-xs text-muted-foreground">{conductor?.telefono}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-success" />
                  <span className="text-xs text-muted-foreground">Coordinador</span>
                </div>
                <p className="font-semibold text-sm truncate">{coordinador?.nombre}</p>
                <p className="text-xs text-muted-foreground">{coordinador?.email}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Sede Destino</span>
                </div>
                <p className="font-semibold text-sm truncate">{sede?.nombre}</p>
                <p className="text-xs text-muted-foreground truncate">{sede?.direccion}</p>
              </CardContent>
            </Card>
          </div>

          <RouteMapPreview estudiantes={estudiantes} asignados={ruta.estudiantes} sede={sede} height={300} />

          {/* Estudiantes */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-secondary-foreground" />
                <h4 className="font-semibold">Estudiantes Asignados ({estudiantesRuta.length})</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {estudiantesRuta.map((est, idx) => (
                  <div key={est.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{est.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate">{est.direccion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fecha creación */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Creada el {new Date(ruta.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerRutaDialog;
