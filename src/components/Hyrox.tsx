import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'
import { hyroxStations } from '../data'

/** Pinned horizontal "race": 8 × 1 km runs, each followed by a station. */
export default function Hyrox() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const km = useRef<HTMLSpanElement>(null)
  const time = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = track.current!
      const distance = () => el.scrollWidth - innerWidth
      gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress
            gsap.set('.hyrox-progress-fill', { scaleX: p })
            gsap.set('.hyrox-runner', { left: `${p * 100}%` })
            if (km.current) km.current.textContent = (p * 8).toFixed(2)
            // a fun race clock: ~1:15:00 finish across the full scroll
            const secs = Math.round(p * 4500)
            const h = Math.floor(secs / 3600)
            const m = Math.floor((secs % 3600) / 60)
            const s = secs % 60
            if (time.current)
              time.current.textContent = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            document.querySelectorAll<HTMLElement>('.station').forEach((st, i) => {
              st.classList.toggle('is-done', p * 8 >= i + 0.6)
            })
          },
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="hyrox" id="hyrox">
      <div className="hyrox-hud mono">
        <div>
          <small>DISTANCE</small>
          <span ref={km}>0.00</span>
          <em>/ 8 KM</em>
        </div>
        <div>
          <small>RACE TIME</small>
          <span ref={time}>0:00:00</span>
        </div>
        <div className="hyrox-progress">
          <div className="hyrox-progress-fill" />
          <div className="hyrox-runner" />
          {hyroxStations.map((s, i) => (
            <i key={s.n} style={{ left: `${((i + 0.6) / 8) * 100}%` }} />
          ))}
        </div>
      </div>
      <div ref={track} className="hyrox-track">
        <div className="hyrox-intro">
          <span className="eyebrow mono">FITNESS RACING · THE FORMAT</span>
          <h2 className="big">
            HY<span className="yellow">ROX</span>
          </h2>
          <p>
            8 × 1 km runs. 8 functional stations. One clock that never stops. It&apos;s the most honest test I know — and the
            best metaphor for shipping software.
          </p>
          <span className="mono hyrox-swipe">KEEP SCROLLING TO RACE →</span>
        </div>
        {hyroxStations.map((s) => (
          <div key={s.n} className="hyrox-leg">
            <div className="run-segment mono" aria-hidden>
              <span>RUN 1 KM</span>
              <div className="run-dashes" />
            </div>
            <article className="station" data-cursor={s.name.toUpperCase()}>
              <span className="station-n">{s.n}</span>
              <div className="station-body">
                <span className="mono station-dist">{s.dist}</span>
                <h3>{s.name}</h3>
                <p>{s.dev}</p>
              </div>
              <div className="station-check mono">✓ DONE</div>
            </article>
          </div>
        ))}
        <div className="hyrox-finish">
          <span className="eyebrow mono">FINISH LINE</span>
          <h2 className="big">ROXZONE</h2>
          <p>Race done. Recover. Then push the next PR — in the gym and on GitHub.</p>
        </div>
      </div>
    </section>
  )
}
