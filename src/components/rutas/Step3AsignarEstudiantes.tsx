import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Estudiante, Sede } from "@/services/types";
import RouteMapPreview from "./RouteMapPreview";

interface Step3FormProps {
  estudiantes: Estudiante[];
  asignados: string[];
  capacidad: number;
  sede: Sede | undefined;
  onToggleEstudiante: (id: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

const Step3AsignarEstudiantes = ({
  estudiantes,
  asignados,
  capacidad,
  sede,
  onToggleEstudiante,
  onBack,
  onSkip,
  onFinish,
}: Step3FormProps) => {
  const canFinish = asignados.length > 0;

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Map Preview */}
      <RouteMapPreview 
        estudiantes={estudiantes} 
        asignados={asignados} 
        sede={sede}
      />

      {/* Students - Mobile Cards / Desktop Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Asignar estudiantes a ruta{" "}
            <span className="text-muted-foreground font-normal">
              {asignados.length}/{capacidad}
            </span>
          </h3>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {estudiantes.map((estudiante) => {
            const isAsignado = asignados.includes(estudiante.id);
            return (
              <div 
                key={estudiante.id} 
                className={`p-3 rounded-lg border ${isAsignado ? 'border-primary bg-primary/5' : 'border-border'}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm truncate">{estudiante.nombre}</p>
                    <p className="text-xs text-muted-foreground">{estudiante.curso}</p>
                    <p className="text-xs text-muted-foreground truncate">{estudiante.direccion}</p>
                    <p className="text-xs text-muted-foreground">{estudiante.barrio}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleEstudiante(estudiante.id)}
                    className={`
                      rounded-full px-3 text-xs font-medium shrink-0
                      ${isAsignado 
                        ? "border-primary text-primary hover:bg-primary/10" 
                        : "border-border text-foreground hover:bg-muted"
                      }
                    `}
                  >
                    {isAsignado ? "Quitar" : "Agregar"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">Nombre de estudiante</TableHead>
                <TableHead className="font-semibold text-foreground">Curso</TableHead>
                <TableHead className="font-semibold text-foreground">Dirección</TableHead>
                <TableHead className="font-semibold text-foreground">Barrio / localidad</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estudiantes.map((estudiante) => {
                const isAsignado = asignados.includes(estudiante.id);
                
                return (
                  <TableRow key={estudiante.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{estudiante.nombre}</TableCell>
                    <TableCell>{estudiante.curso}</TableCell>
                    <TableCell>{estudiante.direccion}</TableCell>
                    <TableCell>{estudiante.barrio}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleEstudiante(estudiante.id)}
                        className={`
                          rounded-full px-4 text-xs font-medium
                          ${isAsignado 
                            ? "border-primary text-primary hover:bg-primary/10" 
                            : "border-border text-foreground hover:bg-muted"
                          }
                        `}
                      >
                        {isAsignado ? "Quitar de ruta" : "Agregar a ruta"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Footer buttons */}
        <div className="p-4 md:p-6 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="px-6 h-11 rounded-full w-full sm:w-auto"
          >
            Atrás
          </Button>
          <Button 
            variant="outline" 
            onClick={onSkip}
            className="px-6 h-11 rounded-full border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
          >
            Omitir
          </Button>
          <Button 
            onClick={onFinish}
            disabled={!canFinish}
            className={`px-8 h-11 rounded-full w-full sm:w-auto ${!canFinish ? 'opacity-50' : ''}`}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step3AsignarEstudiantes;
