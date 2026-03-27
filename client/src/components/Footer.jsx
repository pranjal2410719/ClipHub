import { Globe, Mail } from 'lucide-react'
import { FiGithub } from 'react-icons/fi'

const docsLinks = [
  { label: 'Introduction', href: '/docs' },
  { label: 'About', href: '/docs' },
  { label: 'Features', href: '/docs' },
  { label: 'API Reference', href: '/docs' }
]

const resourceLinks = [
  { label: 'Examples', href: '/docs' },
  { label: 'FAQ', href: '/docs' },
  { label: 'Docs', href: '/docs' }
]

const connectLinks = [
  { label: 'GitHub', href: 'https://github.com/Yug1275', icon: FiGithub },
  { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: Globe },
  { label: 'Email', href: 'mailto:you@example.com', icon: Mail }
]

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 bg-[#0B0F19] border-t border-white/5 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-56 w-[55vw] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative px-6 md:px-12 lg:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-white font-semibold text-xl tracking-tight">ClipHub</h3>
            <p className="text-gray-500 mt-4 max-w-sm leading-relaxed">
              A modern clipboard and file sharing platform for developers.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Documentation</h4>
            <ul className="space-y-3">
              {docsLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:underline underline-offset-4 transition-all duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white hover:underline underline-offset-4 transition-all duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-3">
              {connectLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 hover:brightness-110"
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">© 2026 ClipHub. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  )
}
