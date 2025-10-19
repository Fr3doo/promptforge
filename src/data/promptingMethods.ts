export interface PromptingMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  purpose: string;
  example: string;
  useCases: string[];
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
}

export const promptingMethods: PromptingMethod[] = [
  {
    id: "zero-shot",
    name: "Zero-shot Prompting",
    icon: "🎯",
    description: "Le modèle reçoit uniquement la question ou la tâche, sans exemple.",
    purpose: "Tester la compréhension 'native' du modèle sans guidance préalable.",
    example: "Explique le principe de la gravitation universelle en une phrase simple.",
    useCases: [
      "Questions factuelles simples",
      "Tâches générales bien connues",
      "Premier test d'une idée"
    ],
    difficulty: "Débutant"
  },
  {
    id: "one-shot",
    name: "One-shot Prompting",
    icon: "1️⃣",
    description: "On fournit un seul exemple avant la tâche.",
    purpose: "Donner une base de style ou de structure avec un exemple minimal.",
    example: `Exemple :
Q: Quelle est la capitale de la France ?
R: Paris.

Q: Quelle est la capitale du Japon ?
R:`,
    useCases: [
      "Établir un format de réponse",
      "Montrer le style attendu",
      "Tâches simples avec un pattern clair"
    ],
    difficulty: "Débutant"
  },
  {
    id: "few-shot",
    name: "Few-shot Prompting",
    icon: "🧩",
    description: "On fournit plusieurs exemples pour guider le modèle.",
    purpose: "'Entraîner' implicitement le modèle sur un format ou un style spécifique.",
    example: `Q: Chien → Mammifère
Q: Serpent → Reptile
Q: Poisson → ?`,
    useCases: [
      "Classification",
      "Extraction d'informations",
      "Tâches avec pattern spécifique",
      "Format de sortie complexe"
    ],
    difficulty: "Intermédiaire"
  },
  {
    id: "chain-of-thought",
    name: "Chain-of-Thought (CoT)",
    icon: "🔗",
    description: "On demande au modèle d'expliquer son raisonnement étape par étape.",
    purpose: "Améliorer la cohérence et la justesse logique des réponses complexes.",
    example: "Explique étape par étape comment résoudre le problème suivant : 32 ÷ 8 × 2 = ?",
    useCases: [
      "Problèmes mathématiques",
      "Raisonnement logique complexe",
      "Débogage de code",
      "Analyse de scénarios"
    ],
    difficulty: "Intermédiaire"
  },
  {
    id: "self-consistency",
    name: "Self-Consistency",
    icon: "♻️",
    description: "Le modèle génère plusieurs raisonnements, puis on choisit la réponse la plus cohérente.",
    purpose: "Réduire les erreurs logiques aléatoires en comparant plusieurs chemins de raisonnement.",
    example: "Donne trois façons de raisonner pour résoudre ce problème, puis conclus avec la réponse la plus probable.",
    useCases: [
      "Problèmes complexes incertains",
      "Validation de solutions",
      "Augmentation de la fiabilité"
    ],
    difficulty: "Avancé"
  },
  {
    id: "react",
    name: "ReAct (Reason + Act)",
    icon: "⚡",
    description: "Le modèle alterne entre raisonnement et action (utile avec outils ou API).",
    purpose: "Combiner réflexion logique et exécution d'actions concrètes.",
    example: "Raisonne sur la requête, puis appelle une fonction adaptée si nécessaire.",
    useCases: [
      "Agents autonomes",
      "Utilisation d'outils externes",
      "Recherche et exécution",
      "Workflows complexes"
    ],
    difficulty: "Avancé"
  },
  {
    id: "prompt-chaining",
    name: "Prompt Chaining",
    icon: "⛓️",
    description: "On enchaîne plusieurs prompts : la sortie d'un prompt sert d'entrée au suivant.",
    purpose: "Décomposer une tâche complexe en étapes successives et gérables.",
    example: "1️⃣ Génère une liste d'idées → 2️⃣ Développe la meilleure → 3️⃣ Corrige le style.",
    useCases: [
      "Création de contenu long",
      "Workflows multi-étapes",
      "Raffinement itératif",
      "Pipelines de traitement"
    ],
    difficulty: "Intermédiaire"
  },
  {
    id: "reflexion",
    name: "Reflexion Prompting",
    icon: "🪞",
    description: "On demande explicitement au modèle d'auto-évaluer ou corriger sa réponse.",
    purpose: "Augmenter la fiabilité en encourageant l'autocritique et la révision.",
    example: `Voici ta réponse : [texte].
Relis-la et corrige toute incohérence ou imprécision.`,
    useCases: [
      "Amélioration de la qualité",
      "Détection d'erreurs",
      "Vérification de cohérence",
      "Raffinement de contenu"
    ],
    difficulty: "Intermédiaire"
  },
  {
    id: "role-prompting",
    name: "Role Prompting (Persona)",
    icon: "🎭",
    description: "Le modèle adopte un rôle précis pour répondre.",
    purpose: "Cadrer le ton, le style, ou le niveau d'expertise de la réponse.",
    example: "Tu es un expert Python senior. Explique la différence entre @staticmethod et @classmethod.",
    useCases: [
      "Adapter le ton et le style",
      "Expertise spécifique",
      "Contexte professionnel",
      "Personnalisation de l'output"
    ],
    difficulty: "Débutant"
  },
  {
    id: "few-shot-cot",
    name: "Few-shot + CoT Hybrid",
    icon: "🎓",
    description: "Combine des exemples et un raisonnement détaillé.",
    purpose: "Offrir le meilleur des deux mondes — structure + raisonnement.",
    example: `Exemple 1 : [raisonnement + solution]
Exemple 2 : [raisonnement + solution]
À ton tour : [nouvelle question].`,
    useCases: [
      "Problèmes complexes nécessitant des exemples",
      "Formation du modèle sur des patterns",
      "Tâches nécessitant justification"
    ],
    difficulty: "Avancé"
  },
  {
    id: "instruction",
    name: "Instruction Prompting",
    icon: "📋",
    description: "Demander explicitement une action claire et directe.",
    purpose: "Obtenir des résultats précis en spécifiant exactement ce qui est attendu.",
    example: "Résume ce texte en 3 points clés. Utilise des puces. Sois concis.",
    useCases: [
      "Tâches simples et directes",
      "Formatage spécifique",
      "Actions clairement définies"
    ],
    difficulty: "Débutant"
  },
  {
    id: "meta-prompting",
    name: "Meta Prompting",
    icon: "🎯",
    description: "Demander au modèle comment il devrait répondre.",
    purpose: "Optimiser la qualité de la réponse en faisant réfléchir le modèle sur sa stratégie.",
    example: "Avant de répondre, explique quelle approche tu vas utiliser et pourquoi.",
    useCases: [
      "Optimisation de stratégie",
      "Tâches complexes",
      "Amélioration de la pertinence"
    ],
    difficulty: "Avancé"
  }
];
