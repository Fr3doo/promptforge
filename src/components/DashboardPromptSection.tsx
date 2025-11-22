import { PromptCard } from "@/features/prompts/components/PromptCard";
import type { DashboardSectionProps } from "@/features/prompts/types";

export const DashboardPromptSection = ({
  icon: Icon,
  title,
  prompts,
  currentUserId,
  onToggleFavorite,
  onToggleVisibility,
  onPromptClick,
}: DashboardSectionProps) => {
  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onToggleFavorite={(id, currentState) =>
              onToggleFavorite(id, currentState)
            }
            onToggleVisibility={async (id, currentVisibility, permission) => {
              if (permission !== undefined) {
                await onToggleVisibility(id, currentVisibility, permission);
              } else {
                await onToggleVisibility(id, currentVisibility);
              }
            }}
            onClick={() => onPromptClick(prompt.id)}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </section>
  );
};
