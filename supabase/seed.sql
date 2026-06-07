-- Demo seed data for testing the full happy path
-- Run after schema.sql

-- Demo user 1 (creator)
insert into users (id, email, campus, first_name, verified) values
  ('00000000-0000-0000-0000-000000000001', 'demo1@kenyon.edu', 'kenyon.edu', 'Jordan', true),
  ('00000000-0000-0000-0000-000000000002', 'demo2@kenyon.edu', 'kenyon.edu', 'Alex', true)
on conflict (email) do nothing;

-- Profiles
insert into profiles (id, group_size, place_vibe, plan_style, activities, timing, follow_through, openness, duration, comfort_level) values
  ('00000000-0000-0000-0000-000000000001', '1on1', 'quiet', 'dayof', ARRAY['cafe','food','study'], ARRAY['afternoons','evenings'], 4, 3, 'medium', 'okay'),
  ('00000000-0000-0000-0000-000000000002', 'either', 'chill', 'lastminute', ARRAY['cafe','gym','food'], ARRAY['between classes','afternoons'], 3, 4, 'quick', 'social')
on conflict (id) do nothing;

-- A live plan from demo1
insert into plans (id, creator_id, campus, activity, zone, time_window, note, spots, exact_location, exact_time, expires_at) values
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'kenyon.edu',
    'cafe',
    'Near the village coffee shop',
    '3–4pm',
    'Bring a book, we can read together',
    1,
    'Wiggin Street Coffee, back corner table',
    '3:15pm',
    now() + interval '3 hours'
  )
on conflict (id) do nothing;
