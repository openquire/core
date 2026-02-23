'use client'

import { useState } from 'react'
import { Note } from '@/types/database'
import { cn } from '@/lib/utils'
import {
  Plus,
  Trash2,
  FileText,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { signOut } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

interface NotesSidebarProps {
  notes: Note[]
  currentNoteId: string | null
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
  isCreating: boolean
}

function formatDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    // Use fixed locale to avoid server/client hydration mismatch
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

function getPreview(content: string) {
  const text = content.replace(/<[^>]*>/g, '').trim()
  return text.length > 40 ? text.substring(0, 40) + '...' : text || 'No content'
}

interface NoteItemProps {
  note: Note
  isSelected: boolean
  onSelect: (note: Note) => void
  onDeleteClick: (note: Note, e: React.MouseEvent) => void
}

function NoteItem({ note, isSelected, onSelect, onDeleteClick }: NoteItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(note)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(note) }}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-colors group relative cursor-pointer',
        isSelected
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-muted/50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate text-sm">
              {note.title || 'Untitled'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate pl-6">
            {getPreview(note.content)}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1 pl-6">
            {formatDate(note.updated_at)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={(e) => onDeleteClick(note, e)}
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  )
}

export function NotesSidebar({
  notes,
  currentNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  isCreating,
}: NotesSidebarProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleDeleteClick = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    setNoteToDelete(note)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!noteToDelete) return
    setIsDeleting(true)
    await onDeleteNote(noteToDelete.id)
    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setNoteToDelete(null)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleSelectNote = (note: Note) => {
    onSelectNote(note)
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
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
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
        {/* Header with Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <Logo size="sm" />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B7EF4]/30 focus:border-[#3B7EF4]/50 transition-all"
            />
          </div>
        </div>

        {/* New note button */}
        <div className="p-3">
          <Button
            onClick={() => {
              onCreateNote()
              setIsOpen(false)
            }}
            disabled={isCreating}
            className="w-full justify-start gap-2 text-white shadow-md transition-all duration-200"
            style={{
              background: 'linear-gradient(to top right, #3B7EF4, #96D9A5)'
            }}
          >
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>

        {/* Notes list */}
        <ScrollArea className="flex-1">
          <div className="px-3 pb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Your Notes
            </p>
          </div>
          <div className="space-y-1 px-3">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={currentNoteId === note.id}
                onSelect={handleSelectNote}
                onDeleteClick={handleDeleteClick}
              />
            ))}
            {notes.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground text-sm mb-1">No notes yet</p>
                <p className="text-muted-foreground/70 text-xs">Create your first note to get started</p>
              </div>
            )}
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

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              {noteToDelete ? (
                <>
                  Are you sure you want to delete <strong>&ldquo;{noteToDelete.title || 'Untitled'}&rdquo;</strong>? This action cannot be undone.
                </>
              ) : (
                'Are you sure you want to delete this note? This action cannot be undone.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
