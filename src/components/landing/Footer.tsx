import { Separator } from '@/components/ui/separator'
import { Github, BookOpen, MessageCircle, Twitter, Code2, Scale } from 'lucide-react'

const links = [
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: BookOpen, label: 'Documentation', href: '#' },
  { icon: MessageCircle, label: 'Community', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Code2, label: 'Open API', href: '#' },
  { icon: Scale, label: 'MIT License', href: '#' },
]

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          {links.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon className="w-4 h-4" />
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
