# Configuration Prettier

## Scripts NPM à ajouter

Prettier a été configuré dans le projet. Pour finaliser l'installation, ajoutez les scripts suivants dans `package.json` :

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\""
  }
}
```

## Configuration

Les fichiers suivants ont été créés/modifiés :

### Fichiers de configuration Prettier
- `.prettierrc` - Configuration Prettier
- `.prettierignore` - Fichiers à ignorer par Prettier

### Intégration avec ESLint
- `eslint.config.js` - Mise à jour pour intégrer Prettier avec ESLint

### Intégration avec Husky
- `.husky/pre-commit` - Ajout de la vérification du formatage avant commit

### Intégration avec CI
- `.github/workflows/tests.yml` - Ajout de la vérification du formatage dans la CI

## Utilisation

### Formater tout le code
```bash
npm run format
```

### Vérifier le formatage (sans modifier)
```bash
npm run format:check
```

### Formatage automatique dans VS Code

Pour activer le formatage automatique dans VS Code, ajoutez dans `.vscode/settings.json` :

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Règles de formatage

- **Point-virgule** : Oui
- **Guillemets** : Doubles
- **Largeur de ligne** : 100 caractères
- **Tabulation** : 2 espaces
- **Virgule finale** : ES5
- **Parenthèses pour les fonctions fléchées** : Toujours

## Workflow de développement

1. **Avant commit** : Husky vérifie automatiquement le formatage
2. **Si le formatage est incorrect** : Le commit est bloqué
3. **Corriger** : Lancez `npm run format` pour corriger automatiquement
4. **CI/CD** : La CI vérifie également le formatage sur chaque PR

## Dépannage

### Le formatage diffère entre développeurs
- Assurez-vous que tous utilisent la même version de Prettier
- Vérifiez que `.prettierrc` est bien présent et identique partout

### Conflits entre ESLint et Prettier
- `eslint-config-prettier` désactive les règles ESLint qui entrent en conflit avec Prettier
- Si vous rencontrez des conflits, vérifiez que l'ordre des configurations dans `eslint.config.js` est correct

### Pre-commit hook trop lent
- Utilisez `lint-staged` pour ne formater que les fichiers modifiés
- Ajoutez `lint-staged` dans `package.json` :
  ```json
  {
    "lint-staged": {
      "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"]
    }
  }
  ```
