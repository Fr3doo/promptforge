import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { scrollToSection } from "@/lib/scrollUtils";

interface NavLinkProps {
  to: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  isAnchor?: boolean;
  activeSection?: string | null;
}

export const NavLink = ({ to, children, onClick, className, isAnchor = false, activeSection }: NavLinkProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Déterminer si le lien est actif
  const getIsActive = () => {
    if (isAnchor && to.includes('#')) {
      const hash = to.split('#')[1];
      // Priorité au scroll spy si disponible
      if (activeSection !== undefined) {
        return activeSection === hash;
      }
      return location.hash === `#${hash}`;
    }
    return location.pathname === to;
  };
  
  const isActive = getIsActive();
  const baseClasses = "text-sm font-medium transition-all duration-300 hover:text-primary relative";
  const activeClasses = isActive ? "text-primary font-semibold" : "text-foreground";

  if (isAnchor) {
    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      const [path, hash] = to.split('#');
      const targetPath = path || '/';
      
      if (location.pathname === targetPath) {
        e.preventDefault();
        scrollToSection(hash);
        window.history.pushState(null, '', `#${hash}`);
      } else {
        e.preventDefault();
        navigate(to);
      }
      onClick?.();
    };

    return (
      <a
        href={to}
        onClick={handleAnchorClick}
        className={cn(baseClasses, activeClasses, className)}
      >
        {children}
        {/* Indicateur visuel de section active */}
        <span 
          className={cn(
            "absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full transition-all duration-300",
            isActive ? "w-full" : "w-0"
          )}
        />
      </a>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(baseClasses, activeClasses, className)}
    >
      {children}
      {/* Indicateur visuel pour les liens de page */}
      <span 
        className={cn(
          "absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full transition-all duration-300",
          isActive ? "w-full" : "w-0"
        )}
      />
    </Link>
  );
};
