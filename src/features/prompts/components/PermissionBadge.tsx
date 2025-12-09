import { Eye, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SharePermission } from "../types";
import { promptsMessages } from "@/constants/messages/prompts";

interface PermissionBadgeProps {
  permission: SharePermission;
}

/**
 * Badge visuel pour indiquer le niveau de permission sur un prompt partagé
 * - READ : orange, icône Eye, "Lecture seule"
 * - WRITE : vert, icône Pencil, "Écriture"
 */
export const PermissionBadge = ({ permission }: PermissionBadgeProps) => {
  const isReadOnly = permission === "READ";

  const label = isReadOnly ? "Lecture seule" : "Écriture";
  const tooltipText = isReadOnly
    ? promptsMessages.tooltips.prompts.permission.readOnly
    : promptsMessages.tooltips.prompts.permission.write;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={
              isReadOnly
                ? "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400"
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
            }
          >
            {isReadOnly ? (
              <Eye className="h-3 w-3 mr-1" aria-hidden="true" />
            ) : (
              <Pencil className="h-3 w-3 mr-1" aria-hidden="true" />
            )}
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
