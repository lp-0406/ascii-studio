-- ASCII Studio Seed Data
-- DEMO DATA ONLY - Never use these credentials in production.
--
-- Demo login credentials (plain-text password shown here for demo login only):
--   admin@asciistudio.dev   / Demo@1234   (admin/demo)
--   alice@asciistudio.dev   / Demo@1234
--   bob@asciistudio.dev     / Demo@1234
--   carol@asciistudio.dev   / Demo@1234
--
-- The password_hash values below are bcrypt hashes (cost 10) of "Demo@1234".

USE ascii_studio;

INSERT INTO users (id, name, email, password_hash) VALUES
  (1, 'Admin Demo',  'admin@asciistudio.dev', '$2b$10$pUGRaO9RGmfwxVQajwoozOTBifSMePuDEXxhbbrBDXx8xBgu30fpi'),
  (2, 'Alice Demo',  'alice@asciistudio.dev', '$2b$10$pUGRaO9RGmfwxVQajwoozOTBifSMePuDEXxhbbrBDXx8xBgu30fpi'),
  (3, 'Bob Demo',    'bob@asciistudio.dev',   '$2b$10$pUGRaO9RGmfwxVQajwoozOTBifSMePuDEXxhbbrBDXx8xBgu30fpi'),
  (4, 'Carol Demo',  'carol@asciistudio.dev', '$2b$10$pUGRaO9RGmfwxVQajwoozOTBifSMePuDEXxhbbrBDXx8xBgu30fpi')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO artworks (id, user_id, title, ascii_content, original_filename, settings) VALUES
  (1, 2, 'My Cat', '@@@@%%%%####****++++====----::::....', 'cat.jpg',
     JSON_OBJECT('width', 100, 'charset', '@%#*+=-:.', 'invert', false, 'brightness', 0, 'contrast', 0)),
  (2, 2, 'Landscape', '....::::----====++++****####%%%%@@@@', 'landscape.png',
     JSON_OBJECT('width', 120, 'charset', '@%#*+=-:.', 'invert', false, 'brightness', 10, 'contrast', 5)),
  (3, 3, 'College Logo', '#### #### #### ####\n#  # #  # #  # #  #', 'logo.png',
     JSON_OBJECT('width', 80, 'charset', '@%#*+=-:.', 'invert', true, 'brightness', 0, 'contrast', 0)),
  (4, 4, 'Sunset', '%%%%****++++====----::::....', 'sunset.jpg',
     JSON_OBJECT('width', 100, 'charset', '@%#*+=-:.', 'invert', false, 'brightness', -5, 'contrast', 10))
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO shared_artworks (id, artwork_id, share_token, is_public) VALUES
  (1, 1, 'demo-share-token-cat-000001', TRUE),
  (2, 3, 'demo-share-token-logo-000003', FALSE)
ON DUPLICATE KEY UPDATE is_public = VALUES(is_public);
