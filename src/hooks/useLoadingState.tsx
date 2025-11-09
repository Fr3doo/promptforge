import { ReactNode } from "react";

/**
 * Configuration pour le hook de gestion des états de chargement
 */
interface LoadingStateConfig<T> {
  /** Indicateur de chargement en cours */
  isLoading: boolean;
  
  /** Données à afficher */
  data: T | undefined;
  
  /** Erreur éventuelle */
  error?: Error | null;
  
  /** Composant à afficher pendant le chargement */
  loadingComponent: ReactNode;
  
  /** Composant à afficher en cas d'erreur (optionnel) */
  errorComponent?: (error: Error) => ReactNode;
  
  /** Composant à afficher si les données sont vides (optionnel) */
  emptyComponent?: ReactNode;
  
  /** Fonction pour déterminer si les données sont vides */
  isEmpty?: (data: T) => boolean;
}

/**
 * Résultat du hook useLoadingState
 */
interface LoadingStateResult {
  /** Indique si le contenu de fallback doit être rendu */
  shouldRender: boolean;
  
  /** Contenu de fallback à rendre (loading, error ou empty) */
  content: ReactNode;
}

/**
 * Hook pour gérer de manière centralisée les états de chargement, erreur et vide
 * 
 * @example
 * ```tsx
 * const loadingState = useLoadingState({
 *   isLoading,
 *   data: prompts,
 *   loadingComponent: <PromptListSkeleton />,
 *   emptyComponent: <EmptyState icon={FileText} title="Aucun prompt" />,
 *   isEmpty: (data) => data.length === 0,
 * });
 * 
 * if (loadingState.shouldRender) {
 *   return loadingState.content;
 * }
 * 
 * return <PromptList prompts={prompts} />;
 * ```
 */
export function useLoadingState<T>({
  isLoading,
  data,
  error,
  loadingComponent,
  errorComponent,
  emptyComponent,
  isEmpty,
}: LoadingStateConfig<T>): LoadingStateResult {
  // 1. Priorité maximale : état de chargement
  if (isLoading) {
    return { shouldRender: true, content: loadingComponent };
  }

  // 2. Deuxième priorité : erreur
  if (error && errorComponent) {
    return { shouldRender: true, content: errorComponent(error) };
  }

  // 3. Troisième priorité : données vides
  if (data && isEmpty?.(data) && emptyComponent) {
    return { shouldRender: true, content: emptyComponent };
  }

  // 4. Données disponibles : pas de fallback
  return { shouldRender: false, content: null };
}
