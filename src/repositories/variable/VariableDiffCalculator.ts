import type { Variable, VariableUpsertInput, VariableInsert } from "../VariableRepository";

/**
 * Résultat du calcul de diff entre variables existantes et nouvelles
 */
export interface VariableDiff {
  /** Variables à insérer/mettre à jour (avec IDs préservés si applicable) */
  toUpsert: VariableInsert[];
  /** IDs des variables à supprimer (obsolètes) */
  toDeleteIds: string[];
}

/**
 * Calculateur de diff pour les variables - Interface abstraite
 * 
 * Responsabilité unique : Calculer les différences entre 
 * l'état actuel et l'état souhaité des variables
 * 
 * @remarks
 * Cette interface définit un contrat pour les calculateurs de diff.
 * Les implémentations sont **pures** (sans effets de bord) et donc
 * facilement testables sans mocks de base de données.
 * 
 * Pattern utilisé : Strategy (permet d'injecter différentes stratégies de diff)
 */
export interface VariableDiffCalculator {
  /**
   * Calcule le diff entre variables existantes et nouvelles
   * 
   * La stratégie de matching est la suivante :
   * 1. Si une variable a un ID et qu'il existe en base → préserver cet ID (renommage)
   * 2. Sinon, matcher par nom → préserver l'ID de la variable existante (update)
   * 3. Si aucune correspondance → nouvelle variable (insert sans ID)
   * 
   * Les variables existantes non présentes dans incoming sont marquées pour suppression.
   * 
   * @param promptId - ID du prompt parent
   * @param existing - Variables actuellement en base
   * @param incoming - Nouvelles variables souhaitées
   * @returns Diff avec variables à upsert et IDs à supprimer
   */
  calculate(
    promptId: string,
    existing: Variable[],
    incoming: VariableUpsertInput[]
  ): VariableDiff;
}

/**
 * Implémentation par défaut du calculateur de diff
 * 
 * Classe pure sans dépendances externes, facilitant les tests unitaires.
 * 
 * @example
 * ```typescript
 * const calculator = new DefaultVariableDiffCalculator();
 * const diff = calculator.calculate('prompt-1', existingVars, newVars);
 * // diff.toUpsert contient les variables à persister
 * // diff.toDeleteIds contient les IDs à supprimer
 * ```
 */
export class DefaultVariableDiffCalculator implements VariableDiffCalculator {
  calculate(
    promptId: string,
    existing: Variable[],
    incoming: VariableUpsertInput[]
  ): VariableDiff {
    // Maps pour recherche O(1)
    const existingByName = new Map(existing.map(v => [v.name, v]));
    const existingById = new Map(existing.map(v => [v.id, v]));

    // Calcul des variables à upsert avec préservation des IDs
    const toUpsert = incoming.map((v, index) => 
      this.prepareVariableForUpsert(v, index, promptId, existingByName, existingById)
    );

    // Calcul des IDs à supprimer (variables obsolètes)
    const toDeleteIds = this.calculateObsoleteIds(incoming, existing);

    return { toUpsert, toDeleteIds };
  }

  /**
   * Prépare une variable pour l'upsert en préservant l'ID si possible
   * @private
   */
  private prepareVariableForUpsert(
    variable: VariableUpsertInput,
    index: number,
    promptId: string,
    existingByName: Map<string, Variable>,
    existingById: Map<string, Variable>
  ): VariableInsert {
    // Priorité 1 : Variable avec ID explicite (renommage)
    if (variable.id && existingById.has(variable.id)) {
      return {
        ...variable,
        id: variable.id,
        prompt_id: promptId,
        order_index: index,
      } as VariableInsert;
    }

    // Priorité 2 : Matching par nom (update classique)
    const existingByNameMatch = existingByName.get(variable.name);
    
    return {
      ...variable,
      prompt_id: promptId,
      order_index: index,
      ...(existingByNameMatch ? { id: existingByNameMatch.id } : {}),
    } as VariableInsert;
  }

  /**
   * Identifie les IDs des variables à supprimer
   * 
   * Une variable est obsolète si :
   * - Son ID n'est pas dans les variables entrantes (avec ID explicite)
   * - ET son nom n'est pas dans les variables entrantes
   * 
   * @private
   */
  private calculateObsoleteIds(
    incoming: VariableUpsertInput[],
    existing: Variable[]
  ): string[] {
    const incomingIds = new Set(incoming.filter(v => v.id).map(v => v.id));
    const incomingNames = new Set(incoming.map(v => v.name));

    return existing
      .filter(ev => !incomingIds.has(ev.id) && !incomingNames.has(ev.name))
      .map(v => v.id);
  }
}
