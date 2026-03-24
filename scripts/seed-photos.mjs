/**
 * Seed photos — downloads random dog/cat images from free APIs
 * and uploads them to Supabase Storage, updating animal records.
 *
 * APIs used (no auth required):
 *   - Dogs: https://dog.ceo/dog-api/
 *   - Cats: https://api.thecatapi.com/
 *
 * Usage: node scripts/seed-photos.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lfkxfaxcjxdsaarwbkcy.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma3hmYXhjanhkc2Fhcndia2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM1ODI0MywiZXhwIjoyMDg5OTM0MjQzfQ.J0UKwFpwPwe8-dfBDl7di29GLbvFIEjhQ54DSVTARKY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getRandomDogUrl() {
  const res = await fetch("https://dog.ceo/api/breeds/image/random");
  const data = await res.json();
  return data.message; // direct image URL
}

async function getRandomCatUrl() {
  const res = await fetch("https://api.thecatapi.com/v1/images/search");
  const data = await res.json();
  return data[0].url; // direct image URL
}

async function downloadImage(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return { buffer: new Uint8Array(buffer), contentType };
}

async function uploadToSupabase(animalId, buffer, contentType, index) {
  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `animals/${animalId}/${Date.now()}-${index}.${ext}`;

  const { error } = await supabase.storage
    .from("pet-photos")
    .upload(path, buffer, { contentType, upsert: false });

  if (error) {
    console.log(`   Upload error: ${error.message}`);
    return null;
  }

  const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  console.log("=== Seed Photos — Downloading from free APIs ===\n");

  // Get all animals
  const { data: animals, error } = await supabase
    .from("animals")
    .select("id, name, species, photo_urls")
    .order("created_at");

  if (error || !animals) {
    console.error("Error fetching animals:", error?.message);
    return;
  }

  for (const animal of animals) {
    // Skip if already has photos
    if (animal.photo_urls && animal.photo_urls.length > 0) {
      console.log(`${animal.name}: already has photos, skipping.`);
      continue;
    }

    const isDog = animal.species === "cachorro";
    const photosToGet = Math.floor(Math.random() * 3) + 2; // 2-4 photos each
    const urls = [];

    console.log(
      `${animal.name} (${animal.species}): downloading ${photosToGet} photos...`
    );

    for (let i = 0; i < photosToGet; i++) {
      try {
        const imageUrl = isDog
          ? await getRandomDogUrl()
          : await getRandomCatUrl();

        console.log(`   [${i + 1}/${photosToGet}] Downloading...`);
        const { buffer, contentType } = await downloadImage(imageUrl);

        console.log(`   [${i + 1}/${photosToGet}] Uploading to Supabase...`);
        const publicUrl = await uploadToSupabase(
          animal.id,
          buffer,
          contentType,
          i
        );

        if (publicUrl) {
          urls.push(publicUrl);
          console.log(`   [${i + 1}/${photosToGet}] Done!`);
        }

        // Small delay to not hammer the APIs
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.log(`   [${i + 1}/${photosToGet}] Failed: ${err.message}`);
      }
    }

    if (urls.length > 0) {
      const { error: updateError } = await supabase
        .from("animals")
        .update({
          photo_urls: urls,
          cover_photo: urls[0],
        })
        .eq("id", animal.id);

      if (updateError) {
        console.log(`   Error updating ${animal.name}: ${updateError.message}`);
      } else {
        console.log(`   ${animal.name}: ${urls.length} photos saved!\n`);
      }
    }
  }

  console.log("\n=== Done! Reload the site to see the photos. ===");
}

main().catch(console.error);
