-- ============================================
-- DocuMind Complete Database Schema
-- ============================================
-- Run this entire file in your Supabase SQL Editor
-- This creates all tables, indexes, policies, and triggers
-- ============================================

-- Step 1: Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  extracted_data JSONB,
  schema_used JSONB,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Step 2: Create extraction_history table
CREATE TABLE IF NOT EXISTS extraction_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  extraction_result JSONB,
  extraction_time_ms INTEGER,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_extraction_history_document_id ON extraction_history(document_id);

-- Step 4: Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_history ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist (allows re-running this migration)
DROP POLICY IF EXISTS "Allow public read access" ON documents;
DROP POLICY IF EXISTS "Allow public insert access" ON documents;
DROP POLICY IF EXISTS "Allow public update access" ON documents;
DROP POLICY IF EXISTS "Allow public delete access" ON documents;
DROP POLICY IF EXISTS "Allow public read access" ON extraction_history;
DROP POLICY IF EXISTS "Allow public insert access" ON extraction_history;

-- Step 6: Create Row Level Security policies for public access
CREATE POLICY "Allow public read access" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON documents
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON extraction_history
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON extraction_history
  FOR INSERT WITH CHECK (true);

-- Step 7: Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create trigger to auto-update updated_at on document updates
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verification Query (optional - uncomment to run)
-- ============================================
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name IN ('documents', 'extraction_history')
--   AND table_schema = 'public'
-- ORDER BY table_name, ordinal_position;
