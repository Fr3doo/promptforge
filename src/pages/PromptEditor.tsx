import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PromptEditor as Editor } from "@/components/PromptEditor";
import { VariableManager } from "@/components/VariableManager";
import { toast } from "sonner";
import { ArrowLeft, Save, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { promptSchema, variableSchema } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/errorHandler";

const PromptEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">("PRIVATE");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [variables, setVariables] = useState<any[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      fetchPrompt();
    }
  }, [id]);

  const fetchPrompt = async () => {
    try {
      const { data: prompt, error: promptError } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", id)
        .single();

      if (promptError) throw promptError;

      setTitle(prompt.title);
      setDescription(prompt.description || "");
      setContent(prompt.content);
      setVisibility(prompt.visibility);
      setTags(prompt.tags || []);

      const { data: vars, error: varsError } = await supabase
        .from("variables")
        .select("*")
        .eq("prompt_id", id)
        .order("order_index");

      if (!varsError && vars) {
        setVariables(vars);
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement");
      navigate("/prompts");
    }
  };

  const detectVariables = () => {
    const regex = /{{(\w+)}}/g;
    const matches = content.matchAll(regex);
    const detected = new Set<string>();
    
    for (const match of matches) {
      detected.add(match[1]);
    }

    const newVars = Array.from(detected).map((name, index) => {
      const existing = variables.find(v => v.name === name);
      return existing || {
        name,
        type: "STRING",
        required: false,
        default_value: "",
        help: "",
        order_index: index,
      };
    });

    setVariables(newVars);
    toast.success(`${detected.size} variable(s) détectée(s)`);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      // Validate prompt data
      const validatedPrompt = promptSchema.parse({
        title,
        description,
        content,
        tags,
        visibility,
      });

      // Validate all variables
      const validatedVariables = variables.map(v => variableSchema.parse(v));

      let promptId = id;

      if (id) {
        // Update existing prompt
        const { error: updateError } = await supabase
          .from('prompts')
          .update({
            title: validatedPrompt.title,
            description: validatedPrompt.description || null,
            content: validatedPrompt.content,
            tags: validatedPrompt.tags,
            visibility: validatedPrompt.visibility,
          })
          .eq('id', id);

        if (updateError) throw updateError;

        // Delete existing variables
        const { error: deleteError } = await supabase
          .from('variables')
          .delete()
          .eq('prompt_id', id);

        if (deleteError) throw deleteError;
      } else {
        // Create new prompt
        const { data: newPrompt, error: insertError } = await supabase
          .from('prompts')
          .insert({
            owner_id: user.id,
            title: validatedPrompt.title,
            description: validatedPrompt.description || null,
            content: validatedPrompt.content,
            tags: validatedPrompt.tags,
            visibility: validatedPrompt.visibility,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        promptId = newPrompt.id;
      }

      // Insert variables if any
      if (validatedVariables.length > 0) {
        const { error: varsError } = await supabase
          .from('variables')
          .insert(
            validatedVariables.map((v, index) => ({
              prompt_id: promptId,
              name: v.name,
              type: v.type,
              required: v.required,
              default_value: v.default_value || null,
              help: v.help || null,
              pattern: v.pattern || null,
              options: v.options || null,
              order_index: index,
            }))
          );

        if (varsError) throw varsError;
      }

      toast.success(id ? "Prompt mis à jour !" : "Prompt créé !");
      navigate(`/prompts/${promptId}`);
    } catch (error: any) {
      toast.error(getSafeErrorMessage(error));
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/prompts")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Enregistrement..." : "Enregistrer"}
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
          <h2 className="text-2xl font-bold">Éditeur de prompt</h2>
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
