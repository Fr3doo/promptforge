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
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Créez votre prompt</h1>
        <p className="text-muted-foreground mt-2">Remplissez les informations essentielles pour commencer</p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Champ obligatoire */}
        <div className="space-y-2">
          <Label htmlFor="title">Titre du prompt</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Ex: Résumé d'articles de blog"
            required
          />
          <p className="text-xs text-muted-foreground">Donnez un nom clair et descriptif à votre prompt</p>
        </div>

        {/* Champs optionnels de base */}
        <div className="space-y-2">
          <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Décrivez l'objectif et le contexte d'utilisation de ce prompt"
            className="min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground">Ajoutez des détails pour retrouver facilement ce prompt plus tard</p>
        </div>

        {/* Options avancées */}
        <div className="border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full justify-between"
          >
            <span className="font-semibold">Options avancées</span>
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showAdvanced && (
            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilité</Label>
                <Select value={visibility} onValueChange={(value: any) => onVisibilityChange(value)}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Privé - Visible uniquement par vous</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SHARED">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Partagé - Visible par tous</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => onTagInputChange(e.target.value)}
                    placeholder="Ex: marketing, email, SEO"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onAddTag();
                      }
                    }}
                  />
                  <Button onClick={onAddTag} variant="outline" className="gap-2 shrink-0">
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Organisez vos prompts avec des mots-clés</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => onRemoveTag(tag)}
                        />
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
