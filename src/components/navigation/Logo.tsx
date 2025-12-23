import { Link, useLocation } from "react-router-dom";
import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { container: "h-6 w-6", icon: "h-4 w-4", text: "text-base" },
  md: { container: "h-8 w-8", icon: "h-5 w-5", text: "text-lg sm:text-xl" },
  lg: { container: "h-10 w-10", icon: "h-6 w-6", text: "text-xl sm:text-2xl" },
};

export const Logo = ({ size = "md", showText = true, className }: LogoProps) => {
  const classes = sizeClasses[size];
  const location = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    // Si déjà sur la page d'accueil, forcer le scroll en haut
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Nettoyer le hash si présent
      if (location.hash) {
        window.history.pushState(null, '', '/');
      }
    }
  };

  return (
    <Link 
      to="/" 
      className={cn("flex items-center gap-2", className)}
      onClick={handleClick}
    >
      <div className={cn("rounded-lg bg-primary flex items-center justify-center", classes.container)}>
        <Code2 className={cn("text-primary-foreground", classes.icon)} />
      </div>
      {showText && (
        <span className={cn("font-bold", classes.text)}>PromptForge</span>
      )}
    </Link>
  );
};
