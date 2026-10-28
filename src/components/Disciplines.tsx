import { useEffect, useRef, type PointerEvent } from 'react'
import { gsap, isTouch } from '../lib/motion'
import { disciplines } from '../data'

function TiltCard({ d, index }: { d: (typeof disciplines)[number]; index: number }) {
  const ref = useRef<HTMLElement>(null)
  const move = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current
    if (!el || isTouch()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    gsap.to(el, { rotateY: (x - 0.5) * 16, rotateX: (0.5 - y) * 14, duration: 0.5, ease: 'power3.out' })
  }
  const leave = () => gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1, 0.4)' })

  return (
    <article
      ref={ref}
      className={`dcard dcard-${d.id}`}
      style={{ '--c': d.color } as React.CSSProperties}
      onPointerMove={move}
      onPointerLeave={leave}
      data-cursor={d.title}
    >
      <div className="dcard-glow" />
      <div className="dcard-art" aria-hidden>
        {d.id === 'gym' && <GymArt />}
        {d.id === 'hyrox' && <HyroxArt />}
        {d.id === 'basketball' && <BallArt />}
      </div>
      <header className="dcard-head mono">
        <span>{d.tag}</span>
        <span>0{index + 1}</span>
      </header>
      <h3 className="dcard-title">{d.title}</h3>
      <p className="dcard-line">{d.line}</p>
      <p className="dcard-body">{d.body}</p>
      <div className="dcard-stat">
        <strong data-count={d.stat.value}>0</strong>
        <span className="dcard-suffix">{d.stat.suffix}</span>
        <small className="mono">{d.stat.label}</small>
      </div>
      <ul className="dcard-perks">
        {d.perks.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </article>
  )
}

const GymArt = () => (
  <svg viewBox="0 0 200 200">
    <g className="art-lift">
      <rect x="20" y="92" width="160" height="16" rx="8" />
      <rect x="28" y="60" width="22" height="80" rx="6" />
      <rect x="150" y="60" width="22" height="80" rx="6" />
      <rect x="54" y="72" width="14" height="56" rx="5" />
      <rect x="132" y="72" width="14" height="56" rx="5" />
    </g>
  </svg>
)

const HyroxArt = () => (
  <svg viewBox="0 0 200 200">
    <path className="art-track" d="M20 150 C 60 40, 140 40, 180 150" />
    <circle className="art-runner" r="9" cx="0" cy="0" />
  </svg>
)

const BallArt = () => (
  <svg viewBox="0 0 200 200">
    <g className="art-spin">
      <circle cx="100" cy="100" r="78" />
      <path d="M22 100h156M100 22v156M45 45c30 30 30 80 0 110M155 45c-30 30-30 80 0 110" />
    </g>
  </svg>
)

export default function Disciplines() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.disc-title .char', {
        yPercent: 120,
        stagger: 0.03,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.disc-title', start: 'top 85%' },
      })
      gsap.from('.dcard', {
        y: 160,
        rotateX: -30,
        opacity: 0,
        stagger: 0.15,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.disc-grid', start: 'top 80%' },
      })
      document.querySelectorAll<HTMLElement>('.dcard-stat strong').forEach((el) => {
        const end = Number(el.dataset.count)
        const o = { v: 0 }
        gsap.to(o, {
          v: end,
          duration: 1.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: () => (el.textContent = String(Math.round(o.v))),
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section disc" id="disciplines">
      <div className="section-head">
        <span className="eyebrow mono">THE TRIATHLON OF ME</span>
        <h2 className="disc-title big">
          {'THREE GAMES.'.split('').map((c, i) => (
            <span key={i} className="char-mask">
              <span className="char">{c === ' ' ? ' ' : c}</span>
            </span>
          ))}
          <br />
          <span className="outline">
            {'ONE MINDSET.'.split('').map((c, i) => (
              <span key={i} className="char-mask">
                <span className="char">{c === ' ' ? ' ' : c}</span>
              </span>
            ))}
          </span>
        </h2>
      </div>
      <div className="disc-grid">
        {disciplines.map((d, i) => (
          <TiltCard key={d.id} d={d} index={i} />
        ))}
      </div>
    </section>
  )
}
