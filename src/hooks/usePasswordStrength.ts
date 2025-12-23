import { useMemo } from 'react';
import { PASSWORD_STRENGTH } from '@/constants/validation-limits';

/**
 * Résultat du calcul de force du mot de passe
 */
export interface PasswordStrengthResult {
  /** Score de 0 à 6 */
  score: number;
  /** Score maximum possible */
  maxScore: number;
  /** Pourcentage de force (0-100) */
  percentage: number;
  /** Niveau de force */
  level: 'weak' | 'fair' | 'good' | 'strong';
  /** Le mot de passe atteint le score minimum requis */
  isValid: boolean;
  /** Clés de feedback pour les critères non remplis */
  feedback: string[];
  /** État de chaque critère */
  criteria: {
    hasMinLength: boolean;
    hasStrongLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    hasNoCommonPattern: boolean;
  };
}

/**
 * Hook pour calculer la force d'un mot de passe en temps réel
 * Utilise la même logique que l'edge function validate-password-strength
 * 
 * @param password - Le mot de passe à évaluer
 * @returns PasswordStrengthResult avec score, niveau et feedback
 */
export function usePasswordStrength(password: string): PasswordStrengthResult {
  return useMemo(() => {
    const feedback: string[] = [];
    let score = 0;

    // Critères individuels
    const hasMinLength = password.length >= PASSWORD_STRENGTH.MIN_LENGTH;
    const hasStrongLength = password.length >= PASSWORD_STRENGTH.STRONG_LENGTH;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    // Vérifier les patterns communs
    const lowerPassword = password.toLowerCase();
    const hasNoCommonPattern = !PASSWORD_STRENGTH.COMMON_PATTERNS.some(
      pattern => lowerPassword.includes(pattern.toLowerCase())
    );

    // Calcul du score
    if (hasMinLength) score += 1;
    if (hasStrongLength) score += 1;
    if (hasUppercase) score += 1;
    if (hasLowercase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    
    // Pénalité pour pattern commun
    if (!hasNoCommonPattern) score = Math.max(0, score - 2);

    // Génération du feedback
    if (!hasMinLength) feedback.push('addLength');
    else if (!hasStrongLength) feedback.push('addMoreLength');
    if (!hasUppercase) feedback.push('addUppercase');
    if (!hasLowercase) feedback.push('addLowercase');
    if (!hasNumber) feedback.push('addNumber');
    if (!hasSpecial) feedback.push('addSpecial');
    if (!hasNoCommonPattern) feedback.push('avoidCommon');

    // Déterminer le niveau
    let level: PasswordStrengthResult['level'];
    if (score <= 2) level = 'weak';
    else if (score === 3) level = 'fair';
    else if (score === 4) level = 'good';
    else level = 'strong';

    const maxScore = 6;
    const percentage = Math.round((score / maxScore) * 100);
    const isValid = score >= PASSWORD_STRENGTH.MIN_SCORE;

    return {
      score,
      maxScore,
      percentage,
      level,
      isValid,
      feedback,
      criteria: {
        hasMinLength,
        hasStrongLength,
        hasUppercase,
        hasLowercase,
        hasNumber,
        hasSpecial,
        hasNoCommonPattern,
      },
    };
  }, [password]);
}
