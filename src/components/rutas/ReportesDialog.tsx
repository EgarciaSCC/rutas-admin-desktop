import { useState, useRef, useEffect } from 'react';
import { Ruta, HistorialRuta, Novedad, Conductor, Bus } from '@/services/types';
import apiClient from '@/services/apiClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, Calendar, Clock, Users, MapPin, 
  CheckCircle, XCircle, AlertTriangle, Bell,
  FileText, FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { toast } from 'sonner';

interface ReportesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportesDialog = ({ open, onOpenChange }: ReportesDialogProps) => {
  const [selectedRuta, setSelectedRuta] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [historialRutas, setHistorialRutas] = useState<HistorialRuta[]>([]);
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);

  useEffect(() => {
    (async () => {
      const [rRes, hRes, nRes, cRes, bRes] = await Promise.all([
        apiClient.fallbackGetRutas(),
        apiClient.fallbackGetHistorial(),
        apiClient.fallbackGetNovedades(),
        apiClient.fallbackGetConductores(),
        apiClient.fallbackGetBuses(),
      ]);
      if (rRes.success && rRes.data) setRutas(rRes.data);
      if (hRes.success && hRes.data) setHistorialRutas(hRes.data);
      if (nRes.success && nRes.data) setNovedades(nRes.data);
      if (cRes.success && cRes.data) setConductores(cRes.data);
      if (bRes.success && bRes.data) setBuses(bRes.data);
    })();
  }, []);

  const filteredHistorial = selectedRuta === 'all' 
    ? historialRutas 
    : historialRutas.filter(h => h.rutaId === selectedRuta);

  const filteredNovedades = selectedRuta === 'all'
    ? novedades
    : novedades.filter(n => n.rutaId === selectedRuta);

  const getRutaName = (rutaId: string) => rutas.find(r => r.id === rutaId)?.nombre || 'Desconocida';
  const getBusPlaca = (rutaId: string) => {
    const ruta = rutas.find(r => r.id === rutaId);
    return ruta ? buses.find(b => b.id === ruta.busId)?.placa : 'N/A';
  };

  const estadoConfig = {
    completada: { icon: CheckCircle, color: 'text-success', badge: 'default' as const },
    parcial: { icon: AlertTriangle, color: 'text-amber-500', badge: 'secondary' as const },
    cancelada: { icon: XCircle, color: 'text-destructive', badge: 'destructive' as const },
  };

  const tipoNovedadConfig = {
    info: { color: 'bg-blue-500' },
    alerta: { color: 'bg-amber-500' },
    urgente: { color: 'bg-destructive' },
  };

  // Stats
  const totalViajes = filteredHistorial.length;
  const viajesCompletados = filteredHistorial.filter(h => h.estado === 'completada').length;
  const viajesCancelados = filteredHistorial.filter(h => h.estado === 'cancelada').length;
  const viajesParciales = filteredHistorial.filter(h => h.estado === 'parcial').length;
  const totalKm = filteredHistorial.reduce((acc, h) => acc + h.kmRecorridos, 0);
  const totalEstudiantes = filteredHistorial.reduce((acc, h) => acc + h.estudiantesRecogidos, 0);

  // Chart data
  const estadosData = [
    { name: 'Completadas', value: viajesCompletados, color: '#22c55e' },
    { name: 'Parciales', value: viajesParciales, color: '#f59e0b' },
    { name: 'Canceladas', value: viajesCancelados, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Group historial by date for line chart
  const historialPorFecha = filteredHistorial.reduce((acc, h) => {
    const fecha = h.fecha;
    if (!acc[fecha]) {
      acc[fecha] = { fecha, viajes: 0, estudiantes: 0, km: 0 };
    }
    acc[fecha].viajes += 1;
    acc[fecha].estudiantes += h.estudiantesRecogidos;
    acc[fecha].km += h.kmRecorridos;
    return acc;
  }, {} as Record<string, { fecha: string; viajes: number; estudiantes: number; km: number }>);

  const lineChartData = Object.values(historialPorFecha).sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  // Rutas bar chart data
  const rutasBarData = rutas.map(r => {
    const rutaHistorial = historialRutas.filter(h => h.rutaId === r.id);
    return {
      nombre: r.nombre.length > 10 ? r.nombre.substring(0, 10) + '...' : r.nombre,
      viajes: rutaHistorial.length,
      estudiantes: rutaHistorial.reduce((acc, h) => acc + h.estudiantesRecogidos, 0),
    };
  });

  // Simple CSV export function
  const exportToCSV = () => {
    setIsExporting(true);
    try {
      // Build CSV content
      let csvContent = 'Reporte de Rutas Escolares\n';
      csvContent += `Generado: ${new Date().toLocaleDateString('es-CO')}\n`;
      csvContent += `Filtro: ${selectedRuta === 'all' ? 'Todas las rutas' : getRutaName(selectedRuta)}\n\n`;
      
      // Statistics
      csvContent += 'ESTADISTICAS\n';
      csvContent += `Total de viajes,${totalViajes}\n`;
      csvContent += `Viajes completados,${viajesCompletados}\n`;
      csvContent += `Viajes parciales,${viajesParciales}\n`;
      csvContent += `Viajes cancelados,${viajesCancelados}\n`;
      csvContent += `Km recorridos,${totalKm.toFixed(1)}\n`;
      csvContent += `Estudiantes transportados,${totalEstudiantes}\n\n`;
      
      // Historial
      csvContent += 'HISTORIAL DE RECORRIDOS\n';
      csvContent += 'Ruta,Fecha,Hora Inicio,Hora Fin,Estudiantes Recogidos,Estudiantes Totales,Km Recorridos,Estado\n';
      filteredHistorial.forEach(h => {
        csvContent += `${getRutaName(h.rutaId)},${h.fecha},${h.horaInicio},${h.horaFin},${h.estudiantesRecogidos},${h.estudiantesTotales},${h.kmRecorridos},${h.estado}\n`;
      });
      
      csvContent += '\nNOVEDADES\n';
      csvContent += 'Ruta,Tipo,Titulo,Mensaje,Fecha,Creado por\n';
      filteredNovedades.forEach(n => {
        csvContent += `${getRutaName(n.rutaId)},${n.tipo},"${n.titulo}","${n.mensaje}",${new Date(n.createdAt).toLocaleString('es-CO')},${n.creadoPor}\n`;
      });

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reporte_rutas_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast.success('Archivo CSV descargado correctamente');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Error al exportar CSV');
    } finally {
      setIsExporting(false);
    }
  };

  // Print as PDF (using browser print)
  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const printContent = chartsRef.current;
      if (!printContent) {
        toast.error('No se pudo generar el PDF');
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Por favor, permite las ventanas emergentes para descargar el PDF');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reporte de Rutas Escolares</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
            .stat-card { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #333; }
            .stat-label { font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .section-title { margin-top: 30px; color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>Reporte de Rutas Escolares</h1>
          <p style="text-align: center; color: #666;">Generado: ${new Date().toLocaleDateString('es-CO', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</p>
          ${selectedRuta !== 'all' ? `<p style="text-align: center;">Ruta: ${getRutaName(selectedRuta)}</p>` : ''}
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalViajes}</div>
              <div class="stat-label">Total Viajes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #22c55e;">${viajesCompletados}</div>
              <div class="stat-label">Completados</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalKm.toFixed(1)}</div>
              <div class="stat-label">Km Recorridos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalEstudiantes}</div>
              <div class="stat-label">Estudiantes</div>
            </div>
          </div>

          <h3 class="section-title">Historial de Recorridos</h3>
          <table>
            <thead>
              <tr>
                <th>Ruta</th>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Estudiantes</th>
                <th>Km</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filteredHistorial.map(h => `
                <tr>
                  <td>${getRutaName(h.rutaId)}</td>
                  <td>${new Date(h.fecha).toLocaleDateString('es-CO')}</td>
                  <td>${h.horaInicio} - ${h.horaFin}</td>
                  <td>${h.estudiantesRecogidos}/${h.estudiantesTotales}</td>
                  <td>${h.kmRecorridos}</td>
                  <td>${h.estado}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 class="section-title">Novedades</h3>
          <table>
            <thead>
              <tr>
                <th>Ruta</th>
                <th>Tipo</th>
                <th>Título</th>
                <th>Mensaje</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              ${filteredNovedades.map(n => `
                <tr>
                  <td>${getRutaName(n.rutaId)}</td>
                  <td>${n.tipo}</td>
                  <td>${n.titulo}</td>
                  <td>${n.mensaje}</td>
                  <td>${new Date(n.createdAt).toLocaleString('es-CO')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        toast.success('PDF listo para imprimir/guardar');
      }, 500);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error al generar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Reportes e Historial
          </DialogTitle>
        </DialogHeader>

        {/* Filtro y Botones de Exportación */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtrar:</span>
            <Select value={selectedRuta} onValueChange={setSelectedRuta}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las rutas</SelectItem>
                {rutas.map(ruta => (
                  <SelectItem key={ruta.id} value={ruta.id}>{ruta.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              disabled={isExporting}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={isExporting}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel/CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{totalViajes}</p>
              <p className="text-xs text-muted-foreground">Total Viajes</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-success">{viajesCompletados}</p>
              <p className="text-xs text-muted-foreground">Completados</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{totalKm.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Km Recorridos</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{totalEstudiantes}</p>
              <p className="text-xs text-muted-foreground">Estudiantes</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div ref={chartsRef} className="bg-card p-4 rounded-lg border mb-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Gráficas Estadísticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bar Chart - Viajes por Ruta */}
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2 text-center">Viajes por Ruta</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={rutasBarData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="viajes" name="Viajes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="estudiantes" name="Estudiantes" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Estados */}
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2 text-center">Estado de Viajes</h4>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={estadosData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {estadosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart - Tendencia */}
            <div className="bg-muted/30 rounded-lg p-3 md:col-span-2">
              <h4 className="text-sm font-medium mb-2 text-center">Tendencia de Actividad</h4>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="fecha" 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-CO')}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="estudiantes" 
                    name="Estudiantes"
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="km" 
                    name="Km"
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <Tabs defaultValue="historial">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="historial">Historial de Rutas</TabsTrigger>
            <TabsTrigger value="novedades">Novedades</TabsTrigger>
          </TabsList>

          <TabsContent value="historial" className="mt-4 space-y-3 max-h-[300px] overflow-y-auto">
            {filteredHistorial.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay registros de viajes</p>
            ) : (
              filteredHistorial.map(hist => {
                const config = estadoConfig[hist.estado];
                const Icon = config.icon;
                return (
                  <Card key={hist.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="font-medium">{getRutaName(hist.rutaId)}</span>
                          <Badge variant={config.badge} className="capitalize text-[10px]">
                            {hist.estado}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(hist.fecha).toLocaleDateString('es-CO')}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{hist.horaInicio} - {hist.horaFin}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span>{hist.estudiantesRecogidos}/{hist.estudiantesTotales} estudiantes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{hist.kmRecorridos} km</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Bus: {getBusPlaca(hist.rutaId)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="novedades" className="mt-4 space-y-3 max-h-[300px] overflow-y-auto">
            {filteredNovedades.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay novedades registradas</p>
            ) : (
              filteredNovedades.map(nov => (
                <Card key={nov.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-full min-h-[60px] rounded-full ${tipoNovedadConfig[nov.tipo].color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{nov.titulo}</span>
                            <Badge variant="outline" className="text-[10px]">{getRutaName(nov.rutaId)}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(nov.createdAt).toLocaleString('es-CO')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{nov.mensaje}</p>
                        <p className="text-xs text-muted-foreground mt-2">Por: {nov.creadoPor}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ReportesDialog;
