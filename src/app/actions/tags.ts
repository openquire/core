'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tag, TagInsert, TagUpdate } from '@/types/database'

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return data
}

export async function createTag(tag: TagInsert): Promise<Tag | null> {
  const supabase = await createClient()

  // Upsert: if a tag with the same (user_id, name) exists, return it
  const { data, error } = await supabase
    .from('tags')
    .upsert(tag, { onConflict: 'user_id,name' })
    .select()
    .single()

  if (error) {
    console.error('Error creating tag:', error)
    return null
  }

  return data
}

export async function updateTag(id: string, updates: TagUpdate): Promise<Tag | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating tag:', error)
    return null
  }

  revalidatePath('/dashboard')
  return data
}

export async function deleteTag(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting tag:', error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}

export async function addTagToPage(pageId: string, tagId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('page_tags')
    .upsert({ page_id: pageId, tag_id: tagId }, { onConflict: 'page_id,tag_id' })

  if (error) {
    console.error('Error adding tag to page:', error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}

export async function removeTagFromPage(pageId: string, tagId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('page_tags')
    .delete()
    .eq('page_id', pageId)
    .eq('tag_id', tagId)

  if (error) {
    console.error('Error removing tag from page:', error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}

export async function syncTagsFromContent(
  pageId: string,
  content: string,
  userId: string
): Promise<Tag[]> {
  const supabase = await createClient()

  // Strip HTML tags to get plain text, then extract #hashtags
  const textContent = content.replace(/<[^>]*>/g, '')
  const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9_-]*)/g
  const matches = [...textContent.matchAll(hashtagRegex)]
  const tagNames = [...new Set(matches.map((m) => m[1].toLowerCase()))]

  if (tagNames.length === 0) {
    // Remove all existing tags from this page
    await supabase.from('page_tags').delete().eq('page_id', pageId)
    revalidatePath('/dashboard')
    return []
  }

  // Upsert all tags
  const tags: Tag[] = []
  for (const name of tagNames) {
    const { data } = await supabase
      .from('tags')
      .upsert({ user_id: userId, name }, { onConflict: 'user_id,name' })
      .select()
      .single()
    if (data) tags.push(data)
  }

  // Sync page_tags: clear old, insert new
  await supabase.from('page_tags').delete().eq('page_id', pageId)
  if (tags.length > 0) {
    await supabase.from('page_tags').insert(
      tags.map((tag) => ({ page_id: pageId, tag_id: tag.id }))
    )
  }

  revalidatePath('/dashboard')
  return tags
}

export async function searchTags(query: string): Promise<Tag[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error searching tags:', error)
    return []
  }

  return data
}
