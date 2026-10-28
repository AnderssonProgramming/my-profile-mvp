import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'
import { stats, stack } from '../data'

export default function Stats() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      root.current!.querySelectorAll<HTMLElement>('.stat').forEach((card) => {
        const num = card.querySelector<HTMLElement>('.stat-num')!
        const end = Number(num.dataset.value)
        const o = { v: 0 }
        gsap.from(card, {
          y: 80,
          opacity: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 88%' },
        })
        gsap.to(o, {
          v: end,
          duration: 2,
          ease: 'power4.out',
          scrollTrigger: { trigger: card, start: 'top 88%' },
          onUpdate: () => (num.textContent = String(Math.round(o.v))),
        })
      })
      // marquee speeds up / reverses with scroll direction
      const rows = gsap.utils.toArray<HTMLElement>('.stack-row .marquee-track')
      rows.forEach((row, i) => {
        gsap.to(row, {
          xPercent: i % 2 ? 25 : -25,
          ease: 'none',
          scrollTrigger: { trigger: '.stack', start: 'top bottom', end: 'bottom top', scrub: 0.5 },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section stats">
      <div className="section-head">
        <span className="eyebrow mono">BOX SCORE</span>
        <h2 className="big">
          THE <span className="accent">NUMBERS</span>
        </h2>
      </div>
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-value">
              {s.prefix && <span className="stat-prefix">{s.prefix}</span>}
              <span className="stat-num" data-value={s.value}>
                0
              </span>
              <span className="accent">{s.suffix}</span>
            </div>
            <p>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="stack" aria-label="Tech stack">
        {[0, 1].map((r) => (
          <div key={r} className="stack-row">
            <div className="marquee-track">
              {[...stack, ...stack].map((t, i) => (
                <span key={i} className={i % 3 === r ? 'hot' : ''}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
