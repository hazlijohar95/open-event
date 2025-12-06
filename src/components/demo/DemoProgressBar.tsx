import { cn } from '@/lib/utils'

interface DemoProgressBarProps {
  currentScene: number
  sceneProgress: number
  sceneCount: number
  onSceneClick?: (scene: number) => void
}

export function DemoProgressBar({
  currentScene,
  sceneProgress,
  sceneCount,
  onSceneClick,
}: DemoProgressBarProps) {
  return (
    <div className="flex gap-1.5 w-full max-w-md">
      {Array.from({ length: sceneCount }).map((_, index) => {
        const isActive = index === currentScene
        const isComplete = index < currentScene

        return (
          <button
            key={index}
            onClick={() => onSceneClick?.(index)}
            className={cn(
              'relative h-1.5 flex-1 rounded-full overflow-hidden transition-colors',
              'bg-muted hover:bg-muted/80',
              onSceneClick && 'cursor-pointer'
            )}
            aria-label={`Go to scene ${index + 1}`}
          >
            {/* Completed segment fill */}
            <div
              className={cn(
                'absolute inset-0 bg-primary rounded-full transition-transform duration-300',
                isComplete ? 'scale-x-100' : 'scale-x-0'
              )}
              style={{ transformOrigin: 'left' }}
            />
            {/* Active segment fill with progress */}
            {isActive && (
              <div
                className="absolute inset-0 bg-primary rounded-full"
                style={{
                  transform: `scaleX(${sceneProgress})`,
                  transformOrigin: 'left',
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
