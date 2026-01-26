import type { PromptShare } from "@/repositories/PromptShareRepository";

/**
 * Module d'assertions d'autorisation pour les opérations de partage
 *
 * Responsabilité unique : Valider les préconditions d'autorisation
 * avant les opérations de partage (ajout, modification, suppression)
 *
 * @remarks
 * Toutes les fonctions sont **pures** (sans effets de bord) et utilisent
 * le pattern assertion (throw si invalide) pour une API cohérente.
 *
 * Pattern inspiré de : usePromptSaveErrorHandler.ts (classifyError)
 */

/**
 * Vérifie les préconditions de session utilisateur
 * @param userId - ID de l'utilisateur courant
 * @throws {Error} "SESSION_EXPIRED" si userId est vide ou undefined
 */
export function assertSession(
  userId: string | undefined
): asserts userId is string {
  if (!userId) {
    throw new Error("SESSION_EXPIRED");
  }
}

/**
 * Vérifie qu'un utilisateur ne partage pas avec lui-même
 * @param targetUserId - ID du destinataire du partage
 * @param currentUserId - ID de l'utilisateur courant
 * @throws {Error} "SELF_SHARE" si tentative de partage avec soi-même
 */
export function assertNotSelfShare(
  targetUserId: string,
  currentUserId: string
): void {
  if (targetUserId === currentUserId) {
    throw new Error("SELF_SHARE");
  }
}

/**
 * Vérifie que l'utilisateur est propriétaire du prompt
 * @param isOwner - Résultat de la vérification de propriété
 * @throws {Error} "NOT_PROMPT_OWNER" si non propriétaire
 */
export function assertPromptOwner(isOwner: boolean): void {
  if (!isOwner) {
    throw new Error("NOT_PROMPT_OWNER");
  }
}

/**
 * Vérifie qu'un partage existe
 * @param share - Le partage récupéré (peut être null)
 * @throws {Error} "SHARE_NOT_FOUND" si le partage n'existe pas
 */
export function assertShareExists(
  share: PromptShare | null
): asserts share is PromptShare {
  if (!share) {
    throw new Error("SHARE_NOT_FOUND");
  }
}

/**
 * Vérifie l'autorisation de modifier/supprimer un partage
 *
 * L'utilisateur doit être soit :
 * - Le créateur du partage (shared_by)
 * - Le propriétaire du prompt
 *
 * @param share - Le partage à modifier/supprimer
 * @param currentUserId - ID de l'utilisateur courant
 * @param isPromptOwner - Résultat de la vérification de propriété du prompt
 * @param operation - Type d'opération ("UPDATE" | "DELETE")
 * @throws {Error} "UNAUTHORIZED_UPDATE" ou "UNAUTHORIZED_DELETE" si non autorisé
 */
export function assertShareModifyAuthorization(
  share: PromptShare,
  currentUserId: string,
  isPromptOwner: boolean,
  operation: "UPDATE" | "DELETE"
): void {
  const isSharedBy = share.shared_by === currentUserId;

  if (!isSharedBy && !isPromptOwner) {
    throw new Error(`UNAUTHORIZED_${operation}`);
  }
}
