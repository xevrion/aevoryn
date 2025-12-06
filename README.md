# Aevoryn

A radically minimal Pomodoro experience optimized for quiet productivity, zero distractions, and monochrome minimalism.

## Features

- **Minimal Timer UI**: Customizable durations with smooth transitions
- **Timer Styles**: Choose between numeric display or circular progress ring
- **Background Customization**: Solid colors, gradients, or custom image uploads
- **Session Tracking**: Automatic session history with focus and break minutes
- **Google Authentication**: Seamless sign-in via Supabase Auth
- **Supabase Backend**: Secure data storage and real-time sync

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Supabase** - Authentication, database, and storage
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL schema from `lib/db/schema.sql` in your Supabase SQL editor
   - Create a storage bucket named `backgrounds` with public access
   - Enable Google OAuth in Supabase Authentication settings

3. **Configure environment variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key (optional, for AI insights)
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses two main tables:
- `user_settings` - Stores user preferences (timer durations, styles, backgrounds)
- `sessions` - Tracks completed Pomodoro sessions

See `lib/db/schema.sql` for the complete schema with RLS policies.

## Project Structure

```
app/
  ├── app/          # Main timer page
  ├── history/      # Session history
  ├── settings/     # User settings
  ├── login/        # Authentication
  └── page.tsx      # Landing page

lib/
  ├── supabase/     # Supabase client utilities
  ├── db/           # Database queries and schema
  └── store/        # Client-side state management

components/         # Reusable UI components
```

## License

MIT
