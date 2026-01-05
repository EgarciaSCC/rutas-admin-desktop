import { Ruta, buses, conductores, coordinadores, sedes, estudiantes } from '@/services/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bus, User, Users, MapPin, Calendar, GraduationCap } from 'lucide-react';
import RouteMapPreview from './RouteMapPreview';

interface VerRutaDialogProps {
  ruta: Ruta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VerRutaDialog = ({ ruta, open, onOpenChange }: VerRutaDialogProps) => {
  if (!ruta) return null;

  const bus = buses.find(b => b.id === ruta.busId);
  const conductor = conductores.find(c => c.id === ruta.conductorId);
  const coordinador = coordinadores.find(c => c.id === ruta.coordinadorId);
  const sede = sedes.find(s => s.id === ruta.sedeId);
  const estudiantesRuta = estudiantes.filter(e => ruta.estudiantes.includes(e.id));

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
          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Bus */}
            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bus className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Bus Asignado</span>
                </div>
                <p className="font-semibold text-sm">{bus?.placa}</p>
                <p className="text-xs text-muted-foreground">{bus?.marca} {bus?.modelo}</p>
              </CardContent>
            </Card>

            {/* Conductor */}
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

            {/* Coordinador */}
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

            {/* Sede */}
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

          {/* Map Preview */}
          <RouteMapPreview 
            estudiantes={estudiantes}
            asignados={ruta.estudiantes}
            sede={sede}
            height={300}
          />

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
            <span>Creada el {new Date(ruta.createdAt).toLocaleDateString('es-CO', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerRutaDialog;
