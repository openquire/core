'use client'

import { useState } from 'react'
import { ChevronRight, FileText, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PageTreeNode } from '@/types/database'

interface PageTreeProps {
  nodes: PageTreeNode[]
  selectedPageId: string | null
  expandedIds: Set<string>
  onSelect: (pageId: string) => void
  onToggleExpand: (pageId: string) => void
  onCreateChild: (parentId: string) => void
  onDelete: (pageId: string) => void
}

export function PageTree({
  nodes,
  selectedPageId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onCreateChild,
  onDelete,
}: PageTreeProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<PageTreeNode | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (page: PageTreeNode, e: React.MouseEvent) => {
    e.stopPropagation()
    setPageToDelete(page)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!pageToDelete) return
    setIsDeleting(true)
    await onDelete(pageToDelete.id)
    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setPageToDelete(null)
  }

  return (
    <>
      <div className="space-y-0.5">
        {nodes.map((node) => (
          <PageTreeItem
            key={node.id}
            node={node}
            depth={0}
            selectedPageId={selectedPageId}
            expandedIds={expandedIds}
            onSelect={onSelect}
            onToggleExpand={onToggleExpand}
            onCreateChild={onCreateChild}
            onDeleteClick={handleDeleteClick}
          />
        ))}
        {nodes.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm mb-1">No pages yet</p>
            <p className="text-muted-foreground/70 text-xs">Create your first page</p>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              {pageToDelete ? (
                <>
                  Are you sure you want to delete <strong>&ldquo;{pageToDelete.title || 'Untitled'}&rdquo;</strong>?
                  {pageToDelete.children.length > 0 && (
                    <> This will also delete {pageToDelete.children.length} child page{pageToDelete.children.length > 1 ? 's' : ''}.</>
                  )}
                  {' '}This action cannot be undone.
                </>
              ) : (
                'Are you sure you want to delete this page? This action cannot be undone.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface PageTreeItemProps {
  node: PageTreeNode
  depth: number
  selectedPageId: string | null
  expandedIds: Set<string>
  onSelect: (pageId: string) => void
  onToggleExpand: (pageId: string) => void
  onCreateChild: (parentId: string) => void
  onDeleteClick: (page: PageTreeNode, e: React.MouseEvent) => void
}

function PageTreeItem({
  node,
  depth,
  selectedPageId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onCreateChild,
  onDeleteClick,
}: PageTreeItemProps) {
  const isExpanded = expandedIds.has(node.id)
  const hasChildren = node.children.length > 0
  const isSelected = selectedPageId === node.id

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(node.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect(node.id)
        }}
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors group cursor-pointer',
          isSelected
            ? 'bg-primary/10 text-foreground'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand(node.id)
          }}
          className={cn(
            'flex-shrink-0 p-0.5 rounded hover:bg-muted transition-transform',
            isExpanded && 'rotate-90',
            !hasChildren && 'invisible'
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <span className="flex-shrink-0 text-sm">
          {node.icon || <FileText className="h-4 w-4" />}
        </span>

        <span className="truncate flex-1 text-sm">
          {node.title || 'Untitled'}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation()
              onCreateChild(node.id)
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => onDeleteClick(node, e)}
          >
            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedPageId={selectedPageId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onCreateChild={onCreateChild}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
