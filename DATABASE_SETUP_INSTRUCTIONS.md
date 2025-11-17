# Database Setup Instructions

## ⚠️ IMPORTANT: Fix "user_profiles does not exist" Error

If you're seeing the error `relation "public.user_profiles" does not exist`, you need to run the database migrations in Supabase.

## Quick Fix (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **"New query"** button

3. **Run Complete Setup**
   - Open the file: `frontend/supabase/migrations/COMPLETE_SETUP.sql`
   - Copy the **entire contents** of the file
   - Paste it into the Supabase SQL Editor
   - Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for "Success" message

4. **Verify Setup**
   - Go to **Table Editor** in Supabase
   - You should see these tables:
     - `documents`
     - `extraction_history`
     - `user_profiles` ← **This is the one that was missing!**
     - `token_usage_log`

5. **Test Sign-In/Sign-Up**
   - Try signing in or signing up again
   - The error should be gone!

## Alternative: Run Migrations Individually

If you prefer to run migrations one by one, run them in this order:

1. `20240101000000_initial_schema.sql` - Creates documents and extraction_history tables
2. `20240101000002_user_tokens.sql` - Creates user_profiles and token_usage_log tables
3. `20240101000003_create_profile_function.sql` - Creates the profile creation function

## What Each Migration Does

### Migration 1: Initial Schema
- Creates `documents` table for storing uploaded files
- Creates `extraction_history` table for tracking extractions
- Sets up basic RLS policies

### Migration 2: User Tokens System
- Creates `user_profiles` table (extends auth.users)
- Creates `token_usage_log` table
- Sets up RLS policies for user data
- Creates trigger to auto-create profiles on signup

### Migration 3: Profile Creation Function
- Creates `create_user_profile()` function
- Allows client-side profile creation
- Bypasses RLS restrictions safely

## Troubleshooting

### Error: "relation already exists"
- This means the table already exists - that's okay!
- The migrations use `CREATE TABLE IF NOT EXISTS` so they're safe to run multiple times

### Error: "permission denied"
- Make sure you're running the SQL as the `postgres` role
- In Supabase SQL Editor, check the role dropdown (should say "postgres")

### Still seeing errors after running migrations?
1. Refresh your browser
2. Clear browser cache
3. Check Supabase logs for any errors
4. Verify tables exist in Table Editor

## Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Check Supabase logs (Settings → Logs)
3. Verify all tables exist in Table Editor
4. Make sure you ran the complete setup SQL file

---

**After running the migrations, sign-in and sign-up should work perfectly!** ✅

