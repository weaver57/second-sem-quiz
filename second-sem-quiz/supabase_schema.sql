-- Run this in the Supabase SQL editor

CREATE TABLE scores (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name   text NOT NULL,
  subject     text NOT NULL,
  score       integer NOT NULL,
  total       integer NOT NULL,
  percentage  float NOT NULL,
  time_taken  integer,          -- total seconds for the exam
  answers     jsonb,            -- { questionId: { chosen, correct, status } }
  created_at  timestamptz DEFAULT now()
);

-- Index for fast leaderboard queries
CREATE INDEX idx_scores_subject    ON scores(subject);
CREATE INDEX idx_scores_user       ON scores(user_name);
CREATE INDEX idx_scores_percentage ON scores(percentage DESC);

-- Public read (anyone can see leaderboard), authenticated write via anon key
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scores"
  ON scores FOR SELECT USING (true);

CREATE POLICY "Anyone can insert scores"
  ON scores FOR INSERT WITH CHECK (true);
