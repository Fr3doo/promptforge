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
  // Phase 2: Retour temporaire null - composant non utilisé pour l'instant
  return null;
};
