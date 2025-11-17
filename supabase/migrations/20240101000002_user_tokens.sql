-- ============================================
-- User Tokens and Subscription System
-- ============================================
-- This migration creates tables for user tokens, subscriptions, and usage tracking
-- ============================================

-- Step 1: Create user_profiles table (extends Supabase auth.users)
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

-- Step 2: Create token_usage_log table
CREATE TABLE IF NOT EXISTS token_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_token_usage_log_user_id ON token_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_log_created_at ON token_usage_log(created_at);

-- Step 4: Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_log ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own token usage" ON token_usage_log;
DROP POLICY IF EXISTS "Users can insert own token usage" ON token_usage_log;

-- Step 6: Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 7: Create RLS policies for token_usage_log
CREATE POLICY "Users can view own token usage" ON token_usage_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own token usage" ON token_usage_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 8: Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, tokens_remaining)
  VALUES (NEW.id, NEW.email, 20);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 10: Update documents table to require user_id
-- (Keep existing documents, but new ones will need user_id)
-- Only set NOT NULL if column allows nulls (safe operation)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' 
    AND column_name = 'user_id' 
    AND is_nullable = 'YES'
  ) THEN
    -- First, delete or update any documents without user_id (optional - you might want to keep them)
    -- UPDATE documents SET user_id = gen_random_uuid() WHERE user_id IS NULL;
    -- Or delete them:
    -- DELETE FROM documents WHERE user_id IS NULL;
    
    -- Then set NOT NULL
    ALTER TABLE documents ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Step 11: Update RLS policies for documents to require authentication
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;

CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 12: Update extraction_history RLS policies
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
-- Verification Query (optional - uncomment to run)
-- ============================================
-- SELECT 
--   table_name,
--   column_name,
--   data_type
-- FROM information_schema.columns
-- WHERE table_name IN ('user_profiles', 'token_usage_log')
--   AND table_schema = 'public'
-- ORDER BY table_name, ordinal_position;

