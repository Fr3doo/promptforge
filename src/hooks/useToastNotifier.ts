import { toast } from "@/hooks/use-toast";
import { messages } from "@/constants/messages";
import { ToastAction } from "@/components/ui/toast";
import * as React from "react";

export interface ToastActionConfig {
  label: string;
  onClick: () => void;
}

export interface NotifyOptions {
  action?: ToastActionConfig;
  duration?: number;
}

export function useToastNotifier() {
  const createActionElement = (action: ToastActionConfig) => {
    return React.createElement(
      ToastAction,
      {
        altText: action.label,
        onClick: action.onClick,
      },
      action.label
    );
  };

  const notifySuccess = (title: string, description?: string, options?: NotifyOptions) => {
    toast({
      title: `✅ ${title}`,
      description,
      duration: options?.duration ?? 3000,
      action: options?.action ? createActionElement(options.action) as any : undefined,
    });
  };

  const notifyError = (title: string, description?: string, options?: NotifyOptions) => {
    toast({
      title: `❌ ${title}`,
      description,
      variant: "destructive",
      duration: options?.duration ?? 5000,
      action: options?.action ? createActionElement(options.action) as any : undefined,
    });
  };

  const notifyInfo = (title: string, description?: string, options?: NotifyOptions) => {
    toast({
      title: `ℹ️ ${title}`,
      description,
      duration: options?.duration ?? 4000,
      action: options?.action ? createActionElement(options.action) as any : undefined,
    });
  };

  const notifyWarning = (title: string, description?: string, options?: NotifyOptions) => {
    toast({
      title: `⚠️ ${title}`,
      description,
      duration: options?.duration ?? 4000,
      action: options?.action ? createActionElement(options.action) as any : undefined,
    });
  };

  const notifyLoading = (title: string, description?: string) => {
    return toast({
      title: `⏳ ${title}`,
      description,
      duration: Infinity,
    });
  };

  // Specialized notifications for common scenarios
  const notifyPromptCreated = (promptTitle: string) => {
    const msg = messages.prompts.notifications.created;
    notifySuccess(msg.title, msg.description(promptTitle), { duration: 4000 });
  };

  const notifyPromptUpdated = (promptTitle: string) => {
    const msg = messages.prompts.notifications.updated;
    notifySuccess(msg.title, msg.description(promptTitle), { duration: 3000 });
  };

  const notifyValidationError = (field: string, constraint: string) => {
    notifyError(
      "Validation échouée",
      `${field}: ${constraint}`,
      { duration: 5000 }
    );
  };

  const notifyNetworkError = (action: string, retry?: () => void) => {
    notifyError(
      "Erreur de connexion",
      `Impossible de ${action}. Vérifiez votre connexion internet.`,
      {
        duration: 7000,
        action: retry ? {
          label: "Réessayer",
          onClick: retry,
        } : undefined,
      }
    );
  };

  const notifyServerError = (action: string, retry?: () => void) => {
    notifyError(
      "Erreur serveur",
      `Une erreur s'est produite lors de l'opération "${action}". Veuillez réessayer.`,
      {
        duration: 6000,
        action: retry ? {
          label: "Réessayer",
          onClick: retry,
        } : undefined,
      }
    );
  };

  const notifyPermissionError = (resource: string) => {
    notifyError(
      "Accès refusé",
      `Vous n'avez pas les permissions nécessaires pour modifier ${resource}.`,
      { duration: 5000 }
    );
  };

  const notifyConflictError = (resourceName: string, reload?: () => void) => {
    notifyError(
      "Conflit détecté",
      `${resourceName} a été modifié par un autre utilisateur. Veuillez recharger pour voir les dernières modifications.`,
      {
        duration: 8000,
        action: reload ? {
          label: "Recharger",
          onClick: reload,
        } : undefined,
      }
    );
  };

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    notifyLoading,
    // Specialized notifications
    notifyPromptCreated,
    notifyPromptUpdated,
    notifyValidationError,
    notifyNetworkError,
    notifyServerError,
    notifyPermissionError,
    notifyConflictError,
  };
}
