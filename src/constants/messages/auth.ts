/**
 * Authentication Domain Messages Module
 * 
 * Responsibilities:
 * - Login/logout messages
 * - Signup messages
 * - Authentication errors
 * - Session management notifications
 */

export const authMessages = {
  // Main auth messages
  auth: {
    loginTitle: "Connexion",
    loginSubtitle: "Accédez à vos prompts",
    loginSuccess: "Connexion réussie !",
    loginButton: "Se connecter",
    signupTitle: "Créer un compte",
    signupSubtitle: "Commencez à gérer vos prompts professionnellement",
    signupSuccess: "Compte créé avec succès !",
    signupButton: "Créer mon compte",
    noAccount: "Pas de compte ?",
    createAccount: "Créer un compte",
    alreadyHaveAccount: "Déjà un compte ?",
    signIn: "Se connecter",
    signInButton: "Se connecter",
    signUpButton: "S'inscrire",
    logout: "Déconnexion",
  },

  // Success messages
  success: {
    signedOut: "Déconnexion réussie",
  },

  // Authentication errors
  errors: {
    auth: {
      signOutFailed: "Impossible de se déconnecter",
      passwordBreached: "Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre plus sécurisé.",
      passwordCheckFailed: "Impossible de vérifier la sécurité du mot de passe. Réessayez.",
    },
  },

  // Security checks
  security: {
    checkingPassword: "Vérification de la sécurité du mot de passe...",
  },
} as const;
