import { usePWA } from '@/hooks/use-pwa'
import { cn } from '@/lib/utils'
import { X, DeviceMobile, Lightning, WifiHigh, ArrowRight } from '@phosphor-icons/react'

export function InstallPrompt() {
  const { showPrompt, isInstalled, promptInstall, dismissPrompt } = usePWA()

  // Don't show if already installed or not installable
  if (!showPrompt || isInstalled) {
    return null
  }

  const handleInstall = async () => {
    await promptInstall()
  }

  return (
    <div
      className={cn(
        'fixed z-50 left-4 right-4 md:left-auto md:right-6 md:max-w-md',
        'bottom-4 md:bottom-auto md:top-20',
        'animate-in slide-in-from-bottom-4 md:slide-in-from-top-4 duration-500'
      )}
    >
      <div
        className={cn(
          'relative p-4 rounded-2xl',
          'bg-card/95 backdrop-blur-xl',
          'border border-emerald-500/20',
          'shadow-xl shadow-black/10'
        )}
      >
        {/* Close button */}
        <button
          onClick={dismissPrompt}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} className="text-muted-foreground" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <DeviceMobile size={24} weight="fill" className="text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-semibold text-sm mb-1">Install Open Event</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get faster access and a native app experience.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <WifiHigh size={12} weight="fill" className="text-emerald-500" />
                Works offline
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lightning size={12} weight="fill" className="text-amber-500" />
                Instant loading
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={dismissPrompt}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 rounded-lg',
                  'bg-emerald-600 hover:bg-emerald-700 text-white',
                  'text-xs font-medium transition-all',
                  'shadow-md hover:shadow-lg'
                )}
              >
                Install
                <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
