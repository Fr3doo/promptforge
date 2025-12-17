import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NavLinkProps {
  to: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  isAnchor?: boolean;
}

export const NavLink = ({ to, children, onClick, className, isAnchor = false }: NavLinkProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Déterminer si le lien est actif
  const getIsActive = () => {
    if (isAnchor && to.includes('#')) {
      const hash = to.split('#')[1];
      return location.hash === `#${hash}`;
    }
    return location.pathname === to;
  };
  
  const isActive = getIsActive();
  const baseClasses = "text-sm font-medium transition-colors hover:text-primary";
  const activeClasses = isActive ? "text-primary font-semibold" : "text-foreground";

  if (isAnchor) {
    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Extraire le chemin et le hash (ex: "/#what-is" -> "/" et "what-is")
      const [path, hash] = to.split('#');
      const targetPath = path || '/';
      
      // Si on est sur la page cible, scroll smooth
      if (location.pathname === targetPath) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `#${hash}`);
        }
      } else {
        // Sinon, naviguer vers la page avec le hash
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
    </Link>
  );
};
