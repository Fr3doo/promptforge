import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, Lock } from "lucide-react";
import type { Prompt } from "../types";

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite: (id: string, currentState: boolean) => void;
  onClick: () => void;
}

export const PromptCard = ({ prompt, onToggleFavorite, onClick }: PromptCardProps) => {
  return (
    <Card
      className="cursor-pointer transition-all hover:border-primary"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{prompt.title}</CardTitle>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(prompt.id, prompt.is_favorite ?? false);
            }}
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Star
              className={`h-5 w-5 ${
                prompt.is_favorite ? "fill-accent text-accent" : ""
              }`}
            />
          </button>
        </div>
        <CardDescription className="line-clamp-2">
          {prompt.description || "Aucune description"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          {prompt.tags?.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {prompt.tags && prompt.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{prompt.tags.length - 3}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {prompt.visibility === "SHARED" ? (
              <Eye className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
            <span>{prompt.visibility === "SHARED" ? "Partagé" : "Privé"}</span>
          </div>
          <span>v{prompt.version}</span>
        </div>
      </CardContent>
    </Card>
  );
};
