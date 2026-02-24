import { createClient } from '@/lib/supabase/browser'

export interface UploadResult {
  url: string
  path: string
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 5MB'
  }
  return null
}

export async function uploadImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  const supabase = createClient()

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`

  const { data, error } = await supabase.storage
    .from('note-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data: urlData } = supabase.storage
    .from('note-images')
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}
