# Design System - Prompt Manager

## Vue d'ensemble

Ce document décrit les conventions du design system utilisé dans le projet, en particulier les variables CSS et les bonnes pratiques pour maintenir une cohérence visuelle.

---

## Variables de couleurs HSL

Toutes les couleurs sont définies en HSL dans `src/index.css` et exposées via des variables CSS.

### Échelle de luminosité (mode sombre)

| Variable | Valeur HSL | Luminosité | Usage |
|----------|------------|------------|-------|
| `--background` | `220 20% 8%` | 8% | Fond de page principal |
| `--card` | `220 20% 12%` | 12% | Fond des cartes et popovers |
| `--border` | `220 15% 18%` | 18% | Bordures des éléments (inputs, menus) |
| `--secondary` | `220 15% 18%` | 18% | Éléments secondaires |
| `--muted` | `220 15% 18%` | 18% | Textes et fonds atténués |
| `--input` | `220 15% 22%` | 22% | Fond des champs de saisie |
| `--accent` | `220 15% 22%` | 22% | Éléments accentués |

---

## Convention de bordures

### Principe

Le composant `Card` utilise `border-transparent` par défaut pour éviter les bordures visibles sur fond sombre. Cette décision a été prise car :

1. L'écart de luminosité entre `--card` (12%) et `--border` (18%) créait une bordure "blanche" visible
2. Les cartes n'ont généralement pas besoin de bordure au repos
3. La bordure apparaît au survol via `hover:border-primary`

### Ajout d'une bordure visible

Pour ajouter une bordure visible à une Card, utilisez les classes Tailwind appropriées :

```tsx
// Bordure subtile (pour états vides, sections délimitées)
<Card className="border-muted">

// Bordure en pointillés (pour zones de drop, états vides)
<Card className="border-dashed border-muted">

// Bordure sémantique (erreurs)
<Card className="border-destructive/50">

// Bordure au survol (déjà supporté par défaut)
<Card className="hover:border-primary">
```

### Composants avec bordures explicites

Les composants suivants utilisent des bordures explicites :

| Composant | Classes de bordure | Justification |
|-----------|-------------------|---------------|
| `EmptyState` | `border-dashed border-muted` | Indication visuelle d'un état vide |
| `VariableEmptyState` | `border-dashed border-muted` | Indication visuelle d'un état vide |
| `ErrorCard` | `border-destructive/50` | Indication d'erreur |

---

## Bonnes pratiques

### 1. Utiliser les tokens sémantiques

**✅ Correct :**
```tsx
<div className="bg-card text-card-foreground border-muted">
```

**❌ Incorrect :**
```tsx
<div className="bg-[#1a1a2e] text-white border-gray-700">
```

### 2. Ne pas dupliquer les styles

Les styles de base sont définis dans les composants UI (`src/components/ui/`). Évitez de les redéfinir dans les composants métier.

### 3. Respecter la hiérarchie de luminosité

Lors de la création de nouveaux éléments, respectez la progression de luminosité :

```
background (8%) < card (12%) < border/muted (18%) < input/accent (22%)
```

### 4. Tester en mode sombre

Le mode sombre est le mode par défaut. Vérifiez toujours que les contrastes sont suffisants pour la lisibilité.

---

## Bordures des composants UI

### Badge

| Variant | Comportement |
|---------|-------------|
| `default`, `secondary`, `destructive` | Bordure transparente (invisible) |
| `outline` | Bordure subtile avec `border-muted` |

### Button

| Variant | Comportement |
|---------|-------------|
| `outline` | Bordure subtile avec `border-muted` |
| Autres | Pas de bordure explicite |

### Accordion

- Utiliser `border-muted/50` pour les séparateurs internes (50% d'opacité)

---

## Références

- `src/index.css` : Variables CSS globales
- `tailwind.config.ts` : Configuration Tailwind avec mapping des variables
- `src/components/ui/` : Composants UI de base

---

## Historique des décisions

| Date | Décision | Justification |
|------|----------|---------------|
| 2025-01 | `Card` utilise `border-transparent` par défaut | Éviter les bordures "blanches" sur fond sombre |
| 2025-01 | Luminosité de `--border` fixée à 18% | Équilibre entre visibilité et discrétion |
