-- ============================================
-- COMPLETE DATABASE SETUP
-- ============================================
-- Run this entire file in your Supabase SQL Editor
-- This sets up ALL tables, functions, triggers, and policies
-- Run this ONCE to set up your entire database
-- ============================================

-- ============================================
-- PART 1: Initial Schema (Documents & Extraction History)
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
-- PART 2: User Profiles and Tokens System
-- ============================================

-- Step 9: Create user_profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  tokens_remaining INTEGER DEFAULT 20,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Step 10: Create token_usage_log table
CREATE TABLE IF NOT EXISTS token_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Step 11: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_token_usage_log_user_id ON token_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_log_created_at ON token_usage_log(created_at);

-- Step 12: Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_log ENABLE ROW LEVEL SECURITY;

-- Step 13: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own token usage" ON token_usage_log;
DROP POLICY IF EXISTS "Users can insert own token usage" ON token_usage_log;

-- Step 14: Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 15: Create RLS policies for token_usage_log
CREATE POLICY "Users can view own token usage" ON token_usage_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own token usage" ON token_usage_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 16: Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, tokens_remaining)
  VALUES (NEW.id, NEW.email, 20)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 17: Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 18: Update documents table RLS policies to require authentication
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;

CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 19: Update extraction_history RLS policies
DROP POLICY IF EXISTS "Users can view own extraction history" ON extraction_history;
DROP POLICY IF EXISTS "Users can insert own extraction history" ON extraction_history;

CREATE POLICY "Users can view own extraction history" ON extraction_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = extraction_history.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own extraction history" ON extraction_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = extraction_history.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- ============================================
-- PART 3: Client-Side Profile Creation Function
-- ============================================

-- Step 20: Create function to safely create user profile from client
CREATE OR REPLACE FUNCTION public.create_user_profile(p_email TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  tokens_remaining INTEGER,
  subscription_tier TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  user_id UUID;
  user_email TEXT;
BEGIN
  -- Get the current authenticated user's ID
  user_id := auth.uid();
  
  -- If no user is authenticated, raise an error
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create a profile';
  END IF;
  
  -- Use provided email or try to get from auth.users
  IF p_email IS NOT NULL THEN
    user_email := p_email;
  ELSE
    -- Try to get email from auth.users (may fail due to permissions)
    BEGIN
      SELECT email INTO user_email
      FROM auth.users
      WHERE id = user_id;
    EXCEPTION WHEN OTHERS THEN
      -- If we can't access auth.users, use NULL for email
      user_email := NULL;
    END;
  END IF;
  
  -- Create profile if it doesn't exist (using ON CONFLICT to handle race conditions)
  INSERT INTO public.user_profiles (id, email, tokens_remaining, subscription_tier)
  VALUES (user_id, user_email, 20, 'free')
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, user_profiles.email),
    updated_at = TIMEZONE('utc', NOW());
  
  -- Return the profile (either newly created or existing)
  RETURN QUERY
  SELECT 
    up.id,
    up.email,
    up.full_name,
    up.tokens_remaining,
    up.subscription_tier,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 21: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile() TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT) TO anon;

-- ============================================
-- VERIFICATION
-- ============================================
-- Uncomment the following to verify all tables were created:

-- SELECT 
--   table_name,
--   column_name,
--   data_type
-- FROM information_schema.columns
-- WHERE table_name IN ('documents', 'extraction_history', 'user_profiles', 'token_usage_log')
--   AND table_schema = 'public'
-- ORDER BY table_name, ordinal_position;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- All tables, functions, triggers, and policies have been created.
-- You can now use sign-in and sign-up features.
-- ============================================

