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

  // Specialized notifications for prompts (legacy compatibility)
  const notifyPromptCreated = (promptTitle: string) => {
    const msg = messages.prompts.notifications.created;
    notifySuccess(msg.title, msg.description(promptTitle), { duration: 4000 });
  };

  const notifyPromptUpdated = (promptTitle: string) => {
    const msg = messages.prompts.notifications.updated;
    notifySuccess(msg.title, msg.description(promptTitle), { duration: 3000 });
  };

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    notifyLoading,
    // Legacy prompt notifications (consider using usePromptMessages instead)
    notifyPromptCreated,
    notifyPromptUpdated,
  };
}
