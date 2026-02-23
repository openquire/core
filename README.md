# Notes - Privacy-Focused Note-Taking App

A simple, privacy-focused, light-themed note-taking application built with Next.js 14+, Supabase, and shadcn/ui.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google
- 📝 **CRUD Notes** - Create, read, update, and delete notes
- 🔒 **Row Level Security** - Data is scoped securely to authenticated users
- 📱 **Responsive Design** - Collapsible sidebar on mobile
- 💾 **Auto-save** - Notes save automatically after 2 seconds
- 🎨 **Minimal Light Theme** - Clean, spacious UI

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend/DB**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Icons**: Lucide React

## Getting Started

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Project Settings > API

#### Run the Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and run the contents of `supabase/schema.sql`

This will create:
- The `notes` table
- Row Level Security policies
- Automatic `updated_at` trigger

#### Configure Google OAuth

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com):
   - Create a new project or select existing
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized JavaScript origins: `http://localhost:3000` (and your production URL)
   - Add authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy the Client ID and Client Secret to Supabase

#### Configure Redirect URLs in Supabase

**Important**: You must configure the allowed redirect URLs in Supabase:

1. Go to Authentication > URL Configuration in your Supabase dashboard
2. Add the following URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
3. For production, add your production URLs

**Troubleshooting OAuth Issues**:

If you're being redirected back to login after authentication:
- Verify the redirect URL in Supabase Dashboard > Authentication > URL Configuration
- Check browser console for errors
- Ensure cookies are not blocked by your browser
- Verify your `.env.local` has the correct `NEXT_PUBLIC_SITE_URL`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── actions/
│   │   ├── auth.ts       # Server actions for authentication
│   │   └── notes.ts      # Server actions for CRUD operations
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts  # OAuth callback handler
│   ├── dashboard/
│   │   └── page.tsx      # Main dashboard page
│   ├── login/
│   │   └── page.tsx      # Login page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root redirect
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-client.tsx
│   ├── note-editor.tsx
│   └── notes-sidebar.tsx
├── hooks/
│   └── use-mobile.ts     # Mobile detection hook
├── lib/
│   ├── supabase/
│   │   ├── browser.ts    # Browser client
│   │   └── server.ts     # Server client
│   └── utils.ts          # Utility functions
├── types/
│   └── database.ts       # TypeScript types
└── middleware.ts         # Route protection middleware
```

## Database Schema

### Notes Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to auth.users |
| `title` | TEXT | Note title (default: 'Untitled') |
| `content` | TEXT | Note content |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### Row Level Security

The following policies are implemented:

- **SELECT**: Users can only view their own notes
- **INSERT**: Users can only insert notes with their own user_id
- **UPDATE**: Users can only update their own notes
- **DELETE**: Users can only delete their own notes

## Security Considerations

- Never expose the `service_role` key in client-side code
- All data is scoped to authenticated users via RLS
- Middleware protects all routes requiring authentication
- OAuth callback properly exchanges codes for sessions

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Self-Hosted

1. Build the application: `npm run build`
2. Start the server: `npm start`

Remember to:
- Update `NEXT_PUBLIC_SITE_URL` for production
- Update Google OAuth redirect URIs
- Update Supabase allowed URLs

## License

MIT