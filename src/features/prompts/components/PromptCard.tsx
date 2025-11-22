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
import { useState } from "react";
import { PromptCardView } from "./PromptCardView";
import { PromptCardActions } from "./PromptCardActions";
import { SharePromptDialog } from "./SharePromptDialog";
import { PublicShareDialog } from "./PublicShareDialog";
import type { Prompt } from "../types";
import type { SharingState } from "./VisibilityBadge";
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

  const handleEdit = (id: string) => {
    onClick();
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      <PromptCardView
        prompt={prompt}
        isDraft={isDraft}
        isOwner={isOwner || false}
        shareCount={shareCount}
        sharingState={sharingState}
        onClick={onClick}
        index={index}
        actions={
          <PromptCardActions
            prompt={prompt}
            isOwner={isOwner || false}
            onToggleFavorite={onToggleFavorite}
            onDelete={handleDeleteClick}
            onDuplicate={onDuplicate || (() => {})}
            onToggleVisibility={async (id, visibility, permission) => {
              setPublicShareDialogOpen(true);
            }}
            onEdit={handleEdit}
          />
        }
      />

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
