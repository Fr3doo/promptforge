import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import-x";

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
      prettier: prettierPlugin,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "prettier/prettier": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/integrations/supabase/client"],
              message:
                "❌ Import direct de Supabase interdit ! Utilisez les repositories (PromptRepository, VariableRepository) pour respecter le principe d'inversion de dépendance (DIP). Voir ARCHITECTURE.md pour plus de détails.",
            },
            {
              group: ["**/lib/supabaseQueryBuilder"],
              message:
                "❌ Import du QueryBuilder interdit hors de la couche repository ! Le QueryBuilder (qb) est une abstraction interne réservée aux repositories. Utilisez les repositories via les contextes. Voir docs/SOLID_COMPLIANCE.md pour plus de détails.",
            },
          ],
        },
      ],
      "import/no-cycle": ["error", { maxDepth: Infinity, ignoreExternal: true }],
      "import/no-self-import": "error",
      ...prettierConfig.rules,
    },
  },
  // Configuration spéciale pour les fichiers autorisés à utiliser Supabase et le QueryBuilder
  {
    files: [
      "src/repositories/**/*.ts",
      "src/contexts/**/*RepositoryContext.tsx",
      "supabase/functions/**/*.ts",
      "src/hooks/useAuth.tsx",
      "src/lib/supabaseQueryBuilder.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
);
