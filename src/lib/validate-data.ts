/**
 * Build-time data validation script.
 * Run with: npx tsx src/lib/validate-data.ts
 * Integrated into: npm run validate
 */

import * as fs from "fs";
import * as path from "path";
import { companySchema, frameworkSchema, verticalMarketSchema } from "./schemas";

const DATA_DIR = path.join(process.cwd(), "src", "data");

let errors = 0;
let validated = 0;

function validateFiles(dir: string, schema: typeof companySchema | typeof frameworkSchema | typeof verticalMarketSchema, label: string) {
  const fullDir = path.join(DATA_DIR, dir);
  if (!fs.existsSync(fullDir)) {
    console.log(`  [SKIP] ${fullDir} does not exist yet`);
    return;
  }

  const files = fs.readdirSync(fullDir).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.log(`  [SKIP] No JSON files in ${dir}/`);
    return;
  }

  for (const file of files) {
    const filePath = path.join(fullDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const result = schema.safeParse(data);
      if (result.success) {
        console.log(`  [OK] ${dir}/${file}`);
        validated++;
      } else {
        console.error(`  [FAIL] ${dir}/${file}:`);
        for (const issue of result.error.issues) {
          console.error(`    - ${issue.path.join(".")}: ${issue.message}`);
        }
        errors++;
      }
    } catch (e) {
      console.error(`  [ERROR] ${dir}/${file}: ${e instanceof Error ? e.message : "Unknown error"}`);
      errors++;
    }
  }
}

console.log("\n=== Data Validation ===\n");

console.log("Companies:");
validateFiles("companies", companySchema, "company");

console.log("\nFrameworks:");
validateFiles("frameworks", frameworkSchema, "framework");

console.log("\nVertical Markets:");
validateFiles("markets", verticalMarketSchema, "market");

console.log(`\n=== Results: ${validated} passed, ${errors} failed ===\n`);

if (errors > 0) {
  process.exit(1);
}
