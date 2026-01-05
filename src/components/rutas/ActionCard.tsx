import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'destructive';
}

const ActionCard = ({ icon: Icon, label, onClick, active, badge, badgeColor = 'success' }: ActionCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 p-2.5 md:p-3 flex flex-col items-center justify-center gap-1.5 min-h-[80px] md:min-h-[90px]",
        active 
          ? "ring-2 ring-primary bg-primary/5 border-primary/30" 
          : "bg-card hover:bg-muted/50 border-border"
      )}
    >
      {badge && (
        <span className={cn(
          "absolute top-1 right-1 text-[8px] font-medium px-1.5 py-0.5 rounded-full animate-pulse",
          badgeColor === 'success' && "bg-success/10 text-success",
          badgeColor === 'warning' && "bg-amber-500/10 text-amber-600",
          badgeColor === 'destructive' && "bg-destructive/10 text-destructive"
        )}>
          {badge}
        </span>
      )}
      
      <div className={cn(
        "w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-colors",
        active 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary text-secondary-foreground"
      )}>
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      
      <span className={cn(
        "text-[10px] md:text-xs font-medium text-center leading-tight",
        active ? "text-primary" : "text-foreground"
      )}>
        {label}
      </span>
    </Card>
  );
};

export default ActionCard;
