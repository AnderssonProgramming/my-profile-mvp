import { useRef, type PointerEvent } from 'react'
import { gsap, isTouch } from '../lib/motion'
import { profile } from '../data'
import photo from '../assets/profile.jpg'

/** Trading-card portrait with a holographic sheen that follows the pointer. */
export default function PlayerCard() {
  const ref = useRef<HTMLDivElement>(null)

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || isTouch()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    gsap.to(el, { rotateY: (x - 0.5) * 26, rotateX: (0.5 - y) * 22, duration: 0.5, ease: 'power3.out' })
  }
  const leave = () => gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)' })

  return (
    <div className="pcard-wrap">
      <div ref={ref} className="pcard" onPointerMove={move} onPointerLeave={leave} data-cursor="HELLO">
        <img src={photo} alt={profile.fullName} className="pcard-photo" width={720} height={960} />
        <div className="pcard-holo" aria-hidden />
        <div className="pcard-top mono">
          <span className="pcard-num">#01</span>
          <span>2026 · ROOKIE</span>
        </div>
        <div className="pcard-band">
          <strong>
            ANDERSSON <span className="accent">S.</span>
          </strong>
          <span className="mono">SWE · HYBRID ATHLETE</span>
        </div>
        <dl className="pcard-stats mono">
          <div>
            <dt>NASA</dt>
            <dd>TOP 45</dd>
          </div>
          <div>
            <dt>RACE</dt>
            <dd>HYROX</dd>
          </div>
          <div>
            <dt>HOME</dt>
            <dd>BOG</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
