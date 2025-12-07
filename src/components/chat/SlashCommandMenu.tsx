import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Question,
  Plus,
  Trash,
  Gear,
  ArrowClockwise,
  Command,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { ComponentType, KeyboardEvent } from 'react'
import type { IconProps } from '@phosphor-icons/react'

// ============================================================================
// Types
// ============================================================================

export interface SlashCommand {
  id: string
  name: string
  description: string
  icon: ComponentType<IconProps>
  shortcut?: string
  action: () => void
}

export interface SlashCommandMenuProps {
  isOpen: boolean
  searchQuery: string
  onSelect: (command: SlashCommand) => void
  onClose: () => void
  commands?: SlashCommand[]
  className?: string
}

// ============================================================================
// Default Commands
// ============================================================================

export const createDefaultCommands = (handlers: {
  onNewChat?: () => void
  onClearChat?: () => void
  onShowHelp?: () => void
  onShowSettings?: () => void
  onRetry?: () => void
}): SlashCommand[] => [
  {
    id: 'help',
    name: 'Help',
    description: 'View help & shortcuts',
    icon: Question,
    shortcut: '?',
    action: handlers.onShowHelp || (() => {}),
  },
  {
    id: 'new',
    name: 'New Chat',
    description: 'Start a new conversation',
    icon: Plus,
    shortcut: 'N',
    action: handlers.onNewChat || (() => {}),
  },
  {
    id: 'clear',
    name: 'Clear',
    description: 'Clear current conversation',
    icon: Trash,
    action: handlers.onClearChat || (() => {}),
  },
  {
    id: 'retry',
    name: 'Retry',
    description: 'Retry last message',
    icon: ArrowClockwise,
    shortcut: 'R',
    action: handlers.onRetry || (() => {}),
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Open settings',
    icon: Gear,
    action: handlers.onShowSettings || (() => {}),
  },
]

// ============================================================================
// Component
// ============================================================================

export function SlashCommandMenu({
  isOpen,
  searchQuery,
  onSelect,
  onClose,
  commands = [],
  className,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Filter commands based on search query (remove leading slash)
  const query = searchQuery.startsWith('/') ? searchQuery.slice(1).toLowerCase() : ''
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query)
  )

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    const selectedItem = itemRefs.current[selectedIndex]
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            onSelect(filteredCommands[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [isOpen, filteredCommands, selectedIndex, onSelect, onClose]
  )

  // Expose keyboard handler
  useEffect(() => {
    if (!isOpen) return

    const handler = (e: globalThis.KeyboardEvent) => {
      handleKeyDown(e as unknown as KeyboardEvent)
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, handleKeyDown])

  if (!isOpen || filteredCommands.length === 0) return null

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute bottom-full left-0 right-0 mb-2',
        'bg-popover border border-border rounded-xl shadow-lg',
        'overflow-hidden',
        'menu-entrance',
        className
      )}
      role="listbox"
      aria-label="Slash commands"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
        <Command size={14} weight="bold" className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">
          Commands
        </span>
        <span className="text-xs text-muted-foreground/50 ml-auto">
          ↑↓ to navigate · Enter to select
        </span>
      </div>

      {/* Command list */}
      <div className="max-h-[240px] overflow-y-auto py-1 custom-scrollbar">
        {filteredCommands.map((command, index) => {
          const Icon = command.icon
          const isSelected = index === selectedIndex

          return (
            <button
              key={command.id}
              ref={(el) => { itemRefs.current[index] = el }}
              onClick={() => onSelect(command)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5',
                'transition-colors duration-[var(--duration-fast)]',
                'text-left',
                isSelected
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted/50'
              )}
              role="option"
              aria-selected={isSelected}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  isSelected ? 'bg-primary/10' : 'bg-muted'
                )}
              >
                <Icon
                  size={18}
                  weight="duotone"
                  className={cn(
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{command.name}</span>
                  {command.shortcut && (
                    <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-muted/50 text-[10px] font-mono text-muted-foreground">
                      /{command.shortcut.toLowerCase()}
                    </kbd>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {command.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Empty state */}
      {filteredCommands.length === 0 && (
        <div className="px-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">No commands found</p>
        </div>
      )}
    </div>
  )
}
