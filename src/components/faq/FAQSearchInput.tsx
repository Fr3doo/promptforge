import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FAQSearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher une question..." 
}: FAQSearchInputProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 h-11"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
