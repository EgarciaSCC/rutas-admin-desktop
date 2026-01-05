import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { Plus, Bus as BusIcon } from "lucide-react";
import { Bus, Sede } from "@/services/mockData";

interface Step1FormProps {
  formData: {
    nombreRuta: string;
    busId: string;
    sedeId: string;
  };
  buses: Bus[];
  sedes: Sede[];
  onFormDataChange: (data: Partial<Step1FormProps['formData']>) => void;
  onCreateBus: (bus: Omit<Bus, 'id'>) => void;
  onNext: () => void;
}

type TipoMotor = 'combustible' | 'hibrido' | 'electrico' | 'otro';

const Step1DatosRuta = ({ formData, buses, sedes, onFormDataChange, onCreateBus, onNext }: Step1FormProps) => {
  const busesActivos = buses.filter(b => b.estado === 'activo');
  const selectedBus = buses.find(b => b.id === formData.busId);
  const isValid = formData.nombreRuta.trim() !== '' && formData.busId !== '' && formData.sedeId !== '';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBus, setNewBus] = useState({
    placa: '',
    capacidad: 40,
    marca: '',
    modelo: '',
    fechaRevisionTecnica: '',
    fechaSeguroObligatorio: '',
    tipoMotor: 'combustible' as TipoMotor,
    tipoMotorOtro: '',
  });

  const handleCreateBus = () => {
    onCreateBus({
      ...newBus,
      capacidad: Number(newBus.capacidad),
      estado: 'activo',
    });
    setDialogOpen(false);
    setNewBus({
      placa: '',
      capacidad: 40,
      marca: '',
      modelo: '',
      fechaRevisionTecnica: '',
      fechaSeguroObligatorio: '',
      tipoMotor: 'combustible',
      tipoMotorOtro: '',
    });
  };

  const isNewBusValid = newBus.placa && newBus.marca && newBus.modelo && 
    newBus.capacidad > 0 && newBus.fechaRevisionTecnica && newBus.fechaSeguroObligatorio;

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Nombre de Ruta */}
        <div className="space-y-2">
          <Label htmlFor="nombreRuta" className="text-sm font-medium text-foreground">
            Nombre de Ruta
          </Label>
          <Input
            id="nombreRuta"
            placeholder="Ej: Ruta Norte"
            value={formData.nombreRuta}
            onChange={(e) => onFormDataChange({ nombreRuta: e.target.value })}
            className="h-11"
          />
        </div>

        {/* Escoger bus */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Escoger bus
          </Label>
          <div className="flex gap-2">
            <Select 
              value={formData.busId} 
              onValueChange={(value) => onFormDataChange({ busId: value })}
            >
              <SelectTrigger className="h-11 flex-1">
                <SelectValue placeholder="Seleccionar bus" />
              </SelectTrigger>
              <SelectContent>
                {busesActivos.map((bus) => (
                  <SelectItem key={bus.id} value={bus.id}>
                    {bus.placa} - {bus.marca} {bus.modelo} ({bus.capacidad} pax)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Escoger Salida (Sede) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Escoger Salida
          </Label>
          <Select 
            value={formData.sedeId} 
            onValueChange={(value) => onFormDataChange({ sedeId: value })}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Seleccionar sede" />
            </SelectTrigger>
            <SelectContent>
              {sedes.map((sede) => (
                <SelectItem key={sede.id} value={sede.id}>
                  {sede.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bus info display */}
      {selectedBus && (
        <div className="mt-4 md:mt-6 bg-muted/50 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-3">
            <BusIcon className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground text-sm md:text-base">Información del bus seleccionado</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs md:text-sm">Placa:</span>
              <p className="font-medium">{selectedBus.placa}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs md:text-sm">Capacidad:</span>
              <p className="font-medium">{selectedBus.capacidad} pasajeros</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs md:text-sm">Marca/Modelo:</span>
              <p className="font-medium">{selectedBus.marca} {selectedBus.modelo}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs md:text-sm">Tipo motor:</span>
              <p className="font-medium capitalize">{selectedBus.tipoMotor}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      <div className="flex justify-center mt-8">
        <Button 
          onClick={onNext}
          disabled={!isValid}
          className="px-8 h-11 rounded-full"
        >
          Siguiente
        </Button>
      </div>

      {/* Create Bus Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar nuevo bus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  value={newBus.placa}
                  onChange={(e) => setNewBus(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                  placeholder="ABC123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacidad">Capacidad</Label>
                <Input
                  id="capacidad"
                  type="number"
                  value={newBus.capacidad}
                  onChange={(e) => setNewBus(prev => ({ ...prev, capacidad: Number(e.target.value) }))}
                  placeholder="40"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={newBus.marca}
                  onChange={(e) => setNewBus(prev => ({ ...prev, marca: e.target.value }))}
                  placeholder="Mercedes Benz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo (Año)</Label>
                <Input
                  id="modelo"
                  value={newBus.modelo}
                  onChange={(e) => setNewBus(prev => ({ ...prev, modelo: e.target.value }))}
                  placeholder="2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaRevision">Fecha Revisión Técnico-mecánica</Label>
                <Input
                  id="fechaRevision"
                  type="date"
                  value={newBus.fechaRevisionTecnica}
                  onChange={(e) => setNewBus(prev => ({ ...prev, fechaRevisionTecnica: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaSeguro">Fecha Seguro Obligatorio</Label>
                <Input
                  id="fechaSeguro"
                  type="date"
                  value={newBus.fechaSeguroObligatorio}
                  onChange={(e) => setNewBus(prev => ({ ...prev, fechaSeguroObligatorio: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de motor</Label>
              <Select 
                value={newBus.tipoMotor} 
                onValueChange={(value: TipoMotor) => setNewBus(prev => ({ ...prev, tipoMotor: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="combustible">Combustible</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                  <SelectItem value="electrico">Eléctrico</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newBus.tipoMotor === 'otro' && (
              <div className="space-y-2">
                <Label htmlFor="tipoMotorOtro">Especificar tipo de motor</Label>
                <Input
                  id="tipoMotorOtro"
                  value={newBus.tipoMotorOtro}
                  onChange={(e) => setNewBus(prev => ({ ...prev, tipoMotorOtro: e.target.value }))}
                  placeholder="Especifique el tipo de motor"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateBus}
              disabled={!isNewBusValid}
            >
              Registrar bus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Step1DatosRuta;
