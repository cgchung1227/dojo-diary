import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
═══════════════════════════════════════════════
  Supabase SQL Schema — 在 SQL Editor 執行一次
═══════════════════════════════════════════════

create table daily_logs (
  id               uuid default gen_random_uuid() primary key,
  date             date not null unique,
  weather          text,                 -- sunny/cloudy/rainy/windy/snowy
  humidity         integer,              -- 0–100 (%)
  skin_score       integer check (skin_score between 1 and 5),
  itch_score       integer check (itch_score between 0 and 10),
  affected_areas   text[],              -- ['right_ear','belly','left_paw',...]
  skin_photo_url   text,
  skin_notes       text,
  bathed           boolean default false,
  groomed          boolean default false,
  ear_cleaned      boolean default false,
  pest_control     boolean default false,
  bedding_washed   boolean default false,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table diet_entries (
  id         uuid default gen_random_uuid() primary key,
  log_id     uuid not null references daily_logs(id) on delete cascade,
  meal_type  text not null,             -- morning/noon/evening/snack/supplement
  food_name  text not null,
  amount     text,
  notes      text,
  created_at timestamptz default now()
);

create table exercise_entries (
  id           uuid default gen_random_uuid() primary key,
  log_id       uuid not null references daily_logs(id) on delete cascade,
  type         text not null,           -- walk/run/play/swim/other
  duration_min integer,
  notes        text,
  created_at   timestamptz default now()
);

create table medication_entries (
  id         uuid default gen_random_uuid() primary key,
  log_id     uuid not null references daily_logs(id) on delete cascade,
  med_name   text not null,
  dose       text,
  route      text,                      -- oral/topical/injection
  notes      text,
  created_at timestamptz default now()
);

-- RLS (open for personal use)
alter table daily_logs enable row level security;
create policy "public" on daily_logs for all using (true) with check (true);
alter table diet_entries enable row level security;
create policy "public" on diet_entries for all using (true) with check (true);
alter table exercise_entries enable row level security;
create policy "public" on exercise_entries for all using (true) with check (true);
alter table medication_entries enable row level security;
create policy "public" on medication_entries for all using (true) with check (true);

-- Storage bucket: 在 Dashboard > Storage 建立 "skin-photos"，設為 Public
*/
