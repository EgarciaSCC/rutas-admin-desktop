import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle, CheckCircle, XCircle, Clock, Info, Bell, User, MapPin
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { rutas, estudiantes, Novedad } from "@/services/mockData";
import { useToast } from "@/hooks/use-toast";

interface NovedadDetalleModalProps {
  novedad: Novedad | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAprobar: (novedad: Novedad, comentario: string) => void;
  onRechazar: (novedad: Novedad, comentario: string) => void;
}

const NovedadDetalleModal = ({ novedad, open, onOpenChange, onAprobar, onRechazar }: NovedadDetalleModalProps) => {
  const { toast } = useToast();
  const [showRejectField, setShowRejectField] = useState(false);
  const [comentario, setComentario] = useState("");

  if (!novedad) return null;

  const getRutaNombre = (rutaId: string) => rutas.find(r => r.id === rutaId)?.nombre || "Ruta desconocida";
  const getEstudianteNombre = (estudianteId?: string) => {
    if (!estudianteId) return null;
    return estudiantes.find(e => e.id === estudianteId)?.nombre || null;
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      'cancelacion_ruta': 'Cancelación de Ruta',
      'cancelacion_parada': 'Cancelación de Parada',
      'cambio_horario': 'Cambio de Horario',
      'incidente': 'Incidente',
      'otro': 'Otro'
    };
    return labels[categoria] || categoria;
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'alerta': return <Bell className="w-4 h-4 text-warning" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getEstadoBadge = (estado: string | null) => {
    switch (estado) {
      case 'aprobada': return <Badge className="bg-success/20 text-success text-xs"><CheckCircle className="w-3 h-3 mr-1" />Aprobada</Badge>;
      case 'rechazada': return <Badge className="bg-destructive/20 text-destructive text-xs"><XCircle className="w-3 h-3 mr-1" />Rechazada</Badge>;
      case 'pendiente': return <Badge className="bg-warning/20 text-warning text-xs"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      default: return null;
    }
  };

  const handleAprobar = () => {
    onAprobar(novedad, comentario);
    setComentario("");
    setShowRejectField(false);
    onOpenChange(false);
  };

  const handleRechazar = () => {
    if (!comentario.trim()) {
      toast({ title: "Comentario requerido", description: "Debe indicar el motivo del rechazo.", variant: "destructive" });
      return;
    }
    onRechazar(novedad, comentario);
    setComentario("");
    setShowRejectField(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setShowRejectField(false);
    setComentario("");
    onOpenChange(false);
  };

  const isPending = novedad.requiereAprobacion && novedad.estadoAprobacion === 'pendiente';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            {getTipoIcon(novedad.tipo)}
            <span className="truncate">{novedad.titulo}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Estado y fecha */}
          <div className="flex items-center justify-between">
            {getEstadoBadge(novedad.estadoAprobacion)}
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(novedad.createdAt), "dd MMMM yyyy, HH:mm", { locale: es })}
            </span>
          </div>

          {/* Mensaje */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-foreground">{novedad.mensaje}</p>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Ruta:</span>
              <span className="font-medium truncate">{getRutaNombre(novedad.rutaId)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Categoría:</span>
              <Badge variant="outline" className="ml-1 text-[10px] h-5">{getCategoriaLabel(novedad.categoria)}</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Creado por:</span>
              <span className="font-medium truncate">{novedad.creadoPor}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Rol:</span>
              <span className="font-medium capitalize ml-1">{novedad.rolCreador}</span>
            </div>
            {novedad.estudianteId && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Estudiante:</span>
                <span className="font-medium ml-1">{getEstudianteNombre(novedad.estudianteId)}</span>
              </div>
            )}
          </div>

          {/* Info de aprobación si ya fue procesada */}
          {novedad.aprobadoPor && (
            <>
              <Separator />
              <div className="p-2.5 bg-muted rounded-lg text-xs space-y-1">
                <p><span className="text-muted-foreground">Procesado por:</span> <span className="font-medium">{novedad.aprobadoPor}</span></p>
                <p><span className="text-muted-foreground">Fecha:</span> <span className="font-medium">{novedad.fechaAprobacion && format(new Date(novedad.fechaAprobacion), "dd MMM yyyy, HH:mm", { locale: es })}</span></p>
                {novedad.comentarioAprobacion && (
                  <p><span className="text-muted-foreground">Comentario:</span> <span className="font-medium">{novedad.comentarioAprobacion}</span></p>
                )}
              </div>
            </>
          )}

          {/* Acciones de aprobación */}
          {isPending && (
            <>
              <Separator />
              
              {showRejectField ? (
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Indique el motivo del rechazo..." 
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="h-20 text-xs resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" className="h-8 text-xs gap-1.5 flex-1" onClick={handleRechazar}>
                      <XCircle className="w-3.5 h-3.5" />Confirmar Rechazo
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setShowRejectField(false); setComentario(""); }}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" className="h-8 text-xs gap-1.5 flex-1" onClick={handleAprobar}>
                    <CheckCircle className="w-3.5 h-3.5" />Aprobar
                  </Button>
                  <Button size="sm" variant="destructive" className="h-8 text-xs gap-1.5 flex-1" onClick={() => setShowRejectField(true)}>
                    <XCircle className="w-3.5 h-3.5" />Rechazar
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NovedadDetalleModal;
