import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onMenuClick?: () => void;
}

const AppHeader = ({ onMenuClick }: AppHeaderProps) => {
  return (
    <header className="h-12 bg-primary flex items-center justify-between px-3 lg:px-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-primary-foreground hover:bg-primary/80"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar..." 
            className="pl-9 w-48 lg:w-56 bg-card border-none rounded-full h-8 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground hover:bg-primary/80 relative"
        >
          <Bell className="w-5 h-5" />
        </Button>

        {/* User menu */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar className="h-7 w-7 border-2 border-primary-foreground/20">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">AD</AvatarFallback>
          </Avatar>
          <span className="text-primary-foreground font-medium text-sm hidden sm:block">Admin</span>
          <ChevronDown className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
