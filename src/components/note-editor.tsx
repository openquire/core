'use client'

import { useState, useEffect, useCallback } from 'react'
import { Note } from '@/types/database'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, FileText } from 'lucide-react'

interface NoteEditorProps {
  note: Note | null
  onSave: (id: string, updates: { title?: string; content?: string }) => Promise<void>
}

export function NoteEditor({ note, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Update local state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setHasChanges(false)
    }
  }, [note])

  // Track changes
  useEffect(() => {
    if (note) {
      const titleChanged = title !== (note.title || '')
      const contentChanged = content !== (note.content || '')
      setHasChanges(titleChanged || contentChanged)
    }
  }, [title, content, note])

  const handleSave = useCallback(async () => {
    if (!note || !hasChanges) return
    
    setIsSaving(true)
    try {
      await onSave(note.id, { title, content })
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setIsSaving(false)
    }
  }, [note, hasChanges, title, content, onSave])

  // Auto-save on blur or every 2 seconds after changes
  useEffect(() => {
    if (!hasChanges) return

    const timer = setTimeout(() => {
      handleSave()
    }, 2000)

    return () => clearTimeout(timer)
  }, [hasChanges, handleSave])

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select a note or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-0"
          />
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            size="sm"
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        {hasChanges && (
          <p className="text-xs text-muted-foreground mt-1">Unsaved changes</p>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base leading-relaxed"
        />
      </div>
    </div>
  )
}