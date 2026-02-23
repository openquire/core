import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Use 'next' param or default to dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // Create a response object for the redirect
    const response = NextResponse.redirect(`${origin}${next}`)
    
    // Create Supabase client with cookie handlers
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Update request cookies for this request cycle
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
            // Update response cookies for the browser
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              })
            })
          },
        },
      }
    )
    
    try {
      // Exchange the auth code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth exchange error:', error)
        // Redirect to login with error message
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }
      
      // Session should be set by the cookie handlers above
      return response
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/login?error=callback_error`)
    }
  }

  // No code parameter - redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}