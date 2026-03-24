-- ============================================================
-- SEED DATA: Animais de teste para desenvolvimento
-- ============================================================
-- NOTA: O usuario admin deve ser criado manualmente no
-- Supabase Dashboard > Authentication > Users > Add User
-- ============================================================

insert into animals (name, slug, species, breed, age_months, size, sex, neutered, vaccinated, description, status) values
(
  'Rex',
  'rex-00000001',
  'cachorro',
  'Vira-lata',
  24,
  'medio',
  'macho',
  true,
  true,
  'Rex e um cachorro super docil e brincalhao. Foi resgatado das ruas de Fortaleza e esta pronto para encontrar uma familia amorosa. Adora passeios e e otimo com criancas.',
  'disponivel'
),
(
  'Mia',
  'mia-00000002',
  'gato',
  'Siames',
  8,
  'pequeno',
  'femea',
  true,
  true,
  'Mia e uma gatinha carinhosa e tranquila. Gosta de ficar no colo e ronronar. Ideal para apartamento.',
  'disponivel'
),
(
  'Thor',
  'thor-00000003',
  'cachorro',
  'Labrador mix',
  36,
  'grande',
  'macho',
  false,
  true,
  'Thor e um cachorro energetico que precisa de espaco para correr. Muito leal e protetor. Precisa de um lar com quintal.',
  'urgente'
),
(
  'Luna',
  'luna-00000004',
  'gato',
  'Persa',
  12,
  'pequeno',
  'femea',
  true,
  true,
  'Luna e uma gatinha elegante e independente. Ja esta castrada e vacinada. Gosta de lugares tranquilos.',
  'disponivel'
),
(
  'Bob',
  'bob-00000005',
  'cachorro',
  'Poodle',
  60,
  'pequeno',
  'macho',
  true,
  true,
  'Bob e um poodle senior muito carinhoso. Perfeito para companhar idosos ou casais tranquilos.',
  'disponivel'
),
(
  'Mel',
  'mel-00000006',
  'cachorro',
  'Vira-lata',
  4,
  'medio',
  'femea',
  false,
  true,
  'Mel e uma filhote cheia de energia! Resgatada com apenas 1 mes de vida, esta crescendo saudavel e precisa de um lar urgente.',
  'urgente'
),
(
  'Simba',
  'simba-00000007',
  'gato',
  'Vira-lata',
  18,
  'medio',
  'macho',
  true,
  true,
  'Simba foi adotado por uma familia maravilhosa!',
  'adotado'
);

-- Formularios de interesse de exemplo
insert into interest_forms (animal_id, name, phone, message)
select
  a.id,
  'Maria Silva',
  '85999991234',
  'Oi! Tenho muito interesse em adotar. Moro em apartamento com varanda telada.'
from animals a where a.slug = 'mia-00000002';

insert into interest_forms (animal_id, name, phone, message)
select
  a.id,
  'Joao Santos',
  '85988887777',
  'Tenho uma casa grande com quintal. Gostaria de saber mais sobre o processo de adocao.'
from animals a where a.slug = 'thor-00000003';

insert into interest_forms (animal_id, name, phone, message)
select
  a.id,
  'Ana Costa',
  '85977776666',
  null
from animals a where a.slug = 'rex-00000001';
