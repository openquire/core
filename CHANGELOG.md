# Changelog

## [0.2.1] - 2026-02-26

### Added
- **Page Icons**: Set emoji icons on pages via an inline emoji picker in the page tree
- **Workspace Rename**: Rename workspaces inline from the workspace selector dropdown

## [0.2.0] - 2026-02-26

### Added
- **Workspaces**: Create and switch between multiple workspaces
- **Nested Pages**: Pages support unlimited parent/child hierarchy with collapsible tree view in sidebar
- **Tag Management**: Auto-extract `#hashtags` from page content on save
- **Tag Filtering**: Filter pages by tags in the sidebar
- **Tag Badges**: View and remove tags from the editor header
- **Workspace Selector**: Dropdown in sidebar to switch or create workspaces
- **Page Search**: Search pages by title, content, or tag name
- **Deep Linking**: Pages are addressable via URL (`/dashboard/[workspaceId]?page=[pageId]`)
- New database tables: `workspaces`, `pages`, `tags`, `page_tags` with full RLS policies
- Migration script (`migration-001-workspaces.sql`) to convert existing notes to the new schema

### Changed
- Replaced flat notes list with nested page tree in sidebar
- Dashboard now routes through `/dashboard/[workspaceId]`
- Editor updated from `Note` type to `PageWithTags` with tag display
- Sidebar rewritten as `app-sidebar.tsx` with workspace selector, tag filter, and page tree

### Removed
- `notes` table (replaced by `pages` table with workspace and hierarchy support)
- `notes-sidebar.tsx` (replaced by `app-sidebar.tsx`)
- `note-editor.tsx` (unused legacy component)
- `actions/notes.ts` (replaced by `actions/pages.ts`)

## [0.1.0] - Initial Release

### Added
- Note creation with rich text editor
- Slash commands: headings, lists, quotes, code blocks, bold, italic, image
- Image upload via slash command and clipboard paste
- Auto-save with 2-second debounce
- Google OAuth, GitHub OAuth, and email/password authentication
- Supabase Row Level Security for user data isolation
- Progressive Web App (PWA) support
- Responsive mobile-first design with collapsible sidebar
