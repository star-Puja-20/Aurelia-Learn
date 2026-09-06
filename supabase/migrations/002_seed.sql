-- Seed data for development (run after 001_schema.sql)
-- Uses a known UUID for the demo teacher account

-- Insert demo teacher profile (must match auth.users after real signup)
-- These are placeholders; replace UUIDs after actual Supabase auth signup

INSERT INTO public.learning_content (level, title, content, order_index) VALUES
  ('letter',  'Letters A–E',    '{"letters": ["a","b","c","d","e"]}', 1),
  ('letter',  'Letters F–J',    '{"letters": ["f","g","h","i","j"]}', 2),
  ('letter',  'Letters K–O',    '{"letters": ["k","l","m","n","o"]}', 3),
  ('letter',  'Letters P–T',    '{"letters": ["p","q","r","s","t"]}', 4),
  ('letter',  'Letters U–Z',    '{"letters": ["u","v","w","x","y","z"]}', 5),
  ('word',    'Animals',        '{"words": ["cat","dog","bird","fish","lion"]}', 1),
  ('word',    'Colours',        '{"words": ["red","blue","green","yellow","pink"]}', 2),
  ('word',    'Numbers 1-10',   '{"words": ["one","two","three","four","five","six","seven","eight","nine","ten"]}', 3),
  ('word',    'Food',           '{"words": ["apple","bread","milk","egg","cake"]}', 4),
  ('sentence','I am patterns',  '{"pattern": "I am ___"}', 1),
  ('sentence','I can patterns', '{"pattern": "I can ___"}', 2),
  ('sentence','I like patterns','{"pattern": "I like ___"}', 3),
  ('story',   'The Little Star','{"story_id": "story_1"}', 1),
  ('story',   'The Friendly Dragon','{"story_id": "story_2"}', 2),
  ('conversation','Greetings',  '{"topic": "hello, how are you, goodbye"}', 1),
  ('conversation','Shopping',   '{"topic": "buying items, prices, please, thank you"}', 2)
ON CONFLICT DO NOTHING;
