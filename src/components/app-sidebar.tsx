'use client'

import { useState } from 'react'
import { Plus, LogOut, Search, Hash, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WorkspaceSelector } from '@/components/workspace-selector'
import { PageTree } from '@/components/page-tree'
import { TagFilter } from '@/components/tag-filter'
import { signOut } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import type { Workspace, PageTreeNode, Tag } from '@/types/database'

interface AppSidebarProps {
  workspaces: Workspace[]
  currentWorkspace: Workspace
  userId: string
  pageTree: PageTreeNode[]
  selectedPageId: string | null
  expandedIds: Set<string>
  tags: Tag[]
  activeTagIds: string[]
  searchQuery: string
  onSelectPage: (pageId: string) => void
  onToggleExpand: (pageId: string) => void
  onCreatePage: (parentId?: string) => void
  onDeletePage: (pageId: string) => void
  onToggleTag: (tagId: string) => void
  onSearchChange: (query: string) => void
  onChangePageIcon: (pageId: string, icon: string | null) => void
  onRenameWorkspace: (workspaceId: string, name: string) => void
}

export function AppSidebar({
  workspaces,
  currentWorkspace,
  userId,
  pageTree,
  selectedPageId,
  expandedIds,
  tags,
  activeTagIds,
  searchQuery,
  onSelectPage,
  onToggleExpand,
  onCreatePage,
  onDeletePage,
  onToggleTag,
  onSearchChange,
  onChangePageIcon,
  onRenameWorkspace,
}: AppSidebarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleSelectPage = (pageId: string) => {
    onSelectPage(pageId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-3 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-3">
            <Logo size="sm" variant="dark" />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Workspace selector */}
          <WorkspaceSelector
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            userId={userId}
            onRename={onRenameWorkspace}
          />

          {/* Search bar */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search pages..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B7EF4]/30 focus:border-[#3B7EF4]/50 transition-all"
            />
          </div>
        </div>

        {/* Tags filter */}
        {tags.length > 0 && (
          <div className="border-b border-sidebar-border">
            <div className="px-3 pt-2 pb-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Tags
              </p>
            </div>
            <TagFilter tags={tags} activeTagIds={activeTagIds} onToggle={onToggleTag} />
          </div>
        )}

        {/* New page button */}
        <div className="p-3">
          <Button
            onClick={() => {
              onCreatePage()
              setIsOpen(false)
            }}
            className="w-full justify-start gap-2 text-white shadow-md transition-all duration-200"
            style={{
              background: 'linear-gradient(to top right, #3B7EF4, #96D9A5)',
            }}
          >
            <Plus className="h-4 w-4" />
            New Page
          </Button>
        </div>

        {/* Pages tree */}
        <ScrollArea className="flex-1">
          <div className="px-3 pb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Pages
            </p>
          </div>
          <div className="px-2 pb-3">
            <PageTree
              nodes={pageTree}
              selectedPageId={selectedPageId}
              expandedIds={expandedIds}
              onSelect={handleSelectPage}
              onToggleExpand={onToggleExpand}
              onCreateChild={(parentId) => {
                onCreatePage(parentId)
                setIsOpen(false)
              }}
              onDelete={onDeletePage}
              onChangeIcon={onChangePageIcon}
            />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}
