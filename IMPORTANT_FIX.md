# ⚠️ IMPORTANT: Fix Your API Key

## Problem
You're using the **service_role** key in your `.env.local` file. This is **WRONG** and **UNSAFE** for frontend use!

## Solution

### Step 1: Get the Correct Key
1. Go to Supabase Dashboard → **Settings** → **API** → **API Keys**
2. Find the **"anon public"** key (NOT the service_role key)
3. Copy the anon public key

### Step 2: Update .env.local
Open `frontend/.env.local` and replace:

```env
# WRONG - Don't use service_role key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...service_role...

# CORRECT - Use anon public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...anon...
```

The anon public key should have `"role":"anon"` in the decoded JWT, NOT `"role":"service_role"`.

### Step 3: Restart Server
```bash
# Stop server (Ctrl+C) and restart
npm run dev
```

## Why This Matters
- **service_role key**: Bypasses all security, should NEVER be in frontend
- **anon public key**: Safe for frontend, respects Row Level Security policies

## Use the Correct Page
- ✅ **Use `/get-started`** - This has the real extraction API
- ❌ **Don't use `/dashboard`** - This was just a demo (now redirects to get-started)

