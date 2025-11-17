-- ============================================
-- Create Profile Function for Client-Side Use
-- ============================================
-- This migration creates a function that can be called from the client
-- to safely create user profiles, bypassing RLS issues
-- ============================================

-- Step 1: Create function to safely create user profile from client
-- This version accepts email as parameter to avoid querying auth.users
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

-- Step 2: Grant execute permission to authenticated users
-- Grant for both function signatures (with and without parameter)
GRANT EXECUTE ON FUNCTION public.create_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile() TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT) TO anon;

