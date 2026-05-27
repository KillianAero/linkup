-- Table contacts
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  job_title TEXT,
  email TEXT,
  phone TEXT,
  birthday TEXT NOT NULL,
  relationship TEXT NOT NULL,
  notes TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes par user
CREATE INDEX contacts_user_id_idx ON contacts(user_id);

-- Row Level Security : chaque utilisateur ne voit que ses propres contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);
