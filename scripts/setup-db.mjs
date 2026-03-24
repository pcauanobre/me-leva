/**
 * Setup script — creates tables, RLS policies, and storage bucket
 * via Supabase service_role key.
 *
 * Usage: node scripts/setup-db.mjs
 *
 * Since the Supabase JS client can't run DDL (CREATE TABLE),
 * this script prints the full SQL to paste in the SQL Editor.
 * It also creates the storage bucket via the API.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://lfkxfaxcjxdsaarwbkcy.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma3hmYXhjanhkc2Fhcndia2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM1ODI0MywiZXhwIjoyMDg5OTM0MjQzfQ.J0UKwFpwPwe8-dfBDl7di29GLbvFIEjhQ54DSVTARKY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("=== Me Leva - Database Setup ===\n");

  // 1. Create storage bucket
  console.log("1. Creating storage bucket 'pet-photos'...");
  const { error: bucketError } = await supabase.storage.createBucket(
    "pet-photos",
    { public: true }
  );
  if (bucketError) {
    if (bucketError.message?.includes("already exists")) {
      console.log("   Bucket already exists, skipping.\n");
    } else {
      console.log("   Error:", bucketError.message, "\n");
    }
  } else {
    console.log("   Bucket created!\n");
  }

  // 2. SQL must be run in the SQL Editor
  console.log("2. SQL migrations must be run in the Supabase SQL Editor.");
  console.log("   Go to: https://supabase.com/dashboard/project/lfkxfaxcjxdsaarwbkcy/sql/new\n");
  console.log("   Copy and paste the contents of: supabase/migrations/all.sql\n");

  // 3. Generate combined SQL file
  const migrationDir = join(__dirname, "..", "supabase", "migrations");
  const files = [
    "20260324000001_create_animals.sql",
    "20260324000002_create_interest_forms.sql",
    "20260324000003_rls_policies.sql",
  ];

  let allSql = "-- ============================================\n";
  allSql += "-- Me Leva - Complete Database Setup\n";
  allSql += "-- Run this in the Supabase SQL Editor\n";
  allSql += "-- ============================================\n\n";

  for (const file of files) {
    const sql = readFileSync(join(migrationDir, file), "utf-8");
    allSql += `-- === ${file} ===\n${sql}\n\n`;
  }

  // Add seed data
  const seedSql = readFileSync(
    join(__dirname, "..", "supabase", "seed.sql"),
    "utf-8"
  );
  allSql += `-- === seed.sql ===\n${seedSql}\n`;

  const outPath = join(migrationDir, "all.sql");
  const { writeFileSync } = await import("fs");
  writeFileSync(outPath, allSql);

  console.log(`   Generated: supabase/migrations/all.sql`);
  console.log("   (tables + RLS + seed data combined)\n");

  // 4. Create admin user
  console.log("3. Creating admin user...");
  const { data: user, error: userError } =
    await supabase.auth.admin.createUser({
      email: "admin@meleva.com",
      password: "admin123456",
      email_confirm: true,
    });

  if (userError) {
    if (userError.message?.includes("already been registered")) {
      console.log("   Admin user already exists.\n");
    } else {
      console.log("   Error:", userError.message, "\n");
    }
  } else {
    console.log("   Admin created!");
    console.log("   Email: admin@meleva.com");
    console.log("   Senha: admin123456\n");
  }

  console.log("=== Done! ===");
  console.log("Next steps:");
  console.log("  1. Open the SQL Editor link above");
  console.log("  2. Paste the contents of supabase/migrations/all.sql");
  console.log("  3. Click 'Run'");
  console.log("  4. Run: npm run dev");
  console.log("  5. Login at http://localhost:3000/login");
  console.log("     Email: admin@meleva.com");
  console.log("     Senha: admin123456");
}

main().catch(console.error);
