import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { messages } from "@/constants/messages";

interface PromptSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PromptSearchBar = ({
  value,
  onChange,
  placeholder = messages.placeholders.searchByTitleDescriptionTags,
}: PromptSearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
