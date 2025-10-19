import { useState } from "react";
import { useCreateVersion, useRestoreVersion } from "./useVersions";
import { bumpVersion, type VersionBump } from "@/lib/semver";
import type { Tables } from "@/integrations/supabase/types";

type Prompt = Tables<"prompts">;
type Variable = Tables<"variables">;

export function usePromptVersioning(prompt?: Prompt, variables?: Variable[]) {
  const [versionMessage, setVersionMessage] = useState("");
  const [versionType, setVersionType] = useState<VersionBump>("patch");

  const { mutate: createVersion, isPending: creating } = useCreateVersion();
  const { mutate: restoreVersion, isPending: restoring } = useRestoreVersion();

  const handleCreateVersion = () => {
    if (!prompt) return;

    const newSemver = bumpVersion(prompt.version || "1.0.0", versionType);

    createVersion({
      prompt_id: prompt.id,
      content: prompt.content,
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
  };
}
