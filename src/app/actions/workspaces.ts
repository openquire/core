'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Workspace, WorkspaceInsert, WorkspaceUpdate } from '@/types/database'

export async function getWorkspaces(): Promise<Workspace[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching workspaces:', error)
    return []
  }

  return data
}

export async function getWorkspace(id: string): Promise<Workspace | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching workspace:', error)
    return null
  }

  return data
}

export async function createWorkspace(workspace: WorkspaceInsert): Promise<Workspace | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workspaces')
    .insert(workspace)
    .select()
    .single()

  if (error) {
    console.error('Error creating workspace:', error)
    return null
  }

  // Create a default welcome page in the new workspace
  await supabase
    .from('pages')
    .insert({
      workspace_id: data.id,
      user_id: workspace.user_id,
      title: 'Welcome',
      content: '<h1>Welcome to your workspace</h1><p>Start writing here...</p>',
    })

  revalidatePath('/dashboard')
  return data
}

export async function updateWorkspace(id: string, updates: WorkspaceUpdate): Promise<Workspace | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating workspace:', error)
    return null
  }

  revalidatePath('/dashboard')
  return data
}

export async function deleteWorkspace(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting workspace:', error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}

export async function getOrCreateDefaultWorkspace(userId: string): Promise<Workspace> {
  const supabase = await createClient()

  // Try to get the first existing workspace
  const { data: existing } = await supabase
    .from('workspaces')
    .select('*')
    .order('sort_order', { ascending: true })
    .limit(1)
    .single()

  if (existing) return existing

  // Create a default workspace
  const { data: created, error } = await supabase
    .from('workspaces')
    .insert({ user_id: userId, name: 'My Workspace' })
    .select()
    .single()

  if (error || !created) {
    throw new Error('Failed to create default workspace')
  }

  return created
}
