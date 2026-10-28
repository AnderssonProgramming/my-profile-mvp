import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, Lightformer, Sparkles } from '@react-three/drei'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createBasketballMaps } from './textures'
import { motion, lerp, range, easeInOut, easeOut } from '../lib/motion'

const HOOP = new THREE.Vector3(2.25, 1.05, 0)

/** Where the ball is for a given scroll state — a little choreography in world space. */
function ballPose(out: { p: THREE.Vector3; s: number }, hero: number, shot: number, aspect: number) {
  const narrow = aspect < 0.9
  const h = easeInOut(hero)
  // hero: big ball on the right, drifting to centre as you scroll
  out.p.set(lerp(narrow ? 0 : 2.1, 0, h), lerp(narrow ? -1.5 : -0.1, -0.3, h), 0)
  out.s = lerp(narrow ? 1.05 : 1.55, 0.75, h)
  if (shot <= 0) return out

  const hoopX = narrow ? 0.9 : HOOP.x
  const startX = narrow ? -1.1 : -3.1
  // 0.00–0.15 gather: drop to the shooting pocket
  const g = easeInOut(range(shot, 0, 0.15))
  out.p.set(lerp(out.p.x, startX, g), lerp(out.p.y, -1.6, g), 0)
  out.s = lerp(out.s, 0.32, g)
  // 0.15–0.70 flight: parabola into the rim
  const f = range(shot, 0.15, 0.7)
  if (f > 0) {
    const t = easeInOut(f)
    out.p.x = lerp(startX, hoopX, t)
    out.p.y = lerp(-1.6, HOOP.y + 0.32, t) + 3.4 * t * (1 - t)
  }
  // 0.70–0.86 swish: drop through the net
  const d = range(shot, 0.7, 0.86)
  if (d > 0) out.p.y = lerp(HOOP.y + 0.32, -3.6, d * d)
  // 0.86–1.00 bounce back up, ready for the next section
  const b = easeOut(range(shot, 0.86, 1))
  if (b > 0) {
    out.p.x = lerp(hoopX, narrow ? 0 : 3.4, b)
    out.p.y = lerp(-3.6, -1.2, b)
    out.s = lerp(0.32, 0.6, b)
  }
  return out
}

function Ball() {
  const ref = useRef<THREE.Mesh>(null)
  const group = useRef<THREE.Group>(null)
  const { map, bumpMap } = useMemo(() => createBasketballMaps(), [])
  const pose = useMemo(() => ({ p: new THREE.Vector3(), s: 1 }), [])
  const spin = useRef(0)
  const { viewport } = useThree()

  useFrame((_, dt) => {
    if (!ref.current || !group.current) return
    ballPose(pose, motion.hero, motion.shot, viewport.aspect)
    group.current.position.lerp(pose.p, 1 - Math.pow(0.0001, dt))
    const s = THREE.MathUtils.damp(group.current.scale.x, pose.s, 8, dt)
    group.current.scale.setScalar(s)
    // backspin during the flight, scroll velocity adds a kick
    const inFlight = motion.shot > 0.15 && motion.shot < 0.86
    spin.current += dt * (inFlight ? 6 : 0.45) + Math.abs(motion.velocity) * 0.004
    ref.current.rotation.x = spin.current * (inFlight ? -1 : 1) + motion.mouseY * 0.4
    ref.current.rotation.y = spin.current * 0.6 + motion.mouseX * 0.6
  })

  return (
    <group ref={group}>
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[1, 128, 64]} />
        <meshStandardMaterial map={map} bumpMap={bumpMap} bumpScale={1.6} roughness={0.62} metalness={0.02} />
      </mesh>
    </group>
  )
}

function Hoop() {
  const group = useRef<THREE.Group>(null)
  const net = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()
  useFrame((state, dt) => {
    if (!group.current || !net.current) return
    const narrow = viewport.aspect < 0.9
    const vis = range(motion.shot, 0.02, 0.14) * (1 - range(motion.shot, 0.9, 1))
    const target = new THREE.Vector3(narrow ? 0.9 : HOOP.x, HOOP.y, 0)
    group.current.position.lerp(target.setX(target.x + (1 - vis) * 4), 1 - Math.pow(0.001, dt))
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, Math.max(0.0001, vis), 10, dt))
    // the net snaps when the ball goes through
    const swish = range(motion.shot, 0.7, 0.8) * (1 - range(motion.shot, 0.8, 0.92))
    const wobble = Math.sin(state.clock.elapsedTime * 22) * 0.06 * swish
    net.current.scale.set(1 - swish * 0.18 + wobble, 1 + swish * 0.35, 1 - swish * 0.18 + wobble)
  })
  return (
    <group ref={group} scale={0.0001}>
      <group rotation={[0.32, 0, 0]}>
        {/* rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.028, 16, 64]} />
          <meshStandardMaterial color="#ff4d12" emissive="#ff3300" emissiveIntensity={0.6} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* net */}
        <mesh ref={net} position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.42, 0.26, 0.6, 16, 4, true]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.75} />
        </mesh>
        {/* backboard */}
        <mesh position={[0, 0.42, -0.5]}>
          <boxGeometry args={[1.9, 1.15, 0.04]} />
          <meshPhysicalMaterial color="#cfe3ff" transparent opacity={0.18} roughness={0.05} metalness={0} clearcoat={1} />
        </mesh>
        <lineSegments position={[0, 0.28, -0.475]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.62, 0.45)]} />
          <lineBasicMaterial color="#ffffff" />
        </lineSegments>
        <lineSegments position={[0, 0.42, -0.475]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(1.9, 1.15)]} />
          <lineBasicMaterial color="#ff5a1f" />
        </lineSegments>
      </group>
    </group>
  )
}

function Dumbbell({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 1.3, 24]} />
        <meshStandardMaterial color="#d7dae2" metalness={1} roughness={0.22} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[0, side * 0.0, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.16, 6]} />
            <meshStandardMaterial color="#141418" metalness={0.3} roughness={0.55} />
          </mesh>
          <mesh position={[0, side * 0.11, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.08, 6]} />
            <meshStandardMaterial color="#ff5a1f" metalness={0.2} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Kettlebell(props: { position: [number, number, number] }) {
  return (
    <group {...props} rotation={[0.2, 0.5, -0.2]}>
      <mesh>
        <sphereGeometry args={[0.42, 48, 32]} />
        <meshStandardMaterial color="#ffd400" metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <torusGeometry args={[0.24, 0.06, 16, 48, Math.PI * 1.25]} />
        <meshStandardMaterial color="#1a1a1f" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

function GymProps() {
  const group = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  useFrame((_, dt) => {
    if (!group.current) return
    const h = motion.hero
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, -h * 6 + motion.mouseX * 0.25, 6, dt)
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, h * 2 - motion.mouseY * 0.2, 6, dt)
    group.current.rotation.z = h * 0.6
    group.current.visible = viewport.aspect >= 0.9 && h < 0.98
  })
  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={1.2} floatIntensity={1.4}>
        <Dumbbell position={[-3.6, 1.9, -1.5]} rotation={[0.4, 0.6, 0.5]} />
      </Float>
      <Float speed={1.2} rotationIntensity={1} floatIntensity={1.8}>
        <Kettlebell position={[-4.3, -1.6, -0.5]} />
      </Float>
      <Float speed={2} rotationIntensity={1.6} floatIntensity={1}>
        <Dumbbell position={[4.6, 2.5, -3]} rotation={[-0.3, -0.8, 1.1]} />
      </Float>
    </group>
  )
}

function Rig() {
  useFrame((state, dt) => {
    const cam = state.camera
    cam.position.x = THREE.MathUtils.damp(cam.position.x, motion.mouseX * 0.35, 3, dt)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, -motion.mouseY * 0.25, 3, dt)
    cam.lookAt(0, 0, 0)
  })
  return null
}

export default function Stage({ active }: { active: boolean }) {
  return (
    <Canvas
      className="stage"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 8], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} color="#fff0de" />
        <pointLight position={[-4, -2, 3]} intensity={40} color="#ff5a1f" />
        <pointLight position={[4, 3, -2]} intensity={25} color="#3d7bff" />
        <Ball />
        <Hoop />
        <GymProps />
        <Sparkles count={70} scale={[14, 9, 4]} size={2.2} speed={0.35} color="#ff8a3d" opacity={0.7} />
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={2.5} position={[0, 5, -6]} scale={[12, 4, 1]} />
          <Lightformer form="ring" color="#ff6a00" intensity={5} position={[-5, 1, -1]} scale={3} />
          <Lightformer form="rect" color="#3d7bff" intensity={2.5} position={[6, -1, -1]} scale={[3, 8, 1]} />
          <Lightformer form="rect" color="#ffffff" intensity={1.5} position={[0, -4, 4]} scale={[10, 2, 1]} />
        </Environment>
        <Rig />
      </Suspense>
    </Canvas>
  )
}
