import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { VisibilityBadge } from "./VisibilityBadge";
import type { PromptCardViewProps } from "./PromptCardView.types";

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
    <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 flex flex-col gap-2" onClick={onClick}>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{prompt.title}</CardTitle>
              {isDraft && (
                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  <FileText className="h-3 w-3 mr-1" />
                  Brouillon
                </Badge>
              )}
            </div>
          </div>
          {actions}
        </div>
        <CardDescription className="line-clamp-2" onClick={onClick}>
          {prompt.description || "Aucune description"}
        </CardDescription>
      </CardHeader>
      <CardContent onClick={onClick}>
        <div className="flex flex-wrap gap-2 mb-3">
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
          {!isOwner && (
            <Badge variant="outline" className="text-xs">
              Partagé avec vous
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
