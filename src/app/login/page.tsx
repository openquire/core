'use client'

import { useState } from 'react'
import { signInWithGoogle } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { FileText, Sparkles, Shield, Zap } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignIn() {
    setIsLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{
        background: 'linear-gradient(to top right, #3B7EF4, #96D9A5)'
      }}>
        {/* Decorative elements */}
        <div className="absolute inset-0">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl opacity-10" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl opacity-15" />
          
          {/* Grid pattern */}
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
            <span className="text-white/90">
              beautifully organized
            </span>
          </h1>
          
          <p className="text-lg text-white/80 mb-12 max-w-md">
            A simple, privacy-focused note-taking app that helps you capture and organize your ideas with ease.
          </p>
          
          {/* Feature highlights */}
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
        
        {/* Decorative floating elements */}
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
          <div className="lg:hidden mb-12 text-center">
            <Logo size="lg" className="justify-center" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white lg:text-foreground mb-2">Welcome back</h2>
            <p className="text-white/80 lg:text-muted-foreground">Sign in to continue to your notes</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 lg:bg-card lg:border-border rounded-2xl p-8 shadow-sm lg:backdrop-blur-none">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full h-12 text-base font-medium text-white shadow-lg transition-all duration-200"
              style={{
                background: 'linear-gradient(to top right, #3B7EF4, #96D9A5)'
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </span>
              )}
            </Button>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-white/70 lg:text-muted-foreground">
                By signing in, you agree to our{' '}
                <span className="text-white lg:text-[#3B7EF4] hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-white lg:text-[#3B7EF4] hover:underline cursor-pointer">Privacy Policy</span>
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