import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bus, 
  User, 
  Users, 
  MapPin, 
  Calendar, 
  Shield, 
  Fuel,
  Phone,
  Mail,
  CheckCircle2,
  Route
} from "lucide-react";
import { Bus as BusType, Conductor, Coordinador, Sede, Estudiante } from "@/services/mockData";
import RouteMapPreview from "./RouteMapPreview";

interface Step4RevisionProps {
  formData: {
    nombreRuta: string;
    busId: string;
    sedeId: string;
    conductorId: string;
    coordinadorId: string;
    estudiantesIds: string[];
  };
  buses: BusType[];
  sedes: Sede[];
  conductores: Conductor[];
  coordinadores: Coordinador[];
  estudiantes: Estudiante[];
  onBack: () => void;
  onFinish: () => void;
}

const Step4Revision = ({
  formData,
  buses,
  sedes,
  conductores,
  coordinadores,
  estudiantes,
  onBack,
  onFinish,
}: Step4RevisionProps) => {
  const selectedBus = buses.find(b => b.id === formData.busId);
  const selectedSede = sedes.find(s => s.id === formData.sedeId);
  const selectedConductor = conductores.find(c => c.id === formData.conductorId);
  const selectedCoordinador = coordinadores.find(c => c.id === formData.coordinadorId);
  const estudiantesAsignados = estudiantes.filter(e => formData.estudiantesIds.includes(e.id));

  const getTipoMotorLabel = (tipo: string, otro?: string) => {
    const tipos: Record<string, string> = {
      combustible: 'Combustible',
      hibrido: 'Híbrido',
      electrico: 'Eléctrico',
      otro: otro || 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 md:p-6 border border-primary/20">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Revisión Final</h2>
            <p className="text-sm text-muted-foreground">Verifica la información antes de crear la ruta</p>
          </div>
        </div>
      </div>

      {/* Route Name */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2 md:pb-3 px-4 md:px-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Route className="w-5 h-5 text-primary" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs md:text-sm text-muted-foreground">Nombre de la Ruta</span>
              <p className="font-semibold text-foreground text-base md:text-lg">{formData.nombreRuta}</p>
            </div>
            <div>
              <span className="text-xs md:text-sm text-muted-foreground">Punto de Salida</span>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <p className="font-medium text-foreground text-sm md:text-base">{selectedSede?.nombre}</p>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground ml-6">{selectedSede?.direccion}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Bus Info */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2 md:pb-3 px-4 md:px-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Bus className="w-5 h-5 text-primary" />
              Bus Asignado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-muted-foreground">Placa</span>
              <Badge variant="outline" className="font-mono font-bold text-xs md:text-sm">{selectedBus?.placa}</Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
              <div>
                <span className="text-muted-foreground">Marca</span>
                <p className="font-medium">{selectedBus?.marca}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Modelo</span>
                <p className="font-medium">{selectedBus?.modelo}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Capacidad</span>
                <p className="font-medium">{selectedBus?.capacidad} pasajeros</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Fuel className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Motor</span>
                </div>
                <p className="font-medium">{getTipoMotorLabel(selectedBus?.tipoMotor || '', selectedBus?.tipoMotorOtro)}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-muted-foreground">Rev. Técnica</span>
                  <p className="font-medium truncate">{selectedBus?.fechaRevisionTecnica}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-muted-foreground">Seguro</span>
                  <p className="font-medium truncate">{selectedBus?.fechaSeguroObligatorio}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsables */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2 md:pb-3 px-4 md:px-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Users className="w-5 h-5 text-primary" />
              Responsables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
            {/* Conductor */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-secondary" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground">Conductor</span>
                  <p className="font-semibold text-foreground text-sm md:text-base truncate">{selectedConductor?.nombre}</p>
                </div>
              </div>
              <div className="ml-10 space-y-1 text-xs md:text-sm">
                <p className="text-muted-foreground">Cédula: <span className="text-foreground">{selectedConductor?.cedula}</span></p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">{selectedConductor?.telefono}</span>
                </div>
                <p className="text-muted-foreground">Licencia: <span className="text-foreground">{selectedConductor?.licencia}</span></p>
              </div>
            </div>

            {/* Coordinador */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground">Coordinador/a</span>
                  <p className="font-semibold text-foreground text-sm md:text-base truncate">{selectedCoordinador?.nombre}</p>
                </div>
              </div>
              <div className="ml-10 space-y-1 text-xs md:text-sm">
                <p className="text-muted-foreground">Cédula: <span className="text-foreground">{selectedCoordinador?.cedula}</span></p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">{selectedCoordinador?.telefono}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{selectedCoordinador?.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Preview Full Width */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-2 md:pb-3 px-4 md:px-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-base md:text-lg">
              <MapPin className="w-5 h-5 text-primary" />
              Preview de la Ruta
            </div>
            <Badge variant="secondary" className="font-normal text-xs w-fit">
              {estudiantesAsignados.length} estudiantes asignados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4 md:px-6 pb-4">
            <RouteMapPreview 
              estudiantes={estudiantes}
              asignados={formData.estudiantesIds}
              sede={selectedSede}
              height={300}
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Summary */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2 md:pb-3 px-4 md:px-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-base md:text-lg">
              <Users className="w-5 h-5 text-primary" />
              Estudiantes Asignados
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs w-fit">
              {estudiantesAsignados.length} / {selectedBus?.capacidad || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          {estudiantesAsignados.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 max-h-[250px] overflow-y-auto">
              {estudiantesAsignados.map((estudiante, index) => (
                <div 
                  key={estudiante.id}
                  className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/30 rounded-lg border border-border/50"
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs md:text-sm font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-xs md:text-sm truncate">{estudiante.nombre}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">{estudiante.curso}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4 text-sm">No hay estudiantes asignados a esta ruta</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="px-6 h-11 rounded-full w-full sm:w-auto"
        >
          Atrás
        </Button>
        <Button 
          onClick={onFinish}
          className="px-8 h-11 rounded-full bg-primary hover:bg-primary/90 w-full sm:w-auto"
        >
          Crear Ruta
        </Button>
      </div>
    </div>
  );
};

export default Step4Revision;
