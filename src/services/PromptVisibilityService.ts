import type { 
  PromptMutationRepository, 
  PromptQueryRepository 
} from "@/repositories/PromptRepository.interfaces";
import type { Visibility, Permission, PromptStatus } from "@/constants/domain-types";
import { VISIBILITY, PERMISSION, PROMPT_STATUS } from "@/constants/domain-types";

/**
 * Service dédié à la gestion de la visibilité et des permissions publiques des prompts
 * 
 * Responsabilité unique : Gérer le cycle de vie de la visibilité (PRIVATE/SHARED)
 * et les permissions d'accès public (READ/WRITE)
 * 
 * @example
 * ```typescript
 * const service = new SupabasePromptVisibilityService();
 * 
 * // Toggle visibilité
 * const newVisibility = await service.toggleVisibility("prompt-id", "PRIVATE", "READ");
 * // => "SHARED" (avec status=PUBLISHED et public_permission=READ)
 * 
 * // Mettre à jour permission
 * await service.updatePublicPermission("prompt-id", "WRITE");
 * ```
 */
export interface PromptVisibilityService {
  /**
   * Bascule la visibilité d'un prompt entre PRIVATE et SHARED
   * 
   * @param id - ID du prompt
   * @param currentVisibility - Visibilité actuelle (PRIVATE ou SHARED)
   * @param publicPermission - Permission à appliquer si passage en SHARED (défaut: READ)
   * @returns Nouvelle visibilité (PRIVATE ou SHARED)
   * 
   * @remarks
   * - PRIVATE → SHARED : Force status=PUBLISHED et applique publicPermission
   * - SHARED → PRIVATE : Réinitialise public_permission à READ
   */
  toggleVisibility(
    id: string,
    currentVisibility: Visibility,
    publicPermission?: Permission
  ): Promise<Visibility>;

  /**
   * Met à jour uniquement la permission publique d'un prompt SHARED
   * 
   * @param id - ID du prompt
   * @param permission - Nouvelle permission (READ ou WRITE)
   * @throws {Error} "PERMISSION_UPDATE_ON_PRIVATE_PROMPT" si le prompt est PRIVATE
   * 
   * @remarks
   * Cette méthode ne change PAS la visibilité, seulement la permission.
   * Le prompt doit être SHARED, sinon une erreur est levée.
   */
  updatePublicPermission(id: string, permission: Permission): Promise<void>;
}

export class SupabasePromptVisibilityService implements PromptVisibilityService {
  constructor(
    private mutationRepository: PromptMutationRepository,
    private queryRepository: PromptQueryRepository
  ) {}

  async toggleVisibility(
    id: string,
    currentVisibility: Visibility,
    publicPermission?: Permission
  ): Promise<Visibility> {
    // Toggle PRIVATE <-> SHARED
    const newVisibility = currentVisibility === VISIBILITY.PRIVATE 
      ? VISIBILITY.SHARED 
      : VISIBILITY.PRIVATE;
    
    const updateData: {
      visibility: Visibility;
      status?: PromptStatus;
      public_permission: Permission;
    } = {
      visibility: newVisibility,
      public_permission: PERMISSION.READ, // Reset to default
    };

    // Force PUBLISHED status and set permission when going public
    if (newVisibility === VISIBILITY.SHARED) {
      updateData.status = PROMPT_STATUS.PUBLISHED;
      updateData.public_permission = publicPermission || PERMISSION.READ;
    }

    await this.mutationRepository.update(id, updateData);
    return newVisibility;
  }

  async updatePublicPermission(id: string, permission: Permission): Promise<void> {
    // First, check if the prompt is SHARED (public permission only applies to SHARED prompts)
    const prompt = await this.queryRepository.fetchById(id);

    if (prompt.visibility !== VISIBILITY.SHARED) {
      throw new Error("PERMISSION_UPDATE_ON_PRIVATE_PROMPT");
    }

    await this.mutationRepository.update(id, { public_permission: permission });
  }
}
