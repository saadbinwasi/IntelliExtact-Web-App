# Complete Supabase Setup Tutorial for DocuMind

This is a step-by-step guide to connect Supabase with your DocuMind website.

---

## Part 1: Create Supabase Project

### Step 1: Sign Up / Log In
- Go to [https://supabase.com](https://supabase.com)
- Click "Start your project" or "Sign In"
- Sign up with GitHub, Google, or email

### Step 2: Create New Project
- Click "New Project" button
- Fill in project details:
  - **Name**: `documind` (or any name you prefer)
  - **Database Password**: Create a strong password (save it securely!)
  - **Region**: Choose the closest region to you
  - **Pricing Plan**: Select "Free" (or your preferred plan)
- Click "Create new project"
- Wait 2-3 minutes for project to be ready

---

## Part 2: Get Your API Keys

### Step 3: Navigate to API Settings
- In your Supabase dashboard, click **Settings** (gear icon in left sidebar)
- Click **API** in the settings menu

### Step 4: Copy Your Credentials
You'll see two important values:

1. **Project URL**
   - Located under "Project URL" section
   - Format: `https://xxxxxxxxxxxxx.supabase.co`
   - Click the "Copy" button next to it

2. **API Keys**
   - Find the **"anon public"** key (NOT the service_role key)
   - This is the key that starts with `eyJhbGci...`
   - Click "Copy" or "Reveal" to see the full key
   - ⚠️ **Important**: Use the `anon public` key, NOT the `service_role secret` key

---

## Part 3: Configure Environment Variables

### Step 5: Open Your Project
- Navigate to your frontend folder: `cd frontend`

### Step 6: Create/Edit .env.local File
- Open or create `.env.local` file in the `frontend` directory
- Add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here

# Gemini API Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 7: Replace Placeholder Values
- Replace `https://your-project-id.supabase.co` with your actual Project URL
- Replace `your_anon_public_key_here` with your actual anon public key
- Replace `your_gemini_api_key_here` with your Gemini API key

### Step 8: Save the File
- Save `.env.local` file
- ⚠️ **Important**: Never commit this file to git (it's already in .gitignore)

---

## Part 4: Set Up Database Schema

### Step 9: Open SQL Editor
- In Supabase dashboard, click **SQL Editor** in the left sidebar
- Click **"New query"** button (or the + icon)

### Step 10: Run the Migration SQL
- Open the file: `frontend/supabase/migrations/20240101000000_initial_schema.sql`
- Copy the **entire contents** of the file
- Paste it into the Supabase SQL Editor
- Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
- Wait for "Success" message

### Step 11: Verify Tables Were Created
- In Supabase dashboard, click **Table Editor** in left sidebar
- You should see two tables:
  - `documents`
  - `extraction_history`
- Click on `documents` table to see all columns

---

## Part 5: Configure Row Level Security (Already Done)

### Step 12: Verify RLS Policies
- The migration SQL already created the necessary policies
- In Supabase, go to **Authentication** → **Policies**
- You should see policies for both tables allowing public access
- ⚠️ **Note**: For production, you may want to restrict these policies

---

## Part 6: Refresh Schema Cache (Important!)

### Step 13: Refresh Data API Cache
- Go to **Settings** → **API** → **Data API**
- Toggle **"Enable Data API"** OFF
- Wait 5 seconds
- Toggle **"Enable Data API"** ON
- This refreshes the schema cache so Supabase recognizes your new columns

---

## Part 7: Install Dependencies (If Not Done)

### Step 14: Install Supabase Packages
- In your terminal, navigate to frontend folder:
  ```bash
  cd frontend
  ```
- Install Supabase packages:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  ```
- Wait for installation to complete

---

## Part 8: Test the Connection

### Step 15: Start Development Server
- In your terminal (in the frontend folder):
  ```bash
  npm run dev
  ```
- Wait for server to start
- You should see: "Ready on http://localhost:3000"

### Step 16: Test in Browser
- Open browser and go to: `http://localhost:3000/get-started`
- You should see the Get Started page
- Try uploading a PDF file
- Check browser console (F12) for any errors

### Step 17: Verify Data is Saved
- After uploading a file, go to Supabase dashboard
- Click **Table Editor** → **documents**
- You should see your uploaded file in the table
- Check that all columns are populated correctly

---

## Part 9: Troubleshooting

### Issue: "Could not find the 'model_used' column"
**Solution:**
1. Make sure you ran the complete migration SQL
2. Refresh the schema cache (Step 13)
3. Wait 30-60 seconds and try again
4. Restart your dev server

### Issue: "Failed to save document"
**Solution:**
1. Check your `.env.local` file has correct values
2. Verify you're using the `anon public` key (not service_role)
3. Check Supabase project is active (not paused)
4. Verify tables exist in Table Editor
5. Check browser console for detailed error messages

### Issue: "Invalid API key"
**Solution:**
1. Double-check you copied the correct `anon public` key
2. Make sure there are no extra spaces in `.env.local`
3. Restart your dev server after changing `.env.local`

### Issue: "Schema cache" errors
**Solution:**
1. Refresh Data API cache (Step 13)
2. Wait 1-2 minutes
3. Restart dev server
4. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

---

## Part 10: Verify Complete Setup

### Checklist:
- [ ] Supabase project created
- [ ] API keys copied to `.env.local`
- [ ] Migration SQL executed successfully
- [ ] Tables visible in Table Editor
- [ ] Schema cache refreshed
- [ ] Dev server running
- [ ] Can upload files without errors
- [ ] Data appears in Supabase tables

---

## Quick Reference

### Your Supabase Credentials Location:
- **Dashboard**: https://supabase.com/dashboard
- **Project Settings**: Settings → API
- **SQL Editor**: SQL Editor → New query
- **Table Editor**: Table Editor (to view data)

### Important Files:
- **Environment Variables**: `frontend/.env.local`
- **Migration SQL**: `frontend/supabase/migrations/20240101000000_initial_schema.sql`
- **Supabase Client**: `frontend/lib/supabase/client.ts`

### Key Environment Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

---

## Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use `anon public` key** - Never use `service_role` key in frontend
3. **Restrict RLS policies** - For production, add user-based policies
4. **Rotate keys** - If keys are leaked, regenerate them immediately

---

## Next Steps

After setup is complete:
1. Test file uploads
2. Check extraction results
3. View data in Supabase Table Editor
4. Customize RLS policies for your needs
5. Set up authentication (optional, for future)

---

**Setup Complete! 🎉**

Your Supabase is now connected to your DocuMind website. You can start uploading and processing documents!

