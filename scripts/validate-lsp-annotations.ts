#!/usr/bin/env npx ts-node

/**
 * Script de validation LSP
 * Vérifie que toutes les interfaces de repository ont des annotations @throws
 *
 * Usage: npx ts-node scripts/validate-lsp-annotations.ts
 *
 * Ce script parse les fichiers TypeScript dans src/repositories/ et
 * vérifie que chaque méthode d'interface a au moins une annotation @throws.
 */

import * as fs from "fs";
import * as path from "path";

interface ValidationResult {
  file: string;
  interface: string;
  method: string;
  hasThrows: boolean;
  throwsCount: number;
}

const REPOSITORY_DIR = "src/repositories";
const INTERFACE_PATTERN = /export interface (\w+Repository)/g;
const METHOD_PATTERN = /^\s*(\w+)\s*\([^)]*\)\s*:\s*Promise/gm;
const THROWS_PATTERN = /@throws/g;

function findInterfaceBlock(
  content: string,
  interfaceStart: number
): { block: string; end: number } {
  let braceCount = 0;
  let interfaceEnd = interfaceStart;
  let started = false;

  for (let i = interfaceStart; i < content.length; i++) {
    if (content[i] === "{") {
      braceCount++;
      started = true;
    }
    if (content[i] === "}") {
      braceCount--;
      if (started && braceCount === 0) {
        interfaceEnd = i;
        break;
      }
    }
  }

  return {
    block: content.substring(interfaceStart, interfaceEnd),
    end: interfaceEnd,
  };
}

function extractJSDocBeforeMethod(
  interfaceBlock: string,
  methodIndex: number
): string {
  const beforeMethod = interfaceBlock.substring(0, methodIndex);
  const jsdocMatch = beforeMethod.match(/\/\*\*[\s\S]*?\*\/\s*$/);
  return jsdocMatch ? jsdocMatch[0] : "";
}

function validateFile(filePath: string): ValidationResult[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const results: ValidationResult[] = [];

  // Find interfaces
  const interfaceMatches = [...content.matchAll(INTERFACE_PATTERN)];

  for (const match of interfaceMatches) {
    const interfaceName = match[1];
    const interfaceStart = match.index!;

    const { block: interfaceBlock } = findInterfaceBlock(
      content,
      interfaceStart
    );

    // Find methods and their JSDoc
    const methodMatches = [...interfaceBlock.matchAll(METHOD_PATTERN)];

    for (const methodMatch of methodMatches) {
      const methodName = methodMatch[1];
      const methodIndex = methodMatch.index!;

      const jsdoc = extractJSDocBeforeMethod(interfaceBlock, methodIndex);
      const throwsMatches = jsdoc.match(THROWS_PATTERN);

      results.push({
        file: path.basename(filePath),
        interface: interfaceName,
        method: methodName,
        hasThrows: throwsMatches !== null && throwsMatches.length > 0,
        throwsCount: throwsMatches?.length || 0,
      });
    }
  }

  return results;
}

function formatCoverage(documented: number, total: number): string {
  if (total === 0) return "N/A";
  return ((documented / total) * 100).toFixed(1) + "%";
}

function main(): void {
  console.log("🔍 Validation des annotations @throws LSP\n");

  const files = fs
    .readdirSync(REPOSITORY_DIR)
    .filter((f) => f.endsWith(".ts") && !f.includes(".test."));

  let totalMethods = 0;
  let documentedMethods = 0;
  const issues: ValidationResult[] = [];
  const interfaceStats: Map<string, { documented: number; total: number }> =
    new Map();

  for (const file of files) {
    const filePath = path.join(REPOSITORY_DIR, file);
    const results = validateFile(filePath);

    for (const result of results) {
      totalMethods++;

      // Track per-interface stats
      const stats = interfaceStats.get(result.interface) || {
        documented: 0,
        total: 0,
      };
      stats.total++;
      if (result.hasThrows) {
        stats.documented++;
        documentedMethods++;
      } else {
        issues.push(result);
      }
      interfaceStats.set(result.interface, stats);
    }
  }

  // Report per-interface coverage
  console.log("📋 Couverture par interface:\n");
  console.log(
    "   Interface                          | Méthodes | Couverture"
  );
  console.log(
    "   -----------------------------------|----------|------------"
  );

  for (const [name, stats] of interfaceStats.entries()) {
    const coverage = formatCoverage(stats.documented, stats.total);
    const status = stats.documented === stats.total ? "✅" : "❌";
    console.log(
      `   ${status} ${name.padEnd(32)} | ${stats.total.toString().padStart(8)} | ${coverage.padStart(10)}`
    );
  }

  console.log("\n📊 Résumé de la couverture LSP:\n");
  console.log(`   Total méthodes: ${totalMethods}`);
  console.log(`   Documentées:    ${documentedMethods}`);
  console.log(`   Manquantes:     ${issues.length}`);
  console.log(`   Couverture:     ${formatCoverage(documentedMethods, totalMethods)}\n`);

  if (issues.length > 0) {
    console.log("❌ Méthodes sans annotations @throws:\n");
    for (const issue of issues) {
      console.log(`   ${issue.file} > ${issue.interface}.${issue.method}()`);
    }
    console.log("\n");
    process.exit(1);
  } else {
    console.log("✅ Toutes les interfaces sont correctement documentées!\n");
    process.exit(0);
  }
}

main();
