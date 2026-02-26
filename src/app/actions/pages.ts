'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Page, PageInsert, PageUpdate, PageWithTags, Tag } from '@/types/database'

function mapPageWithTags(row: Page & { page_tags: { tags: Tag | null }[] }): PageWithTags {
  return {
    ...row,
    tags: row.page_tags
      ?.map((pt) => pt.tags)
      .filter((t): t is Tag => t !== null) ?? [],
  }
}

export async function getPages(workspaceId: string): Promise<PageWithTags[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*, page_tags(tags(*))')
    .eq('workspace_id', workspaceId)
    .eq('is_archived', false)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching pages:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => mapPageWithTags(row))
}

export async function getPage(id: string): Promise<PageWithTags | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*, page_tags(tags(*))')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching page:', error)
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mapPageWithTags(data as any)
}

export async function createPage(page: PageInsert): Promise<Page | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pages')
    .insert(page)
    .select()
    .single()

  if (error) {
    console.error('Error creating page:', error)
    return null
  }

  revalidatePath('/dashboard')
  return data
}

export async function updatePage(id: string, updates: PageUpdate): Promise<Page | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pages')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating page:', error)
    return null
  }

  revalidatePath('/dashboard')
  return data
}

export async function deletePage(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting page:', error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}

export async function movePage(
  id: string,
  newParentId: string | null,
  newSortOrder: number
): Promise<Page | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pages')
    .update({ parent_id: newParentId, sort_order: newSortOrder })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error moving page:', error)
    return null
  }

  revalidatePath('/dashboard')
  return data
}

export async function searchPages(workspaceId: string, query: string): Promise<PageWithTags[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*, page_tags(tags(*))')
    .eq('workspace_id', workspaceId)
    .eq('is_archived', false)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error searching pages:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => mapPageWithTags(row))
}

export async function getPagesByTags(workspaceId: string, tagIds: string[]): Promise<PageWithTags[]> {
  const supabase = await createClient()

  // Get page IDs that have ALL the specified tags
  const { data: pageTagRows, error: ptError } = await supabase
    .from('page_tags')
    .select('page_id')
    .in('tag_id', tagIds)

  if (ptError || !pageTagRows) {
    console.error('Error fetching pages by tags:', ptError)
    return []
  }

  // Count how many of the requested tags each page has
  const pageCounts = new Map<string, number>()
  for (const row of pageTagRows) {
    pageCounts.set(row.page_id, (pageCounts.get(row.page_id) ?? 0) + 1)
  }

  // Only pages that match ALL tags
  const matchingPageIds = [...pageCounts.entries()]
    .filter(([, count]) => count >= tagIds.length)
    .map(([id]) => id)

  if (matchingPageIds.length === 0) return []

  const { data, error } = await supabase
    .from('pages')
    .select('*, page_tags(tags(*))')
    .eq('workspace_id', workspaceId)
    .eq('is_archived', false)
    .in('id', matchingPageIds)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching pages by tags:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => mapPageWithTags(row))
}
