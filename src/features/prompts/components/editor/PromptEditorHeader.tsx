import { useNavigate } from "react-router-dom";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { usePromptEditorContext } from "@/features/prompts/contexts/PromptEditorContext";
import { LoadingButton } from "@/components/LoadingButton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageBreadcrumb, BreadcrumbItemData } from "@/components/PageBreadcrumb";
import { ArrowLeft, Eye } from "lucide-react";
import { messages } from "@/constants/messages";

/**
 * Header component for prompt editor
 * Handles navigation back button, breadcrumb and save button
 */
export function PromptEditorHeader() {
  const navigate = useNavigate();
  const { form, canEdit, permission, hasConflict, promptId } = usePromptEditorContext();
  const tooltips = messages.tooltips.prompts.save;
  const breadcrumbMessages = messages.breadcrumb;
  
  const { confirmNavigation } = useUnsavedChangesWarning({
    hasUnsavedChanges: form.hasUnsavedChanges && !form.isSaving,
  });

  const saveTooltip = !canEdit 
    ? tooltips.readOnly 
    : !form.isFormValid 
    ? tooltips.disabled 
    : undefined;

  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: breadcrumbMessages.prompts, href: "/prompts" },
    { 
      label: promptId 
        ? (form.title || breadcrumbMessages.untitled) 
        : breadcrumbMessages.newPrompt 
    },
  ];
  
  return (
    <div className="border-b border-border bg-card sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <PageBreadcrumb items={breadcrumbItems} />
      </div>
      <div className="container mx-auto px-4 pb-4">
        <div className="flex items-center justify-between gap-4">
          <LoadingButton 
            variant="ghost" 
            onClick={() => confirmNavigation(() => navigate("/prompts"))} 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </LoadingButton>
          
          <div className="flex items-center gap-3">
            {!canEdit && permission && (
              <Badge variant="secondary" className="gap-1.5">
                <Eye className="h-3 w-3" />
                Mode lecture seule
              </Badge>
            )}
            {saveTooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <LoadingButton
                      onClick={() => form.handleSave(promptId, hasConflict)}
                      isLoading={form.isSaving}
                      loadingText="Enregistrement..."
                      className="gap-2"
                      disabled={!canEdit || hasConflict || !form.isFormValid}
                    >
                      Enregistrer
                    </LoadingButton>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{saveTooltip}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <LoadingButton
                onClick={() => form.handleSave(promptId, hasConflict)}
                isLoading={form.isSaving}
                loadingText="Enregistrement..."
                className="gap-2"
                disabled={!canEdit || hasConflict || !form.isFormValid}
              >
                Enregistrer
              </LoadingButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
