import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, UserPlus } from "lucide-react";
import { Conductor, Coordinador } from "@/services/mockData";

interface Step2FormProps {
  conductores: Conductor[];
  coordinadores: Coordinador[];
  selectedConductorId: string;
  selectedCoordinadorId: string;
  onConductorChange: (id: string) => void;
  onCoordinadorChange: (id: string) => void;
  onCreateConductor: (conductor: Omit<Conductor, 'id'>) => void;
  onCreateCoordinador: (coordinador: Omit<Coordinador, 'id'>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2AsignarResponsables = ({ 
  conductores,
  coordinadores,
  selectedConductorId,
  selectedCoordinadorId,
  onConductorChange,
  onCoordinadorChange,
  onCreateConductor,
  onCreateCoordinador,
  onNext, 
  onBack 
}: Step2FormProps) => {
  const [dialogConductorOpen, setDialogConductorOpen] = useState(false);
  const [dialogCoordinadorOpen, setDialogCoordinadorOpen] = useState(false);
  
  const [newConductor, setNewConductor] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    licencia: '',
  });

  const [newCoordinador, setNewCoordinador] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
  });

  const conductoresDisponibles = conductores.filter(c => c.estado === 'disponible');
  const coordinadoresDisponibles = coordinadores.filter(c => c.estado === 'disponible');
  const selectedConductor = conductores.find(c => c.id === selectedConductorId);
  const selectedCoordinador = coordinadores.find(c => c.id === selectedCoordinadorId);
  
  const isValid = selectedConductorId !== '' && selectedCoordinadorId !== '';

  const handleCreateConductor = () => {
    onCreateConductor({
      ...newConductor,
      estado: 'disponible',
    });
    setDialogConductorOpen(false);
    setNewConductor({ nombre: '', cedula: '', telefono: '', licencia: '' });
  };

  const handleCreateCoordinador = () => {
    onCreateCoordinador({
      ...newCoordinador,
      estado: 'disponible',
    });
    setDialogCoordinadorOpen(false);
    setNewCoordinador({ nombre: '', cedula: '', telefono: '', email: '' });
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border animate-fade-in">
      <h2 className="text-base md:text-lg font-semibold mb-4 md:mb-6 text-foreground">Asignar Responsables</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Conductor Section */}
        <div className="space-y-3 md:space-y-4">
          <Label className="text-sm font-semibold text-foreground">
            Conductor/a
          </Label>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Select 
              value={selectedConductorId} 
              onValueChange={onConductorChange}
            >
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Buscar conductor" />
              </SelectTrigger>
              <SelectContent>
                {conductoresDisponibles.map((conductor) => (
                  <SelectItem key={conductor.id} value={conductor.id}>
                    {conductor.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => setDialogConductorOpen(true)}
              variant="outline"
              className="h-11 gap-2 whitespace-nowrap w-full sm:w-auto"
            >
              <FileText className="w-4 h-4" />
              <span className="sm:hidden lg:inline">Crear conductor</span>
              <span className="hidden sm:inline lg:hidden">Nuevo</span>
            </Button>
          </div>

          {selectedConductor && (
            <div className="bg-muted/50 rounded-lg p-3 md:p-4">
              <p className="text-xs md:text-sm text-muted-foreground">Conductor seleccionado:</p>
              <p className="font-medium text-foreground">{selectedConductor.nombre}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Licencia: {selectedConductor.licencia}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Tel: {selectedConductor.telefono}</p>
            </div>
          )}
        </div>

        {/* Coordinador Section */}
        <div className="space-y-3 md:space-y-4">
          <Label className="text-sm font-semibold text-foreground">
            Coordinador/a de Ruta
          </Label>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Select 
              value={selectedCoordinadorId} 
              onValueChange={onCoordinadorChange}
            >
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Buscar coordinador/a" />
              </SelectTrigger>
              <SelectContent>
                {coordinadoresDisponibles.map((coordinador) => (
                  <SelectItem key={coordinador.id} value={coordinador.id}>
                    {coordinador.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => setDialogCoordinadorOpen(true)}
              variant="outline"
              className="h-11 gap-2 whitespace-nowrap w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span className="sm:hidden lg:inline">Crear coordinador/a</span>
              <span className="hidden sm:inline lg:hidden">Nuevo</span>
            </Button>
          </div>

          {selectedCoordinador && (
            <div className="bg-muted/50 rounded-lg p-3 md:p-4">
              <p className="text-xs md:text-sm text-muted-foreground">Coordinador/a seleccionado:</p>
              <p className="font-medium text-foreground">{selectedCoordinador.nombre}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Email: {selectedCoordinador.email}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Tel: {selectedCoordinador.telefono}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 md:mt-8">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="px-6 h-11 rounded-full w-full sm:w-auto"
        >
          Atrás
        </Button>
        <Button 
          onClick={onNext}
          disabled={!isValid}
          className="px-8 h-11 rounded-full w-full sm:w-auto"
        >
          Siguiente
        </Button>
      </div>

      {/* Create Conductor Dialog */}
      <Dialog open={dialogConductorOpen} onOpenChange={setDialogConductorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nuevo conductor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreConductor">Nombre completo</Label>
              <Input
                id="nombreConductor"
                value={newConductor.nombre}
                onChange={(e) => setNewConductor(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre del conductor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cedulaConductor">Cédula</Label>
              <Input
                id="cedulaConductor"
                value={newConductor.cedula}
                onChange={(e) => setNewConductor(prev => ({ ...prev, cedula: e.target.value }))}
                placeholder="Número de cédula"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefonoConductor">Teléfono</Label>
              <Input
                id="telefonoConductor"
                value={newConductor.telefono}
                onChange={(e) => setNewConductor(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licencia">Tipo de licencia</Label>
              <Select 
                value={newConductor.licencia} 
                onValueChange={(value) => setNewConductor(prev => ({ ...prev, licencia: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar licencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                  <SelectItem value="C3">C3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogConductorOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateConductor}
              disabled={!newConductor.nombre || !newConductor.cedula || !newConductor.licencia}
            >
              Crear conductor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Coordinador Dialog */}
      <Dialog open={dialogCoordinadorOpen} onOpenChange={setDialogCoordinadorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nuevo coordinador/a</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreCoordinador">Nombre completo</Label>
              <Input
                id="nombreCoordinador"
                value={newCoordinador.nombre}
                onChange={(e) => setNewCoordinador(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre del coordinador/a"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cedulaCoordinador">Cédula</Label>
              <Input
                id="cedulaCoordinador"
                value={newCoordinador.cedula}
                onChange={(e) => setNewCoordinador(prev => ({ ...prev, cedula: e.target.value }))}
                placeholder="Número de cédula"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailCoordinador">Email</Label>
              <Input
                id="emailCoordinador"
                type="email"
                value={newCoordinador.email}
                onChange={(e) => setNewCoordinador(prev => ({ ...prev, email: e.target.value }))}
                placeholder="correo@escuela.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefonoCoordinador">Teléfono</Label>
              <Input
                id="telefonoCoordinador"
                value={newCoordinador.telefono}
                onChange={(e) => setNewCoordinador(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="Número de teléfono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogCoordinadorOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateCoordinador}
              disabled={!newCoordinador.nombre || !newCoordinador.cedula || !newCoordinador.email}
            >
              Crear coordinador/a
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Step2AsignarResponsables;
