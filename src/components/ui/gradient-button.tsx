import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, children, isLoading, loadingText, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative w-full h-12 px-6 rounded-lg font-medium text-primary-foreground",
          "bg-gradient-to-r from-primary to-accent",
          "hover:opacity-90 hover:shadow-lg hover:shadow-primary/25",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
          "transition-all duration-200",
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText || children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
GradientButton.displayName = "GradientButton";

export { GradientButton };
