import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, X, Lock, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { messages } from "@/constants/messages";

interface PromptMetadataFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  tags: string[];
  tagInput: string;
  onTagInputChange: (input: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  isEditMode?: boolean;
  disabled?: boolean;
  errors?: {
    title?: string;
    description?: string;
    tags?: string;
  };
}

export const PromptMetadataForm = ({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  isEditMode = false,
  disabled = false,
  errors = {},
}: PromptMetadataFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Modifier votre prompt" : "Créez votre prompt"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditMode 
            ? "Modifiez les informations de votre prompt" 
            : "Remplissez les informations essentielles pour commencer"}
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Champ obligatoire */}
        <div className="space-y-2">
          <Label htmlFor="prompt-title">
            Titre du prompt <span className="text-destructive" aria-label="requis">*</span>
          </Label>
          <Input
            id="prompt-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={messages.placeholders.promptTitle}
            required
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error title-help" : "title-help"}
            disabled={disabled}
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && (
            <p id="title-error" className="text-sm text-destructive" role="alert">
              {errors.title}
            </p>
          )}
          <p id="title-help" className="text-xs text-muted-foreground">Donnez un nom clair et descriptif à votre prompt</p>
        </div>

        {/* Champs optionnels de base */}
        <div className="space-y-2">
          <Label htmlFor="prompt-description">
            Description <span className="text-muted-foreground font-normal">(optionnel)</span>
          </Label>
          <Textarea
            id="prompt-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={messages.placeholders.promptDescription}
            className={`min-h-[80px] ${errors.description ? "border-destructive" : ""}`}
            aria-describedby={errors.description ? "description-error description-help" : "description-help"}
            aria-invalid={!!errors.description}
            disabled={disabled}
          />
          {errors.description && (
            <p id="description-error" className="text-sm text-destructive" role="alert">
              {errors.description}
            </p>
          )}
          <p id="description-help" className="text-xs text-muted-foreground">
            Ajoutez des détails pour retrouver facilement ce prompt plus tard ({description.length}/3000)
          </p>
        </div>

        {/* Options avancées */}
        <div className="border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full justify-between"
            aria-expanded={showAdvanced}
            aria-controls="advanced-options"
          >
            <span className="font-semibold">Options avancées</span>
            {showAdvanced ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
          </Button>

          {showAdvanced && (
            <div id="advanced-options" className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-tags">
                  Tags <span className="text-muted-foreground font-normal">(optionnel)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="prompt-tags"
                    value={tagInput}
                    onChange={(e) => onTagInputChange(e.target.value)}
                    placeholder={messages.placeholders.tagInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onAddTag();
                      }
                    }}
                    aria-describedby="tags-help"
                    disabled={disabled}
                  />
                  <Button 
                    onClick={onAddTag} 
                    variant="outline" 
                    className="gap-2 shrink-0"
                    aria-label="Ajouter un tag"
                    disabled={disabled}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Ajouter
                  </Button>
                </div>
                <p id="tags-help" className="text-xs text-muted-foreground">
                  Organisez vos prompts avec des mots-clés. Appuyez sur Entrée pour ajouter.
                  {tags.length > 0 && ` (${tags.length}/20)`}
                </p>
                {errors.tags && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.tags}
                  </p>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2" role="list" aria-label="Tags sélectionnés">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1" role="listitem">
                        {tag}
                        <button
                          onClick={() => onRemoveTag(tag)}
                          className="ml-1 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive rounded"
                          aria-label={`Retirer le tag ${tag}`}
                          disabled={disabled}
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
