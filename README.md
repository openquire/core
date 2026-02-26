# OpenQuire

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

A modern note-taking app with workspaces, nested pages, and tag management. Built with Next.js 16, Supabase, and shadcn/ui.

## Features

- **Workspaces** — Organize your work into separate workspaces
- **Nested Pages** — Create pages with unlimited parent/child hierarchy
- **Tag Management** — Tag pages with `#hashtags` inline in content; tags are auto-extracted on save
- **Tag Search** — Filter pages by tags in the sidebar
- **Rich Editor** — Content-editable editor with slash commands (`/heading`, `/code`, `/image`, etc.)
- **Image Upload** — Upload images via slash command or paste from clipboard
- **Auto-save** — Changes are saved automatically after 2 seconds of inactivity
- **Authentication** — Google OAuth, GitHub OAuth, and email/password via Supabase Auth
- **Row Level Security** — All data is scoped securely to authenticated users
- **PWA** — Installable as a Progressive Web App
- **Responsive Design** — Mobile-first with collapsible sidebar

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **UI**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **React**: v19 with React Compiler

## Getting Started

### 1. Clone and Install

```bash
git clone <repo-url>
cd core
npm install
```

### 2. Set Up Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

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

This creates:
- `workspaces` table — user workspaces
- `pages` table — nested pages with parent/child hierarchy
- `tags` table — user-owned tags
- `page_tags` table — junction table linking pages to tags
- `note-images` storage bucket for uploaded images
- Row Level Security policies on all tables
- Auto-update triggers for `updated_at`

> **Migrating from an older version (with `notes` table)?** Run `supabase/migration-001-workspaces.sql` instead. It creates the new tables and migrates existing notes into workspaces and pages.

#### Configure Authentication

**Google OAuth:**
1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com):
   - Create OAuth 2.0 Client ID
   - Add authorized JavaScript origins: `http://localhost:3000` (and your production URL)
   - Add authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy the Client ID and Client Secret to Supabase

**GitHub OAuth:**
1. Enable GitHub provider in Supabase Authentication > Providers
2. Create an OAuth App in GitHub Settings > Developer Settings
3. Set the callback URL to `https://<your-project-ref>.supabase.co/auth/v1/callback`

**Redirect URLs:**
1. Go to Authentication > URL Configuration in your Supabase dashboard
2. Set Site URL: `http://localhost:3000`
3. Add Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    actions/              # Server actions
      auth.ts             # Authentication (OAuth, email)
      workspaces.ts       # Workspace CRUD
      pages.ts            # Page CRUD, search, tag filtering
      tags.ts             # Tag CRUD, sync from content
    auth/                 # Auth callback & confirmation routes
    dashboard/
      page.tsx            # Redirects to default workspace
      [workspaceId]/
        page.tsx          # Main workspace view
    login/                # Login page
  components/
    ui/                   # shadcn/ui primitives
    app-sidebar.tsx       # Sidebar (workspace selector, page tree, tags)
    dashboard-client.tsx  # Client-side state management hub
    markdown-editor.tsx   # Rich content editor with slash commands
    workspace-selector.tsx
    page-tree.tsx         # Recursive collapsible page tree
    tag-filter.tsx        # Tag filter badges in sidebar
    tag-badges.tsx        # Tag display in editor header
  lib/
    supabase/             # Supabase client setup (browser + server)
    page-tree.ts          # Page tree builder utility
    upload-image.ts       # Image upload to Supabase Storage
    utils.ts              # cn() utility
  types/
    database.ts           # TypeScript types for all tables
  middleware.ts           # Auth route protection
supabase/
  schema.sql              # Full database schema (fresh install)
  migration-001-workspaces.sql  # Migration from notes to workspaces+pages
```

## Database Schema

```
workspaces (id, user_id, name, icon, sort_order)
  |
  +-- pages (id, workspace_id, user_id, parent_id, title, content, icon, sort_order, is_archived)
  |     |
  |     +-- pages (nested via parent_id self-reference)
  |
tags (id, user_id, name, color)
  |
  +-- page_tags (page_id, tag_id) -- junction table
```

All tables use Row Level Security so users can only access their own data.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Self-Hosted

1. Build: `npm run build`
2. Start: `npm start`

Remember to update `NEXT_PUBLIC_SITE_URL`, OAuth redirect URIs, and Supabase allowed URLs for production.

## Security

- All data is scoped to authenticated users via Row Level Security
- Never expose the `service_role` key in client-side code
- Middleware protects all dashboard routes
- OAuth callbacks properly exchange codes for sessions
- Image uploads are scoped to user folders

## License

MIT
