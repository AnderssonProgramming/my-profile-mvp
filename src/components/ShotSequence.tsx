import { useEffect, useRef } from 'react'
import { gsap, motion } from '../lib/motion'
import { profile } from '../data'

/**
 * Apple-style pinned sequence: 400vh of scroll drives the 3D ball through a full jump shot
 * while the copy and a 2K-style shot meter react to the same progress.
 */
export default function ShotSequence({ ready, onProgress }: { ready: boolean; onProgress: (p: number) => void }) {
  const root = useRef<HTMLElement>(null)
  const arc = useRef<HTMLElement>(null)
  const release = useRef<HTMLElement>(null)
  const prob = useRef<HTMLElement>(null)
  const meter = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress
            motion.shot = p
            onProgress(p)
            const f = Math.min(1, Math.max(0, (p - 0.15) / 0.55))
            if (arc.current) arc.current.textContent = `${Math.round(f * 47)}°`
            if (release.current) release.current.textContent = `${(f * 0.42).toFixed(2)}s`
            if (prob.current) prob.current.textContent = `${Math.min(100, p * 128).toFixed(1)}%`
            if (meter.current) meter.current.style.transform = `scaleY(${Math.min(1, p * 1.25)})`
          },
        },
      })
      tl.fromTo('.shot-line-0', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.05 }, 0.01).to(
        '.shot-line-0',
        { opacity: 0, y: -60, duration: 0.05 },
        0.13,
      )
      profile.values.forEach((_, i) => {
        const at = 0.18 + i * 0.17
        tl.fromTo(
          `.shot-word-${i}`,
          { opacity: 0, scale: 0.6, filter: 'blur(20px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.05 },
          at,
        ).to(`.shot-word-${i}`, { opacity: 0, scale: 1.4, filter: 'blur(14px)', duration: 0.05 }, at + 0.11)
      })
      tl.fromTo('.shot-flash', { opacity: 0 }, { opacity: 0.85, duration: 0.02 }, 0.74)
        .to('.shot-flash', { opacity: 0, duration: 0.08 }, 0.76)
        .fromTo('.shot-swish', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.05, ease: 'back.out(3)' }, 0.73)
        .to('.shot-swish', { opacity: 0, y: -80, duration: 0.05 }, 0.85)
        .fromTo('.shot-outro', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.05 }, 0.88)
        .to({}, { duration: 0.07 }, 0.93)
    }, root)
    return () => ctx.revert()
  }, [ready, onProgress])

  return (
    <section ref={root} className="shot" id="shot">
      <div className="shot-sticky">
        <div className="shot-flash" />
        <p className="shot-line shot-line-0 mono">
          <span className="accent">●</span> Every rep. Every commit. Every shot.
        </p>
        {profile.values.map((v, i) => (
          <h2 key={v} className={`shot-word shot-word-${i}`}>
            {v}
          </h2>
        ))}
        <h2 className="shot-swish">
          SWISH<span className="accent">.</span>
        </h2>
        <div className="shot-outro">
          <h3>Nothing but net.</h3>
          <p>Same routine on the court, in the gym and in the codebase: prepare, repeat, release with confidence.</p>
        </div>

        <aside className="shot-meter mono" aria-hidden>
          <div className="shot-meter-bar">
            <div ref={meter} className="shot-meter-fill" />
            <div className="shot-meter-green" />
          </div>
          <dl>
            <div>
              <dt>ARC</dt>
              <dd ref={arc}>0°</dd>
            </div>
            <div>
              <dt>RELEASE</dt>
              <dd ref={release}>0.00s</dd>
            </div>
            <div>
              <dt>MAKE %</dt>
              <dd ref={prob}>0.0%</dd>
            </div>
          </dl>
        </aside>
        <div className="shot-hint mono">SCROLL TO SHOOT ↓</div>
      </div>
    </section>
  )
}
