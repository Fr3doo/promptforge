import { FAQSearchInput } from "./FAQSearchInput";
import { Button } from "@/components/ui/button";
import { Check, Clock, AlertCircle } from "lucide-react";
import { FeatureStatus } from "@/data/faqData";
import { cn } from "@/lib/utils";

interface FAQFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  selectedStatus: FeatureStatus | "all";
  onStatusChange: (status: FeatureStatus | "all") => void;
  statusCounts: Record<FeatureStatus, number>;
}

const statusFilters: { value: FeatureStatus | "all"; label: string; icon?: React.ElementType; className?: string }[] = [
  { value: "all", label: "Tous" },
  { value: "available", label: "Disponible", icon: Check, className: "text-green-600 dark:text-green-400" },
  { value: "partial", label: "Partiel", icon: AlertCircle, className: "text-yellow-600 dark:text-yellow-400" },
  { value: "coming-soon", label: "À venir", icon: Clock, className: "text-blue-600 dark:text-blue-400" }
];

export const FAQFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedStatus,
  onStatusChange,
  statusCounts
}: FAQFiltersProps) => {
  return (
    <div className="flex flex-col gap-4">
      <FAQSearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Rechercher une question..."
      />

      {/* Filtre par catégorie */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground">Catégorie</span>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(cat)}
            >
              {cat === "all" ? "Toutes" : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Filtre par statut */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground">Statut</span>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map(({ value, label, icon: Icon, className }) => {
            const count = value === "all" 
              ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
              : statusCounts[value] || 0;
            
            return (
              <Button
                key={value}
                variant={selectedStatus === value ? "default" : "outline"}
                size="sm"
                onClick={() => onStatusChange(value)}
                className={cn(
                  "gap-1.5",
                  selectedStatus !== value && Icon && className
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
                <span className="ml-1 text-xs opacity-70">({count})</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
