import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { usePromptEditorContext } from "@/features/prompts/contexts/PromptEditorContext";
import { LoadingButton } from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageBreadcrumb, BreadcrumbItemData } from "@/components/PageBreadcrumb";
import { ArrowLeft, Eye, Download } from "lucide-react";
import { messages } from "@/constants/messages";
import { ExportPromptDialog } from "@/components/prompts/ExportPromptDialog";

/**
 * Header component for prompt editor
 * Handles navigation back button, breadcrumb, export and save button
 */
export function PromptEditorHeader() {
  const navigate = useNavigate();
  const { form, canEdit, permission, hasConflict, promptId, prompt, variables } = usePromptEditorContext();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
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
            
            {/* Export button - only show for existing prompts */}
            {promptId && prompt && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setExportDialogOpen(true)}
                      aria-label={messages.promptActions.export}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Exporter Prompt</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="sm:hidden">
                    <p>{messages.promptActions.export}</p>
                  </TooltipContent>
                </Tooltip>
                <ExportPromptDialog
                  open={exportDialogOpen}
                  onOpenChange={setExportDialogOpen}
                  prompt={prompt}
                  variables={variables}
                />
              </>
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
