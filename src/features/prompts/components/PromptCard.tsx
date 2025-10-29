import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText } from "lucide-react";
import { useState } from "react";
import { FavoriteButton } from "./FavoriteButton";
import { VisibilityBadge, type SharingState } from "./VisibilityBadge";
import { PromptActionsMenu } from "./PromptActionsMenu";
import { SharePromptDialog } from "./SharePromptDialog";
import { PublicShareDialog } from "./PublicShareDialog";
import type { Prompt } from "../types";
import { useUpdatePublicPermission } from "@/hooks/usePrompts";
import { messages } from "@/constants/messages";

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite: (id: string, currentState: boolean) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleVisibility?: (id: string, currentVisibility: "PRIVATE" | "SHARED", permission?: "READ" | "WRITE") => Promise<void>;
  onClick: () => void;
  index?: number;
  currentUserId?: string;
}

export const PromptCard = ({ 
  prompt, 
  onToggleFavorite, 
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onClick, 
  index = 0,
  currentUserId 
}: PromptCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [publicShareDialogOpen, setPublicShareDialogOpen] = useState(false);
  const { mutateAsync: updatePublicPermission } = useUpdatePublicPermission();
  const isOwner = currentUserId && prompt.owner_id === currentUserId;
  const isDraft = prompt.status === "DRAFT";
  const isShared = prompt.visibility === "SHARED";
  
  // Calculer le véritable état de partage en utilisant share_count de la vue SQL
  const shareCount = prompt.share_count || 0;
  const sharingState: SharingState = 
    prompt.visibility === "SHARED" 
      ? "PUBLIC" 
      : shareCount > 0 
        ? "PRIVATE_SHARED" 
        : "PRIVATE";

  const handleDelete = () => {
    if (onDelete) {
      onDelete(prompt.id);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleVisibility = async (permission?: "READ" | "WRITE") => {
    if (onToggleVisibility) {
      await onToggleVisibility(prompt.id, prompt.visibility, permission);
    }
  };

  const handleUpdatePermission = async (permission: "READ" | "WRITE") => {
    await updatePublicPermission({ id: prompt.id, permission });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
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
              <div className="flex items-center gap-1">
                <FavoriteButton
                  isFavorite={prompt.is_favorite ?? false}
                  onToggle={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(prompt.id, prompt.is_favorite ?? false);
                  }}
                />
                
                {isOwner && onDelete && (
                  <PromptActionsMenu
                    isShared={isShared}
                    onEdit={onClick}
                    onDuplicate={onDuplicate ? () => onDuplicate(prompt.id) : undefined}
                    onManageSharing={() => setShowShareDialog(true)}
                    onToggleVisibility={onToggleVisibility ? () => setPublicShareDialogOpen(true) : undefined}
                    onDelete={() => setShowDeleteDialog(true)}
                  />
                )}
              </div>
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
      </motion.div>

      <SharePromptDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        promptId={prompt.id}
        promptTitle={prompt.title}
      />

        <PublicShareDialog
          open={publicShareDialogOpen}
          onOpenChange={setPublicShareDialogOpen}
          promptTitle={prompt.title}
          currentVisibility={prompt.visibility}
          currentPermission={prompt.public_permission}
          onConfirm={handleToggleVisibility}
          onUpdatePermission={handleUpdatePermission}
        />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{messages.dialogs.deletePrompt.title}</AlertDialogTitle>
            <AlertDialogDescription style={{ whiteSpace: "pre-line" }}>
              {messages.dialogs.deletePrompt.description(prompt.title)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{messages.labels.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
