'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // Get the host from request headers (most reliable)
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  
  // Build the base URL from the actual request
  let baseUrl: string
  
  if (host) {
    baseUrl = `${protocol}://${host}`
  } else {
    // Fallback to environment variables
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
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