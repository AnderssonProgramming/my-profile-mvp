import { useEffect, useRef, useState } from 'react'
import type { PoseLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision'
import { gsap } from '../lib/motion'
import Magnetic from './Magnetic'

type Mode = 'squat' | 'curl' | 'press'
type Status = 'idle' | 'loading' | 'live' | 'error'

const MODES: Record<Mode, { label: string; joints: [number, number, number][]; down: number; up: number; cue: string }> = {
  // [a, b, c] = angle at b. MediaPipe pose indices: 11/12 shoulders, 13/14 elbows, 15/16 wrists, 23/24 hips, 25/26 knees, 27/28 ankles
  squat: { label: 'Squats', joints: [[23, 25, 27], [24, 26, 28]], down: 100, up: 160, cue: 'Step back so hips, knees and ankles are in frame.' },
  curl: { label: 'Bicep curls', joints: [[11, 13, 15], [12, 14, 16]], down: 150, up: 55, cue: 'Face the camera, elbows tucked, full range.' },
  press: { label: 'Wall-ball press', joints: [[13, 11, 23], [14, 12, 24]], down: 60, up: 150, cue: 'Hands up overhead — like a HYROX wall ball.' },
}

const BONES: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28], [27, 31], [28, 32], [15, 19], [16, 20],
]

function angle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) {
  const ab = Math.atan2(a.y - b.y, a.x - b.x)
  const cb = Math.atan2(c.y - b.y, c.x - b.x)
  let deg = Math.abs(((ab - cb) * 180) / Math.PI)
  if (deg > 180) deg = 360 - deg
  return deg
}

const ROBOFLOW_KEY = import.meta.env.VITE_ROBOFLOW_KEY as string | undefined
const ROBOFLOW_MODEL = import.meta.env.VITE_ROBOFLOW_MODEL as string | undefined

type Box = { class?: string; confidence?: number; bbox?: { x: number; y: number; width: number; height: number } }

export default function VisionLab() {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const landmarker = useRef<PoseLandmarker | null>(null)
  const raf = useRef(0)
  const stream = useRef<MediaStream | null>(null)
  const phase = useRef<'up' | 'down'>('up')
  const modeRef = useRef<Mode>('squat')
  const boxes = useRef<Box[]>([])
  const rf = useRef<{ engine: import('inferencejs').InferenceEngine; id: string } | null>(null)

  const [mode, setMode] = useState<Mode>('squat')
  const [status, setStatus] = useState<Status>('idle')
  const [reps, setReps] = useState(0)
  const [jointAngle, setJointAngle] = useState(0)
  const [error, setError] = useState('')
  const [rfOn, setRfOn] = useState(false)

  useEffect(() => {
    modeRef.current = mode
    phase.current = 'up'
    setReps(0)
  }, [mode])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lab-frame', {
        clipPath: 'inset(20% 20% 20% 20% round 40px)',
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.lab-frame', start: 'top 80%' },
      })
    }, root)
    return () => {
      ctx.revert()
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stop = () => {
    cancelAnimationFrame(raf.current)
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    landmarker.current?.close()
    landmarker.current = null
    if (rf.current) void rf.current.engine.stopWorker(rf.current.id)
    rf.current = null
    setRfOn(false)
    setStatus('idle')
  }

  const start = async () => {
    try {
      setStatus('loading')
      setError('')
      const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision')
      const files = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm')
      landmarker.current = await PoseLandmarker.createFromOptions(files, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      })
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } })
      const v = video.current!
      v.srcObject = stream.current
      await v.play()
      setStatus('live')
      void startRoboflow()
      loop()
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Could not start the camera')
      setStatus('error')
    }
  }

  // Optional Roboflow detector (e.g. a basketball model) running in a web worker
  const startRoboflow = async () => {
    if (!ROBOFLOW_KEY || !ROBOFLOW_MODEL) return
    try {
      const { InferenceEngine, CVImage } = await import('inferencejs')
      const engine = new InferenceEngine()
      const id = await engine.startWorkerByModelId(ROBOFLOW_MODEL, ROBOFLOW_KEY)
      rf.current = { engine, id }
      setRfOn(true)
      const tick = async () => {
        if (!rf.current || !video.current || video.current.readyState < 2) return
        const bmp = await createImageBitmap(video.current)
        const preds = (await rf.current.engine.infer(rf.current.id, new CVImage(bmp))) as unknown as Box[]
        boxes.current = preds
        setTimeout(tick, 120)
      }
      void tick()
    } catch (e) {
      console.warn('Roboflow unavailable', e)
    }
  }

  const loop = () => {
    const v = video.current
    const c = canvas.current
    const lm = landmarker.current
    if (!v || !c || !lm) return
    if (c.width !== v.videoWidth) {
      c.width = v.videoWidth
      c.height = v.videoHeight
    }
    const g = c.getContext('2d')!
    g.clearRect(0, 0, c.width, c.height)
    const res = lm.detectForVideo(v, performance.now())
    const pose = res.landmarks[0]
    if (pose) {
      const W = c.width
      const H = c.height
      const cfg = MODES[modeRef.current]
      // pick the side the camera sees best
      const side = cfg.joints
        .map((j) => ({ j, vis: j.reduce((s, i) => s + (pose[i].visibility ?? 0), 0) }))
        .sort((a, b) => b.vis - a.vis)[0].j
      const deg = angle(pose[side[0]], pose[side[1]], pose[side[2]])
      setJointAngle(Math.round(deg))
      const goingDown = cfg.down < cfg.up ? deg < cfg.down : deg > cfg.down
      const goingUp = cfg.down < cfg.up ? deg > cfg.up : deg < cfg.up
      if (phase.current === 'up' && goingDown) phase.current = 'down'
      else if (phase.current === 'down' && goingUp) {
        phase.current = 'up'
        setReps((r) => r + 1)
        gsap.fromTo('.lab-reps strong', { scale: 1.6, color: '#ffd400' }, { scale: 1, color: '#fff', duration: 0.6, ease: 'back.out(3)' })
      }
      // skeleton
      g.lineCap = 'round'
      g.shadowColor = '#ff5a1f'
      g.shadowBlur = 18
      for (const [a, b] of BONES) {
        const pa = pose[a]
        const pb = pose[b]
        if ((pa.visibility ?? 1) < 0.4 || (pb.visibility ?? 1) < 0.4) continue
        const hot = side.includes(a) && side.includes(b)
        g.strokeStyle = hot ? '#ffd400' : 'rgba(255,90,31,0.9)'
        g.lineWidth = hot ? 10 : 6
        g.beginPath()
        g.moveTo(pa.x * W, pa.y * H)
        g.lineTo(pb.x * W, pb.y * H)
        g.stroke()
      }
      g.shadowBlur = 0
      for (let i = 11; i < 33; i++) {
        const p = pose[i]
        if ((p.visibility ?? 1) < 0.4) continue
        g.fillStyle = '#fff'
        g.beginPath()
        g.arc(p.x * W, p.y * H, 6, 0, Math.PI * 2)
        g.fill()
      }
      // angle arc at the tracked joint
      const j = pose[side[1]]
      g.strokeStyle = '#ffd400'
      g.lineWidth = 4
      g.beginPath()
      g.arc(j.x * W, j.y * H, 42, 0, (deg / 180) * Math.PI)
      g.stroke()
    }
    // Roboflow detections
    for (const b of boxes.current) {
      if (!b.bbox) continue
      const { x, y, width, height } = b.bbox
      g.strokeStyle = '#3d7bff'
      g.lineWidth = 4
      g.strokeRect(x - width / 2, y - height / 2, width, height)
      g.fillStyle = '#3d7bff'
      g.font = '600 22px "JetBrains Mono", monospace'
      g.fillText(`${b.class ?? 'object'} ${Math.round((b.confidence ?? 0) * 100)}%`, x - width / 2 + 6, y - height / 2 - 8)
    }
    raf.current = requestAnimationFrame(loop)
  }

  const cfg = MODES[mode]

  return (
    <section ref={root} className="section lab" id="lab">
      <div className="section-head">
        <span className="eyebrow mono">COMPUTER VISION · RUNS 100% IN YOUR BROWSER</span>
        <h2 className="big">
          AI <span className="accent">COACH</span>
        </h2>
        <p className="section-lead">
          Turn on your camera and do a few reps. A pose-estimation model tracks 33 body landmarks in real time, measures your
          joint angles and counts every clean rep. Nothing leaves your device.
        </p>
      </div>

      <div className="lab-grid">
        <div className="lab-frame" data-cursor={status === 'live' ? '' : 'START'}>
          <video ref={video} playsInline muted className="lab-video" />
          <canvas ref={canvas} className="lab-canvas" />
          {status !== 'live' && (
            <div className="lab-overlay">
              <div className="lab-scan" />
              {status === 'loading' ? (
                <p className="mono">Loading pose model…</p>
              ) : (
                <>
                  <p className="mono">{status === 'error' ? `⚠ ${error}` : 'CAMERA OFF'}</p>
                  <Magnetic>
                    <button className="btn btn-primary" onClick={start}>
                      <span>Start the camera</span>
                    </button>
                  </Magnetic>
                </>
              )}
            </div>
          )}
          <div className="lab-corners" aria-hidden>
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <aside className="lab-panel">
          <div className="lab-modes" role="tablist">
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'is-active' : ''} onClick={() => setMode(m)}>
                {MODES[m].label}
              </button>
            ))}
          </div>
          <div className="lab-reps">
            <small className="mono">REPS</small>
            <strong>{reps}</strong>
          </div>
          <div className="lab-gauge">
            <div className="lab-gauge-head mono">
              <span>JOINT ANGLE</span>
              <span>{jointAngle}°</span>
            </div>
            <div className="lab-gauge-bar">
              <div style={{ transform: `scaleX(${jointAngle / 180})` }} />
            </div>
          </div>
          <p className="lab-cue">{cfg.cue}</p>
          <ul className="lab-tech mono">
            <li>
              <b>MediaPipe</b> Pose Landmarker · WASM + GPU
            </li>
            <li>
              <b>Roboflow</b> inference.js ·{' '}
              {rfOn ? <span className="accent">detecting objects</span> : ROBOFLOW_KEY ? 'starts with the camera' : 'add a key in .env to enable'}
            </li>
          </ul>
          {status === 'live' && (
            <button className="btn btn-ghost btn-small" onClick={stop}>
              <span>Stop camera</span>
            </button>
          )}
        </aside>
      </div>
    </section>
  )
}
