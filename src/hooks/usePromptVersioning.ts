import { useState, useMemo } from "react";
import { useCreateVersion, useRestoreVersion } from "./useVersions";
import { bumpVersion, isValidSemVer, type VersionBump } from "@/lib/semver";
import { useOptimisticLocking } from "./useOptimisticLocking";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Prompt = Tables<"prompts">;
type Variable = Tables<"variables">;

export function usePromptVersioning(
  prompt?: Prompt, 
  variables?: Variable[],
  currentContent?: string
) {
  const [versionMessage, setVersionMessage] = useState("");
  const [versionType, setVersionType] = useState<VersionBump>("patch");

  const { mutate: createVersion, isPending: creating } = useCreateVersion();
  const { mutate: restoreVersion, isPending: restoring } = useRestoreVersion();
  const { checkVersionExists } = useOptimisticLocking();

  // Détecter si le contenu a changé par rapport à la dernière version sauvegardée
  const hasUnsavedChanges = useMemo(() => {
    if (!prompt || !currentContent) return false;
    
    // Comparer le contenu actuel avec le contenu du prompt (dernière version sauvegardée)
    return currentContent !== prompt.content;
  }, [prompt?.content, currentContent]);

  const handleCreateVersion = async () => {
    if (!prompt || !currentContent) return;

    const currentVersion = prompt.version || "1.0.0";

    // Valider strictement la version actuelle
    if (!isValidSemVer(currentVersion)) {
      toast.error(
        "Version invalide",
        { description: `La version actuelle "${currentVersion}" n'est pas une version sémantique valide (format attendu: X.Y.Z).` }
      );
      return;
    }

    const newSemver = bumpVersion(currentVersion, versionType);

    // Vérifier si une version avec ce numéro existe déjà
    const versionExists = await checkVersionExists(prompt.id, newSemver);
    
    if (versionExists) {
      toast.error(
        "Conflit détecté",
        { description: `Une version ${newSemver} existe déjà. Un autre utilisateur a créé une version pendant votre édition.` }
      );
      return;
    }

    createVersion({
      prompt_id: prompt.id,
      content: currentContent,
      semver: newSemver,
      message: versionMessage || `Version ${newSemver}`,
      variables: variables || [],
    }, {
      onSuccess: () => {
        setVersionMessage("");
        setVersionType("patch");
      },
    });
  };

  const handleRestoreVersion = (versionId: string) => {
    if (!prompt) return;

    restoreVersion({ versionId, promptId: prompt.id });
  };

  return {
    versionMessage,
    setVersionMessage,
    versionType,
    setVersionType,
    handleCreateVersion,
    handleRestoreVersion,
    isCreating: creating,
    isRestoring: restoring,
    hasUnsavedChanges,
  };
}
