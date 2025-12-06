# Aevoryn Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create Database Tables

1. **Go to your Supabase project dashboard** at https://supabase.com
2. **Navigate to SQL Editor** (left sidebar)
3. **Create a new query** and paste the contents of `lib/db/schema.sql`
4. **Click "Run"** to execute the SQL script

This creates:
- `user_settings` table (stores your timer preferences and background choices)
- `sessions` table (tracks your Pomodoro sessions)
- Row Level Security (RLS) policies to keep your data private

### 2.2 Create Storage Bucket for Background Images

**What is a Storage Bucket?**
A storage bucket is like a folder in the cloud where you can store files (images, documents, etc.). In Aevoryn, we use it to store custom background images that users upload.

**Step-by-step:**

1. **Go to Storage** in your Supabase dashboard (left sidebar)
2. **Click "New bucket"** button
3. **Name it:** `backgrounds` (exactly this name, case-sensitive)
4. **Set it to Public:** 
   - Toggle the "Public bucket" switch to ON
   - This allows images to be accessed via URL (needed to display them)
5. **Click "Create bucket"**

### 2.3 Set Up Storage Policies (Security Rules)

**What are Storage Policies?**
Policies are security rules that control who can upload, read, or delete files. We need two policies:
- One to let logged-in users upload images
- One to let anyone view the images (since the bucket is public)

**Step-by-step:**

1. **Go to Storage** → Click on the `backgrounds` bucket you just created
2. **Click on "Policies" tab** at the top
3. **Click "New Policy"**

**Policy 1: Allow Uploads (Authenticated Users Only)**

1. Select **"Create a policy from scratch"** or **"For full customization"**
2. **Policy name:** `Authenticated users can upload backgrounds`
3. **Allowed operation:** `INSERT` (this means uploading)
4. **Target roles:** `authenticated` (only logged-in users)
5. **Policy definition:** Paste this SQL:

```sql
(bucket_id = 'backgrounds')
```

6. **Click "Review"** then **"Save policy"**

**Policy 2: Allow Public Read Access**

1. Click **"New Policy"** again
2. **Policy name:** `Public read access`
3. **Allowed operation:** `SELECT` (this means reading/viewing)
4. **Target roles:** `public` (everyone, since bucket is public)
5. **Policy definition:** Paste this SQL:

```sql
(bucket_id = 'backgrounds')
```

6. **Click "Review"** then **"Save policy"**

**Alternative: Using SQL Editor (Easier)**

If the policy editor is confusing, you can use the SQL Editor instead:

1. Go to **SQL Editor** in Supabase
2. Paste and run this SQL:

```sql
-- Policy to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload backgrounds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'backgrounds');

-- Policy to allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'backgrounds');
```

**What each policy does:**

- **First policy (`INSERT`):** Only users who are logged in can upload images to the `backgrounds` bucket. This prevents random people from filling up your storage.
- **Second policy (`SELECT`):** Anyone can view/download images from the `backgrounds` bucket. This is needed because when you set a custom background, the app needs to display the image URL publicly.

### 2.4 Enable Google OAuth

1. **Go to Authentication** → **Providers** in Supabase dashboard
2. **Find "Google"** in the list and click to expand
3. **Toggle "Enable Google provider"** to ON
4. **Get Google OAuth credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or use existing)
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - **Authorized redirect URIs** (IMPORTANT - Add these EXACT URLs):
     - **Supabase callback URL:** `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
       - Replace `YOUR_PROJECT_REF` with your Supabase project reference
       - You can find this in your Supabase URL: `https://xxxxx.supabase.co`
       - Example: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**
5. **Paste them into Supabase:**
   - Go back to Supabase → Authentication → Providers → Google
   - Client ID → Paste your Google Client ID
   - Client Secret → Paste your Google Client Secret
6. **Save** the settings

**Important:** The redirect URI in Google Cloud Console must be your **Supabase callback URL**, NOT your app URL. Supabase handles the OAuth callback and then redirects to your app.

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key (optional, for AI insights)
```

**Where to find these values:**

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) → **API**
3. **Project URL** → Copy this as `NEXT_PUBLIC_SUPABASE_URL`
4. **anon/public key** → Copy this as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Important:** Never commit `.env.local` to git! It's already in `.gitignore`.

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: First Login

1. Click "Start Focus" on the landing page
2. Sign in with Google
3. You'll be redirected to the timer page
4. Your settings will be created automatically with defaults

## Troubleshooting

### Database Errors
- Make sure you've run the SQL schema in Supabase SQL Editor
- Check that RLS policies are enabled (they should be auto-enabled by the schema)

### Authentication Issues
- Verify Google OAuth is enabled in Supabase
- Check that redirect URLs match exactly (including http vs https)
- Ensure environment variables are set correctly in `.env.local`
- Restart the dev server after changing `.env.local`

### Storage Issues
- Verify the `backgrounds` bucket exists and is set to **Public**
- Check storage policies are created (go to Storage → backgrounds → Policies tab)
- Try the SQL method if the policy editor doesn't work

### CSS/Type Errors
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and restart: `rm -rf .next && npm run dev`

## Legacy Files

The following directories/files are from the old Vite setup and can be removed:
- `pages/` - Old page components (now in `app/`)
- `context/StoreContext.tsx` - Old state management (replaced by Zustand + server components)
- `services/geminiService.ts` - Can be kept if you want AI insights

These are kept for reference but are not used by the Next.js app.
