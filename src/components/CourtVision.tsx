import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import photo from '../assets/court-shot.jpg'
import result from '../court-detections.json'

type Detection = (typeof result.detections)[number]

const COLORS: Record<string, string> = {
  basketball: '#ff5a1f',
  'basketball hoop': '#ffd400',
  person: '#3d7bff',
}
const colorOf = (d: Detection) => COLORS[d.class] ?? '#ffffff'

/** Fun captions for the detections worth calling out. */
function caption(d: Detection, i: number) {
  if (d.class === 'person' && d.width > 150) return "That's me."
  if (d.class === 'basketball' && d.width > 60) return 'Game ball, in hand.'
  if (d.class === 'basketball') return 'Even the ball on my jersey logo.'
  if (d.class === 'basketball hoop') return 'The target. Always.'
  const n = result.detections.slice(0, i + 1).filter((o) => o.class === 'person' && o.width <= 150).length
  return `Spectator #${n} in the background`
}

/** Unpacks a bit-packed mask into a tinted offscreen canvas. */
function maskCanvas(d: Detection) {
  const m = d.mask
  if (!m) return null
  const c = document.createElement('canvas')
  c.width = m.w
  c.height = m.h
  const g = c.getContext('2d')!
  const img = g.createImageData(m.w, m.h)
  const bits = Uint8Array.from(atob(m.bits), (ch) => ch.charCodeAt(0))
  const hex = colorOf(d)
  const [r, gr, b] = [1, 3, 5].map((o) => parseInt(hex.slice(o, o + 2), 16))
  for (let i = 0; i < m.w * m.h; i++) {
    if (bits[i >> 3] & (1 << (i & 7))) {
      img.data[i * 4] = r
      img.data[i * 4 + 1] = gr
      img.data[i * 4 + 2] = b
      img.data[i * 4 + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
  return c
}

export default function CourtVision() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const scanLine = useRef<HTMLDivElement>(null)
  const state = useRef({ scan: 0 })
  const [active, setActive] = useState<number | null>(null)
  const activeRef = useRef<number | null>(null)
  const [revealed, setRevealed] = useState(0)

  const { width: W, height: H } = result.image
  const detections = result.detections
  const masks = useMemo(() => detections.map(maskCanvas), [detections])
  // reveal order: top to bottom, following the scan line
  const order = useMemo(() => detections.map((d, i) => ({ i, top: d.y - d.height / 2 })).sort((a, b) => a.top - b.top), [detections])

  const render = () => {
    const c = canvas.current
    if (!c) return
    const g = c.getContext('2d')!
    g.clearRect(0, 0, W, H)
    const scanY = state.current.scan * (H + 200) - 100
    const act = activeRef.current
    detections.forEach((d, i) => {
      const top = d.y - d.height / 2
      const t = Math.min(1, Math.max(0, (scanY - top) / 140))
      if (t <= 0) return
      const dim = act !== null && act !== i ? 0.25 : 1
      const color = colorOf(d)
      const x0 = d.x - d.width / 2
      const y0 = top
      // segmentation mask
      const mc = masks[i]
      if (mc && d.mask) {
        g.save()
        g.globalAlpha = t * dim * (act === i ? 0.6 : 0.38)
        g.shadowColor = color
        g.shadowBlur = 24
        g.imageSmoothingEnabled = true
        g.drawImage(mc, d.mask.x, d.mask.y, d.mask.w * d.mask.scale, d.mask.h * d.mask.scale)
        g.restore()
      }
      // corner brackets
      g.save()
      g.globalAlpha = dim
      g.strokeStyle = color
      g.lineWidth = act === i ? 5 : 3
      const L = Math.min(d.width, d.height) * 0.28 * t + 4
      g.beginPath()
      for (const [cx, cy, sx, sy] of [
        [x0, y0, 1, 1],
        [x0 + d.width, y0, -1, 1],
        [x0, y0 + d.height, 1, -1],
        [x0 + d.width, y0 + d.height, -1, -1],
      ]) {
        g.moveTo(cx + sx * L, cy)
        g.lineTo(cx, cy)
        g.lineTo(cx, cy + sy * L)
      }
      g.stroke()
      // label for the big ones (or whichever is hovered)
      if ((d.width > 60 || act === i) && t > 0.5) {
        const label = `${d.class.toUpperCase()} ${Math.round(d.confidence * 100 * Math.min(1, (t - 0.5) * 2))}%`
        g.font = '600 20px "JetBrains Mono", monospace'
        const tw = g.measureText(label).width + 20
        const ly = Math.max(0, y0 - 34)
        g.fillStyle = color
        g.fillRect(x0, ly, tw, 30)
        g.fillStyle = '#07070a'
        g.fillText(label, x0 + 10, ly + 21)
      }
      g.restore()
    })
  }

  useEffect(() => {
    activeRef.current = active
    render()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: '.cv-frame', start: 'top 70%' } })
        .from('.cv-frame', { clipPath: 'inset(10% 10% 10% 10% round 40px)', duration: 1.2, ease: 'expo.out' })
        .to(
          state.current,
          {
            scan: 1,
            duration: 3.2,
            ease: 'power1.inOut',
            onUpdate: () => {
              const s = state.current.scan
              if (scanLine.current) scanLine.current.style.top = `${s * 100}%`
              const scanY = s * (H + 200) - 100
              setRevealed(order.filter((o) => o.top < scanY).length)
              render()
            },
          },
          0.3,
        )
        .to(scanLine.current, { opacity: 0, duration: 0.4 })
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const best = Math.max(...detections.map((d) => d.confidence))
  const classes = new Set(detections.map((d) => d.class)).size
  const shown = new Set(order.slice(0, revealed).map((o) => o.i))

  return (
    <section ref={root} className="section cv" id="court-vision">
      <div className="section-head">
        <span className="eyebrow mono">ROBOFLOW · INSTANCE SEGMENTATION ON MY OWN COURT</span>
        <h2 className="big">
          SHOT, <span className="accent">DETECTED.</span>
        </h2>
        <p className="section-lead">
          A photo of me on the court, run through my Roboflow segmentation workflow. Every outline below is the model&apos;s real
          pixel mask — hover the list to isolate a detection.
        </p>
      </div>

      <div className="cv-grid">
        <div className="cv-frame" data-cursor="CV">
          <img src={photo} alt="Andersson holding a basketball under the hoop on an outdoor court" width={W} height={H} />
          <canvas ref={canvas} width={W} height={H} />
          <div ref={scanLine} className="cv-scan" aria-hidden />
          <span className="cv-tag mono">
            {W}×{H} · {result.workflow}
          </span>
        </div>

        <aside className="cv-panel">
          <div className="cv-summary mono">
            <div>
              <small>OBJECTS</small>
              <strong>{revealed}</strong>
            </div>
            <div>
              <small>CLASSES</small>
              <strong>{classes}</strong>
            </div>
            <div>
              <small>TOP CONF.</small>
              <strong>{Math.round(best * 100)}%</strong>
            </div>
          </div>
          <ul className="cv-list" onPointerLeave={() => setActive(null)}>
            {detections.map((d, i) => (
              <li
                key={i}
                className={`${shown.has(i) ? 'is-in' : ''} ${active === i ? 'is-active' : ''}`}
                style={{ '--c': colorOf(d) } as React.CSSProperties}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={0}
              >
                <i />
                <div className="cv-item-text">
                  <span className="cv-class mono">{d.class}</span>
                  <span className="cv-caption">{caption(d, i)}</span>
                </div>
                <span className="cv-conf mono">{Math.round(d.confidence * 100)}%</span>
                <div className="cv-bar">
                  <div style={{ transform: `scaleX(${shown.has(i) ? d.confidence : 0})` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="cv-note mono">
            Analysed at build time by <code>scripts/analyze-court.mjs</code> — the API key never ships to the browser.
          </p>
        </aside>
      </div>
    </section>
  )
}
