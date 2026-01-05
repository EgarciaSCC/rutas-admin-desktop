import { useState } from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 lg:hidden">
            <AppSidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
