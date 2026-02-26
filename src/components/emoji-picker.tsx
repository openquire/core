'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: 'Pages',
    emojis: ['📄', '📝', '📑', '📋', '📒', '📓', '📔', '📕', '📗', '📘', '📙', '📖'],
  },
  {
    label: 'Objects',
    emojis: ['💡', '🎯', '🔑', '🔒', '📌', '📎', '🔗', '💼', '📦', '🗂️', '📁', '📂'],
  },
  {
    label: 'Symbols',
    emojis: ['⭐', '🌟', '💫', '✨', '🔥', '❤️', '💜', '💙', '💚', '💛', '🧡', '🤍'],
  },
  {
    label: 'Nature',
    emojis: ['🌱', '🌿', '🍀', '🌸', '🌺', '🌻', '🌳', '🌴', '🍃', '🌈', '☀️', '🌙'],
  },
  {
    label: 'Activities',
    emojis: ['🚀', '🎉', '🎨', '🎵', '🎮', '💻', '🧪', '🔬', '📊', '📈', '🏆', '🎓'],
  },
  {
    label: 'Faces',
    emojis: ['😊', '🤔', '💪', '👋', '🙌', '👀', '🧠', '🤖', '👾', '🐱', '🐶', '🦊'],
  },
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onRemove?: () => void
  className?: string
}

export function EmojiPicker({ onSelect, onRemove, className }: EmojiPickerProps) {
  const [search, setSearch] = useState('')

  const filteredGroups = search.trim()
    ? EMOJI_GROUPS.map((g) => ({
        ...g,
        emojis: g.emojis.filter(() => g.label.toLowerCase().includes(search.toLowerCase())),
      })).filter((g) => g.emojis.length > 0)
    : EMOJI_GROUPS

  return (
    <div
      className={cn(
        'bg-popover border border-border rounded-lg shadow-lg w-64 overflow-hidden',
        className
      )}
    >
      <div className="p-2 border-b border-border">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter..."
          className="w-full px-2 py-1 text-xs bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/30"
          autoFocus
        />
      </div>
      <div className="max-h-48 overflow-y-auto p-2">
        {filteredGroups.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 px-0.5">
              {group.label}
            </p>
            <div className="grid grid-cols-8 gap-0.5">
              {group.emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent transition-colors text-base"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {onRemove && (
        <div className="border-t border-border p-1.5">
          <button
            onClick={onRemove}
            className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded transition-colors text-left"
          >
            Remove icon
          </button>
        </div>
      )}
    </div>
  )
}
