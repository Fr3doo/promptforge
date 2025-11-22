import { memo } from "react";
import type { PromptListViewProps } from "./PromptListView.types";

export const PromptListView = memo(({
  prompts,
  isLoading,
  isEmpty,
  loadingComponent,
  emptyComponent,
  children,
  className = "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
}: PromptListViewProps) => {
  // Rendu de l'état de chargement
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  // Rendu de l'état vide
  if (isEmpty) {
    return <>{emptyComponent}</>;
  }

  // Rendu de la liste avec grid layout
  return (
    <div className={className}>
      {children}
    </div>
  );
});

PromptListView.displayName = "PromptListView";
