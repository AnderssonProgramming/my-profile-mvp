import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { XR, createXRStore, useXR } from '@react-three/xr'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createBasketballMaps, createCourtTexture } from './textures'

export const xrStore = createXRStore({ emulate: false })

const G = -9.81
const BALL_R = 0.12
const RIM_R = 0.23
const RIM_TUBE = 0.018
const RIM_Y = 3.05
const HOOP_Z = -5.2
const BOARD_Z = HOOP_Z - RIM_R - 0.16
const MAX_BALLS = 6

type BallState = {
  pos: THREE.Vector3
  vel: THREE.Vector3
  alive: boolean
  age: number
  scored: boolean
  bounced: boolean
  prevY: number
}

export type CourtStats = { makes: number; shots: number; streak: number; best: number; last: 'make' | 'miss' | null }

function Hoop({ hoopX }: { hoopX: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    if (group.current) group.current.position.x = hoopX.current
  })
  return (
    <group ref={group}>
      <mesh position={[0, RIM_Y, HOOP_Z]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RIM_R, RIM_TUBE, 16, 48]} />
        <meshStandardMaterial color="#ff4d12" emissive="#ff3300" emissiveIntensity={0.5} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, RIM_Y - 0.22, HOOP_Z]}>
        <cylinderGeometry args={[RIM_R, RIM_R * 0.62, 0.42, 14, 4, true]} />
        <meshBasicMaterial color="#fff" wireframe transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, RIM_Y + 0.45, BOARD_Z]}>
        <boxGeometry args={[1.8, 1.05, 0.04]} />
        <meshPhysicalMaterial color="#d8ecff" transparent opacity={0.25} roughness={0.05} clearcoat={1} />
      </mesh>
      <lineSegments position={[0, RIM_Y + 0.3, BOARD_Z + 0.03]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(0.59, 0.45)]} />
        <lineBasicMaterial color="#ffffff" />
      </lineSegments>
      <mesh position={[0, RIM_Y + 0.45 - 0.0, BOARD_Z - 0.6]}>
        <boxGeometry args={[0.12, 0.12, 1.1]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, (RIM_Y + 0.45) / 2, BOARD_Z - 1.15]}>
        <boxGeometry args={[0.18, RIM_Y + 0.45, 0.18]} />
        <meshStandardMaterial color="#1a1a1f" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Floor() {
  const tex = useMemo(() => createCourtTexture(), [])
  const isAR = useXR((s) => s.mode === 'immersive-ar')
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, HOOP_Z + 7.5 - 1.2]} visible={!isAR}>
      <planeGeometry args={[15, 15]} />
      <meshStandardMaterial map={tex} roughness={0.35} metalness={0.05} />
    </mesh>
  )
}

function Game({ onStats, moving }: { onStats: (s: CourtStats) => void; moving: boolean }) {
  const { map, bumpMap } = useMemo(() => createBasketballMaps(512), [])
  const meshes = useRef<(THREE.Mesh | null)[]>([])
  const balls = useMemo<BallState[]>(
    () =>
      Array.from({ length: MAX_BALLS }, () => ({
        pos: new THREE.Vector3(0, -10, 0),
        vel: new THREE.Vector3(),
        alive: false,
        age: 0,
        scored: false,
        bounced: false,
        prevY: 0,
      })),
    [],
  )
  const next = useRef(0)
  const stats = useRef<CourtStats>({ makes: 0, shots: 0, streak: 0, best: 0, last: null })
  const hoopX = useRef(0)
  const reticle = useRef<THREE.Mesh>(null)
  const { camera } = useThree()
  const inXR = useXR((s) => s.session != null)

  useEffect(() => {
    if (!inXR) {
      camera.position.set(0, 1.7, -1.2)
      camera.lookAt(0, 2.2, HOOP_Z)
    }
  }, [camera, inXR])

  const shoot = (origin: THREE.Vector3, target: THREE.Vector3) => {
    const b = balls[next.current]
    next.current = (next.current + 1) % MAX_BALLS
    const start = origin.clone().add(new THREE.Vector3(0, -0.25, -0.35))
    // light aim assist: pull the target toward the rim centre when you're close
    const rim = new THREE.Vector3(hoopX.current, RIM_Y + 0.02, HOOP_Z)
    const off = target.distanceTo(rim)
    const aimed = target.clone().lerp(rim, off < 0.55 ? 0.55 : 0.15)
    const dist = start.distanceTo(aimed)
    const t = 0.95 + dist * 0.06
    b.vel.set(
      (aimed.x - start.x) / t,
      (aimed.y - start.y - 0.5 * G * t * t) / t,
      (aimed.z - start.z) / t,
    )
    b.pos.copy(start)
    b.prevY = start.y
    b.alive = true
    b.age = 0
    b.scored = false
    b.bounced = false
    stats.current.shots++
    onStats({ ...stats.current })
  }

  const onAim = (e: ThreeEvent<PointerEvent>) => {
    reticle.current?.position.copy(e.point).setZ(HOOP_Z + 0.02)
  }
  const onShoot = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    shoot(e.ray.origin.clone(), e.point.clone())
  }

  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    hoopX.current = moving ? Math.sin(state.clock.elapsedTime * 0.9) * 1.6 : THREE.MathUtils.damp(hoopX.current, 0, 4, dt)
    const steps = 4
    const h = dt / steps
    balls.forEach((b, i) => {
      const mesh = meshes.current[i]
      if (!b.alive || !mesh) {
        if (mesh) mesh.visible = false
        return
      }
      for (let s = 0; s < steps; s++) {
        b.prevY = b.pos.y
        b.vel.y += G * h
        b.pos.addScaledVector(b.vel, h)
        // floor
        if (b.pos.y < BALL_R) {
          b.pos.y = BALL_R
          b.vel.y *= -0.62
          b.vel.x *= 0.85
          b.vel.z *= 0.85
          if (!b.bounced && !b.scored) {
            stats.current.streak = 0
            stats.current.last = 'miss'
            onStats({ ...stats.current })
          }
          b.bounced = true
        }
        // backboard
        const bx = b.pos.x - hoopX.current
        if (
          b.vel.z < 0 &&
          b.pos.z - BALL_R < BOARD_Z + 0.02 &&
          b.pos.z > BOARD_Z - 0.2 &&
          Math.abs(bx) < 0.9 &&
          b.pos.y > RIM_Y - 0.08 &&
          b.pos.y < RIM_Y + 0.98
        ) {
          b.pos.z = BOARD_Z + 0.02 + BALL_R
          b.vel.z *= -0.55
        }
        // rim (torus) collision
        tmp.set(bx, 0, b.pos.z - HOOP_Z)
        const radial = Math.hypot(tmp.x, tmp.z) || 1e-6
        const cx = (tmp.x / radial) * RIM_R + hoopX.current
        const cz = (tmp.z / radial) * RIM_R + HOOP_Z
        tmp.set(b.pos.x - cx, b.pos.y - RIM_Y, b.pos.z - cz)
        const d = tmp.length()
        if (d < BALL_R + RIM_TUBE) {
          tmp.divideScalar(d || 1)
          b.pos.addScaledVector(tmp, BALL_R + RIM_TUBE - d)
          const vn = b.vel.dot(tmp)
          if (vn < 0) b.vel.addScaledVector(tmp, -1.6 * vn)
        }
        // bucket
        if (!b.scored && b.prevY >= RIM_Y && b.pos.y < RIM_Y && b.vel.y < 0 && radial < RIM_R - BALL_R * 0.35) {
          b.scored = true
          const st = stats.current
          st.makes++
          st.streak++
          st.best = Math.max(st.best, st.streak)
          st.last = 'make'
          onStats({ ...st })
        }
      }
      b.age += dt
      if (b.age > 6) b.alive = false
      mesh.visible = true
      mesh.position.copy(b.pos)
      mesh.rotation.x -= dt * 8
    })
  })

  return (
    <>
      <Hoop hoopX={hoopX} />
      {balls.map((_, i) => (
        <mesh key={i} ref={(m) => void (meshes.current[i] = m)} visible={false} castShadow>
          <sphereGeometry args={[BALL_R, 32, 24]} />
          <meshStandardMaterial map={map} bumpMap={bumpMap} bumpScale={0.6} roughness={0.6} />
        </mesh>
      ))}
      {/* invisible aiming wall in the plane of the hoop: click / tap / trigger to shoot */}
      <mesh position={[0, 3, HOOP_Z]} onPointerMove={onAim} onClick={onShoot}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={reticle} position={[0, RIM_Y, HOOP_Z + 0.02]}>
        <ringGeometry args={[0.07, 0.09, 32]} />
        <meshBasicMaterial color="#ffd400" transparent opacity={0.9} depthTest={false} />
      </mesh>
    </>
  )
}

function Arena() {
  const isAR = useXR((s) => s.mode === 'immersive-ar')
  return (
    <>
      {!isAR && <color attach="background" args={['#07070a']} />}
      {!isAR && <fog attach="fog" args={['#07070a', 9, 22]} />}
      <ambientLight intensity={0.5} />
      <spotLight position={[0, 9, HOOP_Z + 2]} angle={0.6} penumbra={0.6} intensity={180} color="#fff3e0" castShadow />
      <spotLight position={[-6, 7, 2]} angle={0.7} penumbra={1} intensity={90} color="#ff5a1f" />
      <spotLight position={[6, 7, 2]} angle={0.7} penumbra={1} intensity={90} color="#3d7bff" />
      <Floor />
      {!isAR && <Sparkles count={120} scale={[16, 8, 14]} position={[0, 4, -2]} size={3} speed={0.3} color="#ffb070" />}
    </>
  )
}

export default function Court({ onStats, moving }: { onStats: (s: CourtStats) => void; moving: boolean }) {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ fov: 58, near: 0.05, far: 60 }} gl={{ antialias: true }}>
      <XR store={xrStore}>
        <Arena />
        <Game onStats={onStats} moving={moving} />
      </XR>
    </Canvas>
  )
}
