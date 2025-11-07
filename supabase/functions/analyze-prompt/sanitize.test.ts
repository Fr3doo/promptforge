import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

/**
 * Sanitize variable names to match database constraints
 * Replaces hyphens (-) with underscores (_) to comply with CHECK constraint
 */
function sanitizeVariableNames(variables: any[]): any[] {
  if (!variables || !Array.isArray(variables)) return variables;
  
  return variables.map(v => {
    if (v.name && typeof v.name === 'string') {
      const originalName = v.name;
      const sanitizedName = v.name.replace(/-/g, '_');
      
      if (originalName !== sanitizedName) {
        console.log(`[SANITIZE] Variable renommée: "${originalName}" → "${sanitizedName}"`);
      }
      
      return { ...v, name: sanitizedName };
    }
    return v;
  });
}

// ============================================
// TESTS UNITAIRES : sanitizeVariableNames
// ============================================

Deno.test("sanitizeVariableNames - remplace les tirets par des underscores", () => {
  const input = [
    { name: "user-name", type: "STRING", description: "Nom d'utilisateur" },
    { name: "api-key", type: "STRING", description: "Clé API" }
  ];

  const result = sanitizeVariableNames(input);

  assertEquals(result[0].name, "user_name");
  assertEquals(result[1].name, "api_key");
  assertEquals(result[0].type, "STRING");
  assertEquals(result[0].description, "Nom d'utilisateur");
});

Deno.test("sanitizeVariableNames - tirets multiples", () => {
  const input = [
    { name: "very-long-variable-name", type: "STRING", description: "Test" }
  ];

  const result = sanitizeVariableNames(input);

  assertEquals(result[0].name, "very_long_variable_name");
});

Deno.test("sanitizeVariableNames - variables sans tirets restent inchangées", () => {
  const input = [
    { name: "username", type: "STRING", description: "Username" },
    { name: "api_key", type: "STRING", description: "API Key" },
    { name: "userId123", type: "NUMBER", description: "User ID" }
  ];

  const result = sanitizeVariableNames(input);

  assertEquals(result[0].name, "username");
  assertEquals(result[1].name, "api_key");
  assertEquals(result[2].name, "userId123");
});

Deno.test("sanitizeVariableNames - préserve toutes les propriétés", () => {
  const input = [
    {
      name: "user-role",
      type: "ENUM",
      description: "Rôle de l'utilisateur",
      default_value: "user",
      options: ["admin", "user", "guest"]
    }
  ];

  const result = sanitizeVariableNames(input);

  assertEquals(result[0].name, "user_role");
  assertEquals(result[0].type, "ENUM");
  assertEquals(result[0].description, "Rôle de l'utilisateur");
  assertEquals(result[0].default_value, "user");
  assertEquals(result[0].options, ["admin", "user", "guest"]);
});

Deno.test("sanitizeVariableNames - tableau vide", () => {
  const result = sanitizeVariableNames([]);
  assertEquals(result, []);
});

Deno.test("sanitizeVariableNames - null/undefined", () => {
  assertEquals(sanitizeVariableNames(null as any), null);
  assertEquals(sanitizeVariableNames(undefined as any), undefined);
});

Deno.test("sanitizeVariableNames - variable sans propriété name", () => {
  const input = [
    { type: "STRING", description: "Test" }
  ];

  const result = sanitizeVariableNames(input);

  assertEquals(result[0], { type: "STRING", description: "Test" });
});

Deno.test("sanitizeVariableNames - mélange de variables avec et sans tirets", () => {
  const input = [
    { name: "user-name", type: "STRING", description: "User name" },
    { name: "email", type: "STRING", description: "Email" },
    { name: "api-key", type: "STRING", description: "API Key" },
    { name: "created_at", type: "DATE", description: "Creation date" }
  ];

  const result = sanitizeVariableNames(input);

  assertEquals(result[0].name, "user_name");
  assertEquals(result[1].name, "email");
  assertEquals(result[2].name, "api_key");
  assertEquals(result[3].name, "created_at");
});

Deno.test("sanitizeVariableNames - tiret au début ou à la fin", () => {
  const input = [
    { name: "-leading", type: "STRING", description: "Test" },
    { name: "trailing-", type: "STRING", description: "Test" },
    { name: "-both-", type: "STRING", description: "Test" }
  ];

  const result = sanitizeVariableNames(input);

  assertEquals(result[0].name, "_leading");
  assertEquals(result[1].name, "trailing_");
  assertEquals(result[2].name, "_both_");
});

Deno.test("sanitizeVariableNames - immutabilité du tableau d'entrée", () => {
  const input = [
    { name: "user-name", type: "STRING", description: "Test" }
  ];

  const inputCopy = JSON.parse(JSON.stringify(input));
  const result = sanitizeVariableNames(input);

  // Vérifier que l'input original n'a pas été modifié
  assertEquals(input[0].name, "user-name");
  assertEquals(inputCopy[0].name, "user-name");
  
  // Vérifier que le résultat est bien sanitizé
  assertEquals(result[0].name, "user_name");
});
