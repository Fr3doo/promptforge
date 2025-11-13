import { Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { messages } from "@/constants/messages";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

export const FavoriteButton = ({ isFavorite, onToggle }: FavoriteButtonProps) => {
  const tooltips = messages.tooltips.prompts.favorite;
  const label = isFavorite ? tooltips.remove : tooltips.add;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-accent transition-colors"
          aria-label={label}
        >
          <Star
            className={`h-5 w-5 ${isFavorite ? "fill-accent text-accent" : ""}`}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
