'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Workspace, PageWithTags, Tag } from '@/types/database'
import { createPage, updatePage, deletePage } from '@/app/actions/pages'
import { updateWorkspace } from '@/app/actions/workspaces'
import { buildPageTree } from '@/lib/page-tree'
import { syncTagsFromContent, removeTagFromPage } from '@/app/actions/tags'
import { AppSidebar } from '@/components/app-sidebar'
import MarkdownEditor from '@/components/markdown-editor'

interface DashboardClientProps {
  workspaces: Workspace[]
  currentWorkspace: Workspace
  initialPages: PageWithTags[]
  allTags: Tag[]
  userId: string
}

export function DashboardClient({
  workspaces,
  currentWorkspace,
  initialPages,
  allTags,
  userId,
}: DashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [pages, setPages] = useState<PageWithTags[]>(initialPages)
  const [tags, setTags] = useState<Tag[]>(allTags)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand root pages that have children
    const parentIds = new Set<string>()
    for (const p of initialPages) {
      if (p.parent_id) parentIds.add(p.parent_id)
    }
    return parentIds
  })
  const [activeTagIds, setActiveTagIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Selected page from URL
  const selectedPageId = searchParams.get('page')
  const selectedPage = useMemo(
    () => pages.find((p) => p.id === selectedPageId) ?? null,
    [pages, selectedPageId]
  )

  // Auto-select first page if none selected
  useEffect(() => {
    if (!selectedPageId && pages.length > 0) {
      const rootPages = pages.filter((p) => !p.parent_id)
      if (rootPages.length > 0) {
        router.replace(`/dashboard/${currentWorkspace.id}?page=${rootPages[0].id}`, { scroll: false })
      }
    }
  }, [selectedPageId, pages, currentWorkspace.id, router])

  // Build page tree with optional tag filtering and search
  const pageTree = useMemo(() => {
    let filteredPages = pages

    if (activeTagIds.length > 0) {
      filteredPages = pages.filter((page) =>
        activeTagIds.every((tagId) => page.tags.some((t) => t.id === tagId))
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filteredPages = filteredPages.filter(
        (page) =>
          page.title.toLowerCase().includes(q) ||
          page.content.replace(/<[^>]*>/g, '').toLowerCase().includes(q) ||
          page.tags.some((t) => t.name.toLowerCase().includes(q))
      )
    }

    return buildPageTree(filteredPages)
  }, [pages, activeTagIds, searchQuery])

  // Auto-expand ancestors of selected page
  useEffect(() => {
    if (!selectedPageId) return
    const ancestors = new Set<string>()
    let current = pages.find((p) => p.id === selectedPageId)
    while (current?.parent_id) {
      ancestors.add(current.parent_id)
      current = pages.find((p) => p.id === current!.parent_id)
    }
    if (ancestors.size > 0) {
      setExpandedIds((prev) => {
        const next = new Set(prev)
        for (const id of ancestors) next.add(id)
        return next
      })
    }
  }, [selectedPageId, pages])

  const handleSelectPage = useCallback(
    (pageId: string) => {
      router.push(`/dashboard/${currentWorkspace.id}?page=${pageId}`, { scroll: false })
    },
    [currentWorkspace.id, router]
  )

  const handleToggleExpand = useCallback((pageId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(pageId)) {
        next.delete(pageId)
      } else {
        next.add(pageId)
      }
      return next
    })
  }, [])

  const handleCreatePage = useCallback(
    async (parentId?: string) => {
      try {
        const newPage = await createPage({
          workspace_id: currentWorkspace.id,
          user_id: userId,
          parent_id: parentId ?? null,
          title: 'Untitled',
          content: '',
        })
        if (newPage) {
          const pageWithTags: PageWithTags = { ...newPage, tags: [] }
          setPages((prev) => [...prev, pageWithTags])
          router.push(`/dashboard/${currentWorkspace.id}?page=${newPage.id}`, { scroll: false })

          // Auto-expand parent if creating a child
          if (parentId) {
            setExpandedIds((prev) => {
              const next = new Set(prev)
              next.add(parentId)
              return next
            })
          }
        }
      } catch (error) {
        console.error('Failed to create page:', error)
      }
    },
    [currentWorkspace.id, userId, router]
  )

  const handleSavePage = useCallback(
    async (id: string, updates: { title?: string; content?: string }) => {
      const updatedPage = await updatePage(id, updates)
      if (updatedPage) {
        // Sync tags from content
        let pageTags: Tag[] = []
        if (updates.content !== undefined) {
          pageTags = await syncTagsFromContent(id, updates.content, userId)
          // Update global tags list with any new tags
          setTags((prev) => {
            const existing = new Set(prev.map((t) => t.id))
            const newTags = pageTags.filter((t) => !existing.has(t.id))
            return newTags.length > 0 ? [...prev, ...newTags] : prev
          })
        }

        setPages((prev) =>
          prev.map((p) => {
            if (p.id !== id) return p
            return {
              ...updatedPage,
              tags: updates.content !== undefined ? pageTags : p.tags,
            }
          })
        )
      }
    },
    [userId]
  )

  const handleDeletePage = useCallback(
    async (id: string) => {
      const success = await deletePage(id)
      if (success) {
        // Remove the page and all its descendants
        const idsToRemove = new Set<string>()
        const collectIds = (pageId: string) => {
          idsToRemove.add(pageId)
          for (const p of pages) {
            if (p.parent_id === pageId) collectIds(p.id)
          }
        }
        collectIds(id)

        setPages((prev) => prev.filter((p) => !idsToRemove.has(p.id)))

        // Select another page if the deleted one was selected
        if (selectedPageId && idsToRemove.has(selectedPageId)) {
          const remaining = pages.filter((p) => !idsToRemove.has(p.id))
          if (remaining.length > 0) {
            router.push(`/dashboard/${currentWorkspace.id}?page=${remaining[0].id}`, { scroll: false })
          } else {
            router.push(`/dashboard/${currentWorkspace.id}`, { scroll: false })
          }
        }
      }
    },
    [pages, selectedPageId, currentWorkspace.id, router]
  )

  const handleToggleTag = useCallback((tagId: string) => {
    setActiveTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }, [])

  const handleRemoveTagFromPage = useCallback(
    async (tagId: string) => {
      if (!selectedPageId) return
      const success = await removeTagFromPage(selectedPageId, tagId)
      if (success) {
        setPages((prev) =>
          prev.map((p) => {
            if (p.id !== selectedPageId) return p
            return { ...p, tags: p.tags.filter((t) => t.id !== tagId) }
          })
        )
      }
    },
    [selectedPageId]
  )

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleChangePageIcon = useCallback(
    async (pageId: string, icon: string | null) => {
      const updated = await updatePage(pageId, { icon })
      if (updated) {
        setPages((prev) =>
          prev.map((p) => (p.id === pageId ? { ...p, icon } : p))
        )
      }
    },
    []
  )

  const handleRenameWorkspace = useCallback(
    async (workspaceId: string, name: string) => {
      await updateWorkspace(workspaceId, { name })
      router.refresh()
    },
    [router]
  )

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        userId={userId}
        pageTree={pageTree}
        selectedPageId={selectedPageId}
        expandedIds={expandedIds}
        tags={tags}
        activeTagIds={activeTagIds}
        searchQuery={searchQuery}
        onSelectPage={handleSelectPage}
        onToggleExpand={handleToggleExpand}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        onToggleTag={handleToggleTag}
        onSearchChange={handleSearchChange}
        onChangePageIcon={handleChangePageIcon}
        onRenameWorkspace={handleRenameWorkspace}
      />
      <MarkdownEditor
        page={selectedPage}
        onSave={handleSavePage}
        userId={userId}
        onRemoveTag={handleRemoveTagFromPage}
      />
    </div>
  )
}
