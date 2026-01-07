import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePrompt } from "@/hooks/usePrompts";
import { useVariables } from "@/hooks/useVariables";
import { useVersions } from "@/hooks/useVersions";
import { usePromptPermission } from "@/hooks/usePromptPermission";
import { useConflictDetection } from "@/hooks/useConflictDetection";
import { usePromptForm } from "@/features/prompts/hooks/usePromptForm";
import type { Tables } from "@/integrations/supabase/types";

type Prompt = Tables<"prompts">;
type Variable = Tables<"variables">;
type Version = Tables<"versions">;

interface PromptEditorContextValue {
  // Data
  prompt?: Prompt;
  variables: Variable[];
  versions: Version[];
  
  // Loading states
  isLoadingPrompt: boolean;
  isLoadingVariables: boolean;
  
  // Permissions
  canEdit: boolean;
  canCreateVersion: boolean;
  isOwner: boolean;
  permission: any;
  
  // Conflict detection
  hasConflict: boolean;
  serverUpdatedAt?: string;
  
  // Form
  form: ReturnType<typeof usePromptForm>;
  
  // Actions
  refetchPrompt: () => void;
  refetchVariables: () => void;
  resetConflict: () => void;
  handleRefreshPrompt: () => void;
  
  // Modes
  isEditMode: boolean;
  promptId?: string;
}

const PromptEditorContext = createContext<PromptEditorContextValue | undefined>(undefined);

interface PromptEditorProviderProps {
  children: ReactNode;
  promptId?: string;
}

export function PromptEditorProvider({ children, promptId }: PromptEditorProviderProps) {
  const isEditMode = !!promptId;
  const { loading: authLoading } = useAuth();
  
  // Queries
  const { data: prompt, isLoading: isLoadingPrompt, refetch: refetchPrompt } = usePrompt(promptId);
  const { data: existingVariables = [], isLoading: isLoadingVariables, refetch: refetchVariables } = useVariables(promptId);
  const { data: versions = [] } = useVersions(promptId);
  
  // Permissions
  const { canEdit: canEditFromPermission, canCreateVersion, permission, isOwner } = usePromptPermission(promptId);
  const canEdit = !isEditMode || (canEditFromPermission && !authLoading);
  
  // Conflict detection
  const { hasConflict, serverUpdatedAt, resetConflict } = useConflictDetection(
    promptId,
    prompt?.updated_at,
    canEdit
  );
  
  // Form - passe clientUpdatedAt capturé à l'ouverture
  const form = usePromptForm({
    prompt,
    existingVariables,
    isEditMode,
    canEdit,
    promptId,
    clientUpdatedAt: prompt?.updated_at ?? undefined,
  });
  
  const handleRefreshPrompt = () => {
    refetchPrompt();
    refetchVariables();
    resetConflict();
  };
  
  const value: PromptEditorContextValue = {
    prompt,
    variables: existingVariables,
    versions,
    isLoadingPrompt,
    isLoadingVariables,
    canEdit,
    canCreateVersion,
    isOwner,
    permission,
    hasConflict,
    serverUpdatedAt,
    form,
    refetchPrompt,
    refetchVariables,
    resetConflict,
    handleRefreshPrompt,
    isEditMode,
    promptId,
  };
  
  return (
    <PromptEditorContext.Provider value={value}>
      {children}
    </PromptEditorContext.Provider>
  );
}

export function usePromptEditorContext() {
  const context = useContext(PromptEditorContext);
  if (!context) {
    throw new Error("usePromptEditorContext must be used within PromptEditorProvider");
  }
  return context;
}
