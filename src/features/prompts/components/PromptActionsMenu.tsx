import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreVertical, Trash2, Edit, Copy, Lock, Share2, Users } from "lucide-react";
import { messages } from "@/constants/messages";

interface PromptActionsMenuProps {
  isShared: boolean;
  onEdit: () => void;
  onDuplicate?: () => void;
  onToggleVisibility?: () => void;
  onManageSharing?: () => void;
  onDelete: () => void;
}

export const PromptActionsMenu = ({
  isShared,
  onEdit,
  onDuplicate,
  onToggleVisibility,
  onManageSharing,
  onDelete,
}: PromptActionsMenuProps) => {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>{messages.tooltips.prompts.actions.menu}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
