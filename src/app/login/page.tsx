'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signInWithGoogle, signInWithGitHub, signInWithEmail, signUpWithEmail } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { Sparkles, Shield, Zap, Mail, Eye, EyeOff } from 'lucide-react'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState(urlError || '')
  const [message, setMessage] = useState('')

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        const result = await signUpWithEmail(email, password)
        if (result.error) {
          setError(result.error)
        } else {
          setMessage('Check your email for a confirmation link to complete your signup.')
          setEmail('')
          setPassword('')
        }
      } else {
        const result = await signInWithEmail(email, password)
        if (result.error) {
          setError(result.error)
        } else {
          router.push('/dashboard')
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setError('')
    setMessage('')
    setOauthLoading(provider)

    try {
      const result = provider === 'google'
        ? await signInWithGoogle()
        : await signInWithGitHub()

      if ('error' in result && result.error) {
        setError(result.error)
        setOauthLoading(null)
      } else if ('url' in result && result.url) {
        window.location.href = result.url
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setOauthLoading(null)
    }
  }

  const isDisabled = isLoading || oauthLoading !== null

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{
        background: 'linear-gradient(to top right, #3B7EF4, #96D9A5)'
      }}>
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl opacity-10" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl opacity-15" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="mb-12">
            <Logo size="lg" className="text-white" />
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Your thoughts,<br />
            <span className="text-white/90">beautifully organized</span>
          </h1>

          <p className="text-lg text-white/80 mb-12 max-w-md">
            A simple, privacy-focused note-taking app that helps you capture and organize your ideas with ease.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/90">Fast and intuitive editing</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/90">Privacy-focused & secure</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/90">Beautiful, clean interface</span>
            </div>
          </div>
        </div>

        <div className="absolute top-20 right-20 w-4 h-4 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute top-40 right-40 w-2 h-2 rounded-full bg-white/40 animate-pulse delay-300" />
        <div className="absolute bottom-40 left-20 w-3 h-3 rounded-full bg-white/30 animate-pulse delay-500" />
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative bg-linear-to-tr from-[#3B7EF4] to-[#96D9A5] lg:bg-none lg:bg-background">
        {/* Mobile decorative elements */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl opacity-10" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl opacity-15" />
        </div>
        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Logo size="lg" className="justify-center" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white lg:text-foreground mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-white/80 lg:text-muted-foreground">
              {mode === 'login' ? 'Sign in to continue to your notes' : 'Sign up to start taking notes'}
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border border-white/30 lg:bg-card lg:border-border rounded-2xl p-8 shadow-sm lg:backdrop-blur-none">
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {message && (
              <div className="mb-4 p-3 rounded-lg bg-[#96D9A5]/20 border border-[#96D9A5]/30 text-sm text-white lg:text-foreground">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              </div>
            )}

            {/* Email form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  disabled={isDisabled}
                  className="w-full px-4 py-3 rounded-lg border border-white/30 lg:border-border bg-white/10 lg:bg-background text-white lg:text-foreground placeholder:text-white/50 lg:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3B7EF4]/50 transition-all disabled:opacity-50"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-white/30 lg:border-border bg-white/10 lg:bg-background text-white lg:text-foreground placeholder:text-white/50 lg:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3B7EF4]/50 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 lg:text-muted-foreground hover:text-white lg:hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isDisabled}
                className="w-full h-12 text-base font-medium text-white shadow-lg transition-all duration-200"
                style={{
                  background: 'linear-gradient(to top right, #3B7EF4, #96D9A5)'
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <Spinner className="h-5 w-5" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20 lg:border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 text-white/60 lg:text-muted-foreground bg-transparent lg:bg-card">
                  or continue with
                </span>
              </div>
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isDisabled}
                onClick={() => handleOAuth('google')}
                className="h-11 border-white/30 lg:border-border bg-white/10 lg:bg-background text-white lg:text-foreground hover:bg-white/20 lg:hover:bg-muted transition-all"
              >
                {oauthLoading === 'google' ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <>
                    <GoogleIcon className="h-5 w-5 mr-2" />
                    Google
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isDisabled}
                onClick={() => handleOAuth('github')}
                className="h-11 border-white/30 lg:border-border bg-white/10 lg:bg-background text-white lg:text-foreground hover:bg-white/20 lg:hover:bg-muted transition-all"
              >
                {oauthLoading === 'github' ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <>
                    <GitHubIcon className="h-5 w-5 mr-2" />
                    GitHub
                  </>
                )}
              </Button>
            </div>

            {/* Toggle mode */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/70 lg:text-muted-foreground">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login')
                    setError('')
                    setMessage('')
                  }}
                  className="text-white lg:text-[#3B7EF4] font-medium hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Terms */}
            <div className="mt-4 text-center">
              <p className="text-xs text-white/50 lg:text-muted-foreground">
                By continuing, you agree to our{' '}
                <span className="text-white/70 lg:text-[#3B7EF4] hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-white/70 lg:text-[#3B7EF4] hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          </div>

          {/* App features for mobile */}
          <div className="lg:hidden mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-3">
              <Zap className="h-5 w-5 mx-auto mb-2 text-white/80" />
              <span className="text-xs text-white/80">Fast</span>
            </div>
            <div className="p-3">
              <Shield className="h-5 w-5 mx-auto mb-2 text-white/80" />
              <span className="text-xs text-white/80">Secure</span>
            </div>
            <div className="p-3">
              <Sparkles className="h-5 w-5 mx-auto mb-2 text-white/80" />
              <span className="text-xs text-white/80">Beautiful</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
