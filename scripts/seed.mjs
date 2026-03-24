/**
 * Seed script: populates the database with realistic data
 * Usage: node scripts/seed.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lfkxfaxcjxdsaarwbkcy.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma3hmYXhjanhkc2Fhcndia2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM1ODI0MywiZXhwIjoyMDg5OTM0MjQzfQ.J0UKwFpwPwe8-dfBDl7di29GLbvFIEjhQ54DSVTARKY";

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Real dog/cat photos from public APIs
const DOG_PHOTOS = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1583337130417-13571a247cac?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1477884213360-7e9d7dcc8f9b?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1558929996-da64ba858215?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1587559045816-8b0a54d1e694?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&h=600&fit=crop",
];

const CAT_PHOTOS = [
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=600&fit=crop",
];

function slugify(name, id) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + id.slice(0, 8);
}

async function main() {
  console.log("=== Me Leva! Seed Script ===\n");

  // ──────────────────────────────────────────
  // 1. Clean up existing data
  // ──────────────────────────────────────────
  console.log("1. Limpando dados existentes...");
  await sb.from("interest_forms").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await sb.from("animals").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await sb.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Delete all auth users
  const { data: { users } } = await sb.auth.admin.listUsers();
  for (const u of users || []) {
    await sb.auth.admin.deleteUser(u.id);
  }
  console.log("   Dados limpos.\n");

  // ──────────────────────────────────────────
  // 2. Create users
  // ──────────────────────────────────────────
  console.log("2. Criando usuários...");

  // Admin
  const { data: adminAuth } = await sb.auth.admin.createUser({
    email: "admin@meleva.com",
    password: "admin123",
    email_confirm: true,
  });
  const adminId = adminAuth.user.id;
  await sb.from("profiles").insert({
    id: adminId,
    full_name: "Administradora",
    phone: "85999990000",
    role: "admin",
  });
  console.log("   ✓ admin@meleva.com / admin123 (admin)");

  // Regular users
  const userEmails = [
    { email: "maria@email.com", name: "Maria Silva", phone: "85999991111" },
    { email: "joao@email.com", name: "João Santos", phone: "85988882222" },
    { email: "ana@email.com", name: "Ana Costa", phone: "85977773333" },
    { email: "pedro@email.com", name: "Pedro Oliveira", phone: "85966664444" },
    { email: "julia@email.com", name: "Júlia Ferreira", phone: "85955555555" },
    { email: "lucas@email.com", name: "Lucas Mendes", phone: "85944446666" },
  ];

  const userIds = [];
  for (const u of userEmails) {
    const { data } = await sb.auth.admin.createUser({
      email: u.email,
      password: "user123",
      email_confirm: true,
    });
    const uid = data.user.id;
    userIds.push(uid);
    await sb.from("profiles").insert({
      id: uid,
      full_name: u.name,
      phone: u.phone,
      role: "user",
    });
    console.log(`   ✓ ${u.email} / user123 (${u.name})`);
  }
  console.log("");

  // ──────────────────────────────────────────
  // 3. Create catalog animals (admin-created, approved)
  // ──────────────────────────────────────────
  console.log("3. Criando animais no catálogo...");

  const catalogAnimals = [
    {
      name: "Rex",
      species: "cachorro",
      breed: "Pastor Alemão",
      age_months: 24,
      size: "grande",
      sex: "macho",
      neutered: true,
      vaccinated: true,
      description: "Rex é um pastor alemão muito dócil e brincalhão. Adora crianças e se dá bem com outros cães. Foi resgatado de uma situação de maus-tratos e hoje é um cão completamente recuperado e cheio de amor para dar.",
      photo: DOG_PHOTOS[0],
    },
    {
      name: "Mia",
      species: "gato",
      breed: "Siamês",
      age_months: 12,
      size: "pequeno",
      sex: "femea",
      neutered: true,
      vaccinated: true,
      description: "Mia é uma gatinha siamesa muito carinhosa. Adora ficar no colo e ronronar. É independente mas ama companhia. Ideal para apartamento.",
      photo: CAT_PHOTOS[0],
    },
    {
      name: "Thor",
      species: "cachorro",
      breed: "Labrador",
      age_months: 36,
      size: "grande",
      sex: "macho",
      neutered: true,
      vaccinated: true,
      description: "Thor é um labrador puro amor. Muito enérgico, precisa de espaço para correr. Adora água e é excelente companheiro para famílias ativas.",
      photo: DOG_PHOTOS[1],
    },
    {
      name: "Luna",
      species: "gato",
      breed: "Persa",
      age_months: 8,
      size: "pequeno",
      sex: "femea",
      neutered: false,
      vaccinated: true,
      description: "Luna é uma filhote persa de pelagem longa e olhos enormes. Muito tranquila e amorosa. Perfeita para quem busca uma companheira calma.",
      photo: CAT_PHOTOS[1],
    },
    {
      name: "Bob",
      species: "cachorro",
      breed: "Vira-lata",
      age_months: 6,
      size: "medio",
      sex: "macho",
      neutered: false,
      vaccinated: true,
      description: "Bob é um filhote vira-lata cheio de energia. Foi encontrado abandonado na rua com apenas 2 meses. Hoje está saudável e pronto para encontrar um lar.",
      photo: DOG_PHOTOS[2],
    },
    {
      name: "Mel",
      species: "cachorro",
      breed: "Golden Retriever",
      age_months: 48,
      size: "grande",
      sex: "femea",
      neutered: true,
      vaccinated: true,
      description: "Mel é uma golden retriever de 4 anos, muito dócil e treinada. Sabe comandos básicos e é ótima com crianças. Foi entregue por uma família que se mudou.",
      photo: DOG_PHOTOS[3],
    },
    {
      name: "Simba",
      species: "gato",
      breed: "Vira-lata",
      age_months: 18,
      size: "medio",
      sex: "macho",
      neutered: true,
      vaccinated: true,
      description: "Simba é um gato vira-lata com pelagem laranja. Muito brincalhão e curioso. Adora explorar e brincar com bolinhas. Se dá bem com outros gatos.",
      photo: CAT_PHOTOS[2],
    },
    {
      name: "Nina",
      species: "cachorro",
      breed: "Poodle",
      age_months: 60,
      size: "pequeno",
      sex: "femea",
      neutered: true,
      vaccinated: true,
      description: "Nina é uma poodle de 5 anos, muito calma e companheira. Ideal para idosos ou pessoas que moram sozinhas. Não late muito e é muito educada.",
      photo: DOG_PHOTOS[4],
    },
  ];

  const animalIds = [];
  for (const a of catalogAnimals) {
    const tempSlug = a.name.toLowerCase() + "-" + Math.random().toString(36).slice(2, 10);
    const { data, error } = await sb.from("animals").insert({
      name: a.name,
      slug: tempSlug,
      species: a.species,
      breed: a.breed,
      age_months: a.age_months,
      size: a.size,
      sex: a.sex,
      neutered: a.neutered,
      vaccinated: a.vaccinated,
      description: a.description,
      status: "disponivel",
      photo_urls: [a.photo],
      cover_photo: a.photo,
      submission_status: null,
      submitted_by: null,
    }).select("id").single();

    if (error) {
      console.log(`   ✗ ${a.name}: ${error.message}`);
      continue;
    }

    const id = data.id;
    animalIds.push(id);
    const finalSlug = slugify(a.name, id);
    await sb.from("animals").update({ slug: finalSlug }).eq("id", id);
    console.log(`   ✓ ${a.name} (${a.species}, ${a.breed})`);
  }
  console.log("");

  // ──────────────────────────────────────────
  // 4. Create submissions (user-submitted animals)
  // ──────────────────────────────────────────
  console.log("4. Criando solicitações de cadastro...");

  const submissions = [
    {
      name: "Pipoca",
      species: "cachorro",
      breed: "Vira-lata",
      age_months: 4,
      size: "pequeno",
      sex: "femea",
      neutered: false,
      vaccinated: false,
      description: "Encontrei essa cachorrinha abandonada perto de casa. É muito dócil e precisa de um lar.",
      photo: DOG_PHOTOS[5],
      userId: 0,
      status: "pending",
    },
    {
      name: "Freddy",
      species: "gato",
      breed: "Vira-lata",
      age_months: 10,
      size: "medio",
      sex: "macho",
      neutered: true,
      vaccinated: true,
      description: "Gato muito carinhoso que foi abandonado no condomínio. Já é castrado e vacinado.",
      photo: CAT_PHOTOS[3],
      userId: 1,
      status: "pending",
    },
    {
      name: "Bolinha",
      species: "cachorro",
      breed: "Pinscher",
      age_months: 30,
      size: "pequeno",
      sex: "macho",
      neutered: true,
      vaccinated: true,
      description: "Bolinha é um pinscher muito esperto. Preciso doar pois estou me mudando para um apartamento que não aceita pets.",
      photo: DOG_PHOTOS[6],
      userId: 2,
      status: "pending",
    },
    {
      name: "Flora",
      species: "gato",
      breed: "Angorá",
      age_months: 14,
      size: "medio",
      sex: "femea",
      neutered: true,
      vaccinated: true,
      description: "Flora é uma gata angorá linda e elegante. Muito carinhosa mas independente.",
      photo: CAT_PHOTOS[4],
      userId: 3,
      status: "approved",
    },
    {
      name: "Toby",
      species: "cachorro",
      breed: "Beagle",
      age_months: 20,
      size: "medio",
      sex: "macho",
      neutered: false,
      vaccinated: true,
      description: "Toby é um beagle alegre que precisa de um quintal. Muito brincalhão.",
      photo: DOG_PHOTOS[7],
      userId: 4,
      status: "rejected",
      feedback: "Por favor, envie fotos mais nítidas do animal e informe se ele tem alguma condição de saúde.",
    },
    {
      name: "Lilica",
      species: "gato",
      breed: "Vira-lata",
      age_months: 3,
      size: "pequeno",
      sex: "femea",
      neutered: false,
      vaccinated: false,
      description: "Filhotinha encontrada na rua, muito pequena ainda. Precisa de cuidados.",
      photo: CAT_PHOTOS[5],
      userId: 5,
      status: "pending",
    },
  ];

  for (const s of submissions) {
    const tempSlug = s.name.toLowerCase() + "-" + Math.random().toString(36).slice(2, 10);
    const { data, error } = await sb.from("animals").insert({
      name: s.name,
      slug: tempSlug,
      species: s.species,
      breed: s.breed,
      age_months: s.age_months,
      size: s.size,
      sex: s.sex,
      neutered: s.neutered,
      vaccinated: s.vaccinated,
      description: s.description,
      status: s.status === "approved" ? "disponivel" : "disponivel",
      photo_urls: [s.photo],
      cover_photo: s.photo,
      submission_status: s.status,
      submitted_by: userIds[s.userId],
      admin_feedback: s.feedback || null,
    }).select("id").single();

    if (error) {
      console.log(`   ✗ ${s.name}: ${error.message}`);
      continue;
    }

    const finalSlug = slugify(s.name, data.id);
    await sb.from("animals").update({ slug: finalSlug }).eq("id", data.id);
    console.log(`   ✓ ${s.name} (${s.status}) por ${userEmails[s.userId].name}`);
  }
  console.log("");

  // ──────────────────────────────────────────
  // 5. Create interest forms
  // ──────────────────────────────────────────
  console.log("5. Criando formulários de interesse...");

  const interests = [
    { animalIdx: 0, name: "Carla Souza", phone: "85991001001", message: "Oi! Tenho muito interesse no Rex. Moro em casa com quintal grande e já tive pastor alemão antes." },
    { animalIdx: 1, name: "Marcos Lima", phone: "85992002002", message: "A Mia é linda! Moro em apartamento telado, seria perfeito para ela." },
    { animalIdx: 2, name: "Fernanda Rocha", phone: "85993003003", message: "Tenho uma casa grande com piscina. O Thor ia amar! Quando posso conhecê-lo?" },
    { animalIdx: 3, name: "Diego Alves", phone: "85994004004", message: "Quero adotar a Luna para minha filha de 8 anos. Ela ama gatos!" },
    { animalIdx: 4, name: "Patrícia Nunes", phone: "85995005005", message: "O Bob é muito fofo! Tenho experiência com filhotes." },
    { animalIdx: 5, name: "Rafael Costa", phone: "85996006006", message: "Gostaria de saber mais sobre a Mel. Tenho duas crianças em casa." },
  ];

  for (const i of interests) {
    const animalId = animalIds[i.animalIdx];
    if (!animalId) continue;

    const { error } = await sb.from("interest_forms").insert({
      animal_id: animalId,
      name: i.name,
      phone: i.phone,
      message: i.message,
    });

    if (error) {
      console.log(`   ✗ ${i.name}: ${error.message}`);
    } else {
      console.log(`   ✓ ${i.name} → ${catalogAnimals[i.animalIdx].name}`);
    }
  }

  console.log("\n=== Seed completo! ===");
  console.log("\nContas criadas:");
  console.log("  Admin: admin@meleva.com / admin123");
  console.log("  Users: maria@email.com, joao@email.com, ana@email.com,");
  console.log("         pedro@email.com, julia@email.com, lucas@email.com");
  console.log("  Senha de todos os users: user123");
  console.log(`\nAnimais no catálogo: ${animalIds.length}`);
  console.log("Solicitações: 3 pendentes, 1 aprovada, 1 rejeitada, 1 pendente");
  console.log("Formulários de interesse: 6");
}

main().catch(console.error);
