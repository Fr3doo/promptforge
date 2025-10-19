import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tag } from "lucide-react";

interface PromptMetadataFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  visibility: "PRIVATE" | "SHARED";
  onVisibilityChange: (visibility: "PRIVATE" | "SHARED") => void;
  tags: string[];
  tagInput: string;
  onTagInputChange: (input: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export const PromptMetadataForm = ({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  visibility,
  onVisibilityChange,
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}: PromptMetadataFormProps) => {
  return (
    <Card className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Mon super prompt..."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibilité</Label>
          <Select value={visibility} onValueChange={(value: any) => onVisibilityChange(value)}>
            <SelectTrigger id="visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRIVATE">Privé</SelectItem>
              <SelectItem value="SHARED">Partagé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Décrivez brièvement votre prompt..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddTag())}
            placeholder="Ajouter un tag..."
          />
          <Button type="button" onClick={onAddTag} variant="secondary">
            <Tag className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
