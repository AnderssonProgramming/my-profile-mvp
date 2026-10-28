import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { motion, startSmoothScroll, lockScroll, ScrollTrigger } from './lib/motion'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ShotSequence from './components/ShotSequence'
import Disciplines from './components/Disciplines'
import Hyrox from './components/Hyrox'
import Stats from './components/Stats'
import VisionLab from './components/VisionLab'
import CourtVision from './components/CourtVision'
import { Timeline, Projects } from './components/Career'
import CourtSection from './components/CourtSection'
import Contact from './components/Contact'

const Stage = lazy(() => import('./three/Stage'))

export default function App() {
  const [ready, setReady] = useState(false)
  const [stageActive, setStageActive] = useState(true)

  useEffect(() => {
    startSmoothScroll()
    lockScroll(true)
    history.scrollRestoration = 'manual'
    scrollTo(0, 0)
    const onMove = (e: PointerEvent) => {
      motion.mouseX = (e.clientX / innerWidth) * 2 - 1
      motion.mouseY = (e.clientY / innerHeight) * 2 - 1
    }
    addEventListener('pointermove', onMove)
    return () => removeEventListener('pointermove', onMove)
  }, [])

  const onLoaded = useCallback(() => {
    setReady(true)
    lockScroll(false)
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [])

  // pause the fixed 3D stage once the jump-shot sequence is over
  const onShot = useCallback((p: number) => setStageActive(p < 0.999), [])

  return (
    <>
      <Loader onDone={onLoaded} />
      <Cursor />
      <div className="grain" aria-hidden />
      <div className={`stage-wrap ${stageActive ? '' : 'is-off'}`}>
        <Suspense fallback={null}>
          <Stage active={stageActive} />
        </Suspense>
      </div>
      <Nav />
      <main>
        <Hero ready={ready} />
        <ShotSequence ready={ready} onProgress={onShot} />
        <div className="solid">
          <Disciplines />
          <Hyrox />
          <Stats />
          <VisionLab />
          <CourtVision />
          <Timeline />
          <Projects />
          <CourtSection />
          <Contact />
        </div>
      </main>
    </>
  )
}
