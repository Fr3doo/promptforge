import { TemplateInitializationService } from "./TemplateInitializationService";
import { SupabasePromptQueryRepository } from "@/repositories/PromptQueryRepository";
import { SupabasePromptCommandRepository } from "@/repositories/PromptCommandRepository";
import { SupabaseVariableRepository } from "@/repositories/VariableRepository";
import { SupabaseVariableSetRepository } from "@/repositories/VariableSetRepository";

/**
 * Factory pour créer une instance du TemplateInitializationService
 * avec ses dépendances par défaut
 */
export function createTemplateInitializationService(): TemplateInitializationService {
  const promptQueryRepository = new SupabasePromptQueryRepository();
  const promptCommandRepository = new SupabasePromptCommandRepository();
  const variableRepository = new SupabaseVariableRepository();
  const variableSetRepository = new SupabaseVariableSetRepository();

  return new TemplateInitializationService(
    promptQueryRepository,
    promptCommandRepository,
    variableRepository,
    variableSetRepository
  );
}

/**
 * Instance singleton du service pour l'application
 */
export const templateInitializationService = createTemplateInitializationService();
