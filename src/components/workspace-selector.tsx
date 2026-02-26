'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronsUpDown, Plus, Check } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import type { Workspace } from '@/types/database'
import { createWorkspace } from '@/app/actions/workspaces'

interface WorkspaceSelectorProps {
  workspaces: Workspace[]
  currentWorkspace: Workspace
  userId: string
}

export function WorkspaceSelector({
  workspaces,
  currentWorkspace,
  userId,
}: WorkspaceSelectorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSelect = (workspace: Workspace) => {
    setOpen(false)
    if (workspace.id !== currentWorkspace.id) {
      router.push(`/dashboard/${workspace.id}`)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setIsCreating(true)
    try {
      const workspace = await createWorkspace({ user_id: userId, name: newName.trim() })
      if (workspace) {
        setCreateOpen(false)
        setNewName('')
        router.push(`/dashboard/${workspace.id}`)
      }
    } catch (error) {
      console.error('Failed to create workspace:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          onClick={() => setOpen(!open)}
          className="w-full justify-between px-3 py-2 h-auto font-semibold text-sm"
        >
          <span className="flex items-center gap-2 truncate">
            <span className="text-base">{currentWorkspace.icon || '📁'}</span>
            <span className="truncate">{currentWorkspace.name}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        </Button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => handleSelect(ws)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
                    ws.id === currentWorkspace.id && 'bg-accent'
                  )}
                >
                  <span className="text-base">{ws.icon || '📁'}</span>
                  <span className="truncate flex-1">{ws.name}</span>
                  {ws.id === currentWorkspace.id && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={() => {
                    setOpen(false)
                    setCreateOpen(true)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors text-muted-foreground"
                >
                  <Plus className="h-4 w-4" />
                  New workspace
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Give your new workspace a name.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Workspace name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !newName.trim()}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
