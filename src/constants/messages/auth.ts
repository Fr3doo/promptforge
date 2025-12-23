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
      passwordTooWeak: "Votre mot de passe est trop faible. Suivez les conseils ci-dessous.",
      passwordCheckUnavailable: "La vérification de sécurité est indisponible. Veuillez réessayer plus tard.",
    },
  },

  // Security checks
  security: {
    checkingPassword: "Vérification de la sécurité du mot de passe...",
    checkingStrength: "Vérification de la force du mot de passe...",
  },

  // Password strength feedback
  feedback: {
    addUppercase: "Ajoutez au moins une majuscule",
    addLowercase: "Ajoutez au moins une minuscule",
    addNumber: "Ajoutez au moins un chiffre",
    addSpecial: "Ajoutez un caractère spécial (!@#$...)",
    avoidCommon: "Évitez les mots de passe courants",
    addLength: "Utilisez au moins 8 caractères",
    addMoreLength: "Utilisez au moins 12 caractères pour plus de sécurité",
  },

  // Password strength levels
  strength: {
    title: "Force du mot de passe",
    weak: "Faible",
    fair: "Moyen",
    good: "Bon",
    strong: "Fort",
  },
} as const;
