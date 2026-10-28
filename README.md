# my-profile-mvp — Train. Code. Win.

Personal landing page for **Andersson David Sánchez Méndez**: software engineer, gym rat, HYROX racer and hooper.

## What's inside

| Section | What it does | Tech |
| --- | --- | --- |
| Loader | Shot-clock counter + curtain reveal | GSAP |
| Hero | Kinetic split-letter title, procedural 3D basketball, floating dumbbells & kettlebell that react to mouse and scroll | Three.js · React Three Fiber · drei |
| The Shot | 450vh Apple-style pinned sequence: scrolling drives the ball through a full jump shot into a 3D hoop, with a 2K-style shot meter | GSAP ScrollTrigger · Lenis |
| Disciplines | Gym / HYROX / Basketball cards with 3D tilt, cursor-following glow and animated SVG art | CSS 3D · GSAP |
| HYROX | Horizontal pinned "race": 8 × 1 km runs + 8 stations, live distance and race clock | ScrollTrigger pin |
| Box score | Counters + scroll-velocity marquee of the stack | GSAP |
| AI Coach | Webcam pose estimation that counts squats, curls and wall-ball presses, draws the skeleton and joint angle | MediaPipe Pose Landmarker (WASM/GPU) · optional Roboflow inference.js |
| Training log | Scroll-drawn timeline of experience | ScrollTrigger |
| Playbook | Projects as basketball plays with spotlight hover | CSS |
| The Court | Playable basketball with real ballistic + rim/backboard physics. Click/tap to shoot, moving-hoop mode, **Enter VR** with controllers and **AR mode** on supported devices | WebXR · @react-three/xr |
| Contact | Bouncing ball, rotating headline, magnetic buttons, copy-email | GSAP |

Also: custom morphing cursor, magnetic buttons, film grain, smooth scroll, `prefers-reduced-motion` support, and responsive layouts down to phone width.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

### Optional: Roboflow object detection

The AI Coach always runs MediaPipe pose tracking. To also draw Roboflow detections (for example a basketball detector from Roboflow Universe), copy `.env.example` to `.env` and fill in:

```
VITE_ROBOFLOW_KEY=your_publishable_key
VITE_ROBOFLOW_MODEL=workspace/model-slug
```

### VR / AR

WebXR needs HTTPS (or localhost). Open the deployed site in a Quest / Vision Pro browser, scroll to **The Court**, press **Tip-off** and then **Enter VR**. On Android Chrome with ARCore, **AR mode** places the hoop in your room.
