import { Play, Pause } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface DemoControlsProps {
  isPlaying: boolean
  currentScene: number
  sceneCount: number
  sceneTitle: string
  onPlayPause: () => void
}

export function DemoControls({
  isPlaying,
  currentScene,
  sceneCount,
  sceneTitle,
  onPlayPause,
}: DemoControlsProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-mono">
          {currentScene + 1} / {sceneCount}
        </span>
        <span className="text-sm font-medium">{sceneTitle}</span>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onPlayPause}
        aria-label={isPlaying ? 'Pause demo' : 'Play demo'}
      >
        {isPlaying ? (
          <Pause size={18} weight="duotone" />
        ) : (
          <Play size={18} weight="duotone" />
        )}
      </Button>
    </div>
  )
}
