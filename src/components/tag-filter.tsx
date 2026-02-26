'use client'

import { cn } from '@/lib/utils'
import type { Tag } from '@/types/database'

interface TagFilterProps {
  tags: Tag[]
  activeTagIds: string[]
  onToggle: (tagId: string) => void
}

const TAG_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
]

function getTagColor(tag: Tag, index: number): string {
  return tag.color || TAG_COLORS[index % TAG_COLORS.length]
}

export function TagFilter({ tags, activeTagIds, onToggle }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2">
      {tags.map((tag, index) => {
        const isActive = activeTagIds.includes(tag.id)
        const color = getTagColor(tag, index)

        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.id)}
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all',
              isActive
                ? 'text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
            style={isActive ? { backgroundColor: color } : undefined}
          >
            #{tag.name}
          </button>
        )
      })}
    </div>
  )
}
