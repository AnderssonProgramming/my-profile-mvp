// Runs the Roboflow workflow on the court photo once and saves the detections for the site.
// The private API key stays on this machine: it is read from .env and never bundled.
//   node --env-file=.env scripts/analyze-court.mjs [image] [classes]
import { readFile, writeFile } from 'node:fs/promises'

const key = process.env.ROBOFLOW_API_KEY
const workspace = process.env.ROBOFLOW_WORKSPACE ?? 'ander-eci'
const workflow = process.env.ROBOFLOW_WORKFLOW ?? 'general-segmentation-api-2'
const image = process.argv[2] ?? 'src/assets/court-shot.jpg'
const classes = process.argv[3] ?? 'basketball, basketball hoop, person'
const out = 'src/court-detections.json'
const MASK_SCALE = 2 // store masks at half resolution

if (!key) {
  console.error('Missing ROBOFLOW_API_KEY in .env')
  process.exit(1)
}

/** COCO compressed RLE string → counts (port of pycocotools rleFrString). */
function rleCounts(s) {
  const counts = []
  let p = 0
  while (p < s.length) {
    let x = 0
    let k = 0
    let more = 1
    while (more) {
      const c = s.charCodeAt(p) - 48
      x |= (c & 0x1f) << (5 * k)
      more = c & 0x20
      p++
      k++
      if (!more && c & 0x10) x |= -1 << (5 * k)
    }
    if (counts.length > 2) x += counts[counts.length - 2]
    counts.push(x)
  }
  return counts
}

/** Decodes a column-major RLE mask, crops it to its box and bit-packs it row-major at 1/MASK_SCALE. */
function packMask(rle, box) {
  const [h, w] = rle.size
  const full = new Uint8Array(h * w)
  let idx = 0
  let val = 0
  for (const n of rleCounts(rle.counts)) {
    if (val) for (let i = 0; i < n; i++) full[idx + i] = 1
    idx += n
    val ^= 1
  }
  const x0 = Math.max(0, Math.floor((box.x - box.width / 2) / MASK_SCALE))
  const y0 = Math.max(0, Math.floor((box.y - box.height / 2) / MASK_SCALE))
  const mw = Math.ceil(box.width / MASK_SCALE) + 1
  const mh = Math.ceil(box.height / MASK_SCALE) + 1
  const bits = new Uint8Array(Math.ceil((mw * mh) / 8))
  let area = 0
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const sx = Math.min(w - 1, (x0 + x) * MASK_SCALE)
      const sy = Math.min(h - 1, (y0 + y) * MASK_SCALE)
      if (full[sx * h + sy]) {
        const i = y * mw + x
        bits[i >> 3] |= 1 << (i & 7)
        area++
      }
    }
  }
  return { x: x0 * MASK_SCALE, y: y0 * MASK_SCALE, w: mw, h: mh, scale: MASK_SCALE, area, bits: Buffer.from(bits).toString('base64') }
}

const res = await fetch(`https://serverless.roboflow.com/${workspace}/workflows/${workflow}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
  body: JSON.stringify({
    inputs: {
      image: { type: 'base64', value: (await readFile(image)).toString('base64') },
      classes,
    },
  }),
})
const body = await res.json()
if (!res.ok) {
  console.error(res.status, JSON.stringify(body).slice(0, 800))
  process.exit(1)
}

const result = body.outputs[0].predictions
const detections = result.predictions
  .map((p) => ({
    class: p.class.trim(),
    confidence: Math.round(p.confidence * 1000) / 1000,
    x: p.x,
    y: p.y,
    width: p.width,
    height: p.height,
    mask: p.rle_mask ? packMask(p.rle_mask, p) : null,
  }))
  .sort((a, b) => b.width * b.height - a.width * a.height)

await writeFile(
  out,
  JSON.stringify({ workflow: `${workspace}/${workflow}`, classes, analyzedAt: new Date().toISOString(), image: result.image, detections }, null, 1),
)
for (const d of detections)
  console.log(d.class.padEnd(16), d.confidence.toFixed(2), `mask px@1/${MASK_SCALE}:`, d.mask?.area, `box area/${MASK_SCALE ** 2}:`, Math.round((d.width * d.height) / MASK_SCALE ** 2))
console.log(`→ ${out}`)
