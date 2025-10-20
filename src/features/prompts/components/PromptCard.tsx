import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Star, Eye, Lock, MoreVertical, Trash2, Edit, Copy, FileText } from "lucide-react";
import { useState } from "react";
import type { Prompt } from "../types";

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite: (id: string, currentState: boolean) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onClick: () => void;
  index?: number;
  currentUserId?: string;
}

export const PromptCard = ({ 
  prompt, 
  onToggleFavorite, 
  onDelete,
  onDuplicate,
  onClick, 
  index = 0,
  currentUserId 
}: PromptCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isOwner = currentUserId && prompt.owner_id === currentUserId;
  const isDraft = prompt.status === "DRAFT";

  const handleDelete = () => {
    if (onDelete) {
      onDelete(prompt.id);
      setShowDeleteDialog(false);
    }
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(prompt.id, prompt.is_favorite ?? false);
                  }}
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  <Star
                    className={`h-5 w-5 ${
                      prompt.is_favorite ? "fill-accent text-accent" : ""
                    }`}
                  />
                </button>
                
                {isOwner && onDelete && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      {onDuplicate && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(prompt.id);
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {prompt.visibility === "SHARED" ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                <span>{prompt.visibility === "SHARED" ? "Partagé" : "Privé"}</span>
              </div>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le prompt "<strong>{prompt.title}</strong>" ?
              <br />
              <br />
              Cette action est <strong>irréversible</strong> et supprimera également toutes les versions associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
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
