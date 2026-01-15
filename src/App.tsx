import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import RutasList from "@/pages/rutas/RutasList";
import CrearRuta from "@/pages/rutas/CrearRuta";
import EditarRuta from "@/pages/rutas/EditarRuta";
import GestionNovedades from "@/pages/rutas/GestionNovedades";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AdminLayout>
                <RutasList />
              </AdminLayout>
            }
          />
          <Route
            path="/rutas/crear"
            element={
              <AdminLayout>
                <CrearRuta />
              </AdminLayout>
            }
          />
          <Route
            path="/rutas/editar/:id"
            element={
              <AdminLayout>
                <EditarRuta />
              </AdminLayout>
            }
          />
          <Route
            path="/rutas/novedades"
            element={
              <AdminLayout>
                <GestionNovedades />
              </AdminLayout>
            }
          />
          {/* Placeholder routes for other modules */}
          <Route
            path="/gestion-academica"
            element={
              <AdminLayout>
                <PlaceholderPage title="Gestión Académica" />
              </AdminLayout>
            }
          />
          <Route
            path="/admisiones"
            element={
              <AdminLayout>
                <PlaceholderPage title="Admisiones" />
              </AdminLayout>
            }
          />
          <Route
            path="/estudiantes"
            element={
              <AdminLayout>
                <PlaceholderPage title="Estudiantes" />
              </AdminLayout>
            }
          />
          <Route
            path="/pagos"
            element={
              <AdminLayout>
                <PlaceholderPage title="Pagos" />
              </AdminLayout>
            }
          />
          <Route
            path="/formularios"
            element={
              <AdminLayout>
                <PlaceholderPage title="Formularios" />
              </AdminLayout>
            }
          />
          <Route
            path="/personas"
            element={
              <AdminLayout>
                <PlaceholderPage title="Personas" />
              </AdminLayout>
            }
          />
          <Route
            path="/activos"
            element={
              <AdminLayout>
                <PlaceholderPage title="Activos" />
              </AdminLayout>
            }
          />
          <Route
            path="/agendas"
            element={
              <AdminLayout>
                <PlaceholderPage title="Agendas" />
              </AdminLayout>
            }
          />
          <Route
            path="/certificaciones"
            element={
              <AdminLayout>
                <PlaceholderPage title="Certificaciones" />
              </AdminLayout>
            }
          />
          <Route
            path="/control-accesos"
            element={
              <AdminLayout>
                <PlaceholderPage title="Control de Accesos" />
              </AdminLayout>
            }
          />
          <Route
            path="/personalizacion"
            element={
              <AdminLayout>
                <PlaceholderPage title="Personalización" />
              </AdminLayout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Placeholder component for other modules
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    <p className="text-muted-foreground mt-2">
      Este módulo está en desarrollo.
    </p>
  </div>
);

export default App;
