import * as THREE from 'three'

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Procedural basketball: two great-circle seams, two curved seams and a pebbled
 * grain, painted in equirectangular space so it maps cleanly onto a SphereGeometry.
 */
export function createBasketballMaps(width = 1024) {
  const W = width
  const H = width / 2
  const color = document.createElement('canvas')
  const bump = document.createElement('canvas')
  color.width = bump.width = W
  color.height = bump.height = H
  const cctx = color.getContext('2d')!
  const bctx = bump.getContext('2d')!
  const cimg = cctx.createImageData(W, H)
  const bimg = bctx.createImageData(W, H)
  const seamW = 0.018

  for (let y = 0; y < H; y++) {
    const phi = (y / H) * Math.PI
    const sp = Math.sin(phi)
    const py = Math.cos(phi)
    for (let x = 0; x < W; x++) {
      const theta = (x / W) * Math.PI * 2
      const px = -Math.cos(theta) * sp
      const pz = Math.sin(theta) * sp
      const d = Math.min(Math.abs(px), Math.abs(py), Math.abs(Math.abs(pz) - 0.74))
      const seam = 1 - smooth(seamW * 0.55, seamW, d)
      const groove = 1 - smooth(seamW, seamW * 2.2, d)
      const cell = hash(Math.floor(x / 2), Math.floor(y / 2))
      const pebble = cell > 0.55 ? 1 : 0.55
      const tone = 0.94 + Math.sin(px * 7 + pz * 5) * Math.cos(py * 6) * 0.05
      const i = (y * W + x) * 4
      const r = 214 * tone * (0.94 + pebble * 0.06)
      const g = 92 * tone * (0.94 + pebble * 0.06)
      const b = 30 * tone
      cimg.data[i] = r * (1 - seam) + 18 * seam
      cimg.data[i + 1] = g * (1 - seam) + 14 * seam
      cimg.data[i + 2] = b * (1 - seam) + 12 * seam
      cimg.data[i + 3] = 255
      const h = (pebble * 0.35 + 0.55) * (1 - groove * 0.85) * 255
      bimg.data[i] = bimg.data[i + 1] = bimg.data[i + 2] = h
      bimg.data[i + 3] = 255
    }
  }
  cctx.putImageData(cimg, 0, 0)
  bctx.putImageData(bimg, 0, 0)

  const map = new THREE.CanvasTexture(color)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8
  const bumpMap = new THREE.CanvasTexture(bump)
  return { map, bumpMap }
}

/** Hardwood court with painted lines — used by the VR court. */
export function createCourtTexture() {
  const W = 2048
  const H = 2048
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  const plank = 64
  for (let y = 0; y < H; y += plank) {
    let x = -Math.floor(hash(y, 3) * 600)
    while (x < W) {
      const len = 300 + hash(x, y) * 500
      const t = hash(x * 0.1, y * 0.3)
      ctx.fillStyle = `hsl(${28 + t * 8}, ${48 + t * 12}%, ${44 + t * 10}%)`
      ctx.fillRect(x, y, len, plank)
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(x, y, 2, plank)
      x += len
    }
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.fillRect(0, y, W, 2)
  }
  // painted key + arcs (top of the canvas is the hoop end)
  const px = W / 15 // pixels per metre (court texture covers 15m x 15m)
  const cx = W / 2
  const base = px * 1.2
  ctx.fillStyle = 'rgba(255,90,31,0.55)'
  ctx.fillRect(cx - 2.45 * px, 0, 4.9 * px, base + 5.8 * px - 1.2 * px)
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'
  ctx.lineWidth = 10
  ctx.strokeRect(cx - 2.45 * px, -10, 4.9 * px, base + 4.6 * px + 10)
  ctx.beginPath()
  ctx.arc(cx, base + 4.6 * px, 1.8 * px, 0, Math.PI)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, base + 0.4 * px, 6.75 * px, 0.05 * Math.PI, 0.95 * Math.PI)
  ctx.moveTo(cx - 6.6 * px, 0)
  ctx.lineTo(cx - 6.6 * px, base + 1.6 * px)
  ctx.moveTo(cx + 6.6 * px, 0)
  ctx.lineTo(cx + 6.6 * px, base + 1.6 * px)
  ctx.stroke()
  ctx.save()
  ctx.translate(cx, H * 0.78)
  ctx.font = `900 ${px * 1.3}px Anton, Impact, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  ctx.fillText('ANDERSSON', 0, 0)
  ctx.restore()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}
