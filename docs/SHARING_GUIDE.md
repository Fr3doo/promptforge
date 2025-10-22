# Guide du Partage Privé

Ce guide explique comment partager vos prompts avec d'autres utilisateurs de PromptForge et gérer les permissions d'accès.

## Table des matières

- [Partager un prompt](#partager-un-prompt)
- [Gérer les partages existants](#gérer-les-partages-existants)
- [Mode lecture seule](#mode-lecture-seule)
- [Conflits d'édition](#conflits-dédition)
- [Bonnes pratiques](#bonnes-pratiques)

## Partager un prompt

### Étapes pour partager

1. **Accéder au menu de partage**
   - Ouvrez le menu actions (⋮) sur la carte du prompt
   - Sélectionnez "Partager avec des utilisateurs"

2. **Ajouter un utilisateur**
   - Saisissez l'adresse email de l'utilisateur avec qui vous souhaitez partager
   - L'utilisateur doit avoir un compte sur PromptForge

3. **Choisir le niveau d'accès**
   - **Lecture seule** : L'utilisateur peut consulter le contenu et dupliquer le prompt
   - **Lecture et modification** : L'utilisateur peut éditer directement le contenu, les variables et créer des versions

4. **Confirmer le partage**
   - Cliquez sur "Partager"
   - Un toast de confirmation s'affiche
   - L'utilisateur verra le prompt dans sa liste avec le badge "Partagé avec vous"

### Permissions détaillées

| Permission | Voir | Dupliquer | Modifier | Créer versions | Partager | Supprimer |
|------------|------|-----------|----------|----------------|----------|-----------|
| **Propriétaire** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lecture et modification** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Lecture seule** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## Gérer les partages existants

### Voir les partages actifs

Dans la boîte de dialogue de partage, la section "Partagé avec" affiche :
- L'adresse email de chaque utilisateur
- Le niveau de permission (icône œil pour lecture, icône crayon pour modification)
- Un bouton de suppression pour révoquer l'accès

### Modifier une permission

Pour changer la permission d'un utilisateur :
1. Supprimez le partage existant
2. Créez un nouveau partage avec la nouvelle permission

### Révoquer un accès individuel

- Cliquez sur l'icône poubelle à côté de l'utilisateur
- Confirmez la suppression
- L'utilisateur perd immédiatement l'accès au prompt

### Révoquer tous les accès

Pour arrêter tous les partages privés d'un coup :
1. Cliquez sur "Arrêter tous les partages privés" en bas de la liste
2. Tous les utilisateurs perdent l'accès simultanément
3. Le prompt redevient privé (seul le propriétaire y a accès)

## Mode lecture seule

### Comment reconnaître le mode lecture seule

Lorsque vous accédez à un prompt partagé en lecture seule :

- **Badge "Mode lecture seule"** : Affiché en haut de l'éditeur avec une icône œil
- **Champs grisés** : Les champs de titre, description, contenu et variables sont désactivés
- **Bouton "Enregistrer" désactivé** : Vous ne pouvez pas sauvegarder de modifications
- **Badge "Partagé avec vous"** : Visible sur la carte du prompt dans la liste

### Actions possibles en lecture seule

Même en lecture seule, vous pouvez :
- ✅ Consulter le contenu complet du prompt
- ✅ Voir les variables configurées
- ✅ Dupliquer le prompt pour créer votre propre version modifiable
- ✅ Copier le contenu dans le presse-papier

### Dupliquer pour modifier

Si vous souhaitez modifier un prompt en lecture seule :
1. Ouvrez le menu actions (⋮) sur la carte du prompt
2. Sélectionnez "Dupliquer"
3. Une copie du prompt est créée dans votre liste
4. Vous êtes propriétaire de cette copie et pouvez la modifier librement

## Conflits d'édition

### Qu'est-ce qu'un conflit ?

Un conflit se produit lorsque :
- Vous éditez un prompt
- Un autre utilisateur (ou vous sur un autre appareil) sauvegarde une modification pendant ce temps
- Votre version locale n'est plus à jour

### Détection automatique

PromptForge vérifie automatiquement :
- **À l'ouverture** : Vérifie si la version serveur est plus récente
- **Toutes les 30 secondes** : Vérification périodique en arrière-plan
- **Avant sauvegarde** : Vérification finale pour éviter l'écrasement

### Résolution d'un conflit

Lorsqu'un conflit est détecté :

1. **Alerte rouge affichée**
   ```
   ⚠️ Conflit détecté
   Ce prompt a été modifié par un autre utilisateur il y a X minutes.
   Vos modifications risquent d'écraser les changements récents.
   ```

2. **Options disponibles**
   - **Recharger la dernière version** (recommandé) :
     - Récupère la version la plus récente du serveur
     - ⚠️ Vos modifications non sauvegardées seront perdues
     - Le conflit est résolu et vous pouvez continuer à éditer
   
   - **Continuer malgré tout** :
     - Permet de continuer l'édition
     - ⚠️ Risque d'écraser les modifications de l'autre utilisateur
     - À utiliser seulement si vous êtes sûr de vouloir garder vos changements

3. **Blocage de la sauvegarde**
   - Le bouton "Enregistrer" est désactivé pendant le conflit
   - Un toast d'erreur s'affiche si vous tentez de sauvegarder

### Prévenir les conflits

Pour éviter les conflits :
- ✅ Communiquez avec votre équipe sur qui édite quoi
- ✅ Sauvegardez régulièrement vos modifications
- ✅ Utilisez les versions pour garder un historique
- ✅ Rechargez la page avant de commencer une longue session d'édition

## Bonnes pratiques

### Pour le propriétaire

1. **Utilisez les bonnes permissions**
   - Lecture seule pour la validation et la consultation
   - Lecture et modification seulement pour les collaborateurs de confiance

2. **Documentez vos prompts**
   - Utilisez des descriptions claires
   - Configurez bien les variables avec des aides
   - Créez des versions pour marquer les changements importants

3. **Révoquez les accès inutiles**
   - Vérifiez régulièrement qui a accès
   - Supprimez les partages obsolètes

### Pour les collaborateurs

1. **Respectez le travail des autres**
   - Rechargez avant de modifier
   - Créez une version avant un changement majeur
   - Ajoutez un message de version descriptif

2. **Utilisez la duplication**
   - Si vous voulez expérimenter, dupliquez le prompt
   - Partagez votre version améliorée avec le propriétaire

3. **Communiquez**
   - Informez les autres collaborateurs de vos modifications
   - Utilisez les messages de version pour expliquer vos changements

## Différences entre partage privé et partage public

| Critère | Partage privé | Partage public |
|---------|---------------|----------------|
| **Destinataires** | Utilisateurs spécifiques (par email) | Tous les utilisateurs de PromptForge |
| **Contrôle d'accès** | Granulaire par utilisateur | Unique pour tous |
| **Révocation** | Individuelle ou en masse | Tout ou rien |
| **Visibilité dans la liste** | Badge "Partagé avec vous" | Badge "Public" |
| **Gestion** | Via "Partager avec des utilisateurs" | Via le bouton visibilité (globe/cadenas) |

## Questions fréquentes

**Q : Puis-je partager avec quelqu'un qui n'a pas de compte ?**  
R : Non, l'utilisateur doit avoir un compte PromptForge avec l'adresse email indiquée.

**Q : Le destinataire est-il notifié du partage ?**  
R : Pour l'instant non, mais le prompt apparaît immédiatement dans sa liste avec le badge "Partagé avec vous".

**Q : Puis-je voir qui a modifié le prompt ?**  
R : L'historique des versions conserve le créateur de chaque version, mais pas l'auteur de chaque modification.

**Q : Que se passe-t-il si je supprime le prompt ?**  
R : Tous les partages sont automatiquement supprimés et les utilisateurs perdent l'accès.

**Q : Un utilisateur avec permission "Lecture et modification" peut-il partager à son tour ?**  
R : Non, seul le propriétaire peut partager le prompt.

**Q : Les variables sont-elles aussi partagées ?**  
R : Oui, les variables configurées sont incluses dans le partage.

---

Pour toute question ou problème, consultez la [documentation complète](../README.md) ou contactez le support.
