import { useNavigate } from "react-router-dom";
import { PromptCard } from "./PromptCard";
import { PromptListSkeleton } from "@/components/PromptCardSkeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    return (
      <Card className="p-12 text-center border-dashed">
        <p className="text-muted-foreground mb-4">
          {emptySearchState
            ? "Aucun prompt ne correspond à votre recherche"
            : "Aucun prompt créé pour le moment"}
        </p>
        {!emptySearchState && (
          <Button onClick={() => navigate("/prompts/new")}>
            Créer votre premier prompt
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onToggleFavorite={onToggleFavorite}
          onClick={() => navigate(`/prompts/${prompt.id}`)}
        />
      ))}
    </div>
  );
};
