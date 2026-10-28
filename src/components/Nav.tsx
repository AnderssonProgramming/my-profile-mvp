import { useEffect, useState } from 'react'
import { scrollToTarget } from '../lib/motion'
import Magnetic from './Magnetic'

const links = [
  ['#disciplines', 'Disciplines'],
  ['#hyrox', 'HYROX'],
  ['#lab', 'AI Lab'],
  ['#career', 'Career'],
  ['#court', 'VR Court'],
] as const

export default function Nav() {
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      setProgress(max > 0 ? scrollY / max : 0)
    }
    addEventListener('scroll', on, { passive: true })
    on()
    return () => removeEventListener('scroll', on)
  }, [])
  const go = (href: string) => {
    setOpen(false)
    scrollToTarget(href)
  }
  return (
    <header className={`nav ${open ? 'is-open' : ''}`}>
      <button className="nav-logo" onClick={() => go('#top')} data-cursor="TOP" aria-label="Back to top">
        <span className="nav-logo-ball" />
        AS<span className="accent">.</span>
      </button>
      <nav className="nav-links" aria-label="Sections">
        {links.map(([href, label]) => (
          <button key={href} onClick={() => go(href)} className="nav-link">
            <span data-text={label}>{label}</span>
          </button>
        ))}
      </nav>
      <Magnetic>
        <button className="btn btn-small" onClick={() => go('#contact')}>
          <span>Let&apos;s talk</span>
        </button>
      </Magnetic>
      <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
        <i />
        <i />
      </button>
      <div className="nav-progress" style={{ transform: `scaleX(${progress})` }} />
    </header>
  )
}
