import { useNavigate } from "react-router-dom";
import { PromptListSkeleton } from "@/components/PromptCardSkeleton";
import { EmptyPromptState } from "./EmptyPromptState";
import type { Prompt } from "../types";
import { useLoadingState } from "@/hooks/useLoadingState";
import { PromptListView } from "./PromptListView";
import { PromptListActionsItem } from "./PromptListActions";

interface PromptListProps {
  prompts: Prompt[];
  isLoading: boolean;
  onToggleFavorite: (id: string, currentState: boolean) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleVisibility?: (id: string, currentVisibility: "PRIVATE" | "SHARED", permission: "READ" | "WRITE") => Promise<void>;
  emptySearchState?: boolean;
  searchQuery?: string;
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
  searchQuery = "",
  currentUserId,
  isSharedSection = false,
}: PromptListProps) => {
  const navigate = useNavigate();

  const loadingState = useLoadingState({
    isLoading,
    data: prompts,
    loadingComponent: <PromptListSkeleton />,
    emptyComponent: (
      <EmptyPromptState 
        emptySearchState={emptySearchState} 
        isSharedSection={isSharedSection} 
      />
    ),
    isEmpty: (data) => data.length === 0,
  });

  if (loadingState.shouldRender) {
    return <>{loadingState.content}</>;
  }

  return (
    <PromptListView
      prompts={prompts}
      isLoading={isLoading}
      isEmpty={prompts.length === 0}
      loadingComponent={loadingState.content}
      emptyComponent={loadingState.content}
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
