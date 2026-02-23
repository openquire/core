'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Note, NoteInsert, NoteUpdate } from '@/types/database'

export async function getNotes(): Promise<Note[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching notes:', error)
    return []
  }
  
  return data
}

export async function getNote(id: string): Promise<Note | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching note:', error)
    return null
  }
  
  return data
}

export async function createNote(note: NoteInsert): Promise<Note | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating note:', error)
    return null
  }
  
  revalidatePath('/dashboard')
  return data
}

export async function updateNote(id: string, updates: NoteUpdate): Promise<Note | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating note:', error)
    return null
  }
  
  revalidatePath('/dashboard')
  return data
}

export async function deleteNote(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting note:', error)
    return false
  }
  
  revalidatePath('/dashboard')
  return true
}