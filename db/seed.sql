-- ============================================================
--  Nous & Chill — données initiales (équivalent SQL de seed.json)
--  À exécuter après schema.sql :
--    psql "$DATABASE_URL" -f db/seed.sql
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Settings (singleton)
-- ------------------------------------------------------------
insert into settings (season_unlocked, season_end_date) values
  (false, '2025-06-30');

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
insert into users (email, name, role) values
  ('samuel@example.com',        'Samuel',  'samuel'),
  ('mathilde@example.com',      'Mathilde','mathilde'),
  ('ami1.samuel@example.com',   'Théo',    'amis_samuel'),
  ('ami2.samuel@example.com',   'Marc',    'amis_samuel'),
  ('ami1.mathilde@example.com', 'Léa',     'amis_mathilde'),
  ('ami2.mathilde@example.com', 'Camille', 'amis_mathilde');

-- ------------------------------------------------------------
-- Episodes
-- ------------------------------------------------------------
insert into episodes (number, title, date, place, duration, tags, cover_url) values
  (1, 'Le Pilote — Premier Verre',   '2025-03-12', 'Bar à Vin, Le Marais',          '2h47',
    array['Slow burn', 'Vin renversé'],
    'https://images.unsplash.com/photo-1510630934164-b3132271ec45?w=800'),
  (2, 'Cinéma Mystère',              '2025-03-21', 'MK2 Bibliothèque',              '3h12',
    array['Cliffhanger', 'Awkward silence'],
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'),
  (3, 'Le Restaurant Trop Cher',     '2025-04-02', 'Septime, 80 rue de Charonne',   '2h54',
    array['Tension douce', 'Découverte'],
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'),
  (4, 'Balade & Confidences',        '2025-04-13', 'Buttes-Chaumont',               '4h21',
    array['Soft launch', 'Premier vrai bisou'],
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800');

-- ------------------------------------------------------------
-- Ideas (proposed_by résolu via l'email du seed Airtable)
-- ------------------------------------------------------------
insert into ideas (title, description, proposed_by, status)
select v.title, v.description, u.id, v.status
from (values
  ('Cours de poterie chaotique',
   'Comme dans Ghost mais on a aucun talent. Garanti 100% mains pleines de boue.',
   'mathilde@example.com', 'voting'),
  ('Escape game pour vieux couples',
   'On verra qui pète les plombs en premier sur l''énigme du cadenas à 4 chiffres.',
   'samuel@example.com', 'voting'),
  ('Karaoké années 2000 obligatoire',
   'Une chanson de Lorie minimum. C''est non négociable.',
   'mathilde@example.com', 'selected'),
  ('Marché aux puces St-Ouen',
   'On achète un truc absurde pour décorer l''appart, budget 15€ max.',
   'samuel@example.com', 'scheduled'),
  ('Pique-nique gourmand au Père-Lachaise',
   'Romantique ou flippant ? On verra bien.',
   'mathilde@example.com', 'voting'),
  ('Cours de salsa débutants',
   'Risque élevé d''humiliation publique. Précisément pour ça.',
   'samuel@example.com', 'voting')
) as v(title, description, email, status)
join users u on u.email = v.email;

-- ------------------------------------------------------------
-- VoteQuestions
-- ------------------------------------------------------------
insert into vote_questions (question, options, active) values
  ('Quel épisode est le plus susceptible de devenir un mème dans 6 mois ?',
   '["E01 Premier Verre", "E02 Cinéma Mystère", "E03 Restaurant Trop Cher", "E04 Buttes-Chaumont"]', true),
  ('Le moment le plus awkward de la saison ?',
   '["Le verre renversé E01", "Le silence pendant le film E02", "L''addition à 180€ E03", "L''écureuil agressif E04"]', true),
  ('Pronostic pour la saison 2 ?',
   '["Renouvellement officiel", "Spin-off avec les amis", "Annulation surprise", "Cliffhanger non résolu"]', true),
  ('Le plat / lieu le plus cinématographique ?',
   '["Le verre de rouge E01", "Le pop-corn partagé E02", "Les huîtres de Septime E03", "Le banc des Buttes E04"]', true),
  ('L''épisode qui mérite un director''s cut ?',
   '["E01 Premier Verre", "E02 Cinéma Mystère", "E03 Restaurant Trop Cher", "E04 Buttes-Chaumont"]', true);

-- Reviews / VoteResults / Synthese : laissées vides, remplies au runtime.

commit;
