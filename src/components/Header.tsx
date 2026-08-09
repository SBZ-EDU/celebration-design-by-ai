import { useEffect, useState } from 'react'
import { BRAND } from '../lib/content'

const LINKS = [
  { href: '#services', label: 'خدمات' },
  { href: '#designer', label: 'طراح هوشمند ✨' },
  { href: '#packages', label: 'پکت‌ها' },
  { href: '#gallery', label: 'نمونه‌کارها' },
  { href: '#blog', label: 'مجله' },
  { href: '#faq', label: 'سوالات' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/10 bg-[#0b0513]/85 backdrop-blur-xl shadow-card' : 'bg-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between sm:h-20">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-amber-500 text-xl shadow-glow">
            🎉
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold">{BRAND.name}</span>
            <span className="block text-[11px] font-medium text-fuchsia-300">Celebration Design by AI</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-200 transition-colors hover:text-fuchsia-300"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={`tel:${BRAND.phoneLink}`} className="text-sm font-bold text-amber-300" dir="ltr">
            {BRAND.phone}
          </a>
          <a href="#contact" className="btn-primary !px-5 !py-2.5 text-sm">
            رزرو مشاوره رایگان
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/5 lg:hidden"
          aria-label="منو"
        >
          <span className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-[#0b0513]/95 backdrop-blur-xl lg:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="btn-primary mt-2 text-sm">
              رزرو مشاوره رایگان 🎉
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
