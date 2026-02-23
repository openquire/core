-- ============================================
-- Notes App Database Schema & Security Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);

-- Create index for sorting by updated_at
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own notes

-- Policy: Users can view only their own notes
CREATE POLICY "Users can view own notes"
  ON notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert only their own notes
CREATE POLICY "Users can insert own notes"
  ON notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own notes
CREATE POLICY "Users can update own notes"
  ON notes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete only their own notes
CREATE POLICY "Users can delete own notes"
  ON notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to notes table
DROP TRIGGER IF EXISTS handle_notes_updated_at ON notes;
CREATE TRIGGER handle_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- Verification Queries (run these to test)
-- ============================================
-- Check if RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies WHERE tablename = 'notes';