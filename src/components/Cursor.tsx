import { useEffect, useRef } from 'react'
import { isTouch } from '../lib/motion'

/** Ring cursor that lerps behind the pointer and morphs over anything with [data-cursor]. */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isTouch()) return
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }
    const target = { ...pos }
    let raf = 0
    const move = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button')
      const text = el?.dataset.cursor ?? ''
      ring.current?.classList.toggle('is-hover', !!el)
      ring.current?.classList.toggle('has-label', !!text)
      if (label.current) label.current.textContent = text
    }
    const down = () => ring.current?.classList.add('is-down')
    const up = () => ring.current?.classList.remove('is-down')
    const tick = () => {
      pos.x += (target.x - pos.x) * 0.18
      pos.y += (target.y - pos.y) * 0.18
      if (ring.current) ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    addEventListener('pointermove', move)
    addEventListener('pointerdown', down)
    addEventListener('pointerup', up)
    document.documentElement.classList.add('has-cursor')
    tick()
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', move)
      removeEventListener('pointerdown', down)
      removeEventListener('pointerup', up)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden>
        <span ref={label} />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  )
}
