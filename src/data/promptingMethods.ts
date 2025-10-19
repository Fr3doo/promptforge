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
    example: `Prompt : 
Rédige un email professionnel pour demander une réunion avec un client potentiel.

Réponse attendue :
Le modèle va générer directement un email sans avoir besoin d'exemples préalables, en s'appuyant uniquement sur sa compréhension de ce qu'est un email professionnel.`,
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
    example: `Contexte : Je veux classifier des avis clients.

Exemple :
Avis : "Le service client est excellent, réponse rapide et professionnelle."
Sentiment : Positif

Maintenant, classifie cet avis :
Avis : "Le produit est arrivé cassé et le SAV ne répond pas."
Sentiment : ?

Réponse attendue : Négatif`,
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
    example: `Tâche : Extraire les informations clés d'une description de produit

Exemple 1 :
Texte : "iPhone 14 Pro - 256GB - Couleur Noir - Prix : 1299€"
Format : {"produit": "iPhone 14 Pro", "stockage": "256GB", "couleur": "Noir", "prix": "1299€"}

Exemple 2 :
Texte : "MacBook Air M2 - 512GB SSD - Argent - Prix : 1799€"
Format : {"produit": "MacBook Air M2", "stockage": "512GB SSD", "couleur": "Argent", "prix": "1799€"}

À ton tour :
Texte : "AirPods Pro 2ème génération - Blanc - Prix : 299€"
Format : ?`,
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
    example: `Problème : Une boutique vend des t-shirts à 25€. Elle applique une réduction de 20%, puis ajoute 10% de TVA. Quel est le prix final ?

Prompt avec Chain-of-Thought :
Résous ce problème étape par étape en détaillant ton raisonnement.

Réponse attendue :
Étape 1 : Prix de base = 25€
Étape 2 : Réduction de 20% = 25€ × 0.20 = 5€
Étape 3 : Prix après réduction = 25€ - 5€ = 20€
Étape 4 : TVA de 10% = 20€ × 0.10 = 2€
Étape 5 : Prix final = 20€ + 2€ = 22€

Le prix final est de 22€.`,
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
    example: `Problème : Un restaurant a 48 clients. 1/3 commandent du poisson, 1/4 commandent de la viande, le reste commande végétarien. Combien de clients végétariens ?

Prompt avec Self-Consistency :
Résous ce problème de 3 façons différentes, puis compare tes réponses pour trouver la solution la plus probable.

Approche 1 : 48 × (1/3) = 16 poisson, 48 × (1/4) = 12 viande → 48 - 16 - 12 = 20 végétariens
Approche 2 : Poisson = 16, Viande = 12 → Reste = 48 - 28 = 20 végétariens
Approche 3 : Fraction végétariens = 1 - 1/3 - 1/4 = 12/12 - 4/12 - 3/12 = 5/12 → 48 × 5/12 = 20 végétariens

Conclusion : Les 3 approches donnent 20 clients végétariens. Cette réponse est cohérente.`,
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
    example: `Tâche : Trouver le prix actuel d'une action Tesla et déterminer si c'est un bon moment pour acheter.

Thought 1 : Je dois d'abord obtenir le prix actuel de l'action Tesla.
Action 1 : Rechercher [prix action Tesla aujourd'hui]
Observation 1 : Le prix est à 245$.

Thought 2 : Je dois maintenant vérifier l'évolution récente pour donner un contexte.
Action 2 : Rechercher [évolution action Tesla 30 derniers jours]
Observation 2 : L'action a augmenté de 12% sur le mois.

Thought 3 : Je dois analyser les indicateurs financiers pour une recommandation.
Action 3 : Rechercher [ratio P/E Tesla]
Observation 3 : P/E ratio = 78

Réponse finale : L'action Tesla est à 245$ avec une hausse récente de 12%. Le P/E élevé suggère une valorisation premium. Pour un investissement court terme, la tendance est positive, mais la valorisation reste élevée.`,
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
    example: `Tâche globale : Créer un article de blog complet sur l'IA

Prompt 1 : "Génère 5 idées d'angles originaux pour un article sur l'IA dans le marketing"
→ Sortie 1 : Liste de 5 idées

Prompt 2 : "Prends cette idée : [meilleure idée de la sortie 1]. Crée un plan détaillé avec introduction, 3 parties principales et conclusion"
→ Sortie 2 : Plan structuré

Prompt 3 : "Voici le plan : [sortie 2]. Rédige maintenant l'introduction de 150 mots qui capte l'attention"
→ Sortie 3 : Introduction rédigée

Prompt 4 : "Continue avec la première partie du plan en développant les arguments avec des exemples concrets"
→ Sortie 4 : Première partie complète

[...] Et ainsi de suite jusqu'à l'article complet`,
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
    example: `Étape 1 - Génération initiale :
Prompt : "Rédige un email de relance commercial pour un client qui n'a pas répondu depuis 2 semaines"

Réponse initiale : [Le modèle génère un email]

Étape 2 - Auto-évaluation :
Prompt : "Voici l'email que tu viens de générer : [email]. Maintenant :
1. Identifie les points faibles de cet email
2. Vérifie le ton (trop insistant ? pas assez ?)
3. Propose une version améliorée qui corrige ces problèmes"

Résultat : Le modèle va analyser sa propre réponse, identifier que l'email était peut-être trop agressif ou trop passif, et proposer une version optimisée.`,
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
    example: `Prompt sans rôle :
"Explique comment fonctionne une API REST"
→ Réponse générique et technique

Prompt avec rôle :
"Tu es un formateur qui explique des concepts techniques à des débutants en programmation. Explique comment fonctionne une API REST en utilisant des analogies simples du quotidien."

Réponse attendue :
"Imagine une API REST comme un serveur dans un restaurant. Tu (le client) consultes le menu (la documentation API), puis tu passes commande (tu fais une requête GET/POST). Le serveur va en cuisine (le serveur traite la requête), puis te ramène ton plat (la réponse en JSON). Si tu veux modifier ta commande, tu utilises PUT, et si tu veux l'annuler, tu utilises DELETE. Simple, non ?"`,
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
    example: `Tâche : Analyser la rentabilité d'un investissement

Exemple 1 avec raisonnement :
Investissement : 10 000€ à 5% par an pendant 3 ans
Raisonnement :
- Année 1 : 10 000€ × 1.05 = 10 500€
- Année 2 : 10 500€ × 1.05 = 11 025€
- Année 3 : 11 025€ × 1.05 = 11 576.25€
- Gain total : 11 576.25€ - 10 000€ = 1 576.25€
Conclusion : Investissement rentable avec +15.76%

Exemple 2 avec raisonnement :
Investissement : 5 000€ à 3% par an pendant 2 ans
Raisonnement :
- Année 1 : 5 000€ × 1.03 = 5 150€
- Année 2 : 5 150€ × 1.03 = 5 304.50€
- Gain total : 5 304.50€ - 5 000€ = 304.50€
Conclusion : Investissement rentable avec +6.09%

Maintenant à ton tour :
Investissement : 15 000€ à 4% par an pendant 5 ans
Raisonnement : ?`,
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
    example: `Prompt vague :
"Parle-moi de cet article de blog"

Prompt avec instructions précises :
"Analyse cet article de blog et fournis :
1. Un résumé en 3 points clés maximum
2. Le ton utilisé (professionnel/décontracté/académique)
3. Le public cible identifié
4. Une note sur 10 pour la clarté du message
Format : Utilise des puces pour chaque point. Reste concis (max 50 mots par point)."

Résultat : Une analyse structurée exactement dans le format demandé, avec les 4 éléments précis.`,
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
    example: `Question : Comment améliorer le taux de conversion d'un site e-commerce ?

Prompt classique :
"Donne-moi des conseils pour améliorer le taux de conversion"
→ Liste générique de conseils

Prompt Meta :
"Avant de répondre à cette question : 'Comment améliorer le taux de conversion d'un site e-commerce ?'
1. Explique d'abord quelle approche tu vas utiliser pour structurer ta réponse
2. Identifie les 3 aspects les plus importants à considérer
3. Puis donne ta réponse détaillée en suivant cette structure"

Résultat attendu :
"Je vais structurer ma réponse en 3 axes : UX/Design, Psychologie du consommateur, et Performance technique. Cette approche couvre les facteurs humains et techniques.

[Puis la réponse détaillée suit cette structure établie, avec une cohérence optimale]"`,
    useCases: [
      "Optimisation de stratégie",
      "Tâches complexes",
      "Amélioration de la pertinence"
    ],
    difficulty: "Avancé"
  }
];
