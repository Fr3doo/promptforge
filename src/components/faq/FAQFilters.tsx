import { FAQSearchInput } from "./FAQSearchInput";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface FAQFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export const FAQFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories
}: FAQFiltersProps) => {
  return (
    <div className="flex flex-col gap-4">
      <FAQSearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Rechercher une question..."
      />

      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(cat)}
              className="flex-shrink-0 whitespace-nowrap"
            >
              {cat === "all" ? "Toutes" : cat}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
