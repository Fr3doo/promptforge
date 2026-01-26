import type {
  Prompt,
  PromptWithSharePermission,
  SharePermission,
} from "@/repositories/PromptRepository.interfaces";

/**
 * Type brut retourné par la jointure prompt_shares → prompts
 *
 * Représente une ligne de résultat de la requête :
 * SELECT permission, prompts:prompt_id (*) FROM prompt_shares
 */
export interface ShareJoinResult {
  /** Permission de partage (READ | WRITE) */
  permission: string;
  /** Prompt joint (peut être null si FK invalide) */
  prompts: Prompt | null;
}

/**
 * Transforme les résultats bruts de jointure en PromptWithSharePermission.
 *
 * Fonction **pure** pour testabilité maximale.
 * Extrait la logique de mapping depuis PromptQueryRepository.fetchSharedWithMe.
 *
 * @param data - Résultats bruts de la jointure prompt_shares → prompts
 * @returns Liste de prompts avec permission de partage, triée par updated_at DESC
 *
 * @remarks
 * - Filtre les lignes avec prompts null (FK invalides)
 * - Enrichit chaque prompt avec shared_permission
 * - Trie par date de modification décroissante
 *
 * @example
 * ```typescript
 * const rawData = await qb.selectWithJoin<ShareJoinResult>(...);
 * const prompts = mapShareJoinToPromptWithPermission(rawData ?? []);
 * ```
 */
export function mapShareJoinToPromptWithPermission(
  data: ShareJoinResult[]
): PromptWithSharePermission[] {
  return data
    .filter((row) => row.prompts != null)
    .map((row) => ({
      ...(row.prompts as Prompt),
      shared_permission: row.permission as SharePermission,
    }))
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? 0).getTime() -
        new Date(a.updated_at ?? 0).getTime()
    );
}
