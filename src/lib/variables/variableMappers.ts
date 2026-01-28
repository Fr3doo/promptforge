import type {
  Variable,
  VariableUpsertInput,
} from "@/repositories/VariableRepository";
import type { ImportableVariable } from "@/lib/promptImport";

/**
 * Transforme une variable existante en input pour upsert
 *
 * Utilisé pour la duplication de prompts.
 * Préserve tous les champs métier sans les IDs (id, prompt_id).
 *
 * @param variable - Variable source à transformer
 * @returns Input prêt pour upsertMany
 *
 * @example
 * ```typescript
 * const variable: Variable = { id: "...", prompt_id: "...", name: "var1", ... };
 * const input = toVariableUpsertInput(variable);
 * // input n'a pas id ni prompt_id
 * ```
 */
export function toVariableUpsertInput(variable: Variable): VariableUpsertInput {
  return {
    name: variable.name,
    type: variable.type,
    required: variable.required,
    default_value: variable.default_value,
    help: variable.help,
    pattern: variable.pattern,
    options: variable.options,
    order_index: variable.order_index,
  };
}

/**
 * Transforme un tableau de variables pour duplication
 *
 * @param variables - Tableau de variables sources
 * @returns Tableau d'inputs prêts pour upsertMany
 */
export function toVariableUpsertInputs(
  variables: Variable[]
): VariableUpsertInput[] {
  return variables.map(toVariableUpsertInput);
}

/**
 * Transforme une variable importée en input pour upsert
 *
 * Utilisé lors de l'import depuis JSON/Markdown.
 * Applique les valeurs par défaut pour les champs optionnels.
 *
 * @param variable - Variable importée (format externe)
 * @param index - Position pour order_index
 * @returns Input prêt pour upsertMany
 *
 * @remarks
 * Différences avec toVariableUpsertInput :
 * - Type casté vers les valeurs autorisées (fallback "STRING")
 * - required par défaut à false
 * - Mapping defaultValue → default_value
 * - pattern forcé à null (non supporté à l'import)
 */
export function fromImportable(
  variable: ImportableVariable,
  index: number
): VariableUpsertInput {
  return {
    name: variable.name,
    type:
      (variable.type as
        | "STRING"
        | "NUMBER"
        | "BOOLEAN"
        | "ENUM"
        | "DATE"
        | "MULTISTRING") || "STRING",
    required: variable.required ?? false,
    default_value: variable.defaultValue ?? null,
    help: variable.help ?? null,
    pattern: null, // Non supporté à l'import
    options: variable.options ?? null,
    order_index: index,
  };
}

/**
 * Transforme un tableau de variables importées
 *
 * @param variables - Tableau de variables importées
 * @returns Tableau d'inputs avec order_index séquentiel
 */
export function fromImportables(
  variables: ImportableVariable[]
): VariableUpsertInput[] {
  return variables.map((v, i) => fromImportable(v, i));
}
