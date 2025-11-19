import { Lock, Users, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { messages } from "@/constants/messages";

export type SharingState = 
  | "PRIVATE"           // Pas de partage du tout
  | "PRIVATE_SHARED"    // Partagé avec des utilisateurs spécifiques
  | "PUBLIC";           // Partagé publiquement

interface VisibilityBadgeProps {
  sharingState: SharingState;
  shareCount?: number;
}

export const VisibilityBadge = ({ sharingState, shareCount }: VisibilityBadgeProps) => {
  const tooltips = messages.tooltips.prompts;
  
  const configs = {
    PRIVATE: {
      icon: Lock,
      label: "Privé",
      variant: "secondary" as const,
      className: "bg-muted/50 text-muted-foreground border-muted",
      tooltip: "Ce prompt est privé et uniquement visible par vous"
    },
    PRIVATE_SHARED: {
      icon: Users,
      label: shareCount ? `Partagé (${shareCount})` : "Partagé",
      variant: "outline" as const,
      className: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
      tooltip: shareCount ? `Partagé avec ${shareCount} utilisateur(s)` : "Partagé avec des utilisateurs spécifiques"
    },
    PUBLIC: {
      icon: Globe,
      label: "Public",
      variant: "outline" as const,
      className: "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400",
      tooltip: "Ce prompt est visible par tous les utilisateurs"
    }
  };

  const config = configs[sharingState];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
