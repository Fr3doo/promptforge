import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertCircle, Info } from "lucide-react";
import type { FeatureStatus } from "@/data/faqData";

interface FeatureStatusBadgeProps {
  status: FeatureStatus;
  showLabel?: boolean;
}

const statusConfig: Record<FeatureStatus, {
  label: string;
  icon: typeof Check;
  className: string;
}> = {
  available: {
    label: "Disponible",
    icon: Check,
    className: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 hover:bg-green-500/30"
  },
  partial: {
    label: "Partiel",
    icon: AlertCircle,
    className: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
  },
  "coming-soon": {
    label: "À venir",
    icon: Clock,
    className: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
  },
  informational: {
    label: "Info",
    icon: Info,
    className: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/30"
  }
};

export const FeatureStatusBadge = ({ status, showLabel = true }: FeatureStatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} text-xs font-medium gap-1 transition-colors`}
    >
      <Icon className="h-3 w-3" />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
};
