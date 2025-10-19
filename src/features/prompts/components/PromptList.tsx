import { useNavigate } from "react-router-dom";
import { PromptCard } from "./PromptCard";
import { PromptListSkeleton } from "@/components/PromptCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { FileText, Search } from "lucide-react";
import type { Prompt } from "../types";

interface PromptListProps {
  prompts: Prompt[];
  isLoading: boolean;
  onToggleFavorite: (id: string, currentState: boolean) => void;
  emptySearchState?: boolean;
  searchQuery?: string;
}

export const PromptList = ({
  prompts,
  isLoading,
  onToggleFavorite,
  emptySearchState = false,
  searchQuery = "",
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
          title="Aucun résultat"
          description="Aucun prompt ne correspond à votre recherche. Essayez avec d'autres mots-clés."
        />
      );
    }

    return (
      <EmptyState
        icon={FileText}
        title="Aucun prompt"
        description="Vous n'avez pas encore créé de prompt. Commencez par créer votre premier prompt pour organiser vos templates."
        actionLabel="Créer votre premier prompt"
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
          onClick={() => navigate(`/prompts/${prompt.id}`)}
        />
      ))}
    </div>
  );
};
