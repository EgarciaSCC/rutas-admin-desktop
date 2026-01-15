import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle, CheckCircle, XCircle, Clock, Download, Filter,
  Eye, Info, Search, Bell, User, MapPin, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Novedad, Ruta } from "@/services/types";
import { fallbackGetNovedades, fallbackGetRutas } from "@/services/apiClient";
import { useToast } from "@/hooks/use-toast";
import NovedadDetalleModal from "@/components/rutas/NovedadDetalleModal";

const GestionNovedades = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("todas");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [selectedNovedad, setSelectedNovedad] = useState<Novedad | null>(null);
  const [novedadesList, setNovedadesList] = useState<Novedad[]>([]);
  const [rutasList, setRutasList] = useState<Ruta[]>([]);

  useEffect(() => {
    (async () => {
      const [novRes, rutasRes] = await Promise.all([fallbackGetNovedades(), fallbackGetRutas()]);
      if (novRes.success && novRes.data) setNovedadesList(novRes.data);
      if (rutasRes.success && rutasRes.data) setRutasList(rutasRes.data);
    })();
  }, []);

  const getRutaNombre = (rutaId: string) => rutasList.find(r => r.id === rutaId)?.nombre || "Ruta desconocida";

  const pendientes = useMemo(() => 
    novedadesList.filter(n => n.requiereAprobacion && n.estadoAprobacion === 'pendiente'),
    [novedadesList]
  );

  const procesadas = useMemo(() => 
    novedadesList.filter(n => n.requiereAprobacion && (n.estadoAprobacion === 'aprobada' || n.estadoAprobacion === 'rechazada')),
    [novedadesList]
  );

  const informativas = useMemo(() => 
    novedadesList.filter(n => !n.requiereAprobacion),
    [novedadesList]
  );

  const filterNovedades = (list: Novedad[]) => {
    return list.filter(n => {
      const matchesSearch = n.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.mensaje.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getRutaNombre(n.rutaId).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategoria = filterCategoria === 'todas' || n.categoria === filterCategoria;
      const matchesTipo = filterTipo === 'todos' || n.tipo === filterTipo;
      return matchesSearch && matchesCategoria && matchesTipo;
    });
  };

  const handleAprobar = (novedad: Novedad, comentario: string) => {
    setNovedadesList(prev => prev.map(n => 
      n.id === novedad.id 
        ? { 
            ...n, 
            estadoAprobacion: 'aprobada' as const, 
            aprobadoPor: 'Administrador',
            fechaAprobacion: new Date().toISOString(),
            comentarioAprobacion: comentario || undefined
          }
        : n
    ));
    toast({ title: "Novedad aprobada", description: `La novedad "${novedad.titulo}" ha sido aprobada.` });
  };

  const handleRechazar = (novedad: Novedad, comentario: string) => {
    setNovedadesList(prev => prev.map(n => 
      n.id === novedad.id 
        ? { 
            ...n, 
            estadoAprobacion: 'rechazada' as const,
            aprobadoPor: 'Administrador',
            fechaAprobacion: new Date().toISOString(),
            comentarioAprobacion: comentario
          }
        : n
    ));
    toast({ title: "Novedad rechazada", description: `La novedad "${novedad.titulo}" ha sido rechazada.` });
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
      case 'urgente': return <AlertTriangle className="w-3 h-3 text-destructive" />;
      case 'alerta': return <Bell className="w-3 h-3 text-warning" />;
      default: return <Info className="w-3 h-3 text-primary" />;
    }
  };

  const getEstadoBadge = (estado: string | null) => {
    switch (estado) {
      case 'aprobada': return <Badge className="bg-success/20 text-success text-[10px]"><CheckCircle className="w-2.5 h-2.5 mr-1" />Aprobada</Badge>;
      case 'rechazada': return <Badge className="bg-destructive/20 text-destructive text-[10px]"><XCircle className="w-2.5 h-2.5 mr-1" />Rechazada</Badge>;
      case 'pendiente': return <Badge className="bg-warning/20 text-warning text-[10px]"><Clock className="w-2.5 h-2.5 mr-1" />Pendiente</Badge>;
      default: return null;
    }
  };

  const exportarReporte = () => {
    // Encabezados del Excel
    const headers = [
      'ID',
      'Título',
      'Mensaje',
      'Ruta',
      'Categoría',
      'Tipo',
      'Requiere Aprobación',
      'Estado',
      'Creado Por',
      'Rol Creador',
      'Fecha Creación',
      'Aprobado Por',
      'Fecha Aprobación',
      'Comentario Aprobación'
    ];

    // Convertir datos a filas
    const rows = novedadesList.map(n => [
      n.id,
      n.titulo,
      n.mensaje.replace(/"/g, '""'), // Escapar comillas
      getRutaNombre(n.rutaId),
      getCategoriaLabel(n.categoria),
      n.tipo,
      n.requiereAprobacion ? 'Sí' : 'No',
      n.estadoAprobacion || 'N/A',
      n.creadoPor,
      n.rolCreador,
      format(new Date(n.createdAt), "dd/MM/yyyy HH:mm", { locale: es }),
      n.aprobadoPor || '',
      n.fechaAprobacion ? format(new Date(n.fechaAprobacion), "dd/MM/yyyy HH:mm", { locale: es }) : '',
      n.comentarioAprobacion || ''
    ]);

    // Crear contenido CSV con BOM para Excel
    const BOM = '\uFEFF';
    const csvContent = [
      BOM + headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-novedades-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Reporte exportado", description: "El reporte se ha descargado. Ábrelo con Excel." });
  };

  const renderNovedadCard = (novedad: Novedad) => (
    <Card key={novedad.id} className="mb-2 border-border hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelectedNovedad(novedad)}>
      <CardContent className="p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {getTipoIcon(novedad.tipo)}
              <span className="font-medium text-xs text-foreground truncate">{novedad.titulo}</span>
              {getEstadoBadge(novedad.estadoAprobacion)}
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2 mb-1.5">{novedad.mensaje}</p>
            <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />{getRutaNombre(novedad.rutaId)}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-2.5 h-2.5" />{novedad.creadoPor} ({novedad.rolCreador})
              </span>
              <Badge variant="outline" className="text-[9px] h-4">{getCategoriaLabel(novedad.categoria)}</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {format(new Date(novedad.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={(e) => { e.stopPropagation(); setSelectedNovedad(novedad); }}>
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-3 md:p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Gestión de Novedades</h1>
          <p className="text-xs text-muted-foreground">Aprueba, rechaza y visualiza novedades de rutas</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={exportarReporte}>
          <Download className="w-3.5 h-3.5" />Exportar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Card className="border-border">
          <CardHeader className="pb-1 pt-2 px-2.5">
            <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 text-warning" />Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 px-2.5">
            <span className="text-xl font-bold text-warning">{pendientes.length}</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1 pt-2 px-2.5">
            <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-success" />Aprobadas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 px-2.5">
            <span className="text-xl font-bold text-success">{procesadas.filter(n => n.estadoAprobacion === 'aprobada').length}</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1 pt-2 px-2.5">
            <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />Rechazadas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 px-2.5">
            <span className="text-xl font-bold text-destructive">{procesadas.filter(n => n.estadoAprobacion === 'rechazada').length}</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1 pt-2 px-2.5">
            <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3 text-primary" />Informativas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 px-2.5">
            <span className="text-xl font-bold text-primary">{informativas.length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input 
            placeholder="Buscar novedades..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="cancelacion_ruta">Cancelación Ruta</SelectItem>
            <SelectItem value="cancelacion_parada">Cancelación Parada</SelectItem>
            <SelectItem value="cambio_horario">Cambio Horario</SelectItem>
            <SelectItem value="incidente">Incidente</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
            <SelectItem value="alerta">Alerta</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pendientes" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9 mb-3">
          <TabsTrigger value="pendientes" className="text-xs">
            Pendientes ({pendientes.length})
          </TabsTrigger>
          <TabsTrigger value="procesadas" className="text-xs">
            Procesadas ({procesadas.length})
          </TabsTrigger>
          <TabsTrigger value="informativas" className="text-xs">
            Informativas ({informativas.length})
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-340px)]">
          <TabsContent value="pendientes" className="mt-0">
            {filterNovedades(pendientes).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No hay novedades pendientes de aprobación
              </div>
            ) : (
              filterNovedades(pendientes).map(n => renderNovedadCard(n))
            )}
          </TabsContent>

          <TabsContent value="procesadas" className="mt-0">
            {filterNovedades(procesadas).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No hay novedades procesadas
              </div>
            ) : (
              filterNovedades(procesadas).map(n => renderNovedadCard(n))
            )}
          </TabsContent>

          <TabsContent value="informativas" className="mt-0">
            {filterNovedades(informativas).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No hay novedades informativas
              </div>
            ) : (
              filterNovedades(informativas).map(n => renderNovedadCard(n))
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Modal de detalle */}
      <NovedadDetalleModal 
        novedad={selectedNovedad}
        open={!!selectedNovedad}
        onOpenChange={(open) => !open && setSelectedNovedad(null)}
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
      />
    </div>
  );
};

export default GestionNovedades;
