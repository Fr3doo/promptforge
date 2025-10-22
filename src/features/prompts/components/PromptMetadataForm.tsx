import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, X, Lock, Globe, ChevronDown, ChevronUp } from "lucide-react";

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
            placeholder="Ex: Résumé d'articles de blog"
            required
            aria-required="true"
            aria-invalid={!title}
            aria-describedby="title-help"
            disabled={disabled}
          />
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
            placeholder="Décrivez l'objectif et le contexte d'utilisation de ce prompt"
            className="min-h-[80px]"
            aria-describedby="description-help"
            disabled={disabled}
          />
          <p id="description-help" className="text-xs text-muted-foreground">Ajoutez des détails pour retrouver facilement ce prompt plus tard</p>
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
                    placeholder="Ex: marketing, email, SEO"
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
                <p id="tags-help" className="text-xs text-muted-foreground">Organisez vos prompts avec des mots-clés. Appuyez sur Entrée pour ajouter.</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2" role="list" aria-label="Tags sélectionnés">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1" role="listitem">
                        {tag}
                        <button
                          onClick={() => onRemoveTag(tag)}
                          className="ml-1 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive rounded"
                          aria-label={`Retirer le tag ${tag}`}
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
