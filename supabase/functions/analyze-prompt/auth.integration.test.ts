/**
 * Integration tests for analyze-prompt Edge Function authentication
 * 
 * These tests validate that the edge function correctly enforces
 * JWT authentication and rejects unauthenticated requests.
 * 
 * Run with: deno test --allow-net --allow-env --allow-read supabase/functions/analyze-prompt/auth.integration.test.ts
 * 
 * @see docs/EDGE_FUNCTION_TESTS.md for full documentation
 */

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

// ============================================
// CONFIGURATION
// ============================================
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/analyze-prompt`;

// Validate environment
if (!SUPABASE_URL) {
  console.error("❌ SUPABASE_URL or VITE_SUPABASE_URL environment variable is required");
  Deno.exit(1);
}

console.log(`📍 Testing edge function at: ${EDGE_FUNCTION_URL}`);

// ============================================
// AUTHENTICATION TESTS
// ============================================

Deno.test({
  name: "analyze-prompt - rejects request without Authorization header",
  async fn() {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ promptContent: "Test prompt for analysis" }),
    });

    // Consume body to prevent resource leak
    const data = await response.json();

    assertEquals(response.status, 401, "Should return 401 Unauthorized");
    assertExists(data.error, "Response should contain error message");
    assertEquals(
      data.error.toLowerCase().includes("authentifié") || 
      data.error.toLowerCase().includes("connecter"),
      true,
      "Error message should mention authentication"
    );
  },
});

Deno.test({
  name: "analyze-prompt - rejects request with empty Bearer token",
  async fn() {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ",
      },
      body: JSON.stringify({ promptContent: "Test prompt" }),
    });

    const data = await response.json();

    assertEquals(response.status, 401, "Should return 401 Unauthorized");
    assertExists(data.error, "Response should contain error message");
  },
});

Deno.test({
  name: "analyze-prompt - rejects request with invalid JWT format",
  async fn() {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer invalid.jwt.token",
      },
      body: JSON.stringify({ promptContent: "Test prompt" }),
    });

    const data = await response.json();

    assertEquals(response.status, 401, "Should return 401 Unauthorized");
    assertExists(data.error, "Response should contain error message");
  },
});

Deno.test({
  name: "analyze-prompt - rejects request with 'undefined' as token",
  async fn() {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer undefined",
      },
      body: JSON.stringify({ promptContent: "Test prompt" }),
    });

    const data = await response.json();

    assertEquals(response.status, 401, "Should return 401 Unauthorized");
    assertExists(data.error, "Response should contain error message");
  },
});

Deno.test({
  name: "analyze-prompt - rejects request with 'null' as token",
  async fn() {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer null",
      },
      body: JSON.stringify({ promptContent: "Test prompt" }),
    });

    const data = await response.json();

    assertEquals(response.status, 401, "Should return 401 Unauthorized");
    assertExists(data.error, "Response should contain error message");
  },
});

Deno.test({
  name: "analyze-prompt - rejects request with expired/forged JWT",
  async fn() {
    // Create a JWT-like string that will fail signature verification
    const forgedJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${forgedJwt}`,
      },
      body: JSON.stringify({ promptContent: "Test prompt" }),
    });

    const data = await response.json();

    assertEquals(response.status, 401, "Should return 401 Unauthorized for forged JWT");
    assertExists(data.error, "Response should contain error message");
  },
});

// ============================================
// CORS TESTS
// ============================================

Deno.test({
  name: "analyze-prompt - handles OPTIONS preflight request correctly",
  async fn() {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "OPTIONS",
    });

    // Consume body to prevent resource leak
    await response.text();

    assertEquals(response.status, 200, "OPTIONS should return 200 OK");
    assertExists(
      response.headers.get("access-control-allow-origin"),
      "Should have CORS Allow-Origin header"
    );
    assertExists(
      response.headers.get("access-control-allow-headers"),
      "Should have CORS Allow-Headers header"
    );
  },
});

// ============================================
// HEADER EDGE CASES
// ============================================

Deno.test({
  name: "analyze-prompt - rejects request with Authorization header but no Bearer prefix",
  async fn() {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "some-token-without-bearer",
      },
      body: JSON.stringify({ promptContent: "Test prompt" }),
    });

    const data = await response.json();

    assertEquals(response.status, 401, "Should return 401 Unauthorized");
    assertExists(data.error, "Response should contain error message");
  },
});

Deno.test({
  name: "analyze-prompt - rejects request with only whitespace token",
  async fn() {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer    ",
      },
      body: JSON.stringify({ promptContent: "Test prompt" }),
    });

    const data = await response.json();

    assertEquals(response.status, 401, "Should return 401 Unauthorized");
    assertExists(data.error, "Response should contain error message");
  },
});

// ============================================
// AUTHENTICATED TESTS (requires TEST_USER_JWT)
// ============================================

const TEST_USER_JWT = Deno.env.get("TEST_USER_JWT");

if (TEST_USER_JWT) {
  console.log("✅ TEST_USER_JWT configured - running authenticated tests");

  Deno.test({
    name: "analyze-prompt - rejects empty prompt content with valid auth",
    async fn() {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TEST_USER_JWT}`,
        },
        body: JSON.stringify({ promptContent: "" }),
      });

      const data = await response.json();

      assertEquals(response.status, 400, "Should return 400 Bad Request for empty prompt");
      assertExists(data.error, "Response should contain error message");
    },
  });

  Deno.test({
    name: "analyze-prompt - rejects missing promptContent field with valid auth",
    async fn() {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TEST_USER_JWT}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      assertEquals(response.status, 400, "Should return 400 Bad Request for missing field");
      assertExists(data.error, "Response should contain error message");
    },
  });
} else {
  console.log("⚠️ TEST_USER_JWT not configured - skipping authenticated tests");
  console.log("   To run authenticated tests, set TEST_USER_JWT environment variable");
}
