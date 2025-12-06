import { Separator } from '@/components/ui/separator'
import { GithubLogo, BookOpen, ChatCircle, XLogo, Code, Scales, type Icon } from '@phosphor-icons/react'

const links: { icon: Icon; label: string; href: string }[] = [
  { icon: GithubLogo, label: 'GitHub', href: '#' },
  { icon: BookOpen, label: 'Documentation', href: '#' },
  { icon: ChatCircle, label: 'Community', href: '#' },
  { icon: XLogo, label: 'Twitter', href: '#' },
  { icon: Code, label: 'Open API', href: '#' },
  { icon: Scales, label: 'MIT License', href: '#' },
]

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          {links.map(({ icon: IconComponent, label, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconComponent size={16} weight="duotone" />
              <span>{label}</span>
            </a>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom note */}
        <div className="text-center text-sm text-muted-foreground">
          <span className="font-mono">open-event</span>
          <span className="mx-2">·</span>
          <span>Fully open-source</span>
          <span className="mx-2">·</span>
          <span>Built in Malaysia 🇲🇾</span>
        </div>
      </div>
    </footer>
  )
}
