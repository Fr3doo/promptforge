import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePrompt, useCreatePrompt, useUpdatePrompt } from "@/hooks/usePrompts";
import { useVariables, useBulkUpsertVariables } from "@/hooks/useVariables";
import { useVariableDetection } from "@/hooks/useVariableDetection";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PromptEditor as Editor } from "@/components/PromptEditor";
import { VariableManager } from "@/components/VariableManager";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Tag, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { promptSchema, variableSchema } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/errorHandler";

const PromptEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isEditMode = !!id;

  // Queries
  const { data: prompt, isLoading: loadingPrompt } = usePrompt(id);
  const { data: existingVariables = [], isLoading: loadingVariables } = useVariables(id);

  // Mutations
  const { mutate: createPrompt, isPending: creating } = useCreatePrompt();
  const { mutate: updatePrompt, isPending: updating } = useUpdatePrompt();
  const { mutate: saveVariables } = useBulkUpsertVariables();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">("PRIVATE");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [variables, setVariables] = useState<any[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const { detectedNames } = useVariableDetection(content);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Initialize form with existing data
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setDescription(prompt.description || "");
      setContent(prompt.content);
      setVisibility(prompt.visibility || "PRIVATE");
      setTags(prompt.tags || []);
    }
  }, [prompt]);

  useEffect(() => {
    if (existingVariables.length > 0) {
      setVariables(existingVariables);
    }
  }, [existingVariables]);

  const detectVariables = () => {
    const newVariables = detectedNames
      .filter(name => !variables.some(v => v.name === name))
      .map((name, index) => ({
        name,
        type: "STRING",
        required: false,
        order_index: variables.length + index,
      }));

    setVariables([...variables, ...newVariables]);
    toast({ title: `✨ ${newVariables.length} variable(s) détectée(s)` });
  };

  const handleSave = async () => {
    try {
      // Validation
      promptSchema.parse({
        title,
        description,
        content,
        tags,
        visibility,
      });

      // Validate variables
      const validatedVariables = variables.map(v => variableSchema.parse(v));

      if (isEditMode && id) {
        // Update existing
        updatePrompt(
          { 
            id, 
            updates: {
              title,
              description: description || null,
              content,
              tags,
              visibility,
            }
          },
          {
            onSuccess: () => {
              if (validatedVariables.length > 0) {
                saveVariables({ 
                  promptId: id, 
                  variables: validatedVariables.map(v => ({
                    name: v.name,
                    type: v.type,
                    required: v.required,
                    default_value: v.default_value,
                    help: v.help,
                    pattern: v.pattern,
                    options: v.options,
                    order_index: 0,
                  }))
                });
              }
              navigate("/prompts");
            },
          }
        );
      } else {
        // Create new
        createPrompt({
          title,
          description: description || null,
          content,
          tags,
          visibility,
          is_favorite: false,
          version: "1.0.0",
        }, {
          onSuccess: (newPrompt) => {
            if (validatedVariables.length > 0) {
              saveVariables({ 
                promptId: newPrompt.id, 
                variables: validatedVariables.map(v => ({
                  name: v.name,
                  type: v.type,
                  required: v.required,
                  default_value: v.default_value,
                  help: v.help,
                  pattern: v.pattern,
                  options: v.options,
                  order_index: 0,
                }))
              });
            }
            navigate("/prompts");
          },
        });
      }
    } catch (error: any) {
      if (error?.errors?.[0]?.message) {
        toast({ 
          title: "❌ Validation échouée", 
          description: error.errors[0].message,
          variant: "destructive" 
        });
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  if (loadingPrompt || loadingVariables) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSaving = creating || updating;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/prompts")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Metadata Section */}
        <Card className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mon super prompt..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilité</Label>
              <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
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
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement votre prompt..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Ajouter un tag..."
              />
              <Button type="button" onClick={addTag} variant="secondary">
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Editor Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Éditeur de prompt</h2>
            <Button onClick={detectVariables} variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Détecter variables
            </Button>
          </div>
          <Editor
            content={content}
            onChange={setContent}
            onDetectVariables={detectVariables}
            variables={variables}
            variableValues={variableValues}
            onVariableValueChange={(name, value) => 
              setVariableValues({ ...variableValues, [name]: value })
            }
          />
        </div>

        {/* Variables Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Variables ({variables.length})</h2>
          <VariableManager
            variables={variables}
            values={variableValues}
            onValuesChange={setVariableValues}
            onVariableUpdate={(index, variable) => {
              const newVars = [...variables];
              newVars[index] = variable;
              setVariables(newVars);
            }}
            onVariableDelete={(index) => {
              setVariables(variables.filter((_, i) => i !== index));
            }}
            editable
          />
        </div>
      </main>
    </div>
  );
};

export default PromptEditorPage;
