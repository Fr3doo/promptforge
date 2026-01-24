import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { safeRedirectPath } from "@/lib/urlSecurity";

const DEFAULT_REDIRECT = "/dashboard";

/**
 * Hook centralisant la logique de redirection post-authentification.
 *
 * Responsabilités (SRP) :
 * - Lecture du paramètre redirectTo depuis l'URL
 * - Validation via safeRedirectPath()
 * - Navigation sécurisée vers la destination
 * - Génération de liens avec préservation du redirectTo
 *
 * @example
 * const { redirectToTarget, buildLinkWithRedirect } = useRedirectAfterAuth();
 *
 * // Après login réussi
 * redirectToTarget();
 *
 * // Lien vers signup avec préservation
 * <Link to={buildLinkWithRedirect("/signup")}>Créer un compte</Link>
 */
export function useRedirectAfterAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawRedirectTo = searchParams.get("redirectTo");

  const targetPath = useMemo(
    () => safeRedirectPath(rawRedirectTo, DEFAULT_REDIRECT),
    [rawRedirectTo]
  );

  const redirectToTarget = useCallback(() => {
    navigate(targetPath);
  }, [navigate, targetPath]);

  const buildLinkWithRedirect = useCallback(
    (basePath: string): string => {
      if (!rawRedirectTo) return basePath;
      return `${basePath}?redirectTo=${encodeURIComponent(rawRedirectTo)}`;
    },
    [rawRedirectTo]
  );

  return {
    /** Chemin validé pour la redirection (ou fallback) */
    targetPath,
    /** Paramètre redirectTo brut (pour debug/logging) */
    rawRedirectTo,
    /** Navigue vers la destination sécurisée */
    redirectToTarget,
    /** Génère un lien avec préservation du redirectTo */
    buildLinkWithRedirect,
  };
}
