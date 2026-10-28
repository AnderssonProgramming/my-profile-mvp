import { useEffect, useRef, type PointerEvent } from 'react'
import { gsap } from '../lib/motion'
import { experience, projects } from '../data'

export function Timeline() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.tl-line-fill',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.tl', start: 'top 60%', end: 'bottom 60%', scrub: true } },
      )
      gsap.utils.toArray<HTMLElement>('.tl-item').forEach((el) => {
        gsap.from(el, {
          x: el.classList.contains('right') ? 120 : -120,
          opacity: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 80%', toggleClass: { targets: el, className: 'is-in' } },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section career" id="career">
      <div className="section-head">
        <span className="eyebrow mono">TRAINING LOG</span>
        <h2 className="big">
          THE <span className="outline">SEASON</span>
        </h2>
      </div>
      <div className="tl">
        <div className="tl-line">
          <div className="tl-line-fill" />
        </div>
        {experience.map((e, i) => (
          <article key={e.title} className={`tl-item ${i % 2 ? 'right' : 'left'}`}>
            <div className="tl-dot" />
            <div className="tl-card">
              <div className="tl-meta mono">
                <span>{e.when}</span>
                <span className={`tl-badge ${e.badge === 'MILESTONE' ? 'gold' : ''}`}>{e.badge}</span>
              </div>
              <h3>{e.title}</h3>
              <p className="tl-org">{e.org}</p>
              <p>{e.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function PlayCard({ p, i }: { p: (typeof projects)[number]; i: number }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const move = (e: PointerEvent<HTMLAnchorElement>) => {
    const r = ref.current!.getBoundingClientRect()
    ref.current!.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current!.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <a ref={ref} className="play" href={p.url} target="_blank" rel="noreferrer" onPointerMove={move} data-cursor="VIEW">
      <div className="play-spot" />
      <svg className="play-diagram" viewBox="0 0 120 80" aria-hidden>
        <circle cx={20 + (i % 3) * 10} cy="60" r="4" />
        <circle cx="60" cy={20 + (i % 2) * 10} r="4" />
        <circle cx="100" cy="55" r="4" />
        <path d={`M${20 + (i % 3) * 10} 60 Q 40 ${10 + i * 5} 60 ${20 + (i % 2) * 10} T 100 55`} />
        <path className="x" d="M85 20l8 8m0-8l-8 8" />
      </svg>
      <span className="play-name mono">PLAY {String(i + 1).padStart(2, '0')} · {p.play}</span>
      <h3>{p.title}</h3>
      <span className="play-kicker">{p.kicker}</span>
      <p>{p.body}</p>
      <ul>
        {p.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <span className="play-arrow">↗</span>
    </a>
  )
}

export function Projects() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.play', {
        y: 120,
        opacity: 0,
        rotate: (i) => (i % 2 ? 4 : -4),
        stagger: 0.1,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.plays', start: 'top 80%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="section projects" id="projects">
      <div className="section-head">
        <span className="eyebrow mono">THE PLAYBOOK</span>
        <h2 className="big">
          SELECTED <span className="accent">PLAYS</span>
        </h2>
      </div>
      <div className="plays">
        {projects.map((p, i) => (
          <PlayCard key={p.title} p={p} i={i} />
        ))}
      </div>
    </section>
  )
}
