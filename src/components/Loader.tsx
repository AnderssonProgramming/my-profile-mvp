import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'

/** Shot-clock style preloader that counts to 100 and splits open like a curtain. */
export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    const counter = { v: 0 }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.to(counter, {
        v: 100,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => setN(Math.round(counter.v)),
      })
        .to('.loader-ball', { y: -60, duration: 0.25, ease: 'power2.out', repeat: 7, yoyo: true }, 0)
        .to('.loader-word', { yPercent: -100, stagger: 0.05, duration: 0.5, ease: 'power3.in' }, '-=0.2')
        .to('.loader-half', { yPercent: (i) => (i === 0 ? -100 : 100), duration: 0.9, ease: 'expo.inOut' }, '-=0.1')
        .add(onDone, '-=0.55')
        .set(root.current, { display: 'none' })
    }, root)
    return () => ctx.revert()
  }, [onDone])

  return (
    <div ref={root} className="loader" aria-hidden>
      <div className="loader-half loader-top" />
      <div className="loader-half loader-bottom" />
      <div className="loader-content">
        <div className="loader-ball" />
        <div className="loader-words">
          {['WARMING', 'UP'].map((w) => (
            <span key={w} className="loader-mask">
              <span className="loader-word">{w}</span>
            </span>
          ))}
        </div>
        <div className="loader-count">
          <span className="loader-mask">
            <span className="loader-word">{String(n).padStart(3, '0')}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
