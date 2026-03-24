/**
 * Migration v2: Run new migrations + create admin profile
 * Usage: node scripts/migrate-v2.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
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
  console.log("=== Me Leva v2 Migration ===\n");

  // 1. Generate combined SQL for new migrations
  const migrationDir = join(__dirname, "..", "supabase", "migrations");
  const newFiles = [
    "20260324000005_create_profiles.sql",
    "20260324000006_create_settings.sql",
    "20260324000007_add_submission_fields.sql",
    "20260324000008_update_rls_policies.sql",
  ];

  let allSql = "-- ============================================\n";
  allSql += "-- Me Leva v2 - User Registration + Submissions\n";
  allSql += "-- Run this in the Supabase SQL Editor\n";
  allSql += "-- ============================================\n\n";

  for (const file of newFiles) {
    const sql = readFileSync(join(migrationDir, file), "utf-8");
    allSql += `-- === ${file} ===\n${sql}\n\n`;
  }

  const outPath = join(migrationDir, "v2-all.sql");
  writeFileSync(outPath, allSql);
  console.log(`1. Generated: supabase/migrations/v2-all.sql`);
  console.log("   Paste this in the SQL Editor:\n");
  console.log(
    `   https://supabase.com/dashboard/project/lfkxfaxcjxdsaarwbkcy/sql/new\n`
  );

  // 2. Find admin user and create profile
  console.log("2. Creating admin profile...");
  const {
    data: { users },
  } = await supabase.auth.admin.listUsers();

  const adminUser = users?.find((u) => u.email === "admin@meleva.com");

  if (adminUser) {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: adminUser.id,
        full_name: "Administradora",
        phone: null,
        role: "admin",
      },
      { onConflict: "id" }
    );

    if (error) {
      console.log(
        `   Note: Profile insert will work after SQL migration runs.`
      );
      console.log(`   Error (expected if tables don't exist yet): ${error.message}\n`);
    } else {
      console.log(`   Admin profile created for ${adminUser.email}\n`);
    }
  } else {
    console.log("   Admin user not found. Run SQL first, then re-run this script.\n");
  }

  console.log("=== Steps ===");
  console.log("1. Open the SQL Editor link above");
  console.log("2. Paste the contents of supabase/migrations/v2-all.sql");
  console.log("3. Click 'Run'");
  console.log("4. Re-run this script: node scripts/migrate-v2.mjs");
  console.log("   (to create the admin profile after tables exist)");
}

main().catch(console.error);
