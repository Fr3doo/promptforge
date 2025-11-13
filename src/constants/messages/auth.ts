/**
 * Authentication domain messages - Login, signup, logout
 */

export const auth = {
  // Login
  loginTitle: "Connexion",
  loginSubtitle: "Accédez à votre bibliothèque de prompts",
  loginSuccess: "Connexion réussie",
  loginButton: "Se connecter",
  loginWithEmail: "Se connecter avec email",
  loginWithGoogle: "Se connecter avec Google",
  signInButton: "Se connecter",
  
  // Signup
  signupTitle: "Créer un compte",
  signupSubtitle: "Rejoignez PromptForge pour créer et gérer vos prompts",
  signupSuccess: "Compte créé avec succès",
  signupButton: "Créer un compte",
  signupRedirect: "Vous avez déjà un compte ?",
  signupWithEmail: "Créer un compte avec email",
  signupWithGoogle: "Créer un compte avec Google",
  signUpButton: "Créer un compte",
  
  // Logout
  logoutSuccess: "Déconnexion réussie",
  logoutButton: "Se déconnecter",
  
  // Session
  sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
  sessionRefreshed: "Session actualisée",
  
  // Errors
  errors: {
    invalidCredentials: "Email ou mot de passe incorrect",
    emailExists: "Cette adresse email est déjà utilisée",
    weakPassword: "Le mot de passe doit contenir au moins 8 caractères",
    signupError: "Une erreur s'est produite lors de la création du compte",
    loginError: "Une erreur s'est produite lors de la connexion",
    logoutError: "Impossible de se déconnecter. Veuillez réessayer.",
    emailNotVerified: "Veuillez vérifier votre adresse email avant de vous connecter",
    accountDisabled: "Ce compte a été désactivé. Contactez le support.",
    tooManyAttempts: "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
    networkError: "Erreur de connexion. Vérifiez votre connexion internet.",
    signOutFailed: "Impossible de se déconnecter",
  },

  // Password reset
  passwordReset: {
    title: "Réinitialiser le mot de passe",
    subtitle: "Nous vous enverrons un lien de réinitialisation par email",
    button: "Envoyer le lien",
    success: "Lien de réinitialisation envoyé",
    successDescription: "Vérifiez votre boîte email pour réinitialiser votre mot de passe",
    error: "Impossible d'envoyer le lien de réinitialisation",
    backToLogin: "Retour à la connexion",
  },

  // Email verification
  emailVerification: {
    title: "Vérification de l'email",
    description: "Nous vous avons envoyé un email de vérification",
    resend: "Renvoyer l'email",
    resendSuccess: "Email de vérification renvoyé",
    resendError: "Impossible de renvoyer l'email de vérification",
  },
} as const;
