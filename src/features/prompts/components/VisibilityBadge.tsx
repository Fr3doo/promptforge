import { Eye, Lock } from "lucide-react";

interface VisibilityBadgeProps {
  visibility: "PRIVATE" | "SHARED";
}

export const VisibilityBadge = ({ visibility }: VisibilityBadgeProps) => {
  const isShared = visibility === "SHARED";
  
  return (
    <div className="flex items-center gap-1">
      {isShared ? (
        <Eye className="h-3 w-3" />
      ) : (
        <Lock className="h-3 w-3" />
      )}
      <span>{isShared ? "Partagé" : "Privé"}</span>
    </div>
  );
};
