import { useNavigate } from "react-router-dom";
import { PromptCard } from "./PromptCard";
import { PromptListSkeleton } from "@/components/PromptCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { FileText, Search, Share2 } from "lucide-react";
import type { Prompt } from "../types";
import { messages } from "@/constants/messages";

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

  if (isLoading) {
    return <PromptListSkeleton />;
  }

  if (prompts.length === 0) {
    if (emptySearchState) {
      return (
        <EmptyState
          icon={Search}
          title={messages.promptList.noResults}
          description={messages.promptList.noResultsDescription}
        />
      );
    }

    if (isSharedSection) {
      return (
        <EmptyState
          icon={Share2}
          title={messages.promptList.noSharedPrompts}
          description={messages.promptList.noSharedPromptsDescription}
        />
      );
    }

    return (
      <EmptyState
        icon={FileText}
        title={messages.promptList.noPrompts}
        description={messages.promptList.noPromptsDescription}
        actionLabel={messages.promptList.createFirstPrompt}
        onAction={() => navigate("/prompts/new")}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt, index) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          index={index}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onToggleVisibility={onToggleVisibility}
          onClick={() => navigate(`/prompts/${prompt.id}`)}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};
