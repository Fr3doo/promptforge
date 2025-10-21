import { Star } from "lucide-react";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

export const FavoriteButton = ({ isFavorite, onToggle }: FavoriteButtonProps) => {
  return (
    <button
      onClick={onToggle}
      className="text-muted-foreground hover:text-accent transition-colors"
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Star
        className={`h-5 w-5 ${isFavorite ? "fill-accent text-accent" : ""}`}
      />
    </button>
  );
};
