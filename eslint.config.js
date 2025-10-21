import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/integrations/supabase/client"],
              message:
                "❌ Import direct de Supabase interdit ! Utilisez les repositories (PromptRepository, VariableRepository) pour respecter le principe d'inversion de dépendance (DIP). Voir ARCHITECTURE.md pour plus de détails.",
            },
          ],
        },
      ],
    },
  },
  // Configuration spéciale pour les fichiers autorisés à utiliser Supabase
  {
    files: [
      "src/repositories/**/*.ts",
      "src/contexts/**/*RepositoryContext.tsx",
      "supabase/functions/**/*.ts",
      "src/hooks/useAuth.tsx",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
);
