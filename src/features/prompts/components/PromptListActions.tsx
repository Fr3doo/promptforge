import type { PromptListActionsProps } from "./PromptListActions.types";
import type { Prompt } from "../types";
import { PromptCard } from "./PromptCard";

interface PromptListActionsItemProps extends PromptListActionsProps {
  prompt: Prompt;
  index: number;
}

export const PromptListActionsItem = ({
  prompt,
  index,
  onPromptClick,
  onToggleFavorite,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  currentUserId,
}: PromptListActionsItemProps) => {
  return (
    <PromptCard
      key={prompt.id}
      prompt={prompt}
      index={index}
      onToggleFavorite={onToggleFavorite}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onToggleVisibility={onToggleVisibility}
      onClick={() => onPromptClick(prompt.id)}
      currentUserId={currentUserId}
    />
  );
};

// Export du type pour réutilisation
export type { PromptListActionsItemProps };
