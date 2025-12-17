import { Link } from "react-router-dom";
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

  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-lg bg-primary flex items-center justify-center", classes.container)}>
        <Code2 className={cn("text-primary-foreground", classes.icon)} />
      </div>
      {showText && (
        <span className={cn("font-bold", classes.text)}>PromptForge</span>
      )}
    </Link>
  );
};
