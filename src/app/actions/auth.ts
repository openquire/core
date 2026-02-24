'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

async function getBaseUrl() {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'

  let baseUrl: string

  if (host) {
    baseUrl = `${protocol}://${host}`
  } else {
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  }

  if (!baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`
  }

  return baseUrl
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const baseUrl = await getBaseUrl()
  const redirectUrl = `${baseUrl}/auth/callback`

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
    return { error: error.message }
  }

  return { url: data.url }
}

export async function signInWithGitHub() {
  const supabase = await createClient()
  const baseUrl = await getBaseUrl()
  const redirectUrl = `${baseUrl}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectUrl,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { url: data.url }
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = await createClient()
  const baseUrl = await getBaseUrl()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If user already exists and is confirmed, Supabase returns user with identities = []
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'An account with this email already exists. Please sign in instead.' }
  }

  return { success: true }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
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
