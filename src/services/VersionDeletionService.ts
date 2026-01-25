import type { VersionRepository } from "@/repositories/VersionRepository";
import { logDebug, logInfo } from "@/lib/logger";

/**
 * Résultat d'une suppression de versions avec cascade
 */
export interface VersionDeletionResult {
  /** ID du prompt concerné */
  promptId: string;
  /** Nombre de versions supprimées */
  deletedCount: number;
  /** Nouvelle version courante si mise à jour nécessaire */
  newCurrentVersion?: string;
}

/**
 * Paramètres pour la suppression de versions
 */
export interface VersionDeletionParams {
  /** IDs des versions à supprimer */
  versionIds: string[];
  /** ID du prompt parent */
  promptId: string;
  /** Version courante du prompt (pour détecter si cascade nécessaire) */
  currentVersion?: string;
}

/**
 * Service de suppression de versions avec gestion cascade
 * 
 * Responsabilité unique : Supprimer des versions et maintenir
 * la cohérence du champ version du prompt parent
 * 
 * @remarks
 * Suit le pattern DIP via injection du VersionRepository.
 * Extrait la logique métier de useDeleteVersions pour testabilité.
 */
export interface VersionDeletionService {
  /**
   * Supprime des versions avec mise à jour cascade du prompt
   * 
   * Comportement :
   * 1. Récupère les versions à supprimer pour vérifier si courante incluse
   * 2. Supprime les versions
   * 3. Si version courante supprimée → met à jour vers la dernière restante
   * 4. Si aucune version restante → reset à "1.0.0"
   * 
   * @param params - Paramètres de suppression
   * @returns Résultat avec nouvelle version courante si applicable
   * @throws {Error} Si versionIds est vide
   * @throws {Error} Si violation RLS (non propriétaire)
   */
  deleteWithCascade(params: VersionDeletionParams): Promise<VersionDeletionResult>;
}

/**
 * Implémentation par défaut du service de suppression de versions
 * 
 * @example
 * ```typescript
 * const service = new DefaultVersionDeletionService(versionRepository);
 * const result = await service.deleteWithCascade({
 *   versionIds: ['v1', 'v2'],
 *   promptId: 'prompt-1',
 *   currentVersion: '1.2.0'
 * });
 * // result.newCurrentVersion sera défini si '1.2.0' a été supprimée
 * ```
 */
export class DefaultVersionDeletionService implements VersionDeletionService {
  constructor(private readonly versionRepository: VersionRepository) {}

  async deleteWithCascade(params: VersionDeletionParams): Promise<VersionDeletionResult> {
    const { versionIds, promptId, currentVersion } = params;

    logDebug("Suppression de versions", { count: versionIds.length, promptId });

    // Step 1: Fetch versions to check if current is included
    const versionsToDelete = await this.versionRepository.fetchByIds(versionIds);
    const isCurrentVersionIncluded = this.isCurrentVersionInList(versionsToDelete, currentVersion);

    // Step 2: Delete the versions
    await this.versionRepository.delete(versionIds);

    // Step 3: Update prompt version if necessary
    const newCurrentVersion = await this.updatePromptVersionIfNeeded(
      promptId,
      isCurrentVersionIncluded
    );

    logInfo("Versions supprimées", { count: versionIds.length, promptId });

    return {
      promptId,
      deletedCount: versionIds.length,
      newCurrentVersion,
    };
  }

  /**
   * Vérifie si la version courante est dans la liste à supprimer
   * @private
   */
  private isCurrentVersionInList(
    versions: { semver: string }[],
    currentVersion?: string
  ): boolean {
    if (!currentVersion) return false;
    return versions.some(v => v.semver === currentVersion);
  }

  /**
   * Met à jour la version du prompt si nécessaire
   * @returns La nouvelle version si mise à jour effectuée, undefined sinon
   * @private
   */
  private async updatePromptVersionIfNeeded(
    promptId: string,
    isCurrentVersionIncluded: boolean
  ): Promise<string | undefined> {
    if (!isCurrentVersionIncluded) {
      return undefined;
    }

    logInfo("Version courante supprimée, mise à jour du prompt");

    const latestVersion = await this.versionRepository.fetchLatestByPromptId(promptId);

    if (latestVersion) {
      await this.versionRepository.updatePromptVersion(promptId, latestVersion.semver);
      logInfo("Prompt mis à jour vers version", { semver: latestVersion.semver });
      return latestVersion.semver;
    } else {
      await this.versionRepository.updatePromptVersion(promptId, "1.0.0");
      logInfo("Aucune version restante, réinitialisation à 1.0.0");
      return "1.0.0";
    }
  }
}
