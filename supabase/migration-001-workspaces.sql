-- ============================================
-- Migration 001: Workspaces, Pages, Tags
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Migrates from flat notes → workspaces + nested pages + tags
-- ============================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reuse the existing handle_updated_at() trigger function
-- (already created in schema.sql)

-- ============================================
-- 1. Create workspaces table
-- ============================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Workspace',
  icon TEXT DEFAULT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workspaces_user_id_idx ON workspaces(user_id);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workspaces"
  ON workspaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workspaces"
  ON workspaces FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workspaces"
  ON workspaces FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS handle_workspaces_updated_at ON workspaces;
CREATE TRIGGER handle_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- 2. Create pages table (replaces notes)
-- ============================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID DEFAULT NULL REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  icon TEXT DEFAULT NULL,
  sort_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pages_user_id_idx ON pages(user_id);
CREATE INDEX IF NOT EXISTS pages_workspace_id_idx ON pages(workspace_id);
CREATE INDEX IF NOT EXISTS pages_parent_id_idx ON pages(parent_id);
CREATE INDEX IF NOT EXISTS pages_updated_at_idx ON pages(updated_at DESC);
CREATE INDEX IF NOT EXISTS pages_workspace_parent_idx ON pages(workspace_id, parent_id, sort_order);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pages"
  ON pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pages"
  ON pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pages"
  ON pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pages"
  ON pages FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS handle_pages_updated_at ON pages;
CREATE TRIGGER handle_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- 3. Create tags table
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS tags_user_id_idx ON tags(user_id);
CREATE INDEX IF NOT EXISTS tags_user_name_idx ON tags(user_id, name);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. Create page_tags junction table
-- ============================================
CREATE TABLE IF NOT EXISTS page_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, tag_id)
);

CREATE INDEX IF NOT EXISTS page_tags_page_id_idx ON page_tags(page_id);
CREATE INDEX IF NOT EXISTS page_tags_tag_id_idx ON page_tags(tag_id);

ALTER TABLE page_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own page_tags"
  ON page_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM pages WHERE pages.id = page_tags.page_id AND pages.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own page_tags"
  ON page_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM pages WHERE pages.id = page_tags.page_id AND pages.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own page_tags"
  ON page_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM pages WHERE pages.id = page_tags.page_id AND pages.user_id = auth.uid()
  ));

-- ============================================
-- 5. Migrate existing notes to workspaces + pages
-- ============================================

-- Create a default workspace for each user who has notes
INSERT INTO workspaces (user_id, name)
SELECT DISTINCT user_id, 'My Workspace'
FROM notes
ON CONFLICT DO NOTHING;

-- Copy notes into pages under their user's default workspace
INSERT INTO pages (id, workspace_id, user_id, parent_id, title, content, created_at, updated_at)
SELECT
  n.id,
  w.id,
  n.user_id,
  NULL,
  n.title,
  n.content,
  n.created_at,
  n.updated_at
FROM notes n
JOIN workspaces w ON w.user_id = n.user_id;

-- ============================================
-- 6. Drop notes table (uncomment after verifying)
-- ============================================
-- DROP TABLE IF EXISTS notes CASCADE;
