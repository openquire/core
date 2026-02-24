'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
}

export function Logo({ className, iconOnly = false, size = 'md', variant = 'light' }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-6 w-6', text: 'text-lg', container: 'h-6' },
    md: { icon: 'h-8 w-8', text: 'text-xl', container: 'h-8' },
    lg: { icon: 'h-18 w-18', text: 'text-4xl', container: 'h-12' },
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo Icon from public/logo.png */}
      <div className={cn('relative', sizes[size].icon)}>
        <Image
          src="/logo.png"
          alt="openQuire Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      
      {/* App Name */}
      {!iconOnly && (
        <span className={cn('font-bold tracking-tight', sizes[size].text)}>
          <span className={cn(
            'bg-gradient-to-r from-[#3B7EF4] to-[#5CB85C] bg-clip-text',
            variant === 'dark' ? 'text-transparent' : 'text-white'
          )}>
            open
          </span>
          <span className={variant === 'dark' ? 'text-foreground' : 'text-white'}>Quire</span>
        </span>
      )}
    </div>
  )
}

/* Alternative smaller logo mark for headers */
export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('h-8 w-8 relative', className)}>
      <Image
        src="/logo.png"
        alt="openQuire Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}