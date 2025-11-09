/**
 * Contexte de validation (optionnel)
 * Permet aux validateurs d'accéder à des métadonnées
 */
export interface ValidationContext {
  /** Mode d'édition (création vs mise à jour) */
  isEditMode?: boolean;
  
  /** Données complètes du formulaire (pour validations inter-champs) */
  formData?: Record<string, any>;
  
  /** Métadonnées custom */
  metadata?: Record<string, any>;
}

/**
 * Résultat d'une validation
 */
export interface ValidationResult {
  /** Indique si la validation a réussi */
  isValid: boolean;
  
  /** Message d'erreur (si isValid = false) */
  error?: string;
  
  /** Champ concerné (pour affichage dans le formulaire) */
  field?: string;
  
  /** Métadonnées supplémentaires (ex: suggestions de correction) */
  metadata?: Record<string, any>;
}

/**
 * Interface d'un validateur
 * Suit le principe de responsabilité unique : 1 validateur = 1 règle
 */
export interface Validator<T = any> {
  /** Nom du validateur (pour debug et logging) */
  name: string;
  
  /** Fonction de validation */
  validate: (value: T, context?: ValidationContext) => ValidationResult | Promise<ValidationResult>;
  
  /** Priorité d'exécution (1 = haute, 10 = basse) */
  priority?: number;
  
  /** Si true, arrête la validation en cas d'échec */
  stopOnFailure?: boolean;
}

/**
 * Résultat d'une validation composite (plusieurs validateurs)
 */
export interface CompositeValidationResult {
  /** Indique si TOUTES les validations ont réussi */
  isValid: boolean;
  
  /** Erreurs par champ */
  errors: Record<string, string>;
  
  /** Liste des validations qui ont échoué */
  failedValidators: string[];
  
  /** Métadonnées agrégées */
  metadata?: Record<string, any>;
}
