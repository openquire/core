'use client'

import { X } from 'lucide-react'
import type { Tag } from '@/types/database'

interface TagBadgesProps {
  tags: Tag[]
  onRemove: (tagId: string) => void
}

export function TagBadges({ tags, onRemove }: TagBadgesProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
        >
          #{tag.name}
          <button
            onClick={() => onRemove(tag.id)}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )
}
