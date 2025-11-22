import { TemplateInitializationService } from "./TemplateInitializationService";
import { SupabasePromptRepository } from "@/repositories/PromptRepository";
import { SupabaseVariableRepository } from "@/repositories/VariableRepository";

/**
 * Factory pour créer une instance du TemplateInitializationService
 * avec ses dépendances par défaut
 */
export function createTemplateInitializationService(): TemplateInitializationService {
  const promptRepository = new SupabasePromptRepository();
  const variableRepository = new SupabaseVariableRepository();

  return new TemplateInitializationService(
    promptRepository,
    variableRepository
  );
}

/**
 * Instance singleton du service pour l'application
 */
export const templateInitializationService = createTemplateInitializationService();
