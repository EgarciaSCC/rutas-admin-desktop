import { 
  GraduationCap, 
  Users, 
  UserCheck, 
  DollarSign, 
  FileText, 
  UserCircle, 
  Package, 
  Bus, 
  Calendar, 
  Award, 
  Lock, 
  Settings 
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import logoNexuscore from "@/assets/logo-nexuscore.png";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: GraduationCap, label: "Gestión Académica", path: "/gestion-academica" },
  { icon: Users, label: "Admisiones", path: "/admisiones" },
  { icon: UserCheck, label: "Estudiantes", path: "/estudiantes" },
  { icon: DollarSign, label: "Pagos", path: "/pagos" },
  { icon: FileText, label: "Formularios", path: "/formularios" },
  { icon: UserCircle, label: "Personas", path: "/personas" },
  { icon: Package, label: "Activos", path: "/activos" },
  { icon: Bus, label: "Rutas", path: "/" },
  { icon: Calendar, label: "Agendas", path: "/agendas" },
  { icon: Award, label: "Certificaciones", path: "/certificaciones" },
  { icon: Lock, label: "Control de Accesos", path: "/control-accesos" },
  { icon: Settings, label: "Personalización", path: "/personalizacion" },
];

const AppSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/rutas");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-48 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-2 border-b border-sidebar-border">
        <img 
          src={logoNexuscore} 
          alt="NexusCore Académico" 
          className="h-8 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-hide">
        <ul className="space-y-0.5 px-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                    ${active 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary" 
                      : "text-sidebar-foreground hover:bg-muted"
                    }
                  `}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-sidebar-primary" : ""}`} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AppSidebar;
