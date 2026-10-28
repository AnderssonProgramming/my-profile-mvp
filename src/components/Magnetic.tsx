import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, isTouch } from '../lib/motion'

/** Pulls its child toward the pointer, with the inner label travelling further for depth. */
export default function Magnetic({ children, strength = 0.4 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || isTouch()) return
    const inner = el.firstElementChild as HTMLElement | null
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.35)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.35)' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      xTo(dx * strength)
      yTo(dy * strength)
      if (inner) gsap.to(inner, { x: dx * strength * 0.35, y: dy * strength * 0.35, duration: 0.4 })
    }
    const leave = () => {
      xTo(0)
      yTo(0)
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)' })
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])
  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  )
}
