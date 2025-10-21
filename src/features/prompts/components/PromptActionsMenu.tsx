import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Edit, Copy, Lock, Share2 } from "lucide-react";

interface PromptActionsMenuProps {
  isShared: boolean;
  onEdit: () => void;
  onDuplicate?: () => void;
  onToggleVisibility?: () => void;
  onDelete: () => void;
}

export const PromptActionsMenu = ({
  isShared,
  onEdit,
  onDuplicate,
  onToggleVisibility,
  onDelete,
}: PromptActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => e.stopPropagation()}
          aria-label="Actions du prompt"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </DropdownMenuItem>
        {onDuplicate && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}>
            <Copy className="h-4 w-4 mr-2" />
            Dupliquer
          </DropdownMenuItem>
        )}
        {onToggleVisibility && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}>
            {isShared ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Rendre privé
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </>
            )}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
