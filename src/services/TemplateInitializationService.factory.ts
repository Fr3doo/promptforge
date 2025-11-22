import { TemplateInitializationService } from "./TemplateInitializationService";
import { SupabasePromptRepository } from "@/repositories/PromptRepository";
import { SupabaseVariableRepository } from "@/repositories/VariableRepository";
import { SupabaseVariableSetRepository } from "@/repositories/VariableSetRepository";

/**
 * Factory pour créer une instance du TemplateInitializationService
 * avec ses dépendances par défaut
 */
export function createTemplateInitializationService(): TemplateInitializationService {
  const promptRepository = new SupabasePromptRepository();
  const variableRepository = new SupabaseVariableRepository();
  const variableSetRepository = new SupabaseVariableSetRepository();

  return new TemplateInitializationService(
    promptRepository,
    variableRepository,
    variableSetRepository
  );
}

/**
 * Instance singleton du service pour l'application
 */
export const templateInitializationService = createTemplateInitializationService();
