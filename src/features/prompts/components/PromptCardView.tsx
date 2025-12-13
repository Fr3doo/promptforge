import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { VisibilityBadge } from "./VisibilityBadge";
import { PermissionBadge } from "./PermissionBadge";
import type { PromptCardViewProps } from "./PromptCardView.types";
import type { PromptWithSharePermission } from "../types";

/**
 * Composant UI pur pour l'affichage d'une carte de prompt
 * Responsabilité unique : rendu visuel sans logique métier
 * 
 * @phase 2 - Squelette temporaire
 */
export const PromptCardView = ({
  prompt,
  isDraft,
  isOwner,
  shareCount,
  sharingState,
  onClick,
  index = 0,
  actions,
}: PromptCardViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg h-full flex flex-col">
        <CardHeader className="flex-none">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 flex flex-col gap-2" onClick={onClick}>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg line-clamp-1">{prompt.title}</CardTitle>
                {isDraft && (
                  <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20 flex-shrink-0">
                    <FileText className="h-3 w-3 mr-1" />
                    Brouillon
                  </Badge>
                )}
              </div>
            </div>
            {actions}
          </div>
          <CardDescription className="line-clamp-2 h-10" onClick={onClick}>
            {prompt.description || "Aucune description"}
          </CardDescription>
        </CardHeader>
        <CardContent onClick={onClick} className="flex-1 flex flex-col justify-between">
          <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
            {prompt.tags?.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {prompt.tags && prompt.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{prompt.tags.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
            <VisibilityBadge sharingState={sharingState} shareCount={shareCount} />
            <span>v{prompt.version}</span>
            {!isOwner && (prompt as PromptWithSharePermission).shared_permission && (
              <PermissionBadge permission={(prompt as PromptWithSharePermission).shared_permission!} />
            )}
            {!isOwner && !(prompt as PromptWithSharePermission).shared_permission && (
              <Badge variant="outline" className="text-xs">
                Partagé avec vous
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
