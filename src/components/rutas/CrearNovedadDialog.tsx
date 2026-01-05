import { useState } from 'react';
import { Ruta, apiResponses } from '@/services/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, AlertTriangle, Info, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface CrearNovedadDialogProps {
  rutas: Ruta[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CrearNovedadDialog = ({ rutas, open, onOpenChange }: CrearNovedadDialogProps) => {
  const [rutaId, setRutaId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipo, setTipo] = useState<'info' | 'alerta' | 'urgente'>('info');
  const [categoria, setCategoria] = useState<'cancelacion_ruta' | 'cancelacion_parada' | 'cambio_horario' | 'incidente' | 'otro'>('otro');
  const [loading, setLoading] = useState(false);

  const categoriasQueRequierenAprobacion = ['cancelacion_ruta', 'cancelacion_parada', 'cambio_horario'];

  const handleSubmit = async () => {
    if (!rutaId || !titulo || !mensaje) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const requiereAprobacion = categoriasQueRequierenAprobacion.includes(categoria);
      await apiResponses.createNovedad({
        rutaId,
        titulo,
        mensaje,
        tipo,
        categoria,
        requiereAprobacion,
        estadoAprobacion: requiereAprobacion ? 'pendiente' : null,
        creadoPor: 'Usuario Actual',
        rolCreador: 'administrador',
      });
      
      toast.success('Novedad creada y notificación enviada');
      setRutaId('');
      setTitulo('');
      setMensaje('');
      setTipo('info');
      setCategoria('otro');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al crear la novedad');
    } finally {
      setLoading(false);
    }
  };

  const tipoConfig = {
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    alerta: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    urgente: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Crear Novedad
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Seleccionar Ruta */}
          <div className="space-y-2">
            <Label>Ruta</Label>
            <Select value={rutaId} onValueChange={setRutaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una ruta" />
              </SelectTrigger>
              <SelectContent>
                {rutas.filter(r => r.estado === 'activa').map(ruta => (
                  <SelectItem key={ruta.id} value={ruta.id}>
                    {ruta.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Novedad */}
          <div className="space-y-2">
            <Label>Tipo de Novedad</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['info', 'alerta', 'urgente'] as const).map((t) => {
                const config = tipoConfig[t];
                const Icon = config.icon;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`
                      p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1
                      ${tipo === t 
                        ? `border-primary ${config.bg}` 
                        : 'border-border hover:border-muted-foreground/30'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    <span className="text-xs font-medium capitalize">{t}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as typeof categoria)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cancelacion_ruta">Cancelación de Ruta</SelectItem>
                <SelectItem value="cancelacion_parada">Cancelación de Parada</SelectItem>
                <SelectItem value="cambio_horario">Cambio de Horario</SelectItem>
                <SelectItem value="incidente">Incidente</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            {categoriasQueRequierenAprobacion.includes(categoria) && (
              <p className="text-xs text-warning">Esta categoría requiere aprobación del administrador.</p>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Retraso por tráfico"
            />
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea
              id="mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe el mensaje que recibirán los padres de familia..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Este mensaje será enviado como notificación push a los usuarios que siguen la ruta.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            <Send className="w-4 h-4" />
            {loading ? 'Enviando...' : 'Enviar Novedad'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CrearNovedadDialog;
