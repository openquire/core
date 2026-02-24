'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  )
}

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()

    async function handleConfirmation() {
      const code = searchParams.get('code')
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      // PKCE flow: exchange code for session
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.push('/dashboard')
          return
        }
        setError(error.message)
        return
      }

      // OTP flow: verify with token_hash
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as 'signup' | 'email',
        })
        if (!error) {
          router.push('/dashboard')
          return
        }
        setError(error.message)
        return
      }

      // Implicit flow: Supabase client auto-reads #access_token from hash fragment
      // onAuthStateChange will fire if tokens are in the hash
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          router.push('/dashboard')
        }
      })

      // Check if already signed in (hash fragment was processed)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
        return
      }

      // Wait a moment for hash fragment processing, then show error if still no session
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/dashboard')
        } else {
          setError('Email confirmation failed. Please try signing in.')
        }
      }, 2000)

      return () => {
        subscription.unsubscribe()
      }
    }

    handleConfirmation()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-[#3B7EF4] hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#3B7EF4] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Confirming your email...</p>
      </div>
    </div>
  )
}
