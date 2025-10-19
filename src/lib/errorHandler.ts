/**
 * Maps database and application errors to user-friendly messages
 * Prevents exposure of internal database structure and implementation details
 */
export function getSafeErrorMessage(error: any): string {
  // Log full error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error('Error details:', error);
  }

  // Handle Zod validation errors
  if (error?.name === 'ZodError') {
    return error.errors?.[0]?.message || 'Données invalides';
  }

  // Get error code and message safely
  const errorCode = error?.code;
  const errorMessage = error?.message?.toLowerCase() || '';

  // PostgreSQL error codes
  if (errorCode === '23505') return 'Cette entrée existe déjà';
  if (errorCode === '23503') return 'Référence invalide';
  if (errorCode === '23514') return 'Les données ne respectent pas les contraintes';
  if (errorCode === '42501') return 'Action non autorisée';
  
  // Supabase/Auth specific errors
  if (errorMessage.includes('row-level security')) {
    return 'Vous n\'avez pas la permission d\'effectuer cette action';
  }
  if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
    return 'Session expirée, veuillez vous reconnecter';
  }
  if (errorMessage.includes('unique')) {
    return 'Cette valeur est déjà utilisée';
  }
  if (errorMessage.includes('invalid email') || errorMessage.includes('invalid_grant')) {
    return 'Email ou mot de passe invalide';
  }
  if (errorMessage.includes('user already registered')) {
    return 'Cet email est déjà utilisé';
  }
  if (errorMessage.includes('email not confirmed')) {
    return 'Veuillez confirmer votre email avant de vous connecter';
  }
  if (errorMessage.includes('invalid password')) {
    return 'Mot de passe invalide';
  }

  // Generic fallback
  return 'Une erreur est survenue. Veuillez réessayer.';
}
