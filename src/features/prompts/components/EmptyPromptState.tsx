import { EmptyState } from "@/components/EmptyState";
import { FileText, Search, Share2 } from "lucide-react";
import { messages } from "@/constants/messages";
import { useNavigate } from "react-router-dom";

interface EmptyPromptStateProps {
  emptySearchState?: boolean;
  isSharedSection?: boolean;
}

/**
 * Composant pour gérer les différents états vides de PromptList
 * - Résultats de recherche vides
 * - Section partagée vide
 * - Liste de prompts vide (avec action de création)
 */
export const EmptyPromptState = ({ 
  emptySearchState, 
  isSharedSection 
}: EmptyPromptStateProps) => {
  const navigate = useNavigate();

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
};
