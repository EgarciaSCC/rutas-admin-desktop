import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Bus, Users, MapPin, MoreHorizontal, Pencil, Trash2,
  LayoutGrid, List, Grid3X3, Search, Filter, X, Map, LayoutList,
  Eye, Bell, BarChart3, ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { rutas, buses, conductores, sedes, novedades, Ruta } from "@/services/mockData";
import RutasMapView from "@/components/rutas/RutasMapView";
import ActionCard from "@/components/rutas/ActionCard";
import VerRutaDialog from "@/components/rutas/VerRutaDialog";
import CrearNovedadDialog from "@/components/rutas/CrearNovedadDialog";
import ReportesDialog from "@/components/rutas/ReportesDialog";

type ViewMode = 'compact' | 'expanded' | 'list';
type MainView = 'list' | 'map';

const RutasList = () => {
  const navigate = useNavigate();
  const [rutasList] = useState<Ruta[]>(rutas);
  const [mainView, setMainView] = useState<MainView>('list');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterSede, setFilterSede] = useState<string>('todas');
  
  // Dialog states
  const [selectedRutaForView, setSelectedRutaForView] = useState<Ruta | null>(null);
  const [showNovedadDialog, setShowNovedadDialog] = useState(false);
  const [showReportesDialog, setShowReportesDialog] = useState(false);

  // Count pending approvals
  const pendingApprovals = novedades.filter(n => n.requiereAprobacion && n.estadoAprobacion === 'pendiente').length;

  const getBusInfo = (busId: string) => buses.find((b) => b.id === busId);
  const getConductorNombre = (conductorId: string) => conductores.find((c) => c.id === conductorId)?.nombre || "Sin asignar";
  const getSedeNombre = (sedeId: string) => sedes.find((s) => s.id === sedeId)?.nombre || "Sin asignar";

  const filteredRutas = useMemo(() => {
    return rutasList.filter(ruta => {
      const matchesSearch = ruta.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getConductorNombre(ruta.conductorId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getSedeNombre(ruta.sedeId).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEstado = filterEstado === 'todos' || ruta.estado === filterEstado;
      const matchesSede = filterSede === 'todas' || ruta.sedeId === filterSede;
      return matchesSearch && matchesEstado && matchesSede;
    });
  }, [rutasList, searchQuery, filterEstado, filterSede]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterEstado('todos');
    setFilterSede('todas');
  };

  const hasActiveFilters = searchQuery || filterEstado !== 'todos' || filterSede !== 'todas';

  const renderCompactCard = (ruta: Ruta) => (
    <Card key={ruta.id} className="border-border hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-start justify-between pb-1 pt-2 px-2.5">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">{ruta.nombre}</CardTitle>
          <Badge variant={ruta.estado === "activa" ? "default" : "secondary"} className="mt-0.5 text-[10px] h-4">
            {ruta.estado === "activa" ? "Activa" : "Inactiva"}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2 text-xs" onClick={() => setSelectedRutaForView(ruta)}>
              <Eye className="w-3 h-3" />Ver Ruta
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs"><Pencil className="w-3 h-3" />Editar</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs text-destructive"><Trash2 className="w-3 h-3" />Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pt-1 pb-2 px-2.5 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{getSedeNombre(ruta.sedeId)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-3 h-3" />
          <span className="truncate">{getConductorNombre(ruta.conductorId)}</span>
        </div>
      </CardContent>
    </Card>
  );

  const renderExpandedCard = (ruta: Ruta) => {
    const bus = getBusInfo(ruta.busId);
    return (
      <Card key={ruta.id} className="border-border hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between pb-1 pt-2 px-2.5">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">{ruta.nombre}</CardTitle>
            <Badge variant={ruta.estado === "activa" ? "default" : "secondary"} className="mt-1 text-[10px] h-4">
              {ruta.estado === "activa" ? "Activa" : "Inactiva"}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => setSelectedRutaForView(ruta)}>
                <Eye className="w-3 h-3" />Ver Ruta
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs"><Pencil className="w-3 h-3" />Editar</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs text-destructive"><Trash2 className="w-3 h-3" />Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-1 pb-2 px-2.5">
          <div className="flex items-center gap-2 text-xs">
            <Bus className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Bus:</span>
            <span className="font-medium text-foreground">{bus?.placa || 'Sin asignar'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Conductor:</span>
            <span className="font-medium text-foreground truncate">{getConductorNombre(ruta.conductorId)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Sede:</span>
            <span className="font-medium text-foreground truncate">{getSedeNombre(ruta.sedeId)}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListView = () => (
    <Card className="border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-xs">Nombre</TableHead>
            <TableHead className="font-semibold text-xs">Estado</TableHead>
            <TableHead className="font-semibold text-xs">Sede</TableHead>
            <TableHead className="font-semibold text-xs">Conductor</TableHead>
            <TableHead className="font-semibold text-xs">Bus</TableHead>
            <TableHead className="text-right font-semibold text-xs">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRutas.map((ruta) => {
            const bus = getBusInfo(ruta.busId);
            return (
              <TableRow key={ruta.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-xs py-2">{ruta.nombre}</TableCell>
                <TableCell className="py-2">
                  <Badge variant={ruta.estado === "activa" ? "default" : "secondary"} className="text-[10px] h-4">
                    {ruta.estado === "activa" ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs py-2">{getSedeNombre(ruta.sedeId)}</TableCell>
                <TableCell className="text-xs py-2">{getConductorNombre(ruta.conductorId)}</TableCell>
                <TableCell className="text-xs py-2">{bus?.placa || '-'}</TableCell>
                <TableCell className="text-right py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2 text-xs" onClick={() => setSelectedRutaForView(ruta)}>
                        <Eye className="w-3 h-3" />Ver Ruta
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-xs"><Pencil className="w-3 h-3" />Editar</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-xs text-destructive"><Trash2 className="w-3 h-3" />Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div className="p-3 md:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Rutas</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gestiona las rutas de transporte escolar</p>
        </div>
        <Button onClick={() => navigate("/rutas/crear")} className="gap-2 rounded-full px-4 py-1.5 h-8 text-sm w-full sm:w-auto">
          <Plus className="w-3.5 h-3.5" />
          Crear nueva ruta
        </Button>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3 mb-4">
        <ActionCard
          icon={LayoutList}
          label="Gestión de Rutas"
          onClick={() => setMainView('list')}
          active={mainView === 'list'}
        />
        <ActionCard
          icon={Map}
          label="Mapa en Vivo"
          onClick={() => setMainView('map')}
          active={mainView === 'map'}
          badge="En tiempo real"
          badgeColor="success"
        />
        <ActionCard
          icon={ClipboardCheck}
          label="Gestión Novedades"
          onClick={() => navigate("/rutas/novedades")}
          badge={pendingApprovals > 0 ? `${pendingApprovals} pendientes` : undefined}
          badgeColor="warning"
        />
        <ActionCard
          icon={Bell}
          label="Crear Novedad"
          onClick={() => setShowNovedadDialog(true)}
        />
        <ActionCard
          icon={BarChart3}
          label="Reportes"
          onClick={() => setShowReportesDialog(true)}
        />
      </div>

      {/* Map View */}
      {mainView === 'map' && <RutasMapView rutas={rutasList} />}

      {/* List View Content */}
      {mainView === 'list' && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-2 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Rutas</CardTitle>
                <Bus className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent className="pb-2 px-3">
                <div className="text-xl font-bold text-foreground">{rutasList.length}</div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-2 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Buses Activos</CardTitle>
                <Bus className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent className="pb-2 px-3">
                <div className="text-xl font-bold text-foreground">{buses.filter((b) => b.estado === "activo").length}</div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-2 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Conductores Disponibles</CardTitle>
                <Users className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent className="pb-2 px-3">
                <div className="text-xl font-bold text-foreground">{conductores.filter((c) => c.estado === "disponible").length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Buscar rutas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-full sm:w-[120px] h-8 text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="inactiva">Inactiva</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSede} onValueChange={setFilterSede}>
                <SelectTrigger className="w-full sm:w-[140px] h-8 text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las sedes</SelectItem>
                  {sedes.map(sede => (
                    <SelectItem key={sede.id} value={sede.id}>{sede.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1.5 ml-auto">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 h-7 text-xs px-2">
                    <X className="w-3 h-3" />
                    <span className="hidden sm:inline">Limpiar</span>
                  </Button>
                )}

                <div className="hidden md:flex border border-border rounded-md overflow-hidden">
                  <Button variant={viewMode === 'compact' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('compact')} className="rounded-none h-7 w-7">
                    <Grid3X3 className="w-3 h-3" />
                  </Button>
                  <Button variant={viewMode === 'expanded' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('expanded')} className="rounded-none h-7 w-7 border-x border-border">
                    <LayoutGrid className="w-3 h-3" />
                  </Button>
                  <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="rounded-none h-7 w-7">
                    <List className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <p className="text-xs text-muted-foreground mb-3">Mostrando {filteredRutas.length} de {rutasList.length} rutas</p>
          )}

          {viewMode === 'list' ? (
            <div className="hidden md:block">{renderListView()}</div>
          ) : null}
          
          {(viewMode !== 'list' || window.innerWidth < 768) && (
            <div className={`grid gap-3 ${viewMode === 'compact' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {filteredRutas.map((ruta) => viewMode === 'compact' ? renderCompactCard(ruta) : renderExpandedCard(ruta))}
              <Card className="border-dashed border-2 border-border hover:border-primary/50 cursor-pointer transition-colors duration-200 flex items-center justify-center min-h-[100px]" onClick={() => navigate("/rutas/crear")}>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-xs">Agregar ruta</p>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <VerRutaDialog ruta={selectedRutaForView} open={!!selectedRutaForView} onOpenChange={(open) => !open && setSelectedRutaForView(null)} />
      <CrearNovedadDialog rutas={rutasList} open={showNovedadDialog} onOpenChange={setShowNovedadDialog} />
      <ReportesDialog open={showReportesDialog} onOpenChange={setShowReportesDialog} />
    </div>
  );
};

export default RutasList;
