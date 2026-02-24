'use client'

import { useState, useCallback, useEffect } from 'react'
import { Note } from '@/types/database'
import { createNote, updateNote, deleteNote } from '@/app/actions/notes'
import { NotesSidebar } from '@/components/notes-sidebar'
import MarkdownEditor from '@/components/markdown-editor'

interface DashboardClientProps {
  initialNotes: Note[]
  userId: string
}

export function DashboardClient({ initialNotes, userId }: DashboardClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Select first note on mount if available
  useEffect(() => {
    if (notes.length > 0 && !selectedNote) {
      setSelectedNote(notes[0])
    }
  }, [notes, selectedNote])

  const handleCreateNote = useCallback(async () => {
    setIsCreating(true)
    try {
      const newNote = await createNote({
        user_id: userId,
        title: 'Untitled',
        content: '',
      })
      if (newNote) {
        setNotes((prev) => [newNote, ...prev])
        setSelectedNote(newNote)
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setIsCreating(false)
    }
  }, [userId])

  const handleSaveNote = useCallback(async (id: string, updates: { title?: string; content?: string }) => {
    const updatedNote = await updateNote(id, updates)
    if (updatedNote) {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? updatedNote : n))
      )
      // Update selectedNote if it's the one being saved
      if (selectedNote?.id === id) {
        setSelectedNote(updatedNote)
      }
    }
  }, [selectedNote])

  const handleDeleteNote = useCallback(async (id: string) => {
    const success = await deleteNote(id)
    if (success) {
      setNotes((prev) => prev.filter((n) => n.id !== id))
      if (selectedNote?.id === id) {
        setSelectedNote(notes.find((n) => n.id !== id) || null)
      }
    }
  }, [selectedNote, notes])

  return (
    <div className="flex h-screen bg-background">
      <NotesSidebar
        notes={notes}
        currentNoteId={selectedNote?.id || null}
        onSelectNote={setSelectedNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        isCreating={isCreating}
      />
      <MarkdownEditor
        note={selectedNote}
        onSave={handleSaveNote}
        userId={userId}
      />
    </div>
  )
}