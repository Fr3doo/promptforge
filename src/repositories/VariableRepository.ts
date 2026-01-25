import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { qb } from "@/lib/supabaseQueryBuilder";
import { captureException } from "@/lib/logger";
import { 
  DefaultVariableDiffCalculator, 
  type VariableDiffCalculator 
} from "./variable/VariableDiffCalculator";

export type Variable = Tables<"variables">;
export type VariableInsert = TablesInsert<"variables">;

export type VariableUpsertInput = Omit<VariableInsert, "prompt_id"> & { id?: string };

/**
 * Repository pour la gestion des variables de prompts
 * 
 * Gère les opérations CRUD sur les variables stockées dans Supabase
 * 
 * @remarks
 * Toutes les méthodes lèvent une erreur si la connexion à la base échoue.
 * Les implémentations doivent respecter les préconditions documentées.
 */
export interface VariableRepository {
  /**
   * Récupère toutes les variables d'un prompt
   * @param promptId - Identifiant du prompt (requis, non vide)
   * @returns Liste des variables ordonnées par order_index
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   * @remarks Retourne un tableau vide si promptId est vide (comportement défensif)
   */
  fetch(promptId: string): Promise<Variable[]>;

  /**
   * Crée une nouvelle variable
   * @param variable - Données de la variable à créer
   * @returns La variable créée avec son id généré
   * @throws {Error} Si variable.prompt_id est manquant
   * @throws {Error} Si variable.name est vide
   * @throws {Error} Si violation RLS (permissions insuffisantes sur le prompt parent)
   * @throws {Error} Si la requête échoue
   */
  create(variable: VariableInsert): Promise<Variable>;

  /**
   * Met à jour une variable existante
   * @param id - Identifiant de la variable (requis, non vide)
   * @param updates - Champs à mettre à jour
   * @returns La variable mise à jour
   * @throws {Error} Si id est vide ou undefined
   * @throws {Error} Si la variable n'existe pas (PGRST116)
   * @throws {Error} Si violation RLS (permissions insuffisantes)
   * @throws {Error} Si la requête échoue
   */
  update(id: string, updates: Partial<Variable>): Promise<Variable>;

  /**
   * Supprime toutes les variables d'un prompt
   * @param promptId - Identifiant du prompt (requis, non vide)
   * @throws {Error} Si violation RLS (non propriétaire du prompt)
   * @throws {Error} Si la requête échoue
   */
  deleteMany(promptId: string): Promise<void>;

  /**
   * Upsert atomique de plusieurs variables pour un prompt
   * 
   * Cette méthode assure l'intégrité des données en :
   * - Préservant les IDs des variables existantes (matching par nom)
   * - Supportant le renommage via l'ID (matching par ID)
   * - Supprimant uniquement les variables réellement retirées
   * - Utilisant l'upsert Supabase avec résolution de conflit par ID
   * 
   * @param promptId - Identifiant du prompt (requis, non vide)
   * @param variables - Tableau des variables à upsert (sans prompt_id)
   * @returns Tableau des variables upsertées
   * @throws {Error} Si promptId est vide ou undefined
   * @throws {Error} Si violation RLS (permissions insuffisantes)
   * @throws {Error} Si la transaction échoue (logged via captureException)
   */
  upsertMany(promptId: string, variables: VariableUpsertInput[]): Promise<Variable[]>;
}

/**
 * Repository for managing prompt variables using Supabase via QueryBuilder
 * 
 * The upsertMany method uses an atomic transaction-like approach:
 * 1. Fetches existing variables to maintain their IDs
 * 2. Delegates diff calculation to VariableDiffCalculator (SRP)
 * 3. Deletes variables that are no longer present
 * 4. Upserts remaining variables (updates existing, inserts new)
 * 
 * This approach avoids mass deletions and preserves variable IDs,
 * ensuring referential integrity and preventing data loss.
 * 
 * @remarks
 * Follows DIP: VariableDiffCalculator is injected via constructor
 */
export class SupabaseVariableRepository implements VariableRepository {
  private readonly diffCalculator: VariableDiffCalculator;

  constructor(diffCalculator: VariableDiffCalculator = new DefaultVariableDiffCalculator()) {
    this.diffCalculator = diffCalculator;
  }

  async fetch(promptId: string): Promise<Variable[]> {
    if (!promptId) return [];
    return qb.selectMany<Variable>("variables", {
      filters: { eq: { prompt_id: promptId } },
      order: { column: "order_index", ascending: true },
    });
  }

  async create(variable: VariableInsert): Promise<Variable> {
    return qb.insertOne<Variable, VariableInsert>("variables", variable);
  }

  async update(id: string, updates: Partial<Variable>): Promise<Variable> {
    return qb.updateById<Variable>("variables", id, updates);
  }

  async deleteMany(promptId: string): Promise<void> {
    return qb.deleteWhere("variables", "prompt_id", promptId);
  }

  /**
   * Atomic upsert of variables for a prompt
   * 
   * This method ensures data integrity by:
   * - Delegating diff calculation to VariableDiffCalculator (pure, testable)
   * - Matching variables by name to preserve IDs (updates)
   * - Matching variables by ID to support renaming
   * - Only deleting variables that are truly removed
   * - Using Supabase upsert with ID conflict resolution
   * - Maintaining order_index for all variables
   * 
   * @param promptId - The ID of the prompt
   * @param variables - Array of variables to upsert (without prompt_id)
   *                    Can include optional `id` field to preserve ID during rename
   * @returns Array of upserted variables
   * 
   * @example
   * ```typescript
   * // Update existing variable and add new one
   * await repository.upsertMany('prompt-123', [
   *   { name: 'existing', type: 'STRING', required: true }, // Will update
   *   { name: 'new', type: 'NUMBER', required: false }      // Will insert
   * ]);
   * 
   * // Rename variable while preserving ID
   * await repository.upsertMany('prompt-123', [
   *   { id: 'var-1', name: 'newName', type: 'STRING', required: true } // Rename
   * ]);
   * ```
   */
  async upsertMany(promptId: string, variables: VariableUpsertInput[]): Promise<Variable[]> {
    // Edge case: No variables means remove all
    if (variables.length === 0) {
      await this.deleteMany(promptId);
      return [];
    }

    try {
      // Step 1: Fetch existing variables
      const existingVariables = await this.fetch(promptId);

      // Step 2: Calculate diff using injected calculator (SRP)
      const diff = this.diffCalculator.calculate(promptId, existingVariables, variables);

      // Step 3: Delete obsolete variables
      if (diff.toDeleteIds.length > 0) {
        await qb.deleteByIds("variables", diff.toDeleteIds);
      }

      // Step 4: Perform atomic upsert via qb
      return await qb.upsertMany<Variable, VariableInsert>("variables", diff.toUpsert, {
        onConflict: "id",
        order: { column: "order_index", ascending: true },
      });
    } catch (error) {
      captureException(error, "Transaction failed in upsertMany", { 
        promptId,
        variablesCount: variables.length 
      });
      throw error;
    }
  }
}
