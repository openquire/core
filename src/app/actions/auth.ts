'use server'

import { createClient } from '@/lib/supabase/server'

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // Get the base URL from environment, Vercel URL, or default to localhost
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  
  if (!baseUrl) {
    // VERCEL_URL doesn't include protocol
    const vercelUrl = process.env.VERCEL_URL
    if (vercelUrl) {
      baseUrl = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`
    } else {
      baseUrl = 'http://localhost:3000'
    }
  }
  
  // Ensure baseUrl has protocol
  if (!baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`
  }
  
  const redirectUrl = `${baseUrl}/auth/callback`
  console.log('OAuth redirect URL:', redirectUrl)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('OAuth error:', error)
    return { error: error.message }
  }

  return { url: data.url }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true }
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}