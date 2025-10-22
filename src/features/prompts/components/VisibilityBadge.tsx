import { Lock, Users, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type SharingState = 
  | "PRIVATE"           // Pas de partage du tout
  | "PRIVATE_SHARED"    // Partagé avec des utilisateurs spécifiques
  | "PUBLIC";           // Partagé publiquement

interface VisibilityBadgeProps {
  sharingState: SharingState;
  shareCount?: number;
}

export const VisibilityBadge = ({ sharingState, shareCount }: VisibilityBadgeProps) => {
  const configs = {
    PRIVATE: {
      icon: Lock,
      label: "Privé",
      variant: "secondary" as const,
      className: "bg-muted/50 text-muted-foreground border-muted"
    },
    PRIVATE_SHARED: {
      icon: Users,
      label: shareCount ? `Partagé (${shareCount})` : "Partagé",
      variant: "outline" as const,
      className: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400"
    },
    PUBLIC: {
      icon: Globe,
      label: "Public",
      variant: "outline" as const,
      className: "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400"
    }
  };

  const config = configs[sharingState];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};
