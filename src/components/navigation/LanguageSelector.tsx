import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { messages } from "@/constants/messages";

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Globe className="h-4 w-4 mr-1" />
          FR
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex items-center justify-between">
          <span>{messages.settings.language.french}</span>
          <Badge variant="secondary" className="ml-2 text-xs">✓</Badge>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="flex items-center justify-between opacity-50">
          <span>{messages.settings.language.english}</span>
          <Badge variant="outline" className="ml-2 text-xs">{messages.settings.language.comingSoon}</Badge>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
