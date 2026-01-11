import { useNavigate } from "react-router-dom";
import { PromptListSkeleton } from "@/components/PromptCardSkeleton";
import { EmptyPromptState } from "./EmptyPromptState";
import type { Prompt, Visibility, Permission } from "../types";
import { PromptListView } from "./PromptListView";
import { PromptListActionsItem } from "./PromptListActions";

interface PromptListProps {
  prompts: Prompt[];
  isLoading: boolean;
  onToggleFavorite: (id: string, currentState: boolean) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleVisibility?: (id: string, currentVisibility: Visibility, permission: Permission) => Promise<void>;
  emptySearchState?: boolean;
  currentUserId?: string;
  isSharedSection?: boolean;
}

export const PromptList = ({
  prompts,
  isLoading,
  onToggleFavorite,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  emptySearchState = false,
  currentUserId,
  isSharedSection = false,
}: PromptListProps) => {
  const navigate = useNavigate();

  return (
    <PromptListView
      prompts={prompts}
      isLoading={isLoading}
      isEmpty={prompts.length === 0}
      loadingComponent={<PromptListSkeleton />}
      emptyComponent={
        <EmptyPromptState 
          emptySearchState={emptySearchState} 
          isSharedSection={isSharedSection} 
        />
      }
    >
      {prompts.map((prompt, index) => (
        <PromptListActionsItem
          key={prompt.id}
          prompt={prompt}
          index={index}
          onPromptClick={(id) => navigate(`/prompts/${id}`)}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onToggleVisibility={onToggleVisibility}
          currentUserId={currentUserId}
        />
      ))}
    </PromptListView>
  );
};
