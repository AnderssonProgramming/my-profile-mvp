import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { CourtStats } from '../three/Court'
import Magnetic from './Magnetic'

const Court = lazy(() => import('../three/Court'))

export default function CourtSection() {
  const [on, setOn] = useState(false)
  const [moving, setMoving] = useState(false)
  const [stats, setStats] = useState<CourtStats>({ makes: 0, shots: 0, streak: 0, best: 0, last: null })
  const [xr, setXr] = useState({ vr: false, ar: false })
  const [pop, setPop] = useState(0)
  const makes = useRef(0)

  useEffect(() => {
    const x = navigator.xr
    if (!x) return
    Promise.all([x.isSessionSupported('immersive-vr'), x.isSessionSupported('immersive-ar')])
      .then(([vr, ar]) => setXr({ vr, ar }))
      .catch(() => {})
  }, [])

  const onStats = useCallback((s: CourtStats) => {
    if (s.makes > makes.current) setPop((p) => p + 1)
    makes.current = s.makes
    setStats(s)
  }, [])

  const enter = async (mode: 'vr' | 'ar') => {
    setOn(true)
    const { xrStore } = await import('../three/Court')
    if (mode === 'vr') await xrStore.enterVR()
    else await xrStore.enterAR()
  }

  const pct = stats.shots ? Math.round((stats.makes / stats.shots) * 100) : 0

  return (
    <section className="section court" id="court">
      <div className="section-head">
        <span className="eyebrow mono">WEBXR · THREE.JS · REAL PHYSICS</span>
        <h2 className="big">
          THE <span className="accent">COURT</span>
        </h2>
        <p className="section-lead">
          A full-size hoop at regulation 3.05 m. Click or tap to shoot on desktop and mobile — or put on a headset and shoot
          with your controllers in VR, or drop the hoop into your living room with AR.
        </p>
      </div>

      <div className={`court-frame ${on ? 'is-on' : ''}`}>
        {on ? (
          <Suspense fallback={<div className="court-loading mono">Building the arena…</div>}>
            <Court onStats={onStats} moving={moving} />
          </Suspense>
        ) : (
          <div className="court-poster">
            <div className="court-poster-hoop" aria-hidden>
              <div className="board" />
              <div className="rim" />
              <div className="net" />
            </div>
            <Magnetic strength={0.5}>
              <button className="btn btn-primary btn-xl" onClick={() => setOn(true)} data-cursor="BALL">
                <span>Tip-off 🏀</span>
              </button>
            </Magnetic>
          </div>
        )}

        {on && (
          <>
            <div className="court-hud mono">
              <div>
                <small>MAKES</small>
                <strong key={pop} className="pop">
                  {stats.makes}
                </strong>
              </div>
              <div>
                <small>FG%</small>
                <strong>{pct}</strong>
              </div>
              <div>
                <small>STREAK</small>
                <strong className={stats.streak >= 3 ? 'fire' : ''}>
                  {stats.streak}
                  {stats.streak >= 3 ? ' 🔥' : ''}
                </strong>
              </div>
              <div>
                <small>BEST</small>
                <strong>{stats.best}</strong>
              </div>
            </div>
            {stats.last === 'make' && (
              <div key={`m${pop}`} className="court-callout">
                {stats.streak >= 3 ? 'ON FIRE!' : 'BUCKET!'}
              </div>
            )}
            <div className="court-controls">
              <button className={`chip ${moving ? 'is-active' : ''}`} onClick={() => setMoving((m) => !m)}>
                {moving ? '● Moving hoop' : '○ Moving hoop'}
              </button>
              <button className="chip" onClick={() => enter('vr')} disabled={!xr.vr} title={xr.vr ? '' : 'Open on a WebXR headset (Quest, Vision Pro…)'}>
                🥽 Enter VR
              </button>
              <button className="chip" onClick={() => enter('ar')} disabled={!xr.ar} title={xr.ar ? '' : 'Needs an AR-capable device'}>
                📱 AR mode
              </button>
            </div>
            <p className="court-tip mono">Aim at the rim · click / tap / trigger to shoot</p>
          </>
        )}
      </div>
    </section>
  )
}
