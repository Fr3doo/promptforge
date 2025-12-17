import { Link, useLocation } from "react-router-dom";
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
  const isActive = location.pathname === to || (location.hash === to && isAnchor);

  const baseClasses = "text-sm font-medium transition-colors hover:text-primary";
  const activeClasses = isActive ? "text-primary font-semibold" : "text-foreground";

  if (isAnchor) {
    return (
      <a
        href={to}
        onClick={onClick}
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
