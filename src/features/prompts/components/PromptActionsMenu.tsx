import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Edit, Copy, Lock, Share2, Users, Download } from "lucide-react";
import { messages } from "@/constants/messages";

interface PromptActionsMenuProps {
  isShared: boolean;
  onEdit: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onToggleVisibility?: () => void;
  onManageSharing?: () => void;
  onDelete: () => void;
}

export const PromptActionsMenu = ({
  isShared,
  onEdit,
  onDuplicate,
  onExport,
  onToggleVisibility,
  onManageSharing,
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
          aria-label={messages.promptActions.title}
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
          {messages.promptActions.edit}
        </DropdownMenuItem>
        {onDuplicate && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}>
            <Copy className="h-4 w-4 mr-2" />
            {messages.promptActions.duplicate}
          </DropdownMenuItem>
        )}
        {onExport && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}>
            <Download className="h-4 w-4 mr-2" />
            {messages.promptActions.export}
          </DropdownMenuItem>
        )}
        {onManageSharing && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onManageSharing();
          }}>
            <Users className="h-4 w-4 mr-2" />
            {messages.promptActions.privateShare}
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
                {messages.promptActions.stopPublicShare}
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                {messages.promptActions.publicShare}
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
          {messages.promptActions.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
